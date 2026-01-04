import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs
} from "firebase/firestore";
import { db } from "./firebase";

export async function createOrder({ userId, shopId, totalPages, totalPrice }) {
  if (!userId || !shopId) {
    throw new Error("Missing userId or shopId");
  }

  const docRef = await addDoc(collection(db, "orders"), {
    userId,
    shopId,
    totalPages,
    totalPrice,
    status: "pending",
    files: [],
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function attachFilesToOrder(orderId, filesMeta) {
  if (!orderId || !filesMeta?.length) {
    throw new Error("Invalid orderId or filesMeta");
  }

  const orderRef = doc(db, "orders", orderId);

  await updateDoc(orderRef, {
    files: filesMeta,
  });
}



export async function updateOrderStatus(orderId, status) {
  const allowed = [
    "pending",
    "printing",
    "ready",
    "completed",
    "failed",
    "rejected",
  ];

  if (!allowed.includes(status)) {
    throw new Error("Invalid order status");
  }

  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, { status });
}

export function listenToOrder(orderId, callback) {
  const orderRef = doc(db, "orders", orderId);

  return onSnapshot(orderRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        id: snapshot.id,
        ...snapshot.data(),
      });
    }
  });
}

export async function fetchUserOrders(userId) {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
