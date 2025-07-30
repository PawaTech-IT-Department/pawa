// Format currency (KES)
function formatCurrency(cents) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cents / 100);
}

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format delivery date
function formatDeliveryDate(dateString) {
  if (!dateString) return 'Calculating...';
  return new Date(dateString).toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Fetch orders from the backend
async function fetchOrders() {
  try {
    const response = await fetch('http://localhost:5000/api/orders');
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// Render orders list
async function renderAllOrders() {
  const ordersList = document.querySelector(".js-all-orders-list");
  
  try {
    // Show loading state with SweetAlert2
    Swal.fire({
      title: 'Loading your orders...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });
    
    // Fetch orders from the backend
    const orders = await fetchOrders();
    Swal.close();
    
    if (!orders || orders.length === 0) {
      ordersList.innerHTML = `
        <div class="no-orders">
          <i class="fas fa-box-open"></i>
          <p>You haven't placed any orders yet.</p>
          <a href="/index.html" class="btn btn--primary">Start Shopping</a>
        </div>`;
      return;
    }
    
    // Generate orders HTML
    let html = '';
    
    orders.forEach(order => {
      // Find the earliest delivery date from order items
      const deliveryDates = order.order_items
        .map(item => item.estimated_delivery_time)
        .filter(Boolean);
      
      const earliestDeliveryDate = deliveryDates.length > 0 
        ? new Date(Math.min(...deliveryDates.map(date => new Date(date))))
        : null;
      
      html += `
        <div class="order-summary-card">
          <div class="order-header">
            <div>
              <h3>Order #${order.id.split('-')[0].toUpperCase()}</h3>
              <p class="order-date">Placed on ${formatDate(order.order_time)}</p>
            </div>
            <div class="order-status ${order.payment_status.toLowerCase()}">
              ${order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </div>
          </div>
          
          <div class="order-summary-products">
            ${order.order_items.slice(0, 3).map(item => `
              <div class="order-summary-product">
                <div class="order-product-image">
                  <img src="${item.productImage}" alt="${item.productName}" class="w-16 h-16 rounded-lg object-cover" onerror="this.onerror=null;this.src='https://img.icons8.com/?size=100&id=46720&format=png&color=000000';" />
                </div>
                <div class="order-product-info">
                  <span class="product-name">${item.productName}</span>
                  <span class="product-quantity">Qty: ${item.quantity}</span>
                  <span class="product-price">${formatCurrency(item.price_at_time_of_order * item.quantity)}</span>
                </div>
              </div>
            `).join('')}
            
            ${order.order_items.length > 3 ? `
              <div class="additional-items">
                +${order.order_items.length - 3} more item${order.order_items.length - 3 > 1 ? 's' : ''}
              </div>
            ` : ''}
          </div>
          
          <div class="order-footer">
            <div class="order-total">
              <span>Total:</span>
              <span class="amount">${formatCurrency(order.total_cost_cents)}</span>
            </div>
            
            <div class="order-actions">
              <button class="btn btn--outline order-track-btn" data-order-id="${order.id}">
                <i class="fas fa-box"></i> Track Package
              </button>
              ${order.mpesa_receipt_number ? `
                <div class="receipt-info">
                  <i class="fas fa-receipt"></i>
                  <span>Receipt: ${order.mpesa_receipt_number}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    ordersList.innerHTML = html;
    setupEventListeners(orders);
    
  } catch (error) {
    console.error('Error rendering orders:', error);
    Swal.fire({
      icon: 'error',
      title: 'Failed to load your orders',
      text: error.message || 'Please try again later.',
      confirmButtonText: 'Retry',
      allowOutsideClick: false
    }).then(() => {
      window.location.reload();
    });
    ordersList.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load your orders. Please try again later.</p>
        <button class="btn btn--primary" onclick="window.location.reload()">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>`;
  }
}

// Set up event listeners for order tracking
function setupEventListeners(orders) {
  const modal = document.getElementById("order-tracking-modal");
  const modalContent = modal.querySelector(".modal-order-details");
  const closeModalBtn = modal.querySelector(".close-modal-btn");

  // Track package button click
  document.querySelectorAll(".order-track-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const orderId = btn.getAttribute("data-order-id");
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        // Use SweetAlert2 for modal error
        Swal.fire({
          icon: 'error',
          title: 'Order not found',
          text: 'Could not find the order for tracking.',
        });
        return;
      }
      // Build modal content
      let modalHTML = `
        <div class="order-tracking-header">
          <h3>Order #${order.id.split('-')[0].toUpperCase()}</h3>
          <div class="order-status-badge ${order.payment_status.toLowerCase()}">
            ${order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
          </div>
        </div>
        <div class="order-details-grid">
          <div class="order-detail">
            <span class="detail-label">Order Date</span>
            <span class="detail-value">${formatDate(order.order_time)}</span>
          </div>
          <div class="order-detail">
            <span class="detail-label">Payment Method</span>
            <span class="detail-value">${order.payment_method || 'M-Pesa'}</span>
          </div>
          <div class="order-detail">
            <span class="detail-label">Total Amount</span>
            <span class="detail-value">${formatCurrency(order.total_cost_cents)}</span>
          </div>
          ${order.mpesa_receipt_number ? `
            <div class="order-detail">
              <span class="detail-label">M-Pesa Receipt</span>
              <span class="detail-value">${order.mpesa_receipt_number}</span>
            </div>
          ` : ''}
          <div class="order-detail full-width">
            <span class="detail-label">Delivery Address</span>
            <span class="detail-value">${order.delivery_address || 'Not specified'}</span>
          </div>
        </div>
        <h4 class="items-heading">Items in your order</h4>
        <div class="order-items-list">
          ${order.order_items.map(item => `
            <div class="order-item">
              <div class="item-image">
                <img src="${item.productImage}" alt="${item.productName}" class="w-16 h-16 rounded-lg object-cover" onerror="this.onerror=null;this.src='https://img.icons8.com/?size=100&id=46720&format=png&color=000000';" />
              </div>
              <div class="item-details">
                <div class="item-name">${item.productName}</div>
                <div class="item-quantity">Quantity: ${item.quantity}</div>
                <div class="item-price">${formatCurrency(item.price_at_time_of_order * item.quantity)}</div>
                <div class="item-status">
                  <i class="fas fa-truck"></i>
                  <span>Estimated delivery: ${formatDeliveryDate(item.estimated_delivery_time)}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="order-total-summary">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(order.total_cost_cents - Math.round(order.total_cost_cents * 0.16))}</span>
          </div>
          <div class="total-row">
            <span>Tax (16%)</span>
            <span>${formatCurrency(Math.round(order.total_cost_cents * 0.16))}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total</span>
            <span>${formatCurrency(order.total_cost_cents)}</span>
          </div>
        </div>
      `;
      modalContent.innerHTML = modalHTML;
      modal.style.display = "block";
    });
  });
  
  // Close modal when clicking the close button
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
    modalContent.innerHTML = "";
  });
  
  // Close modal when clicking outside the modal content
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      modalContent.innerHTML = "";
    }
  });
}

// Initialize when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  renderAllOrders();
  
  // Add any global event listeners or initializations here
  document.addEventListener('click', (e) => {
    // Handle any global click events if needed
  });
});