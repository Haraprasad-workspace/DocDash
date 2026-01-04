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
                ${currentStep >= step.num
                  ? "bg-btn-primary-bg border-btn-primary-bg text-btn-primary-text"
                  : "bg-brand-bg border-border-default text-brand-text-disabled"
                }`}
            >
              {step.num}
            </div>
            <span
              className={`absolute top-12 text-xs font-medium w-24 text-center
                ${currentStep >= step.num ? "text-brand-text-primary" : "text-brand-text-disabled"}`}
            >
              {step.label}
            </span>
          </div>

          {idx < 2 && (
            <div
              className={`w-24 h-1 mx-2 rounded transition-colors
                ${currentStep > step.num ? "bg-btn-primary-bg" : "bg-brand-surface-primary"}`}
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
    <main className="flex-1 bg-page-bg min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <StepIndicator />

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="bg-brand-bg rounded-3xl p-8 shadow-sm border border-border-default text-center">
            <h2 className="text-2xl font-bold mb-2 text-brand-text-primary">Upload Documents</h2>
            <p className="text-brand-text-muted mb-8">PDFs & Images supported</p>

            <div className="group border-2 border-dashed border-border-default rounded-2xl p-12 relative hover:bg-brand-surface-secondary transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
              <div className="relative z-10 pointer-events-none">
                <div className="mx-auto h-12 w-12 text-brand-text-disabled mb-4">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-brand-text-body">
                  Click or drag files here
                </p>
              </div>
            </div>

            {analysis && (
              <div className="mt-8 flex flex-col md:flex-row justify-between items-center bg-brand-surface-secondary p-6 rounded-2xl gap-4">
                <div className="text-left">
                  <span className="block text-sm text-brand-text-muted">Analysis Complete</span>
                  <span className="font-bold text-lg text-brand-text-primary">
                    {analysis.totalPages} Pages Detected
                  </span>
                </div>
                <button
                  onClick={findBestShops}
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-btn-primary-bg text-btn-primary-text rounded-xl hover:bg-btn-primary-hover disabled:opacity-50 transition-colors shadow-md hover:shadow-lg font-medium"
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-brand-text-primary">Select a Print Shop</h2>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-sm text-brand-text-muted hover:text-brand-text-primary transition-colors"
              >
                ← Back
              </button>
            </div>

            <div className="grid gap-4">
              {shops.map((shop) => (
                <label
                  key={shop.id}
                  className={`relative flex items-center p-6 border rounded-2xl cursor-pointer transition-all duration-300 group
                    ${selectedShop?.id === shop.id
                      ? "border-brand-text-primary ring-1 ring-brand-text-primary bg-brand-surface-secondary shadow-md"
                      : "border-border-default bg-card-bg hover:border-brand-text-muted/50 hover:shadow-lg hover:-translate-y-0.5"
                    }`}
                >
                  <input
                    type="radio"
                    name="shop"
                    className="hidden"
                    onChange={() => setSelectedShop(shop)}
                  />

                  <div className="flex-1">
                    <h3 className="font-bold text-brand-text-primary text-xl tracking-tight">{shop.name}</h3>
                    <div className="flex items-center gap-6 mt-2 text-sm text-brand-text-muted font-medium">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-brand-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {shop.distance.toFixed(1)} km
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-brand-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Queue: <span className={shop.queueLength > 5 ? "text-status-warning-text" : "text-status-success-text"}>{shop.queueLength}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-2xl font-bold text-brand-text-primary">₹{shop.totalPrice}</span>
                    <span className="text-xs text-brand-text-disabled font-medium">Est. Total</span>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={!selectedShop || loading}
              className="w-full py-4 bg-btn-primary-bg text-btn-primary-text font-bold rounded-2xl hover:bg-btn-primary-hover disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
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
