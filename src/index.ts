import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import taskRouter from './routers/taskRouter';
import { TaskManager } from './services/taskManager';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = 3000;

const manager = new TaskManager(5000, 60, (snapshot, event, payload) => {
  io.emit('queue_update', snapshot);
  if (event) io.emit(event, payload);
});

app.use("/api/tasks", taskRouter(manager));

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

manager.startProcessing();

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
