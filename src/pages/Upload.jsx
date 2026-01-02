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

  /* ===============================
     1️⃣ FILE SELECTION + ANALYSIS
     =============================== */
  async function handleFileChange(e) {
    const files = [...e.target.files];
    setSelectedFiles(files);

    setLoading(true);
    try {
      const result = await analyzeFiles(files);
      setAnalysis(result);
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
    } catch (err) {
      alert("Failed to fetch shops");
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

    let orderId = null; // 🔑 critical for fail-safe

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

      // 🔥 FAIL-SAFE (ONLY PLACE IT BELONGS)
      if (orderId) {
        try {
          await updateOrderStatus(orderId, "failed");
        } catch (e) {
          console.error("Failed to mark order as failed", e);
        }
      }

      alert("Order creation failed. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  /* ===============================
     UI (INTENTIONALLY BASIC)
     =============================== */
  return (
    <main className='flex-1'>
      <h2>Create Print Order</h2>

      <input
        type='file'
        multiple
        accept='application/pdf,image/*'
        onChange={handleFileChange}
      />

      {analysis && (
        <>
          <p>Total Pages: {analysis.totalPages}</p>
          <button onClick={findBestShops} disabled={loading}>
            Find Best Shops
          </button>
        </>
      )}

      {shops.length > 0 && (
        <>
          <h3>Select a Shop</h3>

          {shops.map((shop) => (
            <div key={shop.id}>
              <label>
                <input
                  type='radio'
                  name='shop'
                  onChange={() => setSelectedShop(shop)}
                />
                {shop.name} — ₹{shop.totalPrice}
                &nbsp;(Queue: {shop.queueLength})
              </label>
            </div>
          ))}

          <button
            onClick={handleCreateOrder}
            disabled={loading || !selectedShop}
          >
            Confirm Order
          </button>
        </>
      )}

      {loading && <p>Processing...</p>}
    </main>
  );
}

export default Upload;
