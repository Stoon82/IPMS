import { apiClient } from './api';

export interface ConceptNote {
    id: number;
    title: string;
    content: string;
    project_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface ConceptNoteCreate {
    title: string;
    content: string;
    project_id: number;
}

export interface ConceptNoteUpdate {
    id: number;
    title?: string;
    content?: string;
}

export const getProjectConceptNotes = async (projectId: number): Promise<ConceptNote[]> => {
    const response = await apiClient.get(`/api/projects/${projectId}/concepts`);
    return response.data;
};

export const getConceptNote = async (id: number): Promise<ConceptNote> => {
    const response = await apiClient.get(`/api/concepts/${id}`);
    return response.data;
};

export const createConceptNote = async (data: ConceptNoteCreate): Promise<ConceptNote> => {
    const response = await apiClient.post('/api/concepts', data);
    return response.data;
};

export const updateConceptNote = async ({ id, ...data }: ConceptNoteUpdate): Promise<ConceptNote> => {
    const response = await apiClient.put(`/api/concepts/${id}`, data);
    return response.data;
};

export const deleteConceptNote = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/concepts/${id}`);
};
