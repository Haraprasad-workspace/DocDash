
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

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending": return "bg-status-warning-bg text-status-warning-text border-status-warning-bg";
      case "printing": return "bg-status-info text-brand-text-primary border-status-info";
      case "ready": return "bg-status-success-bg text-status-success-text border-status-success-bg";
      case "completed": return "bg-brand-surface-secondary text-brand-text-muted border-brand-surface-secondary";
      case "failed": return "bg-status-error-bg text-status-error-text border-status-error-bg";
      default: return "bg-brand-surface-secondary text-brand-text-muted border-brand-surface-secondary";
    }
  };

  const activeOrders = orders.filter(o => ["pending", "printing", "ready"].includes(o.status));
  const pastOrders = orders.filter(o => ["completed", "failed"].includes(o.status));

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-text-primary"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-page-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-brand-text-primary">My Orders</h1>
            <p className="text-brand-text-muted mt-2 text-lg">Track and manage your print jobs</p>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="px-6 py-3 bg-btn-primary-bg text-btn-primary-text font-semibold rounded-full hover:bg-btn-primary-hover shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            + New Order
          </button>
        </div>

        {/* Active Orders */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-bold text-brand-text-primary">Active Orders</h2>
            {activeOrders.length > 0 && <span className="bg-brand-surface-primary text-brand-text-primary px-3 py-1 rounded-full text-sm font-medium">{activeOrders.length}</span>}
          </div>

          {activeOrders.length === 0 ? (
            <div className="bg-brand-surface-secondary/30 rounded-3xl border border-dashed border-border-default p-16 text-center">
              <p className="text-brand-text-muted text-lg">No active print jobs right now.</p>
              <button onClick={() => navigate("/upload")} className="mt-4 text-brand-text-link hover:underline">Start a new order</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeOrders.map(order => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="group bg-card-bg hover:bg-card-hover rounded-3xl p-8 cursor-pointer transition-all duration-300 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-sm text-brand-text-muted font-medium">
                      {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-text-primary mb-2 line-clamp-1">
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-brand-text-muted mb-6">{order.totalPages} Pages • ₹{order.totalPrice}</p>

                  <div className="flex -space-x-3 overflow-hidden py-2 pl-1">
                    {order.files?.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex-shrink-0 h-10 w-10 rounded-full ring-2 ring-card-bg bg-inset-panel flex items-center justify-center text-lg shadow-sm" title={f.name}>
                        📄
                      </div>
                    ))}
                    {order.files?.length > 3 && (
                      <div className="flex-shrink-0 h-10 w-10 rounded-full ring-2 ring-card-bg bg-brand-surface-primary flex items-center justify-center text-xs font-medium text-brand-text-muted">
                        +{order.files.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Decorative Hover Line */}
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-brand-text-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <section className="pt-8 border-t border-divider-light">
            <h2 className="text-2xl font-bold text-brand-text-muted mb-8">Past Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastOrders.map(order => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="bg-brand-surface-secondary/40 hover:bg-brand-surface-secondary rounded-2xl border border-transparent hover:border-border-default p-6 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-brand-text-disabled">
                      {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-brand-text-body">₹{order.totalPrice}</h3>
                    <span className="text-sm text-brand-text-muted">{order.totalPages} pages</span>
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
