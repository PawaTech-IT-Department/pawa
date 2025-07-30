import { cartInstance, calculateTotalCartQuantity, emptyCart } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { addOrder } from "../../data/order.js";
import formatCurrency from "../utils/moneyFormatter.js";

export async function renderPaymentSummary() {
  const cartContainer = document.querySelector(".cart--summary");

  // If cart is empty, show $0.00 for all values
  if (!cartInstance.cart || cartInstance.cart.length === 0) {
    cartContainer.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary--item">
        <span>Items (0)</span>
        <span>$0.00</span>
      </div>
      <div class="summary--item">
        <span>Shipping</span>
        <span class="free--shipping">Free</span>
      </div>
      <div class="summary--item">
        <span>Tax (16%)</span>
        <span>$0.00</span>
      </div>
      <div class="summary--total">
        <span>Total</span>
        <span>$0.00</span>
      </div>
      <p class="shipping--info">
        <i class="fas fa-truck"></i> Free shipping on orders over $100
      </p>
    `;
    return;
  }

  let subTotalCents = 0;
  // Fetch all products for cart items concurrently
  const productPromises = cartInstance.cart.map(async (cartItem) => {
    try {
      const productId = cartItem.productId;
      const matchingProduct = await getProduct(productId);
      return { cartItem, matchingProduct };
    } catch (error) {
      return { cartItem, matchingProduct: null };
    }
  });
  const productResults = await Promise.all(productPromises);
  for (const { cartItem, matchingProduct } of productResults) {
    if (matchingProduct) {
      subTotalCents += matchingProduct.priceCents * cartItem.quantity;
    }
  }
  const taxCent = (16 * subTotalCents) / 100;
  const totalCents = subTotalCents + taxCent;

  const paymentSummaryHTML = `
    <h3>Order Summary</h3>
    <div class="summary--item">
      <span>Items (${calculateTotalCartQuantity()})</span>
      <span>$${formatCurrency(subTotalCents)}</span>
    </div>
    <div class="summary--item">
      <span>Shipping</span>
      <span class="free--shipping">Free</span>
    </div>
    <div class="summary--item">
      <span>Tax (16%)</span>
      <span>$${formatCurrency(taxCent)}</span>
    </div>
    <!-- total -->
    <div class="summary--total">
      <span>Total</span>
      <span>$${formatCurrency(totalCents)}</span>
    </div>
    <button class="btn btn--primary proceed-checkout-btn">
      Proceed to Checkout
    </button>
    <button class="btn btn--secondary continue-shopping-btn">
      Continue Shopping
    </button>
    <p class="shipping--info">
      <i class="fas fa-truck"></i> Free shipping on orders over $100
    </p>
  `;

  cartContainer.innerHTML = paymentSummaryHTML;

  // Proceed to Checkout logic
  const checkoutButton = document.querySelector(".proceed-checkout-btn");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      if (!cartInstance.cart || cartInstance.cart.length === 0) {
        alert("Your cart is empty."); // Or use a custom message box
        return;
      }
      // Redirect to the new order finalization page
      window.location.href = "/pages/orders.html";
    });
  }

  const continueShoppingButton = document.querySelector(
    ".continue-shopping-btn"
  );
  if (continueShoppingButton) {
    continueShoppingButton.addEventListener("click", () => {
      window.location.href = "/pages/shop.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderPaymentSummary();
});
