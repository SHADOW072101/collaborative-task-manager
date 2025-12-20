import { useQuery } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { type Task } from '../types';
import { useAuth } from '../../auth/hooks/useAuth';

interface UseTasksOptions {
  view?: 'all' | 'my' | 'assigned';
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
}

export const useTasks = (options: UseTasksOptions = {}) => {
  const { user } = useAuth();
  const {
    view = 'my', // Changed default from 'all' to 'my'
    search = '',
    status,
    priority,
    sortBy = 'dueDate-asc',
  } = options;

  const queryKey = ['tasks', { 
    userId: user?.id, 
    view, 
    search, 
    status, 
    priority, 
    sortBy 
  }];

  const { data, isLoading, error, refetch } = useQuery<Task[], Error>({
    queryKey,
    queryFn: async () => {
      try {
        if (!user?.id) {
          console.log('❌ No user ID available');
          return [];
        }

        console.log('🔍 Fetching tasks with:', { 
          userId: user.id, 
          view, 
          search, 
          status, 
          priority, 
          sortBy 
        });

        // Build query parameters for backend
        const params: Record<string, string> = {};
        
        // ALWAYS send the view parameter
        params.view = view;
        
        if (search) params.search = search;
        if (status) params.status = status;
        if (priority) params.priority = priority;
        if (sortBy) params.sortBy = sortBy;
        
        // For 'assigned' view, tell backend to filter by assignedTo
        if (view === 'assigned') {
          params.assignedTo = user.id;
        }
        // For 'my' view, backend handles it (creator OR assignee)
        // For 'all' view, backend handles it

        // Make API call with proper parameters
        const response = await taskService.getTasks(params);
        
        // Handle different response formats
        let tasks: Task[] = [];
        
        if (Array.isArray(response)) {
          tasks = response;
        } else if (response?.data && Array.isArray(response.data)) {
          tasks = response.data;
        } else if (response?.success && Array.isArray(response.data)) {
          tasks = response.data;
        } else {
          console.warn('⚠️ Unexpected response format:', response);
          tasks = [];
        }

        console.log('📦 Tasks received:', {
          total: tasks.length,
          createdByMe: tasks.filter(t => t.createdById === user.id).length,
          assignedToMe: tasks.filter(t => t.assignedToId === user.id).length,
          view,
        });

        // Debug: Show each task's ownership
        tasks.forEach(task => {
          console.log(`📝 Task: ${task.title}`, {
            createdById: task.createdById,
            assignedToId: task.assignedToId,
            isCreatedByMe: task.createdById === user.id,
            isAssignedToMe: task.assignedToId === user.id,
          });
        });

        return tasks;
        
      } catch (err: any) {
        console.error('❌ Error fetching tasks:', err);
        
        // Provide more specific error message
        if (err.response?.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (err.response?.status === 404) {
          throw new Error('Tasks endpoint not found. Check backend routes.');
        } else if (err.message) {
          throw new Error(`Failed to fetch tasks: ${err.message}`);
        } else {
          throw new Error('Failed to fetch tasks. Please try again.');
        }
      }
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
    enabled: !!user?.id, // Only run query if user is authenticated
  });
  
  return {
    tasks: data || [],
    loading: isLoading,
    error,
    refetch,
  };
};