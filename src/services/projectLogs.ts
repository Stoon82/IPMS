import { apiClient } from './api';

export const getProjectLogs = async (projectId: number) => {
    const response = await apiClient.get(`/projects/${projectId}/logs`);
    return response.data;
};

export const createProjectLog = async ({ projectId, ...logData }: any) => {
    const response = await apiClient.post(`/projects/${projectId}/logs`, logData);
    return response.data;
};

export const updateProjectLog = async ({ projectId, logId, ...logData }: any) => {
    const response = await apiClient.put(`/projects/${projectId}/logs/${logId}`, logData);
    return response.data;
};

export const deleteProjectLog = async ({ projectId, logId }: any) => {
    const response = await apiClient.delete(`/projects/${projectId}/logs/${logId}`);
    return response.data;
};
