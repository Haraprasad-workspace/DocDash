import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc, // ✅ Imported
  getDoc,    // ✅ Imported
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase"; // ✅ Uses the main, authenticated instance
// (Make sure "../firebase" is the correct path to your main firebase.js)
import CryptoJS from 'crypto-js'; // ✅ Imported

// Load Credentials
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

// --- HELPER: Delete Single File from Cloudinary ---
async function deleteFileFromCloudinary(publicId) {
  if (!publicId) return;

  const timestamp = Math.round((new Date()).getTime() / 1000);

  // Generate Signature: sha1("public_id=xxx&timestamp=xxx" + secret)
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
  const signature = CryptoJS.SHA1(stringToSign).toString();

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("signature", signature);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp);

  try {
    // 1. Try deleting as 'image' (This works for Images and most PDFs)
    let response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      body: formData
    });

    // 2. If it fails (e.g., it was a raw file), try 'raw'
    if (!response.ok) {
      await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/destroy`, {
        method: 'POST',
        body: formData
      });
    }
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
}

// --- MAIN: Delete Order & Files ---
export async function deleteOrder(orderId) {
  if (!orderId) throw new Error("No order ID provided");

  const orderRef = doc(db, "orders", orderId);

  // 1. Get order data first to find the files
  const snapshot = await getDoc(orderRef);

  if (snapshot.exists()) {
    const orderData = snapshot.data();
    const files = orderData.files || [];

    // 2. Delete all files from Cloudinary
    if (files.length > 0) {
      console.log(`Deleting ${files.length} files from Cloudinary...`);
      await Promise.all(files.map(file => deleteFileFromCloudinary(file.publicId)));
    }

    // 3. Delete the Order from Firestore
    await deleteDoc(orderRef);
    console.log("Order deleted from Firestore.");
    return true;
  }
  return false;
}

// --- EXISTING FUNCTIONS ---

export async function createOrder({ userId, shopId, totalPages, totalPrice }) {
  if (!userId || !shopId) throw new Error("Missing userId or shopId");
  const docRef = await addDoc(collection(db, "orders"), {
    userId, shopId, totalPages, totalPrice,
    status: "pending", files: [], createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function attachFilesToOrder(orderId, filesMeta) {
  if (!orderId || !filesMeta?.length) throw new Error("Invalid orderId");
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { files: filesMeta });
}

export async function updateOrderStatus(orderId, status) {
  const allowed = ["pending", "printing", "ready", "completed", "failed", "rejected"];
  if (!allowed.includes(status)) throw new Error("Invalid order status");
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status, updatedAt: new Date() });
}

export function listenToOrder(orderId, callback) {
  const orderRef = doc(db, "orders", orderId);
  return onSnapshot(orderRef, (snapshot) => {
    if (snapshot.exists()) callback({ id: snapshot.id, ...snapshot.data() });
  });
}

export async function fetchUserOrders(userId) {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}