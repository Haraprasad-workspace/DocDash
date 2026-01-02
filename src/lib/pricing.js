export function calculatePricesForShops(totalPages, shops) {
  if (!Array.isArray(shops)) {
    throw new Error("shops must be an array");
  }

  return shops.map((shop) => ({
    ...shop,
    totalPrice: totalPages * shop.pricePerPage,
  }));
}
