import { useQuery } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { type Task } from '../types';

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

  const { data, isLoading, error, refetch } = useQuery<Task[], Error>({
    queryKey,
    queryFn: async () => {
      try {
        console.log('🔍 Fetching tasks with options:', options);
        
        // Get ALL tasks first
        let tasks = await taskService.getAll();
        
        if (!Array.isArray(tasks)) {
          console.error('❌ tasks is not an array:', tasks);
          return [];
        }
        
        console.log('📦 Raw tasks from API:', tasks.length);
        
        // Apply view-based filtering
        if (view === 'my' && assignedTo) {
          // Show tasks assigned to current user
          tasks = tasks.filter(task => task.assignedToId === assignedTo);
        } else if (view === 'assigned' && createdBy) {
          // Show tasks created by current user
          tasks = tasks.filter(task => task.createdById === createdBy);
        }
        // 'all' view shows all tasks
        
        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          tasks = tasks.filter(task => 
            task.title.toLowerCase().includes(searchLower) ||
            task.description?.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply status filter
        if (status) {
          tasks = tasks.filter(task => task.status === status);
        }
        
        // Apply priority filter
        if (priority) {
          tasks = tasks.filter(task => task.priority === priority);
        }
        
        // Apply sorting
        if (sortBy) {
          const [field, direction] = sortBy.split('-');
          
          tasks.sort((a, b) => {
          let aValue = a[field as keyof Task];
          let bValue = b[field as keyof Task];
          
          // Handle null/undefined values - treat them as empty strings
          if (aValue == null) aValue = '';
          if (bValue == null) bValue = '';
          
          // Handle dates
          if (field === 'dueDate' || field === 'createdAt' || field === 'updatedAt') {
            try {
              const aDate = new Date(aValue as string).getTime();
              const bDate = new Date(bValue as string).getTime();
              
              // Handle invalid dates
              if (isNaN(aDate) && isNaN(bDate)) return 0;
              if (isNaN(aDate)) return direction === 'asc' ? 1 : -1;
              if (isNaN(bDate)) return direction === 'asc' ? -1 : 1;
              
              return direction === 'asc' ? aDate - bDate : bDate - aDate;
            } catch {
              // If date parsing fails, fall back to string comparison
              const aStr = String(aValue);
              const bStr = String(bValue);
              return direction === 'asc' 
                ? aStr.localeCompare(bStr)
                : bStr.localeCompare(aStr);
            }
          }
          
          // Handle strings
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return direction === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
          
          // Handle numbers
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return direction === 'asc' ? aValue - bValue : bValue - aValue;
          }
          
          // Default comparison with null safety
          const aStr = String(aValue);
          const bStr = String(bValue);
          
          return direction === 'asc' 
            ? aStr.localeCompare(bStr)
            : bStr.localeCompare(aStr);
        });
      }
        
        console.log('✅ Filtered tasks:', tasks.length);
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
    tasks: data || [], // Always return an array
    loading: isLoading,
    error,
    refetch,
  };
};