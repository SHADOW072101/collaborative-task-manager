import { apiClient } from '../../../shared/services/apiClient';
import type { TaskFormData } from '../components/TaskForm';
import { type Task, type CreateTaskData, type UpdateTaskData } from '../types';

export const taskService = {
  async createTask(data: TaskFormData | CreateTaskData): Promise<Task> {
    console.log('🔍 taskService.createTask called with:', data);
    
    try {
      const response = await apiClient.post<Task>('/tasks', data);
      console.log('✅ Task created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Task creation failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  async getAll(filters?: Record<string, string>): Promise<Task[]> {
    console.log('🔍 taskService.getAll called with filters:', filters);
    
    try {
      const response = await apiClient.get<Task[]>('/tasks', {
        params: filters,
      });
      
      console.log('✅ Tasks fetched successfully:', {
        count: response.data?.length || 0,
        filters,
      });
      
      // Ensure we always return an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('❌ Failed to fetch tasks:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        filters,
      });
      
      // Return empty array instead of throwing for better UX
      return [];
    }
  },

  async getDashboardStats() {
    console.log('🔍 taskService.getDashboardStats called');
    
    try {
      const response = await apiClient.get('/tasks/dashboard/stats');
      console.log('✅ Dashboard stats fetched');
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch dashboard stats:', error.message);
      
      // Return mock stats if backend is unavailable
      return {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        overdue: 0,
      };
    }
  },


  async getTask(taskId: string): Promise<Task | null> {
    console.log('🔍 taskService.getTask called for:', taskId);
    
    try {
      const response = await apiClient.get<Task>(`/tasks/${taskId}`);
      console.log('✅ Task fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch task:', {
        taskId,
        message: error.message,
        status: error.response?.status,
      });
      return null;
    }
  },


  async updateTask(taskId: string, data: UpdateTaskData): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${taskId}`, data);
    return response.data;
  },

  async deleteTask(taskId: string): Promise<void> {
    console.log('🔍 taskService.deleteTask called for:', taskId);
    
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      console.log('✅ Task deleted successfully');
    } catch (error: any) {
      console.error('❌ Task deletion failed:', {
        taskId,
        message: error.message,
        status: error.response?.status,
      });
      throw error;
    }
  },

  async assignTask(taskId: string, userId: string): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${taskId}/assign`, { userId });
    return response.data;
  },

  async updateStatus(taskId: string, status: Task['status']): Promise<Task> {
    console.log('🔍 taskService.updateStatus called:', { taskId, status });
    
    try {
      const response = await apiClient.patch<Task>(`/tasks/${taskId}/status`, { status });
      console.log('✅ Status updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Status update failed:', {
        taskId,
        status,
        message: error.message,
      });
      throw error;
    }
  },

};