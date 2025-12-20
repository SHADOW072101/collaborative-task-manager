import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { TextArea } from '../../../shared/components/TextArea';
import { Select } from '../../../shared/components/Select';
import { AsyncSelect } from '../../../shared/components/AsyncSelect';
import { userService } from '../../users/services/userService';
import { useEffect } from 'react'; // Add this import

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
  jobTitle?: string;
  department?: string;
  company?: string;
  website?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
  assignedToId: z.string().optional().nullable(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<TaskFormData>;
}

export const TaskForm = ({ onSubmit, loading = false, initialData }: TaskFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      dueDate: new Date().toISOString().slice(0, 16), // Format for datetime-local
      priority: 'MEDIUM',
      status: 'TODO',
      assignedToId: null,
      ...initialData,
    },
  });

  // Debug: Watch the assignedToId value
  const assignedToId = watch('assignedToId');
  
  useEffect(() => {
    console.log('📊 assignedToId value:', assignedToId);
  }, [assignedToId]);

  // Function to search users in real-time
  const searchUsers = async (searchTerm: string) => {
    try {
      const response = await userService.searchUsers(searchTerm, 10);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        return response.data.map(user => ({
          value: user.id,
          label: user.name || user.email,
          email: user.email,
          avatar: user.avatar,
        }));
      } else {
        console.warn('Search response invalid:', response);
        return [];
      }
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  const loadInitialUser = async (userId: string) => {
    if (!userId) return [];
    
    try {
      const response = await userService.getUser(userId);
      
      if (response.success && response.data) {
        return [{
          value: response.data.id,
          label: response.data.name || response.data.email,
          email: response.data.email,
          avatar: response.data.avatar,
        }];
      }
      return [];
    } catch (error) {
      console.error('Error loading user:', error);
      return [];
    }
  };

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  const statusOptions = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'REVIEW', label: 'Review' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  // Handle form submission
  const handleFormSubmit = async (data: TaskFormData) => {
    console.log('🚀 Form submitted with data:', data);
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
          value={watch('priority')}
          onChange={(value: string) => {
            setValue('priority', value as TaskFormData['priority'], { 
              shouldValidate: true 
            });
          }}
        />

        <Select
          label="Status"
          options={statusOptions}
          placeholder="Select status"
          error={errors.status?.message}
          value={watch('status')} // ✅ Fixed: was watching 'priority' instead of 'status'
          onChange={(value: string) => {
            setValue('status', value as TaskFormData['status'], { 
              shouldValidate: true 
            });
          }}
        />

        <div>
          <AsyncSelect
            label="Assign To"
            placeholder="Search users by name or email..."
            value={assignedToId || ''}
            onChange={(value) => {
              console.log('🎯 AsyncSelect onChange called with:', value);
              setValue('assignedToId', value || null, { 
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true 
              });
              trigger('assignedToId'); // Trigger validation
            }}
            onSearch={searchUsers}
            onLoadInitialValue={loadInitialUser} // ✅ Added this prop
            defaultOptions={[]}
            isLoading={loading}
            error={errors.assignedToId?.message}
          />
          {assignedToId && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
              <p>Selected User ID: <code>{assignedToId}</code></p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="submit" 
          loading={isSubmitting || loading}
          disabled={isSubmitting || loading}
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};