import { cart } from "../../data/cart.js"; // Ensure this path is correct
import { getProduct } from "../../data/products.js"; // Ensure this path is correct
import formatCurrency from "../utils/moneyFormatter.js";

const cartContainer = document.querySelector(".cart--content");

export function renderPaymentSummary() {
  let subTotalCents = 0;
  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    const matchingProduct = getProduct(productId);
    subTotalCents += matchingProduct.priceCents * cartItem.quantity;
  });
  const taxCent = (16 * subTotalCents) / 100;
  const totalCents = subTotalCents + taxCent;

  const paymentSummaryHTML = `
  <div class="cart--summary">
    <h3>Order Summary</h3>
    <div class="summary--item">
      <span>Subtotal</span>
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
  </div>
  `;

  cartContainer.insertAdjacentHTML("beforeend", paymentSummaryHTML);
}
