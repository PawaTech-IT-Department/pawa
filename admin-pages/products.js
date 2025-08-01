document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/products')
    .then(res => res.json())
    .then(products => {
      const tbody = document.querySelector('#products-table tbody');
      products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${product._id || ''}</td>
          <td>${product.name || ''}</td>
          <td>${product.description || ''}</td>
          <td>${product.priceCents ? (product.priceCents/100).toFixed(2) : ''}</td>
          <td><button onclick="alert('Edit functionality coming soon')">Edit</button></td>
        `;
        tbody.appendChild(tr);
      });
    });
});
