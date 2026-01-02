// import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
// import { db } from "./firebase";

// // Base location (YOU)
// const BASE_LAT = 22.3059;
// const BASE_LNG = 73.1474;

// // Helper to add small random offset (~0.01 ≈ 1km)
// function randomOffset() {
//   return (Math.random() - 0.5) * 0.04;
// }

// const shops = [
//   { name: "QuickPrint Xerox", pricePerPage: 2 },
//   { name: "City Copy Center", pricePerPage: 3 },
//   { name: "FastPrint Hub", pricePerPage: 2.5 },
//   { name: "Budget Xerox", pricePerPage: 1.5 },
//   { name: "Premium Prints", pricePerPage: 4 },
//   { name: "PaperPoint", pricePerPage: 2 },
//   { name: "Ink & Paper", pricePerPage: 3.5 },
//   { name: "Speedy Xerox", pricePerPage: 2 },
//   { name: "Smart Print Shop", pricePerPage: 2.8 },
//   { name: "Daily Prints", pricePerPage: 1.8 },
// ];

// export async function seedShops() {
//   const shopCollection = collection(db, "shops");

//   for (let i = 0; i < shops.length; i++) {
//     const shopId = `seed_shop_${i + 1}`;

//     const shopData = {
//       shopId,
//       ownerId: shopId, // fake owner for testing
//       name: shops[i].name,
//       location: {
//         lat: BASE_LAT + randomOffset(),
//         lng: BASE_LNG + randomOffset(),
//       },
//       pricePerPage: shops[i].pricePerPage,
//       isAvailable: true,
//       isVerified: true,
//       createdAt: serverTimestamp(),
//     };

//     await setDoc(doc(shopCollection, shopId), shopData);
//     console.log(`✅ Seeded: ${shopData.name}`);
//   }

//   console.log("🔥 All shops seeded successfully");
// }

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Your real test users
const USERS = ["CMgRWHGhs9XggcEupgdt5xobzVH3", "zIGQlSFrU1b6U1UWDkOSd0LG1OA3"];

// Seeded shops (from previous seed.js)
const SHOPS = [
  "seed_shop_1",
  "seed_shop_2",
  "seed_shop_3",
  "seed_shop_4",
  "seed_shop_5",
  "seed_shop_6",
  "seed_shop_7",
  "seed_shop_8",
  "seed_shop_9",
  "seed_shop_10",
];

// Order statuses (completed excluded from queue)
const ACTIVE_STATUSES = ["pending", "printing", "ready"];

// Helper
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPages() {
  return Math.floor(Math.random() * 30) + 1; // 1–30 pages
}

export async function seedShops() {
  const ordersRef = collection(db, "orders");

  let count = 0;

  for (let i = 0; i < SHOPS.length; i++) {
    const shopId = SHOPS[i];

    // 🔥 uneven load: some shops busy, some idle
    const ordersForShop =
      i < 3
        ? 8 // very busy shops
        : i < 6
        ? 5 // medium load
        : i < 8
        ? 2 // light load
        : 0; // idle shops

    for (let j = 0; j < ordersForShop; j++) {
      const totalPages = randomPages();
      const pricePerPage = 2 + Math.random() * 2; // ₹2–₹4
      const totalPrice = Math.round(totalPages * pricePerPage);

      await addDoc(ordersRef, {
        userId: randomFrom(USERS),
        shopId,
        totalPages,
        totalPrice,
        status: randomFrom(ACTIVE_STATUSES),
        files: [], // no files for seed
        createdAt: serverTimestamp(),
      });

      count++;
    }
  }

  console.log(`🔥 Seeded ${count} orders successfully`);
}
