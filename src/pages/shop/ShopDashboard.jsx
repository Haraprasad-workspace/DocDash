import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToShopOrders,
  toggleShopStatus,
  getShopDetails,
} from "../../services/shopService";
// ✅ Import deleteOrder here
import { updateOrderStatus, deleteOrder } from "../../lib/orders";

// 📦 PDF Library Imports
import { Document, Page, pdfjs } from 'react-pdf';
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { logout } from "../../lib/logout";

// 🔧 Worker Configuration
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function ShopDashboard() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Initial Setup
  useEffect(() => {
    if (!currentUser) return;

    getShopDetails(currentUser.uid)
      .then((data) => {
        setShop(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    const unsubscribe = subscribeToShopOrders(currentUser.uid, (incomingOrders) => {
      setOrders(incomingOrders);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 2️⃣ Action Handlers
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // ✅ CHECK: Does this status require deletion?
      const shouldDelete = ['completed', 'failed', 'rejected'].includes(newStatus);

      if (shouldDelete) {
        let confirmMsg = "";
        if (newStatus === 'completed') {
          confirmMsg = "Order Delivered! ✅\n\nDelete this order and remove all files from storage?";
        } else {
          confirmMsg = "Marking as Failed/Rejected ❌\n\nThis will permanently delete the order and files. Continue?";
        }

        if (window.confirm(confirmMsg)) {
          // A. Delete from Cloudinary + Firestore
          await deleteOrder(orderId);

          // B. Remove from UI immediately
          setOrders(prev => prev.filter(o => o.id !== orderId));

          alert("Order cleaned up successfully.");
          return;
        }
      }

      // If we are NOT deleting (e.g. printing, ready, or user clicked Cancel), update normally
      await updateOrderStatus(orderId, newStatus);

    } catch (error) {
      console.error(error);
      alert("Action failed: " + error.message);
    }
  };

  const handleToggleShop = async () => {
    if (!shop) return;
    const newState = !shop.isAvailable;
    setShop((prev) => ({ ...prev, isAvailable: newState }));
    await toggleShopStatus(currentUser.uid, newState);
  };

  if (loading || !shop) return (
    <div className="flex justify-center items-center min-h-screen bg-page-bg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-text-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-page-bg">
      {/* 🟢 TOP HEADER */}
      <header className="bg-white/70 backdrop-blur-md sticky top-0 z-20 border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
              🏪
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-text-primary leading-tight">{shop?.name || "My Shop"}</h1>
              <p className="text-xs text-brand-text-muted font-mono tracking-wide">ID: {currentUser?.uid?.slice(0, 6).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleShop}
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${shop?.isAvailable
                ? "bg-status-success-bg text-status-success-text border border-status-success-bg hover:shadow-md"
                : "bg-status-error-bg text-status-error-text border border-status-error-bg hover:shadow-md"
                }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${shop?.isAvailable ? "bg-green-600 animate-pulse" : "bg-red-600"}`}></span>
              {shop?.isAvailable ? "Shop is LIVE" : "Shop is CLOSED"}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-brand-text-muted hover:text-brand-text-primary hover:bg-brand-surface-secondary rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* 📋 ORDER DASHBOARD */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Pending Orders"
            count={orders.filter(o => o.status === 'pending').length}
            icon="⏳"
            activeColor="bg-status-warning-bg text-status-warning-text"
          />
          <StatCard
            label="In Printing"
            count={orders.filter(o => o.status === 'printing').length}
            icon="🖨️"
            activeColor="bg-status-info text-blue-700"
          />
          <StatCard
            label="Completed Today"
            count={orders.filter(o => o.status === 'completed').length}
            icon="✅"
            activeColor="bg-status-success-bg text-status-success-text"
          />
        </div>

        <div className="flex items-end justify-between border-b border-divider-light pb-4">
          <h2 className="text-2xl font-bold text-brand-text-primary">Incoming Orders</h2>
          <span className="text-sm text-brand-text-muted font-medium">{orders.length} total active</span>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-card-bg/50 rounded-3xl border border-dashed border-border-default text-center">
            <div className="w-20 h-20 bg-brand-surface-secondary rounded-full flex items-center justify-center text-4xl mb-4 grayscale opacity-50">😴</div>
            <h3 className="text-lg font-semibold text-brand-text-primary">No active orders</h3>
            <p className="text-brand-text-muted">Waiting for users to send print jobs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
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

function StatCard({ label, count, icon, activeColor }) {
  return (
    <div className={`p-6 rounded-3xl border border-white/60 shadow-lg backdrop-blur-md flex items-center justify-between transition-transform hover:-translate-y-1 ${count > 0 ? 'bg-card-bg' : 'bg-brand-surface-secondary/50 opacity-80'}`}>
      <div>
        <p className="text-sm font-medium text-brand-text-muted mb-1">{label}</p>
        <p className="text-4xl font-extrabold text-brand-text-primary">{count}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${count > 0 ? activeColor : 'bg-gray-200 text-gray-400'}`}>
        {icon}
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus }) {
  // Status configuration
  const statusConfig = {
    pending: { color: "bg-status-warning-bg text-status-warning-text border-status-warning-bg", label: "Pending Approval" },
    printing: { color: "bg-status-info text-blue-700 border-blue-200", label: "Printing in Progress" },
    ready: { color: "bg-status-success-bg text-status-success-text border-status-success-bg", label: "Ready for Pickup" },
    completed: { color: "bg-gray-100 text-gray-500 border-gray-200", label: "Completed" },
    rejected: { color: "bg-status-error-bg text-status-error-text border-status-error-bg", label: "Rejected" }
  };

  const currentStatus = statusConfig[order.status] || statusConfig.pending;

  // ✅ NEW: Handles System Print Dialog
  const handlePrint = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = localUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // Cleanup after 1 minute (give user time to print)
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(localUrl);
        }, 60000);
      };

    } catch (err) {
      console.error("Auto-print failed, opening in new tab:", err);
      window.open(fileUrl, "_blank");
    }
  };

  const handleOpenOriginal = (url) => {
    window.open(url, "_blank");
  };

  const renderPreview = (file) => {
    const isImage = file.type?.includes("image") || file.name.match(/\.(jpg|jpeg|png|webp)$/i);
    const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");

    if (isImage) {
      return (
        <div className="w-full h-32 rounded-xl border border-border-default overflow-hidden bg-white relative group-hover:scale-105 transition-transform duration-500">
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="w-full h-32 bg-gray-50 rounded-xl border border-border-default overflow-hidden relative group">
          <div className="w-full h-full group-hover:scale-105 transition-transform duration-500 origin-center">
            <Document
              file={file.url}
              loading={<div className="text-xs text-gray-400 p-2 text-center h-full flex items-center justify-center">Loading...</div>}
              error={<div className="text-xs text-red-400 p-2 text-center h-full flex items-center justify-center">Preview N/A</div>}
            >
              <Page pageNumber={1} width={150} renderTextLayer={false} renderAnnotationLayer={false} />
            </Document>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
            <span className="text-white text-xs font-medium">View PDF</span>
          </div>
        </div>
      );
    }
    return <div className="w-full h-32 bg-gray-50 flex items-center justify-center border rounded-xl text-xs text-brand-text-muted">{file.name}</div>;
  };

  return (
    <div className={`bg-card-bg rounded-3xl shadow-sm border border-border-default p-6 md:p-8 transition-all hover:shadow-md relative overflow-hidden group/card`}>
      {/* Status Stripe */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${order.status === 'printing' ? 'bg-blue-500' : order.status === 'ready' ? 'bg-green-500' : order.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>

      <div className="flex flex-col lg:flex-row gap-8 pl-4">

        {/* LEFT: Details */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-xl text-brand-text-primary">Order #{order.id.slice(-4)}</span>
              <span className={`px-3 py-1 text-xs uppercase font-extrabold tracking-wider rounded-full border ${currentStatus.color}`}>
                {order.status}
              </span>
            </div>
            <span className="text-sm text-brand-text-muted font-mono">
              {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : "Just now"}
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="px-5 py-3 bg-brand-surface-secondary rounded-2xl">
              <p className="text-xs uppercase text-brand-text-muted font-bold mb-1">Total Pages</p>
              <p className="text-xl font-bold text-brand-text-primary">📄 {order.totalPages}</p>
            </div>
            <div className="px-5 py-3 bg-brand-surface-secondary rounded-2xl">
              <p className="text-xs uppercase text-brand-text-muted font-bold mb-1">Total Price</p>
              <p className="text-xl font-bold text-brand-text-primary">₹ {order.totalPrice}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {order.status === 'pending' && (
              <>
                <button onClick={() => onUpdateStatus(order.id, 'rejected')} className="flex-1 py-3 px-4 text-sm text-red-600 hover:bg-red-50 rounded-xl font-bold border border-red-200 transition">Reject</button>
                <button onClick={() => onUpdateStatus(order.id, 'printing')} className="flex-[2] py-3 px-6 text-sm bg-btn-primary-bg text-btn-primary-text rounded-xl font-bold hover:bg-btn-primary-hover shadow-lg transition transform active:scale-95">Accept & Print</button>
              </>
            )}
            {order.status === 'printing' && (
              <button onClick={() => onUpdateStatus(order.id, 'ready')} className="w-full py-3 px-6 text-sm bg-yellow-400 text-yellow-900 rounded-xl font-bold hover:bg-yellow-500 shadow-lg transition">Mark as Ready</button>
            )}
            {order.status === 'ready' && (
              <button onClick={() => onUpdateStatus(order.id, 'completed')} className="w-full py-3 px-6 text-sm bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg transition">Complete Order</button>
            )}
            {order.status === 'completed' && (
              <div className="w-full py-3 text-center bg-green-50 text-green-700 rounded-xl font-bold border border-green-200">
                ✅ Delivered Successfully
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Files */}
        <div className="flex-1 lg:max-w-md lg:border-l lg:pl-8 border-divider-light">
          <h4 className="text-xs font-bold text-brand-text-muted uppercase mb-4 tracking-wider">Attached Files ({order.files?.length})</h4>
          <div className="grid grid-cols-2 gap-4">
            {order.files?.map((file, idx) => (
              <div key={idx} className="group relative">
                <div
                  className="cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => handleOpenOriginal(file.url)}
                  title="Click to view full file"
                >
                  {renderPreview(file)}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrint(file.url);
                  }}
                  className="absolute -bottom-3 right-2 shadow-md bg-gray-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-full hover:bg-black hover:scale-105 transition-all flex items-center gap-1 z-10"
                >
                  🖨️ Print
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
