import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import { TaskManager } from './taskManager';
import { Task } from './Task';
import { v4 as uuidv4 } from 'uuid';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new IOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

const manager = new TaskManager(5000, 60, (snapshot, event, payload) => {
    io.emit('queue_update', snapshot);

    if (event === "task_progress") {
        io.emit('task_progress', payload);
    } else if (event === "task_completed") {
        io.emit('task_completed', payload);
    } else if (event === "task_added") {
        io.emit('task_added', payload);
    } else if (event === "task_started") {
        io.emit('task_started', payload);
    }
});


// REST endpoints

// GET /api/tasks - Get all tasks in queue
app.get("/api/tasks", (req, res) => {
    try {
        const snapshot = manager.getSnapshot();
        res.json({
            pending: snapshot.pending,
            current: snapshot.current,
            completedCount: snapshot.completed.length
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

// POST /api/tasks - Add new task
app.post("/api/tasks", (req, res) => {
    try {
        const { name, priority } = req.body;
        if (typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ error: "Invalid or missing task name" });
        }
        if (typeof priority !== "number" || !Number.isFinite(priority)) {
            return res.status(400).json({ error: "Invalid or missing task priority (number expected)" });
        }
        const task: Task = {
            id: uuidv4(),
            name: name.trim(),
            priority,
            progress: 0,
            createdAt: new Date()
        };
        manager.addTask(task);
        res.status(201).json({ message: "Task added", task });
    } catch (err) {
        res.status(500).json({ error: "Failed to add task" });
    }
});


// GET /api/tasks/completed - Get completed tasks
app.get("/api/tasks/completed", (req, res) => {
    try {
        res.json(manager.getCompleted());
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch completed tasks" });
    }
});

// DELETE /api/tasks/completed - Clear completed tasks
app.delete("/api/tasks/completed", (req, res) => {
    try {
        manager.clearCompleted();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: "Failed to clear completed tasks" });
    }
});

// socket.io handling
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // client -> server: join_queue
    socket.on("join_queue", () => {
        socket.emit("queue_update", manager.getSnapshot());
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

manager.startProcessing();
server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});