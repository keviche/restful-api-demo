
const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskCount = document.getElementById("task-count");
const apiLog = document.getElementById("api-log");
const errorMessage = document.getElementById("error-message");

let tasks = [];

// Helper function to send HTTP requests
async function apiRequest(method, endpoint, body = null) {
  const options = { method };

  if (body !== null) {
    options.headers = {
      "Content-Type": "application/json"
    };
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, options);

    // Display the HTTP request and response status
    apiLog.textContent =
      `${method} ${endpoint} → ${response.status} ${response.statusText}`;

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }

    errorMessage.textContent = "";

    // DELETE returns 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    errorMessage.textContent = error.message;
    throw error;
  }
}

// GET - Retrieve all tasks
async function loadTasks() {
  tasks = await apiRequest("GET", "/tasks");
  renderTasks();
}

// Render tasks on the webpage
function renderTasks() {
  taskList.innerHTML = "";

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);

    checkbox.addEventListener("change", () => {
      updateTask(task.id, checkbox.checked);
    });

    const title = document.createElement("span");
    title.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });

    li.append(checkbox, title, deleteButton);
    taskList.appendChild(li);
  }

  const remaining = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${remaining} remaining`;
}

// POST - Create a task
taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  try {
    const newTask = await apiRequest("POST", "/tasks", { title });

    tasks.push(newTask);
    taskInput.value = "";
    renderTasks();
  } catch (error) {
    console.error(error);
  }
});

// PATCH - Update a task
async function updateTask(id, completed) {
  try {
    const updatedTask = await apiRequest(
      "PATCH",
      `/tasks/${id}`,
      { completed }
    );

    tasks = tasks.map(task =>
      task.id === id ? updatedTask : task
    );

    renderTasks();
  } catch (error) {
    console.error(error);
    renderTasks();
  }
}

// DELETE - Remove a task
async function deleteTask(id) {
  try {
    await apiRequest("DELETE", `/tasks/${id}`);

    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
  } catch (error) {
    console.error(error);
  }
}

// Load tasks when the page opens
loadTasks().catch(console.error);
