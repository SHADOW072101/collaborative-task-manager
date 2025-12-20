import { useEffect } from 'react';
import { useSocket } from '../../../shared/context/SocketContext';
import { type Task } from '../types';

interface UseTaskSocketOptions {
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
  onTaskAssigned?: (task: Task) => void;
}

export const useTaskSocket = (options: UseTaskSocketOptions = {}) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (task: Task) => {
      console.log('Task created via socket:', task);
      options.onTaskCreated?.(task);
    };

    const handleTaskUpdated = (task: Task) => {
      console.log('Task updated via socket:', task);
      options.onTaskUpdated?.(task);
    };

    const handleTaskDeleted = (taskId: string) => {
      console.log('Task deleted via socket:', taskId);
      options.onTaskDeleted?.(taskId);
    };

    const handleTaskAssigned = (task: Task) => {
      console.log('Task assigned via socket:', task);
      options.onTaskAssigned?.(task);
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('task:assigned', handleTaskAssigned);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('task:assigned', handleTaskAssigned);
    };
  }, [socket, options]);

  return null;
};