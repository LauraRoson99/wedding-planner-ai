import { TaskCategory, TaskPriority, TaskStatus } from "../generated/client/client";
export declare function getTasksService(weddingId: string): Promise<{
    priority: TaskPriority;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    notes: string | null;
    title: string;
    completed: boolean;
    dueDate: Date | null;
    status: TaskStatus;
    category: TaskCategory;
}[]>;
export declare function getTaskByIdService(id: string, userId: string): Promise<{
    priority: TaskPriority;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    notes: string | null;
    title: string;
    completed: boolean;
    dueDate: Date | null;
    status: TaskStatus;
    category: TaskCategory;
} | null>;
export declare function createTaskService(data: {
    title: string;
    weddingId: string;
    notes?: string | null;
    dueDate?: Date | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    category?: TaskCategory;
}): Promise<{
    priority: TaskPriority;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    notes: string | null;
    title: string;
    completed: boolean;
    dueDate: Date | null;
    status: TaskStatus;
    category: TaskCategory;
}>;
export declare function createManyTasksService(weddingId: string, tasks: Array<{
    title: string;
    category?: TaskCategory;
    priority?: TaskPriority;
    dueDate?: Date | null;
    notes?: string | null;
}>): Promise<{
    created: number;
}>;
export declare function updateTaskService(id: string, data: {
    title?: string;
    notes?: string | null;
    completed?: boolean;
    dueDate?: Date | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    category?: TaskCategory;
}): Promise<{
    priority: TaskPriority;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    notes: string | null;
    title: string;
    completed: boolean;
    dueDate: Date | null;
    status: TaskStatus;
    category: TaskCategory;
}>;
export declare function deleteTaskService(id: string): Promise<{
    priority: TaskPriority;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    weddingId: string;
    notes: string | null;
    title: string;
    completed: boolean;
    dueDate: Date | null;
    status: TaskStatus;
    category: TaskCategory;
}>;
//# sourceMappingURL=task.service.d.ts.map