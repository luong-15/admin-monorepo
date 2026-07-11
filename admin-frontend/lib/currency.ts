export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatPrice(price: number): string {
  // Format as Vietnamese currency but remove the "₫" symbol for cleaner display
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}
