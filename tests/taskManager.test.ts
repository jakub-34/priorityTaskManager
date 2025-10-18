import { TaskManager } from "../src/services/taskManager";
import { Task } from "../src/models/Task";

describe("TaskManager", () => {
  let manager: TaskManager;

  beforeEach(() => {
    manager = new TaskManager(10, 60, () => {});
  });

  test("add task to currentTask", () => {
  const task: Task = {
    id: "1",
    name: "Test Task",
    priority: 5,
    progress: 0,
    createdAt: new Date()
  };

  manager.addTask(task);

  const snapshot = manager.getSnapshot();

  expect(snapshot.current).not.toBeNull();
  expect(snapshot.current!.name).toBe("Test Task");

  expect(snapshot.pending.length).toBe(0);
  });

    test("add task to pending", () => {
  const task1: Task = {
    id: "2",
    name: "Test Task",
    priority: 3,
    progress: 0,
    createdAt: new Date()
  };

  const task2: Task = {
    id: "3",
    name: "Test Task 2",
    priority: 2,
    progress: 0,
    createdAt: new Date()
  };

  manager.addTask(task1);
  manager.addTask(task2);

  const snapshot = manager.getSnapshot();

  expect(snapshot.pending.length).toBe(1);
  expect(snapshot.pending[0].name).toBe("Test Task 2");
  });

  test("complete current task and start next pending task and add to completed", async () => {
  const task1: Task = {
    id: "4",
    name: "Task 1",
    priority: 1,
    progress: 0,
    createdAt: new Date()
  };

  const task2: Task = {
    id: "5",
    name: "Task 2",
    priority: 2,
    progress: 0,
    createdAt: new Date()
  };

  manager.addTask(task1);
  manager.addTask(task2);

  const snapshot = manager.getSnapshot();
  manager.startProcessing();

  expect(snapshot.current?.name).toBe("Task 1");
  expect(snapshot.pending.length).toBe(1);
  expect(snapshot.pending[0].name).toBe("Task 2");
  expect(snapshot.completed.length).toBe(0);

  await new Promise((r) => setTimeout(r, 150));

  const updatedSnapshot = manager.getSnapshot();

  expect(updatedSnapshot.current?.name).toBe("Task 2");
  expect(updatedSnapshot.pending.length).toBe(0);
  expect(updatedSnapshot.completed.length).toBe(1);
  expect(updatedSnapshot.completed[0].name).toBe("Task 1");

  manager.stopProcessing();
  });
});