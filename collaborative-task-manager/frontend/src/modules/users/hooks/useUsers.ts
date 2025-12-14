import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

export const useUsers = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    users: data || [],
    loading: isLoading,
    error,
    refetch,
  };
};