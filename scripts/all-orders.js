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
          <a class="btn track-package-btn" href="/pages/tracking.html?orderId=${order.id}">Track Package</a>
        </div>
      </div>`;
    }
    html += `</div></div>`;
  }
  ordersList.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", renderAllOrders); 