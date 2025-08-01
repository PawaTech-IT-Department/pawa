// tasks.js - Task management page logic

document.addEventListener("DOMContentLoaded", function () {
  fetchTasks();
});

async function fetchTasks() {
  try {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch tasks");
    renderTasks(data.tasks || []);
  } catch (err) {
    console.error("Error fetching tasks:", err);
  }
}

function renderTasks(tasks) {
  const tbody = document.getElementById("tasks-list");
  if (!tbody) return;
  tbody.innerHTML = "";
  tasks.forEach((task) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${task._id || "-"}</td>
      <td>${task.title || "-"}</td>
      <td>${task.assigned_to || "-"}</td>
      <td>${task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}</td>
      <td><span class="status ${getTaskStatusClass(task.status)}"></span> ${task.status || "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}

function getTaskStatusClass(status) {
  if (!status) return "orange";
  const s = status.toLowerCase();
  if (s.includes("complete")) return "purple";
  if (s.includes("progress")) return "orange";
  if (s.includes("pending") || s.includes("not")) return "pink";
  return "orange";
}
