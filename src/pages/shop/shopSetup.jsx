import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createShopProfile } from "../../services/shopService";

const ShopSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    lat: null,
    lng: null,
  });

  // 1. Handle Geolocation
  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    // Show temporary loading state if needed
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
      },
      (error) => {
        alert("Unable to retrieve your location. Please allow access.");
      }
    );
  };

  // 2. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createShopProfile(formData);
      navigate("/shop/dashboard");
    } catch (error) {
      console.error("Setup failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLocationSet = formData.lat && formData.lng;

  return (
    <div className="min-h-screen bg-page-bg py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-card-bg/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">

        {/* Header */}
        <div className="bg-brand-text-primary px-8 py-6 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-1">🏠 Setup Your Shop</h2>
            <p className="text-gray-300 text-sm">One-time setup to get started.</p>
          </div>
          {/* Subtle pattern overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {/* Shop Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-text-primary">Shop Name</label>
            <input
              type='text'
              required
              placeholder="e.g. Campus Xerox Center"
              className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl focus:ring-2 focus:ring-brand-text-primary focus:border-transparent outline-none transition-all placeholder:text-input-placeholder"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-text-primary">Price per Page (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted font-bold">₹</span>
              <input
                type='number'
                required
                min="1"
                placeholder="2"
                className="w-full pl-10 pr-4 py-3 bg-input-bg border border-input-border rounded-xl focus:ring-2 focus:ring-brand-text-primary focus:border-transparent outline-none transition-all placeholder:text-input-placeholder"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          {/* Location Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-brand-text-primary">Shop Location</label>
            <div
              onClick={handleLocation}
              className={`group border-2 border-dashed rounded-2xl p-6 flex items-center justify-center cursor-pointer transition-all duration-300 ${isLocationSet
                  ? "border-status-success-text/50 bg-status-success-bg/30"
                  : "border-border-default hover:border-brand-text-primary hover:bg-brand-surface-secondary/50"
                }`}
            >
              {isLocationSet ? (
                <div className="text-status-success-text flex flex-col items-center gap-2 font-medium">
                  <div className="w-10 h-10 rounded-full bg-status-success-text text-white flex items-center justify-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Location Captured!</span>
                </div>
              ) : (
                <div className="text-brand-text-muted group-hover:text-brand-text-primary flex flex-col items-center gap-2 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-brand-surface-secondary group-hover:bg-white border border-transparent group-hover:border-border-default flex items-center justify-center transition-all shadow-sm">
                    <span className="text-2xl">📍</span>
                  </div>
                  <span className="text-sm font-medium">Tap to detect current location</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={loading || !isLocationSet}
            className={`w-full py-4 px-6 rounded-xl font-bold tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${loading || !isLocationSet
                ? "bg-btn-disabled-bg text-btn-disabled-text cursor-not-allowed shadow-none hover:translate-y-0"
                : "bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Creating Shop...
              </span>
            ) : (
              "Complete Setup"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShopSetup;
