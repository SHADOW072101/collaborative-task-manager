import { apiClient } from '../../../shared/services/apiClient';
import { type Task, type CreateTaskData, type UpdateTaskData } from '../types';

export const taskService = {
  async getTasks(params?: Record<string, string>): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks', { params });
    return response.data;
  },

  async getTaskById(taskId: string): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${taskId}`);
    return response.data;
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  },

  async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${taskId}`, data);
    return response.data;
  },

  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  async assignTask(taskId: string, userId: string): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${taskId}/assign`, { userId });
    return response.data;
  },

  async updateStatus(taskId: string, status: Task['status']): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${taskId}/status`, { status });
    return response.data;
  },
};