import { useQuery } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { type Task } from '../types';

interface UseTasksOptions {
  view?: 'all' | 'my' | 'assigned';
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  assignedTo?: string; // Add this
  createdBy?: string;
}

export const useTasks = (options: UseTasksOptions = {}) => {
  const {
    view = 'all',
    search = '',
    status,
    priority,
    sortBy = 'dueDate-asc',
    assignedTo, // FIXED: This variable should be defined
    createdBy,
  } = options;

  const queryKey = ['tasks', { view, search, status, priority, sortBy, assignedTo, createdBy }];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: Record<string, string> = {};

      if (search) params.search = search;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (sortBy) params.sortBy = sortBy;
      if (assignedTo) params.assignedTo = assignedTo; // FIXED: Use the variable
      if (createdBy) params.createdBy = createdBy;

      if (view === 'my') {
        params.assignedTo = 'me';
      }

      try {
        const tasks = await taskService.getTasks(params);
        console.log('✅ Tasks fetched:', tasks.length);
        return tasks;
      } catch (err) {
        console.error('❌ Error fetching tasks:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
  });

  return {
    tasks: data || [],
    loading: isLoading,
    error,
    refetch,
  };
};