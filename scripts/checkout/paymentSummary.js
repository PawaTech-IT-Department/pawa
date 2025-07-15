import { cart, calculateTotalCartQuantity } from "../../data/cart.js";
import { loadProducts } from "../../data/products.js";
import formatCurrency from "../utils/moneyFormatter.js";

// Cache for products to avoid multiple API calls
let products = [];

function getProduct(productId) {
  const matchingProduct = products.find((product) => product.id === productId);
  if (!matchingProduct) {
    console.warn(`Product with ID ${productId} not found in cached products.`);
    return null;
  }
  return matchingProduct;
}

export async function renderPaymentSummary() {
  try {
    // Load products if not already cached
    if (products.length === 0) {
      products = await loadProducts();
      if (!products || products.length === 0) {
        console.error("No products loaded from API.");
        const cartContainer = document.querySelector(".cart--summary");
        if (cartContainer) {
          cartContainer.innerHTML =
            '<p style="text-align: center; color: red;">No products available to display summary.</p>';
        }
        return;
      }
      // Sync with global products for consistency
      window.products = products;
    }

    const cartContainer = document.querySelector(".cart--summary");
    if (!cartContainer) {
      console.warn("Cart summary element not found.");
      return;
    }

    let subTotalCents = 0;
    cart.forEach((cartItem) => {
      const productId = cartItem.productId;
      const matchingProduct = getProduct(productId);
      if (matchingProduct) {
        subTotalCents += matchingProduct.priceCents * cartItem.quantity;
      } else {
        console.warn(
          `Skipping cart item with productId ${productId}: Product not found.`
        );
      }
    });

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

    // Attach event listeners for buttons
    const checkoutButton = document.querySelector(".proceed-checkout-btn");
    if (checkoutButton) {
      checkoutButton.addEventListener("click", () => {
        console.log("Proceed to checkout clicked");
        // Add checkout logic here (e.g., redirect to checkout page)
      });
    }

    const continueShoppingButton = document.querySelector(
      ".continue-shopping-btn"
    );
    if (continueShoppingButton) {
      continueShoppingButton.addEventListener("click", () => {
        console.log("Continue shopping clicked");
        // Add navigation logic (e.g., redirect to products page)
        window.location.href = "/products.html"; // Adjust URL as needed
      });
    }
  } catch (error) {
    console.error("Error rendering payment summary:", error);
    const cartContainer = document.querySelector(".cart--summary");
    if (cartContainer) {
      cartContainer.innerHTML =
        '<p style="text-align: center; color: red;">Error loading payment summary. Please try again later.</p>';
    }
  }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  renderPaymentSummary();
});
