document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest("tr").remove();
    });
  });

  // === SIDEBAR LOAD ===
  const sidebarPlaceholder = document.getElementById("sidebar-placeholder");

  if (sidebarPlaceholder) {
    const depth = window.location.pathname.split("/").length - 2;

    let sidebarPath = "";
    for (let i = 0; i < depth; i++) {
      sidebarPath += "../";
    }
    sidebarPath += "admin-pages/sidebar.html";

    fetch(sidebarPath)
      .then((response) => response.text())
      .then((data) => {
        sidebarPlaceholder.innerHTML = data;

        // === AUTO-HIGHLIGHT ACTIVE LINK BASED ON CURRENT PAGE ===
        const currentPage = window.location.pathname.split("/").pop(); // e.g., 'customers.html'
        const sidebarLinks = document.querySelectorAll(".sidebar-menu a");

        sidebarLinks.forEach((link) => {
          const linkPage = link.getAttribute("href");
          if (linkPage === currentPage) {
            link.parentElement.classList.add("active");
          } else {
            link.parentElement.classList.remove("active");
          }
        });
      })
      .catch((error) => {
        console.error("Error loading sidebar:", error);
      });
  }

  // === HEADER LOAD ===
  const headerPlaceholder = document.getElementById("header-placeholder");

  if (headerPlaceholder) {
    let headerPath = "";

    if (window.location.pathname.includes("/admin-pages/")) {
      headerPath = "admin-header.html";
    } else {
      headerPath = "admin-pages/admin-header.html";
    }

    fetch(headerPath)
      .then((res) => res.text())
      .then((data) => {
        headerPlaceholder.innerHTML = data;

        // === INIT USER DROPDOWN AFTER HEADER LOAD ===
        const userMenuToggle = document.getElementById("userMenuToggle");
        const userDropdown = document.getElementById("userDropdown");

        if (userMenuToggle && userDropdown) {
          userMenuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            userDropdown.style.display =
              userDropdown.style.display === "block" ? "none" : "block";
          });

          document.addEventListener("click", () => {
            userDropdown.style.display = "none";
          });
        }

        // === DROPDOWN LINK FUNCTIONALITY ===
        if (userDropdown) {
          const profileLink = userDropdown.querySelector(
            'a[href="#"]:nth-child(1)'
          );
          const settingsLink = userDropdown.querySelector(
            'a[href="#"]:nth-child(2)'
          );
          const logoutLink = userDropdown.querySelector(
            'a[href="#"]:nth-child(3)'
          );

          if (profileLink) {
            profileLink.addEventListener("click", (e) => {
              e.preventDefault();
              window.location.href = "/admin-pages/profile.html";
            });
          }

          if (settingsLink) {
            settingsLink.addEventListener("click", (e) => {
              e.preventDefault();
              window.location.href = "/admin-pages/settings.html";
            });
          }

          if (logoutLink) {
            logoutLink.addEventListener("click", (e) => {
              e.preventDefault();
              localStorage.removeItem("theme");
              window.location.href = "/login.html";
            });
          }
        }

        // === DARK MODE TOGGLE===
        const darkModeToggle = document.querySelector(".dark-mode-toggle");
        if (darkModeToggle) {
          darkModeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem(
              "theme",
              document.body.classList.contains("dark-mode") ? "dark" : "light"
            );
          });
        }
      })
      .catch((error) => {
        console.error("Error loading header:", error);
      });
  }

  // === Load saved theme mode on refresh ===
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  // === INVENTORY PAGE LOGIC ===
  if (window.location.pathname.includes("inventory.html")) {
    const rows = document.querySelectorAll("#inventory-table tbody tr");
    const totalItems = document.getElementById("total-items");
    const lowStock = document.getElementById("low-stock-count");
    const outOfStock = document.getElementById("out-of-stock-count");
    const filter = document.getElementById("stock-filter");

    let total = 0,
      low = 0,
      out = 0;

    rows.forEach((row) => {
      const stock = parseInt(row.dataset.stock);
      total++;
      if (stock === 0) {
        out++;
      } else if (stock < 6) {
        low++;
      }
    });

    totalItems.textContent = total;
    lowStock.textContent = low;
    outOfStock.textContent = out;

    filter.addEventListener("change", function () {
      const value = this.value;
      rows.forEach((row) => {
        const stock = parseInt(row.dataset.stock);
        if (
          value === "all" ||
          (value === "in" && stock >= 6) ||
          (value === "low" && stock > 0 && stock < 6) ||
          (value === "out" && stock === 0)
        ) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }

  // === INVENTORY MODAL ===
  const showInventoryModalBtn = document.getElementById("showInventoryModal");
  const inventoryModal = document.getElementById("inventoryModal");
  const cancelInventoryModalBtn = document.getElementById(
    "cancelInventoryModal"
  );
  const inventoryForm = document.getElementById("inventoryForm");

  if (showInventoryModalBtn && inventoryModal && inventoryForm) {
    // Show modal
    showInventoryModalBtn.addEventListener("click", () => {
      inventoryModal.style.display = "flex";

      // Auto-generate ID
      const tbody = document.querySelector("#inventory-table tbody");
      const newId = `#IN${String(tbody.rows.length + 1).padStart(3, "0")}`;
      document.getElementById("itemId").value = newId;
      document.getElementById("itemId").readOnly = true;
    });

    // Cancel modal
    cancelInventoryModalBtn.addEventListener("click", () => {
      inventoryModal.style.display = "none";
      inventoryForm.reset();
    });

    // Dismiss modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === inventoryModal) {
        inventoryModal.style.display = "none";
      }
    });

    // Add new item
    inventoryForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const id = document.getElementById("itemId").value;
      const name = document.getElementById("productName").value;
      const category = document.getElementById("category").value;
      const stock = parseInt(document.getElementById("stock").value, 10);

      let status = "";
      let statusClass = "";

      if (stock === 0) {
        status = "Out of Stock";
        statusClass = "pink";
      } else if (stock < 6) {
        status = "Low Stock";
        statusClass = "orange";
      } else {
        status = "In Stock";
        statusClass = "purple";
      }

      const newRow = document.createElement("tr");
      newRow.dataset.stock = stock;
      newRow.innerHTML = `
      <td>${id}</td>
      <td>${name}</td>
      <td>${category}</td>
      <td>${stock}</td>
      <td><span class="status ${statusClass}"></span> ${status}</td>
      <td><button class="delete-btn">Delete</button></td>
    `;

      const tbody = document.querySelector("#inventory-table tbody");
      tbody.appendChild(newRow);

      addDeleteFunctionality(newRow);

      inventoryForm.reset();
      inventoryModal.style.display = "none";

      updateInventorySummary();
    });
  }

  // === Update Summary Counters After Adding New Item ===
  function updateInventorySummary() {
    const rows = document.querySelectorAll("#inventory-table tbody tr");
    let total = 0,
      low = 0,
      out = 0;

    rows.forEach((row) => {
      const stock = parseInt(row.dataset.stock);
      total++;
      if (stock === 0) out++;
      else if (stock < 6) low++;
    });

    document.getElementById("total-items").textContent = total;
    document.getElementById("low-stock-count").textContent = low;
    document.getElementById("out-of-stock-count").textContent = out;
  }

  // === SIDEBAR TOGGLE ===
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (menuToggle && sidebar && mainContent) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("hidden");
      mainContent.classList.toggle("full-width");
    });
  }

  // === MODAL FUNCTIONALITY (CUSTOMERS PAGE) ===
  const addButton = document.querySelector(".card-header button");
  const modal = document.getElementById("addModal");
  const cancelModal = document.getElementById("cancelModal");
  const addForm = document.getElementById("addForm");

  if (addButton && modal && cancelModal && addForm) {
    addButton.addEventListener("click", () => {
      modal.style.display = "flex";
    });

    cancelModal.addEventListener("click", () => {
      modal.style.display = "none";
      addForm.reset();
    });

    addForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("productName").value;
      const email = document.getElementById("categoryOrEmail").value;
      const phone = document.getElementById("stockOrPhone").value;
      const status = document.getElementById("status").value;

      const statusClass =
        {
          Active: "purple",
          Inactive: "pink",
          Pending: "orange",
        }[status] || "grey";

      const tbody = document.querySelector("table tbody");
      const newId = `#CU${String(tbody.rows.length + 1).padStart(3, "0")}`;

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
      <td>${newId}</td>
      <td>${name}</td>
      <td>${email}</td>
      <td>${phone}</td>
      <td><span class="status ${statusClass}"></span> ${status}</td>
      <td><button class="delete-btn">Delete</button></td>
    `;

      tbody.appendChild(newRow);
      addDeleteFunctionality(newRow);
      modal.style.display = "none";
      addForm.reset();
    });
  }

  // === DELETE FUNCTIONALITY ===
  function addDeleteFunctionality(row) {
    const deleteBtn = row.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        row.remove();
      });
    }
  }

  // === DELETE EXISTING CUSTOMERS ON LOAD ===
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest("tr").remove();
    });
  });

  // === MODAL FUNCTIONALITY (TASKS PAGE) ===
  const taskAddButton = document.getElementById("showAddTaskModal");
  const taskModal = document.getElementById("addTaskModal");
  const cancelTaskModal = document.getElementById("cancelTaskModal");
  const taskForm = document.getElementById("addTaskForm");

  if (
    taskAddButton &&
    taskModal &&
    cancelTaskModal &&
    taskForm &&
    window.location.pathname.includes("tasks.html")
  ) {
    const taskTbody = document.querySelector("table tbody");

    taskAddButton.addEventListener("click", () => {
      taskModal.style.display = "flex";
    });

    cancelTaskModal.addEventListener("click", () => {
      taskModal.style.display = "none";
      taskForm.reset();
    });

    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const description = document.getElementById("taskDescription").value;
      const assignee = document.getElementById("taskAssignee").value;
      const dueDate = document.getElementById("taskDueDate").value;
      const status = document.getElementById("taskStatus").value;

      const statusClass =
        {
          "Not Started": "pink",
          "In Progress": "orange",
          Completed: "purple",
        }[status] || "grey";

      const newId = `#TSK${String(taskTbody.rows.length + 1).padStart(3, "0")}`;

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
      <td>${newId}</td>
      <td>${description}</td>
      <td>${assignee}</td>
      <td>${dueDate}</td>
      <td><span class="status ${statusClass}"></span> ${status}</td>
      <td><button class="delete-btn">Delete</button></td>
    `;

      taskTbody.appendChild(newRow);
      addDeleteFunctionality(newRow); // Reuse if you have this defined elsewhere

      taskModal.style.display = "none";
      taskForm.reset();
    });
  }

  // ===== EDIT BUTTON FUNCTIONALITY =====
  const editModal = document.getElementById("edit-product-modal");
  const editForm = document.getElementById("edit-product-form");
  const cancelEditBtn = document.getElementById("cancel-edit");

  let currentEditingRow = null;

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("edit-btn")) {
      const row = e.target.closest("tr");
      currentEditingRow = row;

      // Populate form with current row data
      document.getElementById("edit-product-name").value =
        row.querySelector(".product-name").textContent;
      document.getElementById("edit-product-category").value =
        row.querySelector(".product-category").textContent;
      document.getElementById("edit-product-price").value = row
        .querySelector(".product-price")
        .textContent.replace("$", "");
      document.getElementById("edit-product-stock").value =
        row.querySelector(".product-stock").textContent;

      editModal.style.display = "flex";
    }
  });

  cancelEditBtn.addEventListener("click", function () {
    editModal.style.display = "none";
    editForm.reset();
    currentEditingRow = null;
  });

  editForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!currentEditingRow) return;

    currentEditingRow.querySelector(".product-name").textContent =
      document.getElementById("edit-product-name").value;
    currentEditingRow.querySelector(".product-category").textContent =
      document.getElementById("edit-product-category").value;
    currentEditingRow.querySelector(".product-price").textContent =
      "$" + document.getElementById("edit-product-price").value;
    currentEditingRow.querySelector(".product-stock").textContent =
      document.getElementById("edit-product-stock").value;

    editModal.style.display = "none";
    editForm.reset();
    currentEditingRow = null;
  });

  /// === ADD PRODUCT FUNCTIONALITY ===
  const addProductBtn = document.querySelector(".card-header button");
  const addProductModal = document.getElementById("addProductModal");
  const cancelAddProductBtn = document.getElementById("cancelAddProduct");
  const addProductForm = document.getElementById("addProductForm");

  if (
    addProductBtn &&
    addProductModal &&
    cancelAddProductBtn &&
    addProductForm
  ) {
    addProductBtn.addEventListener("click", () => {
      addProductModal.style.display = "flex";
    });

    cancelAddProductBtn.addEventListener("click", () => {
      addProductModal.style.display = "none";
      addProductForm.reset();
    });

    addProductForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("productName").value;
      const category = document.getElementById("category").value;
      const price = document.getElementById("price").value;
      const stock = document.getElementById("stock").value;

      const tbody = document.querySelector("table tbody");
      const newId = `#PR${String(tbody.rows.length + 1).padStart(3, "0")}`;

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
      <td class="product-name">${name}</td>
      <td class="product-category">${category}</td>
      <td class="product-price">$${price}</td>
      <td class="product-stock">${stock}</td>
      <td><button class="edit-btn">Edit</button></td>
      <td><button class="delete-btn">Delete</button></td>
    `;

      tbody.appendChild(newRow);
      addDeleteFunctionality(newRow);
      addProductModal.style.display = "none";
      addProductForm.reset();
    });
  }

  // === SEARCH FUNCTIONALITY (PRODUCTS PAGE) ===
  const searchInput = document.querySelector(".search-wrapper input");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      const rows = document.querySelectorAll("table tbody tr");

      rows.forEach((row) => {
        const productName =
          row.querySelector(".product-name")?.textContent.toLowerCase() || "";
        const category =
          row.querySelector(".product-category")?.textContent.toLowerCase() ||
          "";

        if (productName.includes(query) || category.includes(query)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }
});
// === GLOBAL OBSERVER FOR HEADER SEARCH ===
const observer = new MutationObserver(() => {
  const searchInput = document.getElementById("dashboardSearch");
  const orders = document.querySelectorAll("#ordersList tr");
  const customers = document.querySelectorAll("#customersList .customer");

  if (!searchInput || orders.length === 0 || customers.length === 0) return;

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();

    orders.forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(searchTerm)
        ? ""
        : "none";
    });

    customers.forEach((customer) => {
      customer.style.display = customer.textContent
        .toLowerCase()
        .includes(searchTerm)
        ? ""
        : "none";
    });
  });

  observer.disconnect();
});

observer.observe(document.body, { childList: true, subtree: true });
