async function fetchOrders() {
  const res = await fetch('/api/orders');
  if (!res.ok) throw new Error('Failed to fetch orders');
  return await res.json();
}

async function renderAdminOrders() {
  const ordersList = document.querySelector('.js-admin-orders-list');
  try {
    const orders = await fetchOrders();
    if (!orders.length) {
      ordersList.innerHTML = '<p>No orders found.</p>';
      return;
    }
    let html = '';
    for (const order of orders) {
      html += `<div class="order-summary-card">
        <h3>Order ID: ${order.id}</h3>
        <p>Date: ${new Date(order.order_time).toLocaleString()}</p>
        <p>Total: $${(order.total_cost_cents / 100).toFixed(2)}</p>
        <button class="btn delete-order-btn" data-order-id="${order.id}">Delete Order</button>
        <button class="btn update-order-btn" data-order-id="${order.id}">Update Order</button>
        <div class="order-summary-products">`;
      for (const p of order.products) {
        html += `<div class="order-summary-product">
          <div class="order-summary-product-info">
            <span>Product ID: ${p.productId}</span>
            <span>Qty: ${p.quantity}</span>
            <button class="btn buy-again-btn" data-product-id="${p.productId}" data-quantity="${p.quantity}">Buy it again</button>
            <a class="btn track-package-btn" href="/pages/tracking.html?orderId=${order.id}">Track Order</a>
          </div>
        </div>`;
      }
      html += `</div></div>`;
    }
    ordersList.innerHTML = html;

    // Buy again logic
    document.querySelectorAll('.buy-again-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = btn.getAttribute('data-product-id');
        const quantity = parseInt(btn.getAttribute('data-quantity')) || 1;
        // Optionally, add to cart logic here
        window.location.href = '/shop.html';
      });
    });
    // Delete order logic
    document.querySelectorAll('.delete-order-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const orderId = btn.getAttribute('data-order-id');
        if (confirm('Are you sure you want to delete this order?')) {
          await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
          window.location.reload();
        }
      });
    });
    // Update order logic (placeholder)
    document.querySelectorAll('.update-order-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        alert('Update order feature coming soon!');
      });
    });
  } catch (err) {
    ordersList.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', renderAdminOrders); 