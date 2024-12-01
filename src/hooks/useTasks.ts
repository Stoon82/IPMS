import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { Task, TaskCreate as TaskCreateData, TaskUpdate as TaskUpdateData } from '../types/task';
import { TaskFilters } from '../components/tasks/TaskFilters';

const buildQueryString = (filters?: TaskFilters): string => {
    if (!filters) return '';
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    return params.toString() ? `?${params.toString()}` : '';
};

export const useTasks = (filters?: TaskFilters) => {
    const queryClient = useQueryClient();

    const { data: tasks = [], isLoading, error } = useQuery({
        queryKey: ['tasks', filters],
        queryFn: () => apiClient.get(`/api/tasks${buildQueryString(filters)}`).then((response: any) => response.data),
    });

    const createTask = useMutation({
        mutationFn: (taskData: TaskCreateData) => 
            apiClient.post('/api/tasks', taskData).then(response => response.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const updateTask = useMutation({
        mutationFn: ({ id, data }: { id: number; data: TaskUpdateData }) =>
            apiClient.put(`/api/tasks/${id}`, data).then(response => response.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const deleteTask = useMutation({
        mutationFn: (taskId: number) => 
            apiClient.delete(`/api/tasks/${taskId}`).then(response => response.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    return {
        tasks,
        isLoading,
        error,
        createTask: createTask.mutate,
        updateTask: updateTask.mutate,
        deleteTask: deleteTask.mutate,
        isCreating: createTask.isPending,
        isUpdating: updateTask.isPending,
        isDeleting: deleteTask.isPending,
    };
};
