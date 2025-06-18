const API_BASE = "https://todo-backend-rorc.onrender.com";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

let taskList = []; // memory for filtering

// Load tasks on page load
window.addEventListener("DOMContentLoaded", loadTasks);

async function loadTasks() {
  try {
    const res = await fetch(`${API_BASE}`);
    const tasks = await res.json();
    taskList = tasks;
    renderFilteredTasks("all");
  } catch (err) {
    alert("⚠️ Could not load tasks.");
    console.error(err);
  }
}

// Submit new task
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  try {
    const res = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, completed: false }),
    });
    const newTask = await res.json();
    taskList.push(newTask);
    renderFilteredTasks("all");
    input.value = "";
  } catch (err) {
    alert("⚠️ Failed to add task.");
    console.error(err);
  }
});

// Add a single task to the DOM
function addTask(task) {
  const li = document.createElement("li");

  const taskSpan = document.createElement("span");
  taskSpan.textContent = task.text;
  taskSpan.style.flex = "1";
  if (task.completed) taskSpan.classList.add("completed");

  // Toggle complete
  taskSpan.addEventListener("click", async () => {
    task.completed = !task.completed;
    taskSpan.classList.toggle("completed");
    await updateTask(task);
  });

  // Delete
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.style.marginLeft = "10px";
  deleteBtn.addEventListener("click", async () => {
    try {
      await fetch(`${API_BASE}/${task._id}`, { method: "DELETE" });
      taskList = taskList.filter(t => t._id !== task._id);
      renderFilteredTasks("all");
    } catch (err) {
      alert("⚠️ Failed to delete task.");
      console.error(err);
    }
  });

  li.style.display = "flex";
  li.style.alignItems = "center";
  li.appendChild(taskSpan);
  li.appendChild(deleteBtn);
  list.appendChild(li);
}

// Update a task in DB and memory
async function updateTask(task) {
  try {
    const res = await fetch(`${API_BASE}/${task._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    const updated = await res.json();
    const index = taskList.findIndex(t => t._id === updated._id);
    if (index !== -1) taskList[index] = updated;
  } catch (err) {
    alert("⚠️ Failed to update task.");
    console.error(err);
  }
}

// Filter UI buttons
const filterButtons = document.querySelectorAll("#filters button");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.getAttribute("data-filter");
    renderFilteredTasks(filter);
  });
});

// Show only filtered tasks
function renderFilteredTasks(filter) {
  list.innerHTML = "";
  taskList.forEach(task => {
    const show =
      filter === "all" ||
      (filter === "completed" && task.completed) ||
      (filter === "incomplete" && !task.completed);
    if (show) addTask(task);
  });
}
