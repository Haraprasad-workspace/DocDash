import { calculateHaversineDistance } from "./geo";
import { fetchAvailableShops, fetchActiveOrders } from "./shops";

const DISTANCE_WEIGHT = 0.3;
const QUEUE_WEIGHT = 1.0;

export async function rankShops(userLocation) {
  // 1️⃣ Fetch data in parallel
  const [shops, activeOrders] = await Promise.all([
    fetchAvailableShops(),
    fetchActiveOrders(),
  ]);

  // 2️⃣ Build queue map
  const queueMap = {};

  for (const order of activeOrders) {
    if (!queueMap[order.shopId]) {
      queueMap[order.shopId] = 0;
    }
    queueMap[order.shopId]++;
  }

  // 3️⃣ Rank shops
  const ranked = shops.map((shop) => {
    const distance = calculateHaversineDistance(userLocation, {
      lat: shop.location.lat,
      lng: shop.location.lng,
    });

    const queueLength = queueMap[shop.id] || 0;

    const score = distance * DISTANCE_WEIGHT + queueLength * QUEUE_WEIGHT;

    return {
      id: shop.id,
      name: shop.name,
      pricePerPage: shop.pricePerPage,
      distance,
      queueLength,
      score,
    };
  });

  ranked.sort((a, b) => a.score - b.score);
  return ranked;
}

export async function getTopShops(userLocation, limit = 5) {
  const ranked = await rankShops(userLocation);
  return ranked.slice(0, limit);
}
