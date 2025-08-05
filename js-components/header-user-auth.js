// This script should be loaded after header-footer-components.js
// Handles login/signup modal and dynamic account label/profile link

document.addEventListener("DOMContentLoaded", function () {
  const accountLink = document.getElementById("account-icon-link");
  const accountLabel = document.getElementById("account-label");

  function getUser() {
    let userObj = null;
    try {
      userObj = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
    } catch {}
    return userObj;
  }

  function updateAccountLabelAndLink() {
    const user = getUser();
    if (accountLabel && accountLink) {
      if (user && user.username) {
        accountLabel.textContent = user.username;
        accountLink.setAttribute("href", "/pages/profile.html");
        accountLink.onclick = null;
      } else {
        accountLabel.textContent = "Account";
        accountLink.setAttribute("href", "#");
        accountLink.onclick = function (e) {
          e.preventDefault();
          const modal = document.getElementById("auth-modal");
          const iframe = document.getElementById("auth-iframe");
          if (modal && iframe) {
            iframe.src = "/login.html";
            modal.style.display = "block";
          } else {
            window.location.href = "/login.html";
          }
        };
      }
    }
  }

  // Listen for login/signup success from iframe/modal
  window.addEventListener("message", function handler(event) {
    if (event.data && event.data.type === "auth_success" && event.data.user) {
      localStorage.setItem("user", JSON.stringify(event.data.user));
      updateAccountLabelAndLink();
      // Optionally close modal here
      const modal = document.getElementById("auth-modal");
      const iframe = document.getElementById("auth-iframe");
      if (modal && iframe) {
        modal.style.display = "none";
        iframe.src = "";
      }
    }
  });

  updateAccountLabelAndLink();
});
