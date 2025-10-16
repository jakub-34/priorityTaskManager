import { Task } from './Task';
import { randomInt } from "crypto";

export type QueueSnapshot = {
    pending: Task[];
    current?: Task | null;
    completed: Task[];
}

export class TaskManager {
    private pending: Task[] = [];
    private currentTask: Task | null = null;
    private completed: Task[] = [];
    private processingIntervalMs: number;
    private agingFactor: number;
    private tickHandle: NodeJS.Timeout | null = null;
    private onUpdateCb: (snapshot: QueueSnapshot, event?: string, task?: Task) => void;

    constructor(processingIntervalMs: number = 5000, agingFactor: number = 60, onUpdateCb?: (snapshot: QueueSnapshot, event?: string, task?: Task) => void) {
        this.processingIntervalMs = processingIntervalMs;
        this.agingFactor = agingFactor;
        this.onUpdateCb = onUpdateCb ?? (() => {});
    }

    addTask(task: Task) {
        if (!task.id || typeof task.name !== "string" || typeof task.priority !== "number") {
            throw new Error("Invalid task");
        }

        task.progress = 0;
        task.createdAt = new Date(task.createdAt || Date.now());
        this.pending.push(task);
        this.sortPending();
        this.emitUpdate("task_added", task);
        if (!this.currentTask){
            this.pickNextTask();
        }
    }

    getSnapshot(): QueueSnapshot {
        return{
            pending: [...this.pending].sort((a, b) => this.getEffectivePriority(b) - this.getEffectivePriority(a)),
            current: this.currentTask ? { ...this.currentTask } : null,
            completed: [...this.completed]
        };
    }

    getCompleted() {
        return [...this.completed];
    }

    clearCompleted() {
        this.completed = [];
        this.emitUpdate("completed_cleared");
    }

    startProcessing() {
        if (this.tickHandle) return; // already running

        this.pickNextTask();
        this.tickHandle = setInterval(async () => {
            try {
                await this.tick();
            } catch (err) {
                console.error("Error during task processing:", err);
            }
        }, this.processingIntervalMs);
    }

    stopProcessing() {
        if (this.tickHandle) {
            clearInterval(this.tickHandle);
            this.tickHandle = null;
        }
    }

    private async tick() {
        this.pickNextTask();

        if (!this.currentTask) return;

        const inc = randomInt(10, 21);
        this.currentTask.progress = Math.min(100, this.currentTask.progress + inc);
        this.emitUpdate("task_progress", this.currentTask);

        if (this.currentTask.progress >= 100) {
            const completed = this.currentTask;
            this.completed.push({...completed, progress: 100});
            this.currentTask = null;
            this.currentTask = null;
            this.pending = this.pending.filter(t => t.id !== completed.id);
            this.emitUpdate("task_completed", completed);
            this.pickNextTask();
        }
    }

    private pickNextTask() {
        if (this.currentTask && this.currentTask.progress < 100) return;

        if (this.pending.length === 0) {
            this.currentTask = null;
            this.emitUpdate("queue_idle");
            return;
        }

        this.sortPending();
        const next = this.pending.shift()!;
        this.currentTask = next;
        this.emitUpdate("task_started", next);
    }

    private sortPending() {
        this.pending.sort((a, b) => {
            const pa = this.getEffectivePriority(a);
            const pb = this.getEffectivePriority(b);
            if (pa === pb) {
                return a.createdAt.getTime() - b.createdAt.getTime();
            }
            return pb - pa;
        });
    }

    private getEffectivePriority(task: Task): number {
        const ageSeconds = (Date.now() - task.createdAt.getTime()) / 1000;
        return task.priority + Math.floor((ageSeconds / this.agingFactor));
    }

    private emitUpdate(event?: string, task?: Task) {
        try {
            const snapshot = this.getSnapshot();
            this.onUpdateCb(snapshot, event, task);
        } catch (err) {
            console.error("Emit update error:", err);
        }
    }
}