import { default as ioClient } from "socket.io-client";
import { Task } from "../src/models/Task";

const socket = ioClient("http://localhost:3000");

// Send join_queue event upon connection
socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("join_queue");
});

// When a new task is added
socket.on("task_added", (task: Task) => {
  console.log(`Task added: ${task.name}`);
});

// When a completed tasks are cleared
socket.on("completed_cleared", () => {
    console.log("Completed tasks cleared");
});

// When the task progress changes
socket.on("task_progress", (task: Task) => {
  console.log(`Task progress: ${task.name} ${task.progress}%`);
});

// When the task is completed
socket.on("task_completed", (task: Task) => {
  console.log(`Task completed: ${task.name}`);
});

// When the queue becomes idle
socket.on("queue_idle", () => {
  console.log("Queue is idle");
});

// When a task starts processing
socket.on("task_started", (task: Task) => {
  console.log(`Task started: ${task.name}`);
});

// Queue update
socket.on("queue_update", (data: any) => {
    console.log("Queue update:", data);
});

// When the connection is lost
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
