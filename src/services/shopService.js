import { db, auth } from "../firebase"; // Adjust path to your firebase config
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

// 1. Check if the current logged-in user is already a shop owner
export const checkIsShopOwner = async (uid) => {
  const shopRef = doc(db, "shops", uid); // using UID as ShopID for simplicity
  const shopSnap = await getDoc(shopRef);
  return shopSnap.exists();
};

// 2. Create the Shop Profile (The "Registration" Step)
export const createShopProfile = async (shopData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  // We use the User's UID as the Shop Document ID.
  // This makes security rules much easier later.
  await setDoc(doc(db, "shops", user.uid), {
    shopId: user.uid,        // Redundant but helpful for queries [cite: 101]
    ownerId: user.uid,       // The key link for security [cite: 103]
    name: shopData.name,     // [cite: 102]
    location: {              // [cite: 104]
      lat: shopData.lat,
      lng: shopData.lng
    },
    pricePerPage: Number(shopData.price), // [cite: 108]
    isAvailable: true,       // Default to open [cite: 110]
    isVerified: false,       // Default to unverified [cite: 111]
    createdAt: serverTimestamp() // [cite: 112]
  });
};

export const subscribeToShopOrders = (shopId, callback) => {
  const q = query(
    collection(db, "orders"),
    where("shopId", "==", shopId),
    // Show newest orders first
    orderBy("createdAt", "desc")
  );

  // onSnapshot = Keep connection open
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
};

export const toggleShopStatus = async (shopId, isOpen) => {
  const shopRef = doc(db, "shops", shopId);
  await updateDoc(shopRef, {
    isAvailable: isOpen
  });
};

/**
 * ℹ️ GET SHOP DETAILS (For Header):
 */
export const getShopDetails = async (shopId) => {
  const docRef = doc(db, "shops", shopId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};