// inventory.js - Inventory management page logic

document.addEventListener("DOMContentLoaded", function () {
  fetchInventories();
});

async function fetchInventories() {
  try {
    const res = await fetch("/api/inventories");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch inventories");
    renderInventories(data.inventories || []);
  } catch (err) {
    console.error("Error fetching inventories:", err);
  }
}

function renderInventories(inventories) {
  const tbody = document.getElementById("inventory-list");
  if (!tbody) return;
  tbody.innerHTML = "";
  inventories.forEach((inv) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${inv._id || "-"}</td>
      <td>${inv.product_id || "-"}</td>
      <td>${inv.category || "-"}</td>
      <td>${inv.quantity || 0}</td>
      <td><span class="status ${
        inv.quantity > 10 ? "purple" : inv.quantity > 0 ? "orange" : "pink"
      }"></span> ${
      inv.quantity > 10
        ? "In Stock"
        : inv.quantity > 0
        ? "Low Stock"
        : "Out of Stock"
    }</td>
    `;
    tbody.appendChild(tr);
  });
}
