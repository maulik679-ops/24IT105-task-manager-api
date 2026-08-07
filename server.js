const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const Task = require('./models/Task');

const app = express();
const PORT = 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
    });

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

// Home Route
app.get('/', (req, res) => {
    res.send('Task Manager API is running...');
});

// GET all tasks
app.get('/tasks', async (req, res, next) => {
    try {

        const tasks = await Task.find();

        res.status(200).json(tasks);

    } catch (err) {

        next(err);

    }
});

// GET task by ID
app.get('/tasks/:id', async (req, res, next) => {
    try {

        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);

    } catch (err) {

        next(err);

    }
});

// POST a new task
app.post('/tasks', async (req, res, next) => {
    try {

        const task = await Task.create(req.body);

        res.status(201).json(task);

    } catch (err) {

        next(err);

    }
});

// PUT update a task
app.put('/tasks/:id', async (req, res, next) => {
    try {

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json(task);

    } catch (err) {

        next(err);

    }
});

// DELETE a task
app.delete('/tasks/:id', async (req, res, next) => {
    try {

        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (err) {

        next(err);

    }
});

// Test Error Route
app.get('/error', (req, res, next) => {
    next(new Error("Test error"));
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: "Something went wrong"
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});