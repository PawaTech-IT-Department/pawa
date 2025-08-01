// accounts.js - Admin management page logic

document.addEventListener("DOMContentLoaded", function () {
  fetchAdmins();
});

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
      <td><button onclick="grantAdmin('${admin._id}')">Grant Admin</button></td>
    `;
    tbody.appendChild(tr);
  });
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
