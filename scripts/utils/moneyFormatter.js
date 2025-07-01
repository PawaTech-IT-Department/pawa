export default function formatCurrency(priceCents) {
  if (typeof priceCents !== "number" || isNaN(priceCents)) {
    throw new Error("Input must be a valid number");
  }
  return (Math.round(priceCents) / 100).toFixed(2);
}
