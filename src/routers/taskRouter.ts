import { Router } from "express";
import { createTaskController } from "../controllers/taskController";
import { TaskManager } from "../services/taskManager";

export default function taskRouter(manager: TaskManager) {
  const router = Router();
  const controller = createTaskController(manager);

  router.get("/", controller.getAllTasks);
  router.post("/", controller.addTask);
  router.get("/completed", controller.getCompletedTasks);
  router.delete("/completed", controller.clearCompleted);

  return router;
}
