import { useQuery } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
// import type { Task } from '../types';

interface UseTasksOptions {
  view?: 'all' | 'my' | 'assigned';
  search?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  assignedTo?: string;
  createdBy?: string;
}

export const useTasks = (options: UseTasksOptions = {}) => {
  const {
    view = 'all',
    search = '',
    status,
    priority,
    sortBy = 'dueDate-asc',
    assignedTo,
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
      if (assignedTo) params.assignedTo = assignedTo;
      if (createdBy) params.createdBy = createdBy;

      switch (view) {
        case 'my':
          params.assignedTo = 'me';
          break;
        case 'assigned':
          params.assigned = 'true';
          break;
      }

      return taskService.getTasks(params);
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