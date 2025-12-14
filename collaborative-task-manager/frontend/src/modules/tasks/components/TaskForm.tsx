import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { TextArea } from '../../../shared/components/TextArea';
import { Select } from '../../../shared/components/Select';
import type { User } from '../../users/types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  status: z.enum(['To Do', 'In Progress', 'Review', 'Completed']),
  assignedToId: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  loading?: boolean;
  users: User[];
  initialData?: Partial<TaskFormData>;
}

export const TaskForm = ({ onSubmit, loading = false, users, initialData }: TaskFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData,
  });

  const userOptions = users.map(user => ({
    value: user.id,
    label: user.name,
  }));

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' },
  ];

  const statusOptions = [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Review', label: 'Review' },
    { value: 'Completed', label: 'Completed' },
  ];

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

        <Select
          label="Assign To"
          options={[{ value: '', label: 'Unassigned' }, ...userOptions]}
          placeholder="Select user"
          error={errors.assignedToId?.message}
          {...register('assignedToId')}
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