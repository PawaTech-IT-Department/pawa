document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/orders')
    .then(res => res.json())
    .then(orders => {
      const tbody = document.querySelector('#orders-table tbody');
      orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${order._id || ''}</td>
          <td>${order.user || ''}</td>
          <td>${order.products ? order.products.map(p => p.name || p).join(', ') : ''}</td>
          <td>${order.totalCents ? (order.totalCents/100).toFixed(2) : ''}</td>
          <td>${order.status || ''}</td>
          <td><button onclick="alert('View functionality coming soon')">View</button></td>
        `;
        tbody.appendChild(tr);
      });
    });
});
