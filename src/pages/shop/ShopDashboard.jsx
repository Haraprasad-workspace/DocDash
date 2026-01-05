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
import { Document, Page, pdfjs } from "react-pdf";
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

    const unsubscribe = subscribeToShopOrders(
      currentUser.uid,
      (incomingOrders) => {
        // ✅ Filter only pending, printing, ready orders
        const activeOrders = incomingOrders.filter((order) =>
          ["pending", "printing", "ready"].includes(order.status)
        );
        setOrders(activeOrders);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // 2️⃣ Action Handlers
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // ✅ CHECK: Does this status require deletion?
      const shouldDelete = ["completed", "failed"].includes(newStatus);

      if (shouldDelete) {
        let confirmMsg = "";
        if (newStatus === "completed") {
          confirmMsg =
            "Order Delivered!\nThis will delete all files. Continue?";
        } else {
          confirmMsg = "Marking as Failed/Rejected, want to continue?";
        }

        if (window.confirm(confirmMsg)) {
          // A. Delete from Cloudinary + Firestore
          await deleteOrder(orderId);

          // B. Remove from UI immediately
          setOrders((prev) => prev.filter((o) => o.id !== orderId));

          alert("Order cleaned up successfully.");
        }
        return;
      }

      // ✅ NEW: Handle rejected status - update then remove from UI
      if (newStatus === "rejected") {
        await updateOrderStatus(orderId, newStatus);
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        return;
      }

      // If status is NOT a deletion/rejection status (printing, ready, etc.)
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

  if (loading || !shop)
    return <div className='p-10 text-center'>Loading Dashboard...</div>;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 🟢 TOP HEADER */}
      <header className='bg-white shadow-sm border-b sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>
              {shop?.name || "My Shop"}
            </h1>
            <p className='text-sm text-gray-500'>
              Shop ID: {currentUser?.uid?.slice(0, 6)}...
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <button
              onClick={handleToggleShop}
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
                shop?.isAvailable
                  ? "bg-status-success-bg text-status-success-text border border-status-success-bg hover:shadow-md"
                  : "bg-status-error-bg text-status-error-text border border-status-error-bg hover:shadow-md"
              }`}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  shop?.isAvailable
                    ? "bg-green-600 animate-pulse"
                    : "bg-red-600"
                }`}
              ></span>
              {shop?.isAvailable ? "Shop is LIVE" : "Shop is CLOSED"}
            </button>
            <button
              onClick={logout}
              className='text-gray-500 hover:text-red-600 font-medium'
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* 📋 ORDER DASHBOARD */}
      <main className='max-w-6xl mx-auto px-4 py-8'>
        <div className='grid grid-cols-2 gap-4 mb-8'>
          <StatCard
            label='Pending'
            count={orders.filter((o) => o.status === "pending").length}
            color='bg-yellow-50 text-yellow-700'
          />
          <StatCard
            label='Printing'
            count={orders.filter((o) => o.status === "printing").length}
            color='bg-blue-50 text-blue-700'
          />
        </div>

        <h2 className='text-xl font-bold mb-4'>Active Orders</h2>

        {orders.length === 0 ? (
          <div className='text-center py-12 bg-white rounded-xl border border-dashed text-gray-400'>
            No orders yet. Waiting for students...
          </div>
        ) : (
          <div className='space-y-6'>
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
    <div
      className={`p-4 rounded-xl border ${activeColor} flex flex-col items-center justify-center`}
    >
      <span className='text-3xl font-bold'>{count}</span>
      <span className='text-sm opacity-80'>{label}</span>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus }) {
  const statusColors = {
    pending: "border-l-4 border-yellow-400",
    printing: "border-l-4 border-blue-500",
    ready: "border-l-4 border-green-500",
    completed: "opacity-60 bg-gray-50",
    rejected: "opacity-60 bg-red-50",
  };

  // 🖨️ Handle Print (System Dialog)
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
    const isImage =
      file.type?.includes("image") ||
      file.name.match(/\.(jpg|jpeg|png|webp)$/i);
    const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");

    if (isImage) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className='w-full h-32 object-contain bg-gray-100 rounded border'
        />
      );
    }

    if (isPDF) {
      return (
        <div className='w-full h-32 bg-gray-100 rounded border overflow-hidden relative group'>
          <Document
            file={file.url}
            loading={
              <div className='text-xs text-gray-400 p-2'>Loading PDF...</div>
            }
            error={
              <div className='text-xs text-red-400 p-2'>
                Preview Unavailable
              </div>
            }
          >
            <Page
              pageNumber={1}
              width={150}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
          <div className='absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-1'>
            PDF Preview
          </div>
        </div>
      );
    }
    return (
      <div className='w-full h-32 bg-gray-50 flex items-center justify-center border rounded text-xs text-gray-500'>
        {file.name}
      </div>
    );
  };

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-sm border border-gray-100 ${
        statusColors[order.status]
      }`}
    >
      <div className='flex flex-col md:flex-row gap-6'>
        {/* LEFT: Details */}
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='font-bold text-lg'>
              Order #{order.id.slice(-4)}
            </span>
            <span
              className={`px-2 py-0.5 text-xs uppercase font-bold rounded bg-gray-100 text-gray-800`}
            >
              {order.status}
            </span>
          </div>

          <div className='text-sm text-gray-600 space-y-1 mb-4'>
            <p>
              📄 <b>{order.totalPages} Pages</b> • ₹{order.totalPrice}
            </p>
            <p>
              🕒{" "}
              {order.createdAt?.seconds
                ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                : "Just now"}
            </p>
          </div>

          <div className='flex flex-wrap gap-2'>
            {order.status === "pending" && (
              <>
                <button
                  onClick={() => onUpdateStatus(order.id, "rejected")}
                  className='px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded font-medium border border-red-200'
                >
                  Reject
                </button>
                <button
                  onClick={() => onUpdateStatus(order.id, "printing")}
                  className='px-4 py-2 text-sm bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow'
                >
                  Accept & Print
                </button>
              </>
            )}
            {order.status === "printing" && (
              <button
                onClick={() => onUpdateStatus(order.id, "ready")}
                className='px-4 py-2 text-sm bg-yellow-500 text-white rounded font-bold hover:bg-yellow-600 shadow'
              >
                Mark Ready
              </button>
            )}
            {order.status === "ready" && (
              <button
                onClick={() => onUpdateStatus(order.id, "completed")}
                className='px-4 py-2 text-sm bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow'
              >
                Complete Order
              </button>
            )}
            {order.status === "completed" && (
              <span className='text-green-600 font-bold flex items-center gap-1'>
                ✅ Delivered (Saved in History)
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: Files */}
        <div className='flex-1 border-l pl-0 md:pl-6 border-gray-100'>
          <h4 className='text-xs font-bold text-gray-400 uppercase mb-3'>
            Attached Files ({order.files?.length})
          </h4>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
            {order.files?.map((file, idx) => (
              <div key={idx} className='flex flex-col gap-2'>
                <div
                  className='cursor-pointer hover:opacity-80 transition'
                  onClick={() => handleOpenOriginal(file.url)}
                  title='Click to view full file'
                >
                  {renderPreview(file)}
                </div>

                <button
                  onClick={() => handlePrint(file.url)}
                  className='text-xs bg-gray-800 text-white py-1.5 px-2 rounded hover:bg-black flex items-center justify-center gap-1 transition-colors'
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
