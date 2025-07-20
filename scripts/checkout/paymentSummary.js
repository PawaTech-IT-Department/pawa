import { cart, calculateTotalCartQuantity, emptyCart } from "../../data/cart.js"; // Ensure this path is correct
import { getProduct } from "../../data/products.js"; // Ensure this path is correct
import { addOrder } from "../../data/order.js";
import formatCurrency from "../utils/moneyFormatter.js";

export async function renderPaymentSummary() {
  const cartContainer = document.querySelector(".cart--summary");

  let subTotalCents = 0;
  
  // Fetch all products for cart items
  for (const cartItem of cart) {
    try {
      const productId = cartItem.productId;
      const matchingProduct = await getProduct(productId);
      if (matchingProduct) {
        subTotalCents += matchingProduct.priceCents * cartItem.quantity;
      }
    } catch (error) {
      console.error(`Error fetching product ${cartItem.productId} for payment summary:`, error);
      // Skip this product in total calculation if it can't be fetched
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
    checkoutButton.addEventListener("click", async () => {
      if (!cart || cart.length === 0) {
        alert("Your cart is empty.");
        return;
      }
      try {
        const response = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cart }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to place order");
        }
        const order = await response.json();
        addOrder(order);
        emptyCart(); // <-- clear the cart after placing order
        window.location.href = "/pages/orders.html";
      } catch (error) {
        alert("Error placing order: " + error.message);
      }
    });
  }
}
