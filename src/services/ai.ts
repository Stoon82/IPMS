import { apiClient } from './api';

export const aiService = {
    analyzeTask: async (taskData: { title: string; description: string }) => {
        const response = await apiClient.post('/api/ai/analyze-task', taskData);
        return response.data;
    },
    
    suggestOptimization: async (taskId: number) => {
        const response = await apiClient.get(`/api/ai/optimize-task/${taskId}`);
        return response.data;
    }
};
