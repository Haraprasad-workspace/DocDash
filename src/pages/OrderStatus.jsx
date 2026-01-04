import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listenToOrder } from "../lib/orders";

const OrderStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = listenToOrder(orderId, setOrder);
    return () => unsubscribe();
  }, [orderId]);

  if (!order) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh] bg-page-bg">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-brand-surface-secondary rounded mb-4"></div>
          <div className="h-4 w-48 bg-brand-surface-primary rounded"></div>
        </div>
      </main>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-status-warning-bg text-status-warning-text border-status-warning-bg";
      case "printing":
        return "bg-status-info text-brand-text-primary border-status-info";
      case "ready":
        return "bg-status-success-bg text-status-success-text border-status-success-bg";
      case "completed":
        return "bg-brand-surface-secondary text-brand-text-muted border-brand-surface-secondary";
      case "failed":
        return "bg-status-error-bg text-status-error-text border-status-error-bg";
      default:
        return "bg-brand-surface-primary text-brand-text-body";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Waiting in Queue",
      printing: "Printing in Progress",
      ready: "Ready for Pickup",
      completed: "Order Completed",
      failed: "Order Failed",
    };
    return labels[status] || status;
  };

  return (
    <main className="flex-1 bg-page-bg py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-brand-text-primary">Order Status</h2>
            <p className="text-brand-text-muted mt-1">Track your document processing in real-time.</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm font-medium text-brand-text-link hover:text-brand-text-link-hover underline decoration-dotted underline-offset-4"
          >
            &larr; Back to History
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-brand-bg rounded-3xl p-8 shadow-sm border border-border-default">

          {/* Status Banner */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-border-default">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-1">
                Current Status
              </span>
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border ${getStatusStyle(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-1">
                Order ID
              </span>
              <span className="font-mono text-brand-text-body bg-brand-surface-secondary px-2 py-1 rounded text-sm">
                #{order.id.slice(0, 8)}...
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-brand-surface-secondary/50 p-6 rounded-2xl">
              <span className="block text-sm text-brand-text-muted mb-2">Total Price</span>
              <span className="text-3xl font-bold text-brand-text-primary">₹{order.totalPrice}</span>
            </div>
            <div className="bg-brand-surface-secondary/50 p-6 rounded-2xl">
              <span className="block text-sm text-brand-text-muted mb-2">Total Pages</span>
              <span className="text-3xl font-bold text-brand-text-primary">{order.totalPages}</span>
            </div>
          </div>

          {/* Messages */}
          {order.status === "completed" && (
            <div className="mb-8 p-4 bg-status-success-bg/20 border border-status-success-bg/20 rounded-xl flex items-center gap-3">
              <span className="text-xl">✅</span>
              <p className="text-status-success-text font-medium">Your order is completed. Please collect it from the counter.</p>
            </div>
          )}

          {order.status === "failed" && (
            <div className="mb-8 p-4 bg-status-error-bg/20 border border-status-error-bg/20 rounded-xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-status-error-text font-medium">Order failed. Please try again or contact support.</p>
            </div>
          )}

          {/* Files Section */}
          <div>
            <h3 className="text-lg font-bold text-brand-text-primary mb-4">Attached Files</h3>
            {(!order.files || order.files.length === 0) ? (
              <p className="text-brand-text-muted italic">No files attached.</p>
            ) : (
              <div className="space-y-3">
                {order.files.map((file, idx) => (
                  <div key={idx} className="group flex items-center p-4 bg-white border border-border-default rounded-xl hover:border-brand-accent hover:shadow-sm transition-all">
                    <div className="h-10 w-10 bg-brand-surface-secondary rounded-lg flex items-center justify-center mr-4 group-hover:bg-brand-surface-primary transition-colors">
                      <svg className="w-5 h-5 text-brand-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={file.url} target="_blank" rel="noreferrer" className="block text-sm font-medium text-brand-text-primary truncate hover:text-brand-text-link hover:underline">
                        {file.name}
                      </a>
                      <p className="text-xs text-brand-text-muted mt-0.5">
                        {file.pages} page{file.pages !== 1 && 's'} • PDF
                      </p>
                    </div>
                    <a href={file.url} target="_blank" rel="noreferrer" className="ml-4 p-2 text-brand-text-muted hover:text-brand-text-primary rounded-full hover:bg-brand-surface-secondary transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
};

export default OrderStatus;
