import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export async function fetchAvailableShops() {
  const q = query(collection(db, "shops"), where("isAvailable", "==", true));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// 🔥 ONE QUERY FOR ALL ACTIVE ORDERS
export async function fetchActiveOrders() {
  const q = query(collection(db, "orders"), where("status", "!=", "completed"));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => doc.data());
}
