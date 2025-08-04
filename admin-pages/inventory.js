// inventory.js - Inventory management page logic

document.addEventListener("DOMContentLoaded", function () {
  fetchInventories();
  setupModalHandlers();
});

function setupModalHandlers() {
  // Show modal
  document.getElementById("showAddInventoryModal").addEventListener("click", function () {
    document.getElementById("addinventoryModal").style.display = "block";
    generateItemId();
  });
  // Close modal
  document.querySelectorAll('[data-close-button]').forEach(btn => {
    btn.addEventListener("click", function () {
      document.getElementById("addinventoryModal").style.display = "none";
      document.getElementById("add-inventory-form").reset();
    });
  });
  // Form submit
  document.getElementById("add-inventory-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    await addInventory();
  });
}

function generateItemId() {
  // Generate a random 8-char alphanumeric ID for demo (replace with backend logic if needed)
  document.getElementById("itemId").value = Math.random().toString(36).substr(2, 8).toUpperCase();
}

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
      <td>
        <button class="btn delete-btn" data-id="${inv._id}">Delete</button>
        <button class="btn print-btn" data-id="${inv._id}">Print</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  // Attach delete/print handlers
  tbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      deleteInventory(this.getAttribute('data-id'));
    });
  });
  tbody.querySelectorAll('.print-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      printInventory(this.getAttribute('data-id'));
    });
  });
}

async function addInventory() {
  const productName = document.getElementById("productName").value.trim();
  const category = document.getElementById("category").value.trim();
  const quantity = parseInt(document.getElementById("stock").value, 10);
  // Validation
  if (!productName) {
    alert("Product name is required.");
    return;
  }
  if (!category) {
    alert("Category is required.");
    return;
  }
  if (isNaN(quantity) || quantity < 0) {
    alert("Quantity must be a non-negative number.");
    return;
  }
  const payload = {
    product_id: productName,
    category,
    quantity
  };
  try {
    const res = await fetch("/api/inventories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    let data;
    try {
      data = await res.json();
    } catch (jsonErr) {
      const text = await res.text();
      console.error("Non-JSON response:", text);
      throw new Error("Server error: " + text);
    }
    if (!res.ok) throw new Error(data.error || "Failed to add inventory");
    document.getElementById("addinventoryModal").style.display = "none";
    document.getElementById("add-inventory-form").reset();
    fetchInventories();
  } catch (err) {
    alert("Error adding inventory: " + err.message);
  }
}

async function deleteInventory(id) {
  if (!confirm("Are you sure you want to delete this inventory item?")) return;
  try {
    const res = await fetch(`/api/inventories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete inventory");
    fetchInventories();
  } catch (err) {
    alert("Error deleting inventory: " + err.message);
  }
}

function printInventory(id) {
  // Print only the row for the given id
  const row = Array.from(document.querySelectorAll("#inventory-list tr")).find(tr => tr.firstElementChild.textContent === id);
  if (!row) return alert("Inventory item not found");
  const printWindow = window.open('', '', 'width=600,height=400');
  printWindow.document.write('<html><head><title>Print Inventory</title></head><body>');
  printWindow.document.write('<table border="1">' + row.outerHTML + '</table>');
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}
