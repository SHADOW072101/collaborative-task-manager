import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import type { CreateTaskData, UpdateTaskData } from '../types';

export const useTaskMutations = () => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskData) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskData }) =>
      taskService.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const createTask = async (data: CreateTaskData) => {
    return createTaskMutation.mutateAsync(data);
  };

  const updateTask = async (taskId: string, data: UpdateTaskData) => {
    return updateTaskMutation.mutateAsync({ taskId, data });
  };

  const deleteTask = async (taskId: string) => {
    return deleteTaskMutation.mutateAsync(taskId);
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    isLoading:
      createTaskMutation.isPending ||
      updateTaskMutation.isPending ||
      deleteTaskMutation.isPending,
  };
};