import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { useSocket } from '../../../shared/context/SocketContext';
import { useEffect } from 'react';
import type { Notification } from '../types';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
    staleTime: 1000 * 30, // 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Listen for new notifications via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      console.log('New notification via socket:', notification);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, queryClient]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId: string) => {
    await markAsReadMutation.mutateAsync(notificationId);
  };

  const markAllAsRead = async () => {
    await markAllAsReadMutation.mutateAsync();
  };

  return {
    notifications,
    unreadCount,
    loading: isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
  };
};