import { apiClient } from './api';
import { Idea } from '../types/idea';

export const getProjectIdeas = async (projectId: number): Promise<Idea[]> => {
    const response = await apiClient.get(`/api/projects/${projectId}/ideas`);
    return response.data;
};

export const linkIdeaToProject = async (projectId: number, ideaId: number): Promise<void> => {
    await apiClient.post(`/api/projects/${projectId}/ideas/${ideaId}`);
};

export const unlinkIdeaFromProject = async (projectId: number, ideaId: number): Promise<void> => {
    await apiClient.delete(`/api/projects/${projectId}/ideas/${ideaId}`);
};

export const getAvailableIdeas = async (projectId: number): Promise<Idea[]> => {
    const response = await apiClient.get(`/api/ideas`, {
        params: { exclude_project: projectId }
    });
    return response.data;
};
