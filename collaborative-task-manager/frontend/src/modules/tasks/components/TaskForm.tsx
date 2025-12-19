import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { TextArea } from '../../../shared/components/TextArea';
import { Select } from '../../../shared/components/Select';
import { AsyncSelect } from '../../../shared/components/AsyncSelect';
import type { User } from '../../users/types';
import { apiClient } from '../../../shared/services/apiClient';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  status: z.enum(['ToDo', 'InProgress', 'Review', 'Completed']),
  assignedToId: z.string().optional().nullable(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<TaskFormData>;
  // Remove users prop since we'll fetch them async
}

export const TaskForm = ({ onSubmit, loading = false, initialData }: TaskFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      dueDate: new Date().toISOString().slice(0, 16), // Format for datetime-local
      priority: 'Medium',
      status: 'ToDo',
      ...initialData,
    },
  });

  // Function to search users in real-time
  const searchUsers = async (searchTerm: string) => {
    try {
      const response = await apiClient.get('/users/search', {
        params: { query: searchTerm, limit: 10 }
      });
      
      // Transform API response to AsyncSelect options format
      return (response.data || []).map((user: User) => ({
        value: user.id,
        label: user.name,
        ...user,
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };


  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' },
  ];

  const statusOptions = [
    { value: 'ToDo', label: 'ToDo' },
    { value: 'InProgress', label: 'InProgress' },
    { value: 'Review', label: 'Review' },
    { value: 'Completed', label: 'Completed' },
  ];

  const assignedToId = watch('assignedToId');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="Enter task title"
        error={errors.title?.message}
        {...register('title')}
      />

      <TextArea
        label="Description"
        placeholder="Enter task description (optional)"
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Due Date"
          type="datetime-local"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />

        <Select
          label="Priority"
          options={priorityOptions}
          placeholder="Select priority"
          error={errors.priority?.message}
          {...register('priority')}
        />

        <Select
          label="Status"
          options={statusOptions}
          placeholder="Select status"
          error={errors.status?.message}
          {...register('status')}
        />

        <AsyncSelect
          label="Assign To"
          placeholder="Search users by name or email..."
          value={assignedToId || ''}
          onChange={(value) => setValue('assignedToId', value || null)}
          onSearch={searchUsers}
          defaultOptions={[]}
          isLoading={loading}
          error={errors.assignedToId?.message}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};