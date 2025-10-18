export interface Task {
    id: string;
    name: string;
    priority: number; // higher = more important
    progress: number; // 0-100 as percents
    createdAt: Date;
}
