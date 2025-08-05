// accounts.js - Admin management page logic

document.addEventListener("DOMContentLoaded", function () {
  fetchAdmins();
  setupAccountModalHandlers();
});

function setupAccountModalHandlers() {
  // Create modal if not present
  if (!document.getElementById("createAccountModal")) {
    const modal = document.createElement("div");
    modal.id = "createAccountModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <h3>Create Admin Account</h3>
        <form id="createAccountForm">
          <div class="form-group">
            <label for="adminName">Name:</label>
            <input type="text" id="adminName" required />
          </div>
          <div class="form-group">
            <label for="adminEmail">Email:</label>
            <input type="email" id="adminEmail" required />
          </div>
          <div class="form-group">
            <label for="adminPassword">Password:</label>
            <input type="password" id="adminPassword" required />
          </div>
          <div class="form-actions">
            <button type="submit">Save</button>
            <button type="button" id="cancelCreateAccount">Cancel</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }
  // Show modal
  document.getElementById("create-account-btn").addEventListener("click", function () {
    document.getElementById("createAccountModal").style.display = "block";
  });
  // Close modal
  document.getElementById("cancelCreateAccount").addEventListener("click", function () {
    document.getElementById("createAccountModal").style.display = "none";
    document.getElementById("createAccountForm").reset();
  });
  // Form submit
  document.getElementById("createAccountForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    await createAdmin();
  });
}

async function fetchAdmins() {
  try {
    const res = await fetch("/api/admins");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch admins");
    renderAdmins(data.admins || []);
  } catch (err) {
    console.error("Error fetching admins:", err);
  }
}

function renderAdmins(admins) {
  const tbody = document.getElementById("admins-list");
  if (!tbody) return;
  tbody.innerHTML = "";
  admins.forEach((admin) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${admin._id || "-"}</td>
      <td>${admin.username || admin.email || "-"}</td>
      <td>${admin.is_super_admin ? "Super Admin" : admin.is_admin ? "Admin" : "User"}</td>
      <td>${admin.email || "-"}</td>
      <td><span class="status ${admin.is_super_admin ? "purple" : admin.is_admin ? "pink" : "orange"}"></span> Active</td>
      <td>
        <button onclick="grantAdmin('${admin._id}')">Grant Admin</button>
        <button onclick="deleteAdmin('${admin._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.createAdmin = async function () {};

async function createAdmin() {
  const username = document.getElementById("adminName").value;
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;
  const payload = { username, email, password };
  try {
    const res = await fetch("/api/admins/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create admin");
    document.getElementById("createAccountModal").style.display = "none";
    document.getElementById("createAccountForm").reset();
    fetchAdmins();
  } catch (err) {
    alert("Error creating admin: " + err.message);
  }
}

window.grantAdmin = async function (adminId) {
  try {
    const res = await fetch("/api/admins/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: adminId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to grant admin");
    alert("Admin privileges granted!");
    fetchAdmins();
  } catch (err) {
    alert("Error: " + err.message);
  }
};

window.deleteAdmin = async function (adminId) {
  if (!confirm("Are you sure you want to delete this admin?")) return;
  try {
    const res = await fetch(`/api/admins/${adminId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete admin");
    fetchAdmins();
  } catch (err) {
    alert("Error deleting admin: " + err.message);
  }
};
