import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Circle, AlertCircle, UserPlus, Edit } from 'lucide-react';
import type { Notification } from '../types';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notificationId: string) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'TASK_ASSIGNED':
      return <UserPlus className="h-5 w-5 text-blue-500" />;
    case 'TASK_UPDATED':
      return <Edit className="h-5 w-5 text-yellow-500" />;
    case 'TASK_OVERDUE':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationMessage = (notification: Notification) => {
  switch (notification.type) {
    case 'TASK_ASSIGNED':
      return `Task "${notification.metadata.taskTitle}" has been assigned to you`;
    case 'TASK_UPDATED':
      return `Task "${notification.metadata.taskTitle}" was updated by ${notification.metadata.updatedBy}`;
    case 'TASK_OVERDUE':
      return `Task "${notification.metadata.taskTitle}" is overdue`;
    default:
      return notification.message;
  }
};

export const NotificationList = ({ notifications, onNotificationClick }: NotificationListProps) => {
  return (
    <div className="divide-y divide-gray-100">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
            !notification.read ? 'bg-blue-50' : ''
          }`}
          onClick={() => {
            if (!notification.read) {
              onNotificationClick(notification.id);
            }
          }}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {getNotificationMessage(notification)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                {!notification.read && (
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              {notification.read ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-blue-500" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};