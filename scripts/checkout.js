import { renderOrderSummary } from "./checkout/orderSummary.js";
import { renderPaymentSummary } from "./checkout/paymentSummary.js";
import { loadProducts } from "../data/products.js";

document.addEventListener("DOMContentLoaded", async function () {
  try {
    await renderOrderSummary();
    await renderPaymentSummary();
  } catch (error) {
    console.error("Error rendering checkout:", error);
    // Show error message to user
    const cartList = document.querySelector(".cart--product--list");
    const cartSummary = document.querySelector(".cart--summary");
    
    if (cartList) {
      cartList.innerHTML = '<p style="text-align: center; color: #cc0000;">Error loading cart. Please try refreshing the page.</p>';
    }
    
    if (cartSummary) {
      cartSummary.innerHTML = '<p style="text-align: center; color: #cc0000;">Error loading payment summary.</p>';
    }
  }
});
