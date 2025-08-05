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
        const currentPage = window.location.pathname.split("/").pop();
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

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  // === DASHBOARD FUNCTIONALIZATION ===
  updateDashboardCards();
  updateRecentOrders();
  updateNewCustomers();

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
      if (stock === 0) out++;
      else if (stock < 6) low++;
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

  // === INVENTORY MODAL ===//
  const showInventoryModalBtn = document.getElementById("showInventoryModal");
  const inventoryModal = document.getElementById("inventoryModal");
  const cancelInventoryModalBtn = document.getElementById(
    "cancelInventoryModal"
  );
  const inventoryForm = document.getElementById("inventoryForm");

  if (showInventoryModalBtn && inventoryModal && inventoryForm) {
    showInventoryModalBtn.addEventListener("click", () => {
      inventoryModal.style.display = "flex";
      const tbody = document.querySelector("#inventory-table tbody");
      const newId = `#IN${String(tbody.rows.length + 1).padStart(3, "0")}`;
      document.getElementById("itemId").value = newId;
      document.getElementById("itemId").readOnly = true;
    });

    cancelInventoryModalBtn.addEventListener("click", () => {
      inventoryModal.style.display = "none";
      inventoryForm.reset();
    });

    window.addEventListener("click", (e) => {
      if (e.target === inventoryModal) {
        inventoryModal.style.display = "none";
      }
    });

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

  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (menuToggle && sidebar && mainContent) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("hidden");
      mainContent.classList.toggle("full-width");
    });
  }

  // === CUSTOMER MODAL ===
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

  function addDeleteFunctionality(row) {
    const deleteBtn = row.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        row.remove();
      });
    }
  }

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest("tr").remove();
    });
  });
});

// === DASHBOARD CARDS ===
async function updateDashboardCards() {
  try {
    const res = await fetch("/api/reports/summary");
    const data = await res.json();
    if (!res.ok)
      throw new Error(data.error || "Failed to fetch dashboard data");
    const cards = document.querySelectorAll(".card-single");
    if (cards.length >= 4) {
      cards[0].querySelector("h1").textContent = data.userCount;
      cards[1].querySelector("h1").textContent = data.productCount;
      cards[2].querySelector("h1").textContent = data.orderCount;

      let income = 0;
      if (Array.isArray(data.orders)) {
        income = data.orders.reduce(
          (sum, o) => sum + (o.total_cost_cents || 0),
          0
        );
      }
      cards[3].querySelector("h1").textContent = `$${(
        income / 100
      ).toLocaleString()}`;
    }
  } catch (err) {
    console.error("Error updating dashboard cards:", err);
  }
}

// === RECENT ORDERS TABLE ===
async function updateRecentOrders() {
  try {
    const res = await fetch("/api/orders?limit=6");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch orders");
    const orders = data.orders || data;
    const tbody = document.querySelector(".orders table tbody");
    if (tbody) {
      tbody.innerHTML = "";
      orders.slice(0, 6).forEach((order) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${order._id || order.id || "-"}</td>
          <td>${
            order.order_items && order.order_items[0]
              ? order.order_items[0].productName ||
                order.order_items[0].product_id
              : "-"
          }</td>
          <td><span class="status ${getOrderStatusClass(
            order.status
          )}"></span> ${order.status || "Pending"}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error("Error updating recent orders:", err);
  }
}

function getOrderStatusClass(status) {
  if (!status) return "orange";
  const s = status.toLowerCase();
  if (s.includes("ship")) return "purple";
  if (s.includes("process")) return "pink";
  if (s.includes("pend")) return "orange";
  return "orange";
}

// === NEW CUSTOMERS LIST ===
async function updateNewCustomers() {
  try {
    const res = await fetch("/api/users?limit=3");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch users");
    const users = data.users || data;
    const container = document.querySelector(".customers .card-body");
    if (container) {
      container.innerHTML = "";
      users.slice(0, 3).forEach((user) => {
        const div = document.createElement("div");
        div.className = "customer";
        div.innerHTML = `
          <div class="info">
            <img src="https://i.imgur.com/7vQ8d2b.png" width="40" height="40" alt="" />
            <div>
              <h4>${user.username || user.email || "User"}</h4>
            </div>
          </div>
          <div class="contact">
            <span class="las la-user-circle"></span>
            <span class="las la-comment"></span>
            <span class="las la-phone"></span>
          </div>
        `;
        container.appendChild(div);
      });
    }
  } catch (err) {
    console.error("Error updating new customers:", err);
  }
}
