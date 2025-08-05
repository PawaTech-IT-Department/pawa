// customers.js - Customer/user management page logic

document.addEventListener("DOMContentLoaded", function () {
  fetchCustomers();
  setupCustomerModalHandlers();
});

function setupCustomerModalHandlers() {
  const showModalBtn = document.getElementById("add-customer-btn");
  const modal = document.getElementById("addModal");
  const cancelBtn = document.getElementById("cancelModal");
  const addForm = document.getElementById("addForm");

  if (showModalBtn && modal && addForm) {
    showModalBtn.addEventListener("click", () => {
      modal.style.display = "block";
    });
    cancelBtn.addEventListener("click", () => {
      modal.style.display = "none";
      addForm.reset();
    });
    addForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      await addCustomer();
    });
  }
}

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
      <td><span class="status ${user.is_admin ? "purple" : "orange"}"></span> ${
      user.is_admin ? "Admin" : "User"
    }</td>
    `;
    tbody.appendChild(tr);
  });
}

async function addCustomer() {
  const name = document.getElementById("productName").value;
  const email = document.getElementById("categoryOrEmail").value;
  const phone = document.getElementById("stockOrPhone").value;
  const status = document.getElementById("status").value;
  const payload = { name, email, phone, status };
  try {
    const res = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add customer");
    document.getElementById("addModal").style.display = "none";
    document.getElementById("addForm").reset();
    fetchCustomers();
  } catch (err) {
    alert("Error adding customer: " + err.message);
  }
}
