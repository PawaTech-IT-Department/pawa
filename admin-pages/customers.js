// customers.js - Customer/user management page logic

document.addEventListener("DOMContentLoaded", function () {
  fetchCustomers();
});

async function fetchCustomers() {
  try {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch users");
    renderCustomers(data.users || []);
  } catch (err) {
    console.error("Error fetching users:", err);
  }
}

function renderCustomers(users) {
  const tbody = document.getElementById("customers-list");
  if (!tbody) return;
  tbody.innerHTML = "";
  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user._id || "-"}</td>
      <td>${user.username || user.email || "-"}</td>
      <td>${user.email || "-"}</td>
      <td>${user.phone || "-"}</td>
      <td><span class="status ${user.is_admin ? "purple" : "orange"}"></span> ${user.is_admin ? "Admin" : "User"}</td>
    `;
    tbody.appendChild(tr);
  });
}
