import { Request, Response } from "express";
import { TaskManager } from "../services/taskManager";
import { v4 as uuidv4 } from "uuid";
import { Task } from "../models/Task";

export function createTaskController(manager: TaskManager) {
  return {
    getAllTasks(req: Request, res: Response) {
      const snapshot = manager.getSnapshot();
      res.json(snapshot);
    },

    addTask(req: Request, res: Response) {
      const { name, priority } = req.body;
      if (!name || typeof priority !== "number") {
        return res.status(400).json({ error: "Invalid task" });
      }

      const task: Task = {
        id: uuidv4(),
        name,
        priority,
        progress: 0,
        createdAt: new Date(),
      };

      manager.addTask(task);
      res.status(201).json(task);
    },

    getCompletedTasks(req: Request, res: Response) {
      res.json(manager.getCompleted());
    },

    clearCompleted(req: Request, res: Response) {
      manager.clearCompleted();
      res.status(204).send();
    },
  };
}
