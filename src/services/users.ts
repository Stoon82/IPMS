import { apiClient } from './api';
import { User, UserSummary, ProjectActivity } from '../types/user';

export const getUsers = async (): Promise<User[]> => {
    const response = await apiClient.get('/api/users');
    return response.data;
};

export const searchUsers = async (query: string): Promise<UserSummary[]> => {
    const response = await apiClient.get('/api/users/search', { params: { q: query } });
    return response.data;
};

export const getProjectMembers = async (projectId: number): Promise<UserSummary[]> => {
    const response = await apiClient.get(`/api/projects/${projectId}/members`);
    return response.data;
};

export const getProjectActivities = async (projectId: number): Promise<ProjectActivity[]> => {
    const response = await apiClient.get(`/api/projects/${projectId}/activities`);
    return response.data;
};
