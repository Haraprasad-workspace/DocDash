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
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Select Shop

  /* ===============================
     STEP INDICATOR
     =============================== */
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      {[
        { num: 1, label: "Upload" },
        { num: 2, label: "Select Shop" },
        { num: 3, label: "Payment" },
      ].map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors
                ${
                  currentStep >= step.num
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
            >
              {step.num}
            </div>
            <span
              className={`absolute top-12 text-xs font-medium w-20 text-center
                ${currentStep >= step.num ? "text-blue-600" : "text-gray-400"}`}
            >
              {step.label}
            </span>
          </div>

          {idx < 2 && (
            <div
              className={`w-24 h-1 mx-2 rounded transition-colors
                ${currentStep > step.num ? "bg-blue-600" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  /* ===============================
     FILE ANALYSIS
     =============================== */
  async function handleFileChange(e) {
    const files = [...e.target.files];
    if (!files.length) return;

    setSelectedFiles(files);
    setLoading(true);
    try {
      const result = await analyzeFiles(files);
      setAnalysis(result);
    } catch (err) {
      alert(err.message || "Failed to analyze files");
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     FIND SHOPS
     =============================== */
  async function findBestShops() {
    if (!analysis) return;

    setLoading(true);
    try {
      const userLocation = await getUserLocation();
      const topShops = await getTopShops(userLocation, 5);
      const priced = calculatePricesForShops(analysis.totalPages, topShops);

      setShops(priced);
      setCurrentStep(2);
    } catch (err) {
      alert("Failed to fetch shops. Please allow location access.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     CREATE ORDER
     =============================== */
  async function handleCreateOrder() {
    if (!selectedShop) return alert("Select a shop first");

    setLoading(true);
    let orderId = null;

    try {
      orderId = await createOrder({
        userId: currentUser.uid,
        shopId: selectedShop.id,
        totalPages: analysis.totalPages,
        totalPrice: selectedShop.totalPrice,
      });

      const uploadedFiles = await uploadFilesToCloudinary(
        selectedFiles,
        orderId
      );

      const filesMeta = uploadedFiles.map((f, idx) => ({
        name: f.name,
        url: f.url,
        publicId: f.publicId,
        type: f.type,
        pages: analysis.filesMeta[idx].pages,
      }));

      await attachFilesToOrder(orderId, filesMeta);

      navigate(`/order/${orderId}`);
    } catch (err) {
      console.error(err);
      alert("Order creation failed. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     UI
     =============================== */
  return (
    <main className="flex-1 bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <StepIndicator />

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <h2 className="text-2xl font-bold mb-2">Upload Documents</h2>
            <p className="text-gray-500 mb-8">PDFs & Images supported</p>

            <div className="border-2 border-dashed rounded-xl p-12 relative hover:bg-blue-50 transition">
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <p className="text-lg font-medium text-gray-700">
                Click or drag files here
              </p>
            </div>

            {analysis && (
              <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <span className="font-bold">
                  Total Pages: {analysis.totalPages}
                </span>
                <button
                  onClick={findBestShops}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Analyzing..." : "Find Best Shops →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">Select a Print Shop</h2>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-sm text-gray-500"
              >
                ← Back
              </button>
            </div>

            <div className="grid gap-4">
              {shops.map((shop) => (
                <label
                  key={shop.id}
                  className={`flex items-center p-6 border-2 rounded-xl cursor-pointer transition
                    ${
                      selectedShop?.id === shop.id
                        ? "border-blue-500 ring-4 ring-blue-50"
                        : "border-gray-200"
                    }`}
                >
                  <input
                    type="radio"
                    name="shop"
                    className="hidden"
                    onChange={() => setSelectedShop(shop)}
                  />

                  <div className="flex-1">
                    <h3 className="font-bold">{shop.name}</h3>
                    <p className="text-sm text-gray-500">
                      📍 {shop.distance.toFixed(1)} km • 👥 Queue:{" "}
                      {shop.queueLength}
                    </p>
                  </div>

                  <div className="text-right font-bold text-lg">
                    ₹{shop.totalPrice}
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={!selectedShop || loading}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Creating Order..."
                : `Pay ₹${selectedShop?.totalPrice || 0} & Print`}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Upload;
