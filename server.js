const express = require('express');

const app = express();
const PORT = 5000;

// In-memory task storage
let tasks = [
    {
        id: 1,
        title: "Learn Express",
        completed: false
    },
    {
        id: 2,
        title: "Build REST API",
        completed: false
    }
];

// Parse JSON request body
app.use(express.json());

// Content-Type validation middleware
app.use((req, res, next) => {

    // Only check POST and PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {

        // Check if Content-Type is application/json
        if (!req.is('application/json')) {
            return res.status(400).json({
                error: 'Content-Type must be application/json'
            });
        }
    }

    next();
});

// Global Request Logging Middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Route-specific middleware to validate task ID
const validateTaskId = (req, res, next) => {

    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: "Invalid task ID"
        });
    }

    next();
};

// Home Route
app.get('/', (req, res) => {
    res.send('Task Manager API is running...');
});

// GET all tasks
app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
});

// POST a new task
app.post('/tasks', (req, res) => {
    const { title } = req.body;

    const newTask = {
        id: tasks.length + 1,
        title: title,
        completed: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});

// PUT update a task
app.put('/tasks/:id', validateTaskId, (req, res) => {
    const id = parseInt(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const { title, completed } = req.body;

    if (title !== undefined) {
        task.title = title;
    }

    if (completed !== undefined) {
        task.completed = completed;
    }

    res.status(200).json(task);
});

// DELETE a task
app.delete('/tasks/:id', validateTaskId, (req, res) => {
    const id = parseInt(req.params.id);

    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1);

    res.status(200).json({
        message: "Task deleted successfully",
        deletedTask: deletedTask[0]
    });
});

app.get('/error', (req, res, next) => {
    next(new Error("Test error"));
});

// 404 Handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        error: "Something went wrong"
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});