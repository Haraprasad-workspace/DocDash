
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchUserOrders } from "../lib/orders";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await fetchUserOrders(currentUser.uid);
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      loadOrders();
    }
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "printing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const activeOrders = orders.filter(o => ["pending", "printing", "ready"].includes(o.status));
  const pastOrders = orders.filter(o => ["completed", "failed"].includes(o.status));

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 mt-2">Track and manage your print jobs</p>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow transition-colors"
          >
            + New Order
          </button>
        </div>

        {/* Active Orders */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🚀 Active Orders
            {activeOrders.length > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{activeOrders.length}</span>}
          </h2>

          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              No active orders right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map(order => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer p-6 relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Order #{order.id.slice(0, 6)}...
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{order.totalPages} Pages • ₹{order.totalPrice}</p>

                  <div className="flex -space-x-2 overflow-hidden py-1">
                    {order.files?.slice(0, 3).map((f, i) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs text-gray-500" title={f.name}>
                        📄
                      </div>
                    ))}
                    {order.files?.length > 3 && (
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                        +{order.files.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <section className="opacity-75">
            <h2 className="text-xl font-bold text-gray-800 mb-6">📂 Past Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-6 grayscale hover:grayscale-0 transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">₹{order.totalPrice}</span>
                    <span className="text-sm text-gray-500">{order.totalPages} pgs</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default Dashboard