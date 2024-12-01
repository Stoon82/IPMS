import { apiClient } from './api';
import { Task, TaskCreate, TaskUpdate } from '../types/task';

const TASKS_URL = '/api/tasks';

export const getTasks = async (): Promise<Task[]> => {
    const response = await apiClient.get(TASKS_URL);
    return response.data;
};

export const getProjectTasks = async (projectId: number): Promise<Task[]> => {
    const response = await apiClient.get(`/api/projects/${projectId}/tasks`);
    return response.data;
};

export const createTask = async (taskData: TaskCreate): Promise<Task> => {
    const response = await apiClient.post(TASKS_URL, taskData);
    return response.data;
};

export const updateTask = async ({ id, ...taskData }: TaskUpdate): Promise<Task> => {
    const response = await apiClient.put(`${TASKS_URL}/${id}`, taskData);
    return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
    await apiClient.delete(`${TASKS_URL}/${id}`);
};
