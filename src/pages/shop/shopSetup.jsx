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
    lng: null
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
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">🏠 Setup Your Shop</h2>
          <p className="text-blue-100 text-sm">One-time setup to get started.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Campus Xerox Center"
              className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Page (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="number"
                required
                min="1"
                placeholder="2"
                className="w-full pl-8 text-black pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

          {/* Location Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Location</label>
            <div 
              onClick={handleLocation}
              className={`border-2 border-dashed rounded-lg p-4 flex items-center justify-center cursor-pointer transition-colors ${
                isLocationSet ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-blue-400"
              }`}
            >
              {isLocationSet ? (
                <div className="text-green-700 flex items-center gap-2 font-medium">
                  <span>✅ Location Captured</span>
                </div>
              ) : (
                <div className="text-gray-500 flex flex-col items-center gap-1">
                  <span className="text-2xl">📍</span>
                  <span className="text-sm">Tap to detect current location</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isLocationSet}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold shadow-md transition-all ${
              loading || !isLocationSet 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
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