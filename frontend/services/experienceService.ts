import api from './api';
import { Experience, ApiResponse } from '@/types';

export const experienceService = {
  async getAllExperiences(): Promise<ApiResponse<Experience[]>> {
    const response = await api.get('/experiences');
    return response.data;
  },

  async getExperienceById(id: number): Promise<ApiResponse<Experience>> {
    const response = await api.get(`/experiences/${id}`);
    return response.data;
  },

  async createExperience(experience: Omit<Experience, 'id'>): Promise<ApiResponse<Experience>> {
    const response = await api.post('/experiences', experience);
    return response.data;
  },

  async updateExperience(id: number, experience: Partial<Experience>): Promise<ApiResponse<Experience>> {
    const response = await api.put(`/experiences/${id}`, experience);
    return response.data;
  },

  async deleteExperience(id: number): Promise<ApiResponse<void>> {
    const response = await api.delete(`/experiences/${id}`);
    return response.data;
  },

  async addTagToExperience(experienceId: number, tag: string): Promise<ApiResponse<Experience>> {
    const response = await api.post(`/experiences/${experienceId}/tags`, { tag });
    return response.data;
  },

  async updateExperienceTags(experienceId: number, tags: string[]): Promise<ApiResponse<Experience>> {
    const response = await api.put(`/experiences/${experienceId}/tags`, { tags });
    return response.data;
  },

  async deleteTagFromExperience(experienceId: number, tagId: number): Promise<ApiResponse<Experience>> {
    const response = await api.delete(`/experiences/${experienceId}/tags/${tagId}`);
    return response.data;
  }
}; 