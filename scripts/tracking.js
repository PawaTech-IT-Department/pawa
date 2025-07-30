import { orders } from "../data/order.js";
import { getProduct } from "../data/products.js";

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function getOrder(orderId) {
  return orders.find(o => o.id === orderId);
}

function getStatusStage(orderTime, estimatedDeliveryTime) {
  const now = new Date();
  const orderDate = new Date(orderTime);
  const deliveryDate = new Date(estimatedDeliveryTime);
  if (now < orderDate) return 0; // Not started
  if (now < deliveryDate) {
    const total = deliveryDate - orderDate;
    const elapsed = now - orderDate;
    if (elapsed / total < 0.5) return 1; // Preparing
    return 2; // Shipped
  }
  return 3; // Delivered
}

async function renderTracking() {
  const orderId = getQueryParam('orderId');
  const order = getOrder(orderId);
  const orderInfoDiv = document.querySelector('.js-tracking-order-info');
  const productsListDiv = document.querySelector('.js-tracking-products-list');
  const progressDiv = document.querySelector('.js-tracking-progress');

  if (!order) {
    orderInfoDiv.innerHTML = '<p>Order not found.</p>';
    productsListDiv.innerHTML = '';
    progressDiv.innerHTML = '';
    return;
  }

  orderInfoDiv.innerHTML = `
    <h2>Tracking Order: ${order.id}</h2>
    <p>Order Date: ${new Date(order.order_time).toLocaleString()}</p>
  `;

  let productsHTML = '';
  let maxStage = 0;
  for (const productEntry of order.products) {
    let product = null;
    try {
      product = await getProduct(productEntry.productId);
    } catch (e) {}
    const stage = getStatusStage(order.order_time, productEntry.estimatedDeliveryTime);
    if (stage > maxStage) maxStage = stage;
    productsHTML += `
      <div class="tracking-product-card">
        <img src="/img/${product ? product.image.slice(7) : ''}" alt="${product ? product.name : ''}" class="tracking-product-img" />
        <div class="tracking-product-details">
          <h3>${product ? product.name : productEntry.productId}</h3>
          <p>Quantity: ${productEntry.quantity}</p>
          <p>Arriving on: ${new Date(productEntry.estimatedDeliveryTime).toLocaleDateString()}</p>
        </div>
      </div>
    `;
  }
  productsListDiv.innerHTML = productsHTML;

  // Progress bar for the whole order (max stage among products)
  const stages = ['Preparing', 'Shipped', 'Delivered'];
  let progressHTML = '<div class="tracking-progress-bar">';
  for (let i = 1; i <= 3; i++) {
    progressHTML += `<span class="progress-step${i <= maxStage ? ' active' : ''}">${stages[i-1]}</span>`;
    if (i < 3) progressHTML += '<span class="progress-arrow">&rarr;</span>';
  }
  progressHTML += '</div>';
  progressDiv.innerHTML = progressHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  renderTracking();
}); 