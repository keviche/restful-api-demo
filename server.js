
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory database
let tasks = [
  { id: 1, title: "Learn REST APIs", completed: false },
  { id: 2, title: "Build a Task Manager", completed: false }
];

let nextId = 3;

// GET - Retrieve all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// GET - Retrieve a specific task
app.get("/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(task);
});

// POST - Create a new task
app.post("/tasks", (req, res) => {
  const { title } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Valid title required" });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    completed: false
  };

  tasks.push(task);

  res.status(201).json(task);
});

// PATCH - Update an existing task
app.patch("/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, completed } = req.body ?? {};

  if (title !== undefined &&
      (typeof title !== "string" || !title.trim())) {
    return res.status(400).json({ error: "Invalid title" });
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ error: "Invalid completed value" });
  }

  if (title !== undefined) task.title = title.trim();
  if (completed !== undefined) task.completed = completed;

  res.json(task);
});

// DELETE - Remove a task
app.delete("/tasks/:id", (req, res) => {
  const index = tasks.findIndex(t => t.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(index, 1);

  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
