import api from './api';
import { Project, ApiResponse } from '@/types';

export const projectService = {
  async getAllProjects(): Promise<ApiResponse<Project[]>> {
    const response = await api.get('/projects');
    return response.data;
  },

  async getProjectById(id: number): Promise<ApiResponse<Project>> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Project>> {
    const response = await api.post('/projects', project);
    return response.data;
  },

  async updateProject(id: number, project: Partial<Project>): Promise<ApiResponse<Project>> {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },

  async deleteProject(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  async addTechnologyToProject(projectId: number, technology: string): Promise<ApiResponse<Project>> {
    const response = await api.post(`/projects/${projectId}/technologies`, { technology });
    return response.data;
  },

  async updateProjectTechnologies(projectId: number, technologies: string[]): Promise<ApiResponse<Project>> {
    const response = await api.put(`/projects/${projectId}/technologies`, { technologies });
    return response.data;
  },

  async deleteTechnologyFromProject(projectId: number, techId: number): Promise<ApiResponse<Project>> {
    const response = await api.delete(`/projects/${projectId}/technologies/${techId}`);
    return response.data;
  }
}; 