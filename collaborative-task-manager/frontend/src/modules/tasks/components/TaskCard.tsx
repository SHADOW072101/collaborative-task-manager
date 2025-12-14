import { format } from 'date-fns';
import { Calendar, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import type { Task } from '../types';

const priorityColors = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-red-100 text-red-800',
};

const statusColors = {
  'To Do': 'bg-gray-100 text-gray-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Review: 'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  currentUserId: string;
}

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  currentUserId,
}: TaskCardProps) => {
  const isAssignedToMe = task.assignedToId === currentUserId;
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow ${
      isAssignedToMe ? 'border-blue-200' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg truncate">{task.title}</h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{task.description}</p>
        </div>
        
        <div className="flex gap-2 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="text-gray-500 hover:text-gray-700"
          >
            Edit
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
          {task.status}
        </span>
        {isOverdue && (
          <span className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </span>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span className={isAssignedToMe ? 'font-semibold text-blue-600' : ''}>
              {task.assignedTo?.name || 'Unassigned'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {task.status !== 'Completed' && isAssignedToMe && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(task.id, 'Completed')}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
          
          {task.creatorId === currentUserId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};