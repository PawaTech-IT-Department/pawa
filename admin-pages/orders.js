document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#orders-table tbody");
  const totalOrdersSpan = document.getElementById("total-orders");
  const pendingCountSpan = document.getElementById("pending-count");
  const processingCountSpan = document.getElementById("processing-count");
  const shippedCountSpan = document.getElementById("shipped-count");

  let currentOrders = [];

  function updateSummaryCards() {
    const statusCount = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
    };

    currentOrders.forEach((order) => {
      const status = order.status;
      if (statusCount[status] !== undefined) {
        statusCount[status]++;
      }
    });

    totalOrdersSpan.textContent = currentOrders.length;
    pendingCountSpan.textContent = statusCount.Pending;
    processingCountSpan.textContent = statusCount.Processing;
    shippedCountSpan.textContent = statusCount.Shipped;
  }

  function renderOrder(order) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${order._id || ""}</td>
      <td>${order.user || order.customer || ""}</td>
      <td>${
        order.products ? order.products.map((p) => p.name || p).join(", ") : "-"
      }</td>
      <td>${
        order.totalCents
          ? (order.totalCents / 100).toFixed(2)
          : parseFloat(order.total || 0).toFixed(2)
      }</td>
      <td>${order.status || "Pending"}</td>
      <td><button class="delete-btn">Delete</button></td>
    `;
    tbody.appendChild(tr);

    addDeleteFunctionality(tr, order);
  }

  function addDeleteFunctionality(row, order) {
    const deleteBtn = row.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        const index = currentOrders.indexOf(order);
        if (index !== -1) {
          currentOrders.splice(index, 1);
        }
        row.remove();
        updateSummaryCards();
      });
    }
  }

  // === Load Orders from API ===
  fetch("/api/orders")
    .then((res) => res.json())
    .then((orders) => {
      currentOrders = orders;
      orders.forEach(renderOrder);
      updateSummaryCards();
    });

  // === Modal Logic ===
  const showModalBtn = document.getElementById("showAddOrderModal");
  const modal = document.getElementById("orderModal");
  const cancelBtn = document.getElementById("cancelOrderModal");
  const orderForm = document.getElementById("orderForm");

  showModalBtn.addEventListener("click", () => {
    modal.classList.add("active");

    const newId = `#OR${String(tbody.rows.length + 1).padStart(3, "0")}`;
    document.getElementById("orderId").value = newId;
    document.getElementById("orderId").readOnly = true;
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    orderForm.reset();
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });

  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const id = document.getElementById("orderId").value;
    const customer = document.getElementById("customerName").value;
    const total = document.getElementById("orderTotal").value;
    const status = document.getElementById("orderStatus").value;

    const newOrder = {
      _id: id,
      customer: customer,
      total: total,
      status: status,
    };

    currentOrders.push(newOrder);
    renderOrder(newOrder);
    updateSummaryCards();

    orderForm.reset();
    modal.classList.remove("active");
  });
});
