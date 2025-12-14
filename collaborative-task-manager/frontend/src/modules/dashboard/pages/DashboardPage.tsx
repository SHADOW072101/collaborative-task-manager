import { useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { DashboardStats } from '../components/DashboardStats';
import { TaskOverview } from '../components/TaskOverview';
import { TaskListSkeleton } from '../../tasks/components/TaskListSkeleton';
import { useTasks } from '../../tasks/hooks/useTasks';
import { useAuth } from '../../auth/hooks/useAuth';
import { Plus } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { tasks, loading } = useTasks({
    assignedTo: user?.id,
    createdBy: user?.id,
  });

  const assignedTasks = tasks.filter(task => task.assignedToId === user?.id);
  const createdTasks = tasks.filter(task => task.creatorId === user?.id);
  const overdueTasks = tasks.filter(task => 
    new Date(task.dueDate) < new Date() && task.status !== 'Completed'
  );
  const completedTasks = tasks.filter(task => task.status === 'Completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <DashboardStats
        assignedTasks={assignedTasks.length}
        createdTasks={createdTasks.length}
        overdueTasks={overdueTasks.length}
        completedTasks={completedTasks.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <TaskListSkeleton />
          ) : (
            <TaskOverview tasks={tasks} />
          )}
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" fullWidth>
                View Assigned Tasks
              </Button>
              <Button variant="outline" fullWidth>
                View Overdue Tasks
              </Button>
              <Button variant="outline" fullWidth>
                View Completed Tasks
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tasks Completed Today</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tasks Created This Week</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tasks Due Tomorrow</span>
                <span className="font-semibold">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};