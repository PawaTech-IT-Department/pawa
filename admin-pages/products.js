document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("products-table-body");
  const showAddModalBtn = document.getElementById("showAddProductModal");
  const addModal = document.getElementById("addProductModal");
  const cancelAddBtn = document.getElementById("cancelAddProduct");
  const addForm = document.getElementById("addProductForm");

  const editModal = document.getElementById("edit-product-modal");
  const cancelEditBtn = document.getElementById("cancel-edit");
  const editForm = document.getElementById("edit-product-form");

  let currentEditRow = null;

  // === Fetch and populate products ===
  let products = [];
  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch products");
      products = data.products || data;
      tableBody.innerHTML = "";
      products.forEach((product) => addProductRow(product));
    } catch (err) {
      alert("Error loading products: " + err.message);
    }
  }
  fetchProducts();

  // === Show Add Modal ===
  showAddModalBtn.addEventListener("click", () => {
    addModal.style.display = "flex";
  });

  cancelAddBtn.addEventListener("click", () => {
    addModal.style.display = "none";
    addForm.reset();
  });

  // === Add New Product ===
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("productName").value;
    const category = document.getElementById("category").value;
    const price = document.getElementById("price").value;
    const stock = document.getElementById("stock").value;

    const newProduct = {
      name,
      category,
      priceCents: parseFloat(price) * 100,
      stock,
    };
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add product");
      fetchProducts();
      addModal.style.display = "none";
      addForm.reset();
    } catch (err) {
      alert("Error adding product: " + err.message);
    }
  });

  // === Add Product Row to Table ===
  function addProductRow(product) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${product.name || ""}</td>
      <td>${product.category || ""}</td>
      <td>$${
        product.priceCents ? (product.priceCents / 100).toFixed(2) : "0.00"
      }</td>
      <td>${product.stock || 0}</td>
      <td><button class="edit-btn">Edit</button></td>
      <td><button class="delete-btn">Delete</button></td>
    `;

    // === Edit button ===
    tr.querySelector(".edit-btn").addEventListener("click", () => {
      currentEditRow = tr;
      document.getElementById("edit-product-name").value = product.name;
      document.getElementById("edit-product-category").value = product.category;
      document.getElementById("edit-product-price").value = (
        product.priceCents / 100
      ).toFixed(2);
      document.getElementById("edit-product-stock").value = product.stock;
      editModal.style.display = "flex";
    });

    // === Delete button ===
    tr.querySelector(".delete-btn").addEventListener("click", () => {
      tr.remove();
    });

    tableBody.appendChild(tr);
  }

  // === Save Edited Product ===
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentEditRow) return;

    const name = document.getElementById("edit-product-name").value;
    const category = document.getElementById("edit-product-category").value;
    const price = parseFloat(
      document.getElementById("edit-product-price").value
    ).toFixed(2);
    const stock = document.getElementById("edit-product-stock").value;

    currentEditRow.innerHTML = `
      <td>${name}</td>
      <td>${category}</td>
      <td>$${price}</td>
      <td>${stock}</td>
      <td><button class="edit-btn">Edit</button></td>
      <td><button class="delete-btn">Delete</button></td>
    `;

    // Reattach listeners
    currentEditRow.querySelector(".edit-btn").addEventListener("click", () => {
      document.getElementById("edit-product-name").value = name;
      document.getElementById("edit-product-category").value = category;
      document.getElementById("edit-product-price").value = price;
      document.getElementById("edit-product-stock").value = stock;
      currentEditRow = currentEditRow;
      editModal.style.display = "flex";
    });

    currentEditRow
      .querySelector(".delete-btn")
      .addEventListener("click", () => {
        currentEditRow.remove();
      });

    editModal.style.display = "none";
    currentEditRow = null;
  });

  cancelEditBtn.addEventListener("click", () => {
    editModal.style.display = "none";
    currentEditRow = null;
  });

  // === Search Products ===
  const searchInput = document.querySelector(".search-wrapper input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const filter = this.value.toLowerCase();
      const rows = tableBody.querySelectorAll("tr");
      rows.forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(filter)
          ? ""
          : "none";
      });
    });
  }
});
