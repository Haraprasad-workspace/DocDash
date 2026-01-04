import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { subscribeToShopOrders, toggleShopStatus, getShopDetails } from "../../services/shopService";
import { updateOrderStatus } from "../../lib/orders";

export default function ShopDashboard() {
  const { currentUser, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Setup: Fetch Shop Details & Listen for Orders
  useEffect(() => {
    if (!currentUser) return;

    // A. Load Shop Profile (Name, Open/Closed status)
    getShopDetails(currentUser.uid).then(data => {
      setShop(data);
      setLoading(false);
    });

    // B. Start Real-Time Listener for Orders
    // This function returns an "unsubscribe" function to clean up later
    const unsubscribe = subscribeToShopOrders(currentUser.uid, (incomingOrders) => {
      setOrders(incomingOrders);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [currentUser]);

  // 2. Action Handlers
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      alert("Error updating order: " + error.message);
    }
  };

  const handleToggleShop = async () => {
    if (!shop) return;
    const newState = !shop.isAvailable;
    // Optimistic UI Update (Update screen before waiting for server)
    setShop(prev => ({ ...prev, isAvailable: newState }));
    await toggleShopStatus(currentUser.uid, newState);
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🟢 TOP HEADER */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{shop?.name || "My Shop"}</h1>
            <p className="text-sm text-gray-500">Shop ID: {currentUser?.uid?.slice(0, 6)}...</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Toggle */}
            <button
              onClick={handleToggleShop}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${shop?.isAvailable
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
                }`}
            >
              {shop?.isAvailable ? "● Shop is LIVE" : "○ Shop is CLOSED"}
            </button>

            <button onClick={logout} className="text-gray-500 hover:text-red-600 font-medium">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* 📋 ORDER DASHBOARD */}
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Pending" count={orders.filter(o => o.status === 'pending').length} color="bg-yellow-50 text-yellow-700" />
          <StatCard label="In Progress" count={orders.filter(o => o.status === 'printing').length} color="bg-blue-50 text-blue-700" />
          <StatCard label="Completed" count={orders.filter(o => o.status === 'completed').length} color="bg-green-50 text-green-700" />
        </div>

        <h2 className="text-xl font-bold mb-4">Active Orders</h2>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-400">
            No orders yet. Waiting for students...
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, count, color }) {
  return (
    <div className={`p-4 rounded-xl border ${color} flex flex-col items-center justify-center`}>
      <span className="text-3xl font-bold">{count}</span>
      <span className="text-sm opacity-80">{label}</span>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus }) {
  // Define colors based on status
  const statusColors = {
    pending: "border-l-4 border-yellow-400",
    printing: "border-l-4 border-blue-500",
    ready: "border-l-4 border-green-500",
    completed: "opacity-60 bg-gray-50",
    rejected: "opacity-60 bg-red-50"
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-100 ${statusColors[order.status] || ""}`}>
      <div className="flex flex-col md:flex-row justify-between gap-4">

        {/* Left: Order Info */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg">Order #{order.id.slice(-4)}</span>
            <span className={`px-2 py-0.5 text-xs uppercase font-bold rounded ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'printing' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
              {order.status}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>📄 <b>{order.totalPages} Pages</b> • ₹{order.totalPrice}</p>
            <p>🕒 {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : "Just now"}</p>
          </div>

          {/* Files List */}
          <div className="mt-3 flex flex-wrap gap-2">
            {order.files?.map((file, idx) => (
              <a
                key={idx}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-blue-50 text-blue-600 text-xs rounded-md border transition-colors"
              >
                📎 Download {file.name}
              </a>
            ))}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-center">

          {/* ACTION: Pending -> Printing */}
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(order.id, 'rejected')}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                Reject
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'printing')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-bold"
              >
                Accept & Print
              </button>
            </>
          )}

          {/* ACTION: Printing -> Ready */}
          {order.status === 'printing' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'ready')}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 font-bold"
            >
              Mark Ready
            </button>
          )}

          {/* ACTION: Ready -> Completed */}
          {order.status === 'ready' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'completed')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-bold"
            >
              Complete Order
            </button>
          )}

          {/* ACTION: Completed State */}
          {order.status === 'completed' && (
            <div className="text-green-600 font-bold flex items-center gap-1">
              ✅ Delivered
            </div>
          )}

        </div>
      </div>
    </div>
  );
}