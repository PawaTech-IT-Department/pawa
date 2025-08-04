// tasks.js - Task management page logic

document.addEventListener("DOMContentLoaded", function () {
  fetchTasks();
  setupTaskModalHandlers();
});

function setupTaskModalHandlers() {
  // Show modal
  document.getElementById("showAddTaskModal").addEventListener("click", function () {
    document.getElementById("addTaskModal").style.display = "block";
  });
  // Close modal
  document.getElementById("cancelTaskModal").addEventListener("click", function () {
    document.getElementById("addTaskModal").style.display = "none";
    document.getElementById("addTaskForm").reset();
  });
  // Form submit
  document.getElementById("addTaskForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    await addTask();
  });
}

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
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;
    // Delete
    tr.querySelector(".delete-btn").addEventListener("click", async () => {
      if (!confirm("Delete this task?")) return;
      try {
        const res = await fetch(`/api/tasks/${task._id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete task");
        fetchTasks();
      } catch (err) {
        alert("Error deleting task: " + err.message);
      }
    });
    // Edit
    tr.querySelector(".edit-btn").addEventListener("click", () => {
      showEditTaskModal(task);
    });
    tbody.appendChild(tr);
  });
}

// Edit Task Modal Logic
function showEditTaskModal(task) {
  // Create modal if not present
  if (!document.getElementById("editTaskModal")) {
    const modal = document.createElement("div");
    modal.id = "editTaskModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <h3>Edit Task</h3>
        <form id="editTaskForm">
          <div class="form-group">
            <label for="editTaskDescription">Description:</label>
            <input type="text" id="editTaskDescription" required />
          </div>
          <div class="form-group">
            <label for="editTaskAssignee">Assigned To:</label>
            <input type="text" id="editTaskAssignee" required />
          </div>
          <div class="form-group">
            <label for="editTaskDueDate">Due Date:</label>
            <input type="date" id="editTaskDueDate" required />
          </div>
          <div class="form-group">
            <label for="editTaskStatus">Status:</label>
            <select id="editTaskStatus">
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit">Save</button>
            <button type="button" id="cancelEditTaskModal">Cancel</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }
  // Fill form
  document.getElementById("editTaskDescription").value = task.title;
  document.getElementById("editTaskAssignee").value = task.assigned_to;
  document.getElementById("editTaskDueDate").value = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "";
  document.getElementById("editTaskStatus").value = task.status;
  // Show modal
  document.getElementById("editTaskModal").style.display = "block";
  // Close modal
  document.getElementById("cancelEditTaskModal").onclick = function () {
    document.getElementById("editTaskModal").style.display = "none";
    document.getElementById("editTaskForm").reset();
  };
  // Form submit
  document.getElementById("editTaskForm").onsubmit = async function (e) {
    e.preventDefault();
    await saveTaskEdit(task._id);
  };
}

async function saveTaskEdit(id) {
  const description = document.getElementById("editTaskDescription").value;
  const assigned_to = document.getElementById("editTaskAssignee").value;
  const due_date = document.getElementById("editTaskDueDate").value;
  const status = document.getElementById("editTaskStatus").value;
  const payload = { description, assigned_to, due_date, status };
  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update task");
    document.getElementById("editTaskModal").style.display = "none";
    document.getElementById("editTaskForm").reset();
    fetchTasks();
  } catch (err) {
    alert("Error updating task: " + err.message);
  }
}

async function addTask() {
  const description = document.getElementById("taskDescription").value;
  const assigned_to = document.getElementById("taskAssignee").value;
  const due_date = document.getElementById("taskDueDate").value;
  const status = document.getElementById("taskStatus").value;
  const payload = { description, assigned_to, due_date, status };
  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add task");
    document.getElementById("addTaskModal").style.display = "none";
    document.getElementById("addTaskForm").reset();
    fetchTasks();
  } catch (err) {
    alert("Error adding task: " + err.message);
  }
}

function getTaskStatusClass(status) {
  if (!status) return "orange";
  const s = status.toLowerCase();
  if (s.includes("complete")) return "purple";
  if (s.includes("progress")) return "orange";
  if (s.includes("pending") || s.includes("not")) return "pink";
  return "orange";
}
