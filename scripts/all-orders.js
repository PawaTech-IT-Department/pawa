import { orders } from "../data/order.js";
import { getProduct } from "../data/products.js";

async function renderAllOrders() {
  const ordersList = document.querySelector(".js-all-orders-list");
  if (!orders.length) {
    ordersList.innerHTML = '<p>You have no orders yet.</p>';
    return;
  }
  let html = "";
  for (const order of orders) {
    html += `<div class="order-summary-card">
      <h3>Order ID: ${order.id}</h3>
      <p>Date: ${new Date(order.order_time).toLocaleString()}</p>
      <p>Total: $${(order.total_cost_cents / 100).toFixed(2)}</p>
      <div class="order-summary-products">`;
    for (const p of order.products) {
      let product = null;
      try {
        product = await getProduct(p.productId);
      } catch (e) {}
      html += `<div class="order-summary-product">
        <img src="/img/${product ? product.image.slice(7) : ''}" alt="${product ? product.name : ''}" class="order-summary-product-img" />
        <div class="order-summary-product-info">
          <span>${product ? product.name : p.productId}</span>
          <span>Qty: ${p.quantity}</span>
        </div>
      </div>`;
    }
    html += `</div>
      <button class="btn btn--primary order-track-btn" data-order-id="${order.id}">
        <i class="fas fa-box"></i> Track Package
      </button>
    </div>`;
  }
  ordersList.innerHTML = html;

  // Modal logic
  const modal = document.getElementById("order-tracking-modal");
  const modalContent = modal.querySelector(".modal-order-details");
  const closeModalBtn = modal.querySelector(".close-modal-btn");

  document.querySelectorAll(".order-track-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const orderId = btn.getAttribute("data-order-id");
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
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
  });
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

document.addEventListener("DOMContentLoaded", renderAllOrders); 