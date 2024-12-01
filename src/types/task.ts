export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
    created_at: string;
    updated_at: string;
    user_id: number;
    project_id: number;
}

export interface TaskCreate {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string;
    project_id: number;
}

export interface TaskUpdate extends Partial<TaskCreate> {
    id: number;
}
