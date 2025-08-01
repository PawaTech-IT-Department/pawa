document.addEventListener("DOMContentLoaded", function () {
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

  // === DASHBOARD FUNCTIONALIZATION ===
  updateDashboardCards();
  updateRecentOrders();
  updateNewCustomers();
});

// === DASHBOARD CARDS ===
async function updateDashboardCards() {
  try {
    const res = await fetch("/api/reports/summary");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch dashboard data");
    const cards = document.querySelectorAll(".card-single");
    if (cards.length >= 4) {
      cards[0].querySelector("h1").textContent = data.userCount;
      cards[1].querySelector("h1").textContent = data.productCount;
      cards[2].querySelector("h1").textContent = data.orderCount;
      // For income, you may want to sum order totals or use a backend field
      let income = 0;
      if (Array.isArray(data.orders)) {
        income = data.orders.reduce((sum, o) => sum + (o.total_cost_cents || 0), 0);
      }
      cards[3].querySelector("h1").textContent = `$${(income / 100).toLocaleString()}`;
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
          <td>${order.order_items && order.order_items[0] ? order.order_items[0].productName || order.order_items[0].product_id : "-"}</td>
          <td><span class="status ${getOrderStatusClass(order.status)}"></span> ${order.status || "Pending"}</td>
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

// === DROPDOWN LINK FUNCTIONALITY ===
// (unchanged, keep as is)
// ...
// === SIDEBAR TOGGLE ===
// (unchanged, keep as is)
