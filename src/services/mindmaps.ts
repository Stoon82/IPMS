import { apiClient } from './api';

export interface MindmapNode {
  id: string;
  text: string;
  children?: MindmapNode[];
}

export interface Mindmap {
  id: number;
  title: string;
  data: MindmapNode;
  project_id: number;
}

export const createMindmap = async (title: string, data: MindmapNode, projectId: number) => {
  const response = await apiClient.post('/api/mindmaps/', {
    title,
    data,
    project_id: projectId,
  });
  return response.data;
};

export const getMindmap = async (id: number) => {
  const response = await apiClient.get(`/api/mindmaps/${id}`);
  return response.data;
};

export const getProjectMindmaps = async (projectId: number) => {
  const response = await apiClient.get(`/api/mindmaps/projects/${projectId}/mindmaps/`);
  return response.data;
};

export const updateMindmap = async (id: number, title: string, data: MindmapNode) => {
  console.log('Preparing mindmap update request:', { id, title, data });
  
  try {
    const payload = {
      title,
      data,
    };
    console.log('Sending mindmap update payload:', payload);
    
    const response = await apiClient.put(`/api/mindmaps/${id}`, payload);
    console.log('Mindmap update successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Mindmap update failed:', error);
    throw error;
  }
};

export const deleteMindmap = async (id: number) => {
  const response = await apiClient.delete(`/api/mindmaps/${id}`);
  return response.data;
};
