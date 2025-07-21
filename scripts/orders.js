import { orders } from "../data/order.js";
import { getProduct } from "../data/products.js";
import { addToCart, emptyCart } from "../data/cart.js";

async function renderLatestOrder() {
  if (!orders.length) {
    document.querySelector(".order-placed-title").textContent = "No recent order found.";
    return;
  }
  const order = orders[orders.length - 1];
  document.querySelector(".js-order-date").textContent = `Order Date: ${new Date(order.order_time).toLocaleString()}`;
  document.querySelector(".js-order-id").textContent = `Order ID: ${order.id}`;
  document.querySelector(".js-order-total").textContent = `Total: $${(order.total_cost_cents / 100).toFixed(2)}`;

  const productsList = document.querySelector(".js-order-products-list");
  let html = "";
  for (const p of order.products) {
    let product = null;
    try {
      product = await getProduct(p.productId);
    } catch (e) {}
    html += `<div class="order-product-card">
      <img src="/img/${product ? product.image.slice(7) : ''}" alt="${product ? product.name : ''}" class="order-product-img" />
      <div class="order-product-info">
        <h4>${product ? product.name : p.productId}</h4>
        <p>Arriving on: ${new Date(p.estimatedDeliveryTime).toLocaleDateString()}</p>
        <p>Quantity: ${p.quantity}</p>
        <button class="btn buy-again-btn" data-product-id="${p.productId}" data-quantity="${p.quantity}">Buy it again</button>
      </div>
    </div>`;
  }
  productsList.innerHTML = html;

  // Buy again button logic (add to cart and redirect to shop)
  document.querySelectorAll('.buy-again-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = btn.getAttribute('data-product-id');
      const quantity = parseInt(btn.getAttribute('data-quantity')) || 1;
      addToCart(productId, quantity);
      emptyCart();
      window.location.href = '/shop.html';
    });
  });

  // Modal logic for order-level tracking
  const modal = document.getElementById("order-tracking-modal");
  const modalContent = modal.querySelector(".modal-order-details");
  const closeModalBtn = modal.querySelector(".close-modal-btn");
  const trackBtn = document.querySelector(".order-track-btn");
  if (trackBtn) {
    trackBtn.addEventListener("click", async () => {
      // Build modal content
      let modalHTML = `<h3>Order Tracking</h3>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Date:</strong> ${new Date(order.order_time).toLocaleString()}</p>
        <p><strong>Total:</strong> $${(order.total_cost_cents / 100).toFixed(2)}</p>
        <h4>Items in this Order:</h4>
        <ul class="modal-product-list">`;
      for (const p of order.products) {
        let product = null;
        try {
          product = await getProduct(p.productId);
        } catch (e) {}
        modalHTML += `<li>
          <span>${product ? product.name : p.productId}</span> &times; ${p.quantity}
          <span class="modal-delivery-date">Estimated Delivery: ${p.estimatedDeliveryTime ? new Date(p.estimatedDeliveryTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
        </li>`;
      }
      modalHTML += `</ul>`;
      modalContent.innerHTML = modalHTML;
      modal.style.display = "block";
    });
  }
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
    modalContent.innerHTML = "";
  });
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      modalContent.innerHTML = "";
    }
  });
}

document.addEventListener("DOMContentLoaded", renderLatestOrder); 