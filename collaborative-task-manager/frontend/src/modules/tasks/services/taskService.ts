import { apiClient } from '../../../shared/services/apiClient';
import type { TaskFormData } from '../components/TaskForm';
import { type Task, type CreateTaskData, type UpdateTaskData } from '../types';

export const taskService = {
  async createTask(data: TaskFormData) {
    console.log('🔍 taskService.createTask called with:', data);
    
    try {
      const response = await apiClient.post('/tasks', data);
      console.log('✅ Task created successfully:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Task creation failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },


  async getDashboardStats() {
    const response = await apiClient.get('/tasks/dashboard/stats');
    return response.data;
  },

  async getTaskById(taskId: string): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${taskId}`);
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