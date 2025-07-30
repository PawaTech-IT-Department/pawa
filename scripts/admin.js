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
});

// === DROPDOWN LINK FUNCTIONALITY ===
const profileLink = userDropdown.querySelector('a[href="#"]:nth-child(1)');
const settingsLink = userDropdown.querySelector('a[href="#"]:nth-child(2)');
const logoutLink = userDropdown.querySelector('a[href="#"]:nth-child(3)');

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
