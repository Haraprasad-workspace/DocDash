import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { analyzeFiles } from "../lib/fileAnalyzer";
import { getUserLocation } from "../lib/geo";
import { getTopShops } from "../lib/routing";
import { calculatePricesForShops } from "../lib/pricing";
import { createOrder, attachFilesToOrder } from "../lib/orders";
import { uploadFilesToCloudinary } from "../lib/cloudinary";

function Upload() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Select Shop, 3: Complete

  /* ===============================
     1️⃣ FILE SELECTION + ANALYSIS
     =============================== */
  async function handleFileChange(e) {
    const files = [...e.target.files];
    processFiles(files);
  }

  async function processFiles(files) {
    if (files.length === 0) return;

    setSelectedFiles(files);
    setLoading(true);
    try {
      const result = await analyzeFiles(files);
      setAnalysis(result);
      // Automatically proceed to find shops after analysis if we have location? 
      // User might want to review first. Let's keep manual button or auto-advance.
      // For UX, let's keep it manual "Find Shops" or auto if we want to be fancy.
      // Sticking to "Find Best Shops" button for now to match flow step 1 -> step 2.
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     2️⃣ FETCH + RANK SHOPS
     =============================== */
  async function findBestShops() {
    if (!analysis) return;

    setLoading(true);
    try {
      const userLocation = await getUserLocation();
      const topShops = await getTopShops(userLocation, 5);

      const priced = calculatePricesForShops(analysis.totalPages, topShops);

      setShops(priced);
      setCurrentStep(2); // Move to Step 2
    } catch (err) {
      alert("Failed to fetch shops. Please allow location access.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     3️⃣ CREATE ORDER + UPLOAD FILES
     =============================== */
  async function handleCreateOrder() {
    if (!selectedShop) {
      alert("Select a shop first");
      return;
    }

    setLoading(true);

    let orderId = null;

    try {
      // 1️⃣ Create order FIRST
      orderId = await createOrder({
        userId: currentUser.uid,
        shopId: selectedShop.id,
        totalPages: analysis.totalPages,
        totalPrice: selectedShop.totalPrice,
      });

      // 2️⃣ Upload files
      const uploadedFiles = await uploadFilesToCloudinary(
        selectedFiles,
        orderId
      );

      // 3️⃣ Attach file metadata
      const filesMeta = uploadedFiles.map((f, idx) => ({
        name: f.name,
        url: f.url,
        publicId: f.publicId,
        type: f.type,
        pages: analysis.filesMeta[idx].pages,
      }));

      await attachFilesToOrder(orderId, filesMeta);

      // 4️⃣ Success → navigate
      navigate(`/order/${orderId}`);
    } catch (err) {
      console.error(err);

      // 🔥 FAIL-SAFE
      if (orderId) {
        try {
          // await updateOrderStatus(orderId, "failed"); // Assuming this function is imported or available if needed
        } catch (e) {
          console.error("Failed to mark order as failed", e);
        }
      }

      alert("Order creation failed. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  // --- UI COMPONENTS ---

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      <div className="flex items-center">
        {[
          { num: 1, label: "Upload" },
          { num: 2, label: "Select Shop" },
          { num: 3, label: "Payment" }
        ].map((step, idx) => (
          <div key={step.num} className="flex items-center">
            <div className={`flex flex-col items-center relative z-10`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2 
                ${currentStep >= step.num
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"}`}
              >
                {step.num}
              </div>
              <span className={`absolute top-12 text-xs font-medium w-20 text-center ${currentStep >= step.num ? "text-blue-600" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {idx < 2 && (
              <div className={`w-24 h-1 bg-gray-200 mx-2 rounded ${currentStep > step.num ? "bg-blue-600" : ""}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="flex-1 bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <StepIndicator />

        {/* STEP 1: UPLOAD */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h2>
            <p className="text-gray-500 mb-8">PDFs and Images supported</p>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer relative group">
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">☁️</span>
                </div>
                {selectedFiles.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-blue-600">{selectedFiles.length} file(s) selected</p>
                    <p className="text-sm text-gray-500">{selectedFiles.map(f => f.name).join(", ")}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-medium text-gray-700">Click or Drag files here</p>
                    <p className="text-sm text-gray-400 mt-2">Maximum file size 50MB</p>
                  </>
                )}
              </div>
            </div>

            {analysis && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="block text-xs text-gray-500 uppercase tracking-wide font-bold">Total Pages</span>
                  <span className="text-2xl font-bold text-gray-900">{analysis.totalPages}</span>
                </div>
                <button
                  onClick={findBestShops}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md transition-all"
                >
                  {loading ? "Analyzing..." : "Find Best Shops →"}
                </button>
              </div>
            )}

            {loading && !analysis && <p className="mt-4 text-gray-500 animate-pulse">Processing files...</p>}
          </div>
        )}

        {/* STEP 2: SELECT SHOP */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Select a Print Shop</h2>
              <button onClick={() => setCurrentStep(1)} className="text-sm text-gray-500 hover:text-gray-900">← Back</button>
            </div>

            {shops.length === 0 && !loading && (
              <div className="text-center p-8 bg-white rounded-xl text-gray-500">No shops found nearby.</div>
            )}

            <div className="grid gap-4">
              {shops.map((shop) => (
                <label
                  key={shop.id}
                  className={`relative flex items-center p-6 bg-white border-2 rounded-xl cursor-pointer transition-all hover:shadow-md
                     ${selectedShop?.id === shop.id ? "border-blue-500 ring-4 ring-blue-50/50" : "border-transparent border-gray-100 shadow-sm"}`}
                >
                  <input
                    type="radio"
                    name="shop"
                    className="absolute opacity-0"
                    onChange={() => setSelectedShop(shop)}
                  />

                  {/* Icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl mr-6">
                    🏪
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-lg">{shop.name}</h3>
                      {shop.score < 2 && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Best Match</span>}
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">📍 {(shop.distance).toFixed(1)} km</span>
                      <span className="flex items-center gap-1">👥 Queue: {shop.queueLength}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">₹{shop.totalPrice}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleCreateOrder}
                disabled={loading || !selectedShop}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
              >
                {loading ? "Creating Order..." : `Pay ₹${selectedShop?.totalPrice || 0} & Print`}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Upload;
