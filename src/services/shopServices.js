import { db, auth } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Check if user is a shop owner with completed setup
 */
export async function checkIsShopOwner(uid) {
  try {
    const shopDoc = await getDoc(doc(db, "shops", uid));
    return shopDoc.exists();
  } catch (error) {
    console.error("Error checking shop owner:", error);
    return false;
  }
}

/**
 * Create shop profile during setup
 */
export async function createShopProfile(formData) {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  const shopData = {
    uid: user.uid,
    name: formData.name,
    pricePerPage: Number(formData.price),
    location: {
      lat: formData.lat,
      lng: formData.lng,
    },
    email: user.email,
    createdAt: serverTimestamp(),
    isActive: true,
  };

  await setDoc(doc(db, "shops", user.uid), shopData);

  // Update user role to "shop" if not already
  await setDoc(
    doc(db, "users", user.uid),
    {
      role: "shop",
    },
    { merge: true }
  );
}
