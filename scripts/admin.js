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
      addDeleteFunctionality(newRow); // ✅ FIXED: now it's inside
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
});
