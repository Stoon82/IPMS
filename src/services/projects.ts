import { apiClient } from './api';
import { Project, ProjectCreate, ProjectUpdate } from '../types/project';

const PROJECTS_URL = '/api/projects';

interface GetProjectsParams {
    status?: string;
    skip?: number;
    limit?: number;
    sort_by?: 'created_at' | 'updated_at' | 'title' | 'status';
    sort_order?: 'asc' | 'desc';
}

export const getProjects = async (params?: GetProjectsParams): Promise<Project[]> => {
    const response = await apiClient.get(PROJECTS_URL, { params });
    return response.data;
};

export const getProject = async (id: number): Promise<Project> => {
    const response = await apiClient.get(`${PROJECTS_URL}/${id}`);
    return response.data;
};

export const createProject = async (project: ProjectCreate): Promise<Project> => {
    const response = await apiClient.post(PROJECTS_URL, project);
    return response.data;
};

export const updateProject = async ({ id, ...project }: ProjectUpdate): Promise<Project> => {
    const response = await apiClient.put(`${PROJECTS_URL}/${id}`, project);
    return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
    await apiClient.delete(`${PROJECTS_URL}/${id}`);
};

export const addTeamMember = async (projectId: number, userId: number): Promise<void> => {
    await apiClient.post(`${PROJECTS_URL}/${projectId}/team/${userId}`);
};

export const removeTeamMember = async (projectId: number, userId: number): Promise<void> => {
    await apiClient.delete(`${PROJECTS_URL}/${projectId}/team/${userId}`);
};

export const updateProjectProgress = async (projectId: number, progress: number): Promise<Project> => {
    const response = await apiClient.put(`${PROJECTS_URL}/${projectId}/progress`, { progress });
    return response.data;
};
