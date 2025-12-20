import { useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { DashboardStats } from '../components/DashboardStats';
import { TaskOverview } from '../components/TaskOverview';
import { TaskListSkeleton } from '../../tasks/components/TaskListSkeleton';
import { useTasks } from '../../tasks/hooks/useTasks';
import { useAuth } from '../../auth/hooks/useAuth';
// import { useUsers } from '../../users/hooks/useUsers';
import { useTaskMutations } from '../../tasks/hooks/useTaskMutations';
import { Plus, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { TaskForm } from '../../tasks/components/TaskForm';
import { Link } from 'react-router-dom';

// Define interfaces at the top
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  priority: string;
  creatorId: string;
  assignedToId?: string; 
  createdAt: string;
  updatedAt: string;
}

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   avatar?: string;
//   jobTitle?: string;
//   department?: string;
// }

export const DashboardPage = () => {
  const { user } = useAuth();
  // const { users } = useUsers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Fetch all tasks for the current user
  const { tasks, loading, refetch } = useTasks({
    view: 'my',
  });

  const { createTask, isLoading: isCreating } = useTaskMutations();

  const handleCreateTask = async (data: any) => {
    await createTask(data);
    setShowCreateModal(false);
    refetch();
  };

  // Ensure users is always an array
  // const safeUsers = Array.isArray(users) ? users : [];
  
  // Dynamic calculations with proper typing
  const assignedTasks = tasks.filter((task: Task) => task.assignedToId === user?.id);
  const createdTasks = tasks.filter((task: Task) => task.creatorId === user?.id);
  
  const overdueTasks = tasks.filter((task: Task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'Completed';
  });

  const completedTasks = tasks.filter((task: Task) => task.status === 'Completed');
  
  // Tasks completed today
  const tasksCompletedToday = tasks.filter((task: Task) => {
    if (task.status !== 'Completed') return false;
    const completedDate = new Date(task.updatedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  }).length;

  // Tasks created this week
  const tasksCreatedThisWeek = tasks.filter((task: Task) => {
    const createdDate = new Date(task.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate >= weekAgo;
  }).length;

  // Tasks due tomorrow
  const tasksDueTomorrow = tasks.filter((task: Task) => {
    if (task.status === 'Completed') return false;
    const dueDate = new Date(task.dueDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return dueDate >= tomorrow && dueDate < nextDay;
  }).length;

  // Recent activity (last 5 updated tasks)
  const recentActivity = tasks
    .sort((a: Task, b: Task) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

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
              <Link to="/tasks?filter=assigned">
                <Button variant="outline" fullWidth className="justify-start">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                  View Assigned Tasks ({assignedTasks.length})
                </Button>
              </Link>
              <Link to="/tasks?filter=overdue">
                <Button variant="outline" fullWidth className="justify-start">
                  <Clock className="h-4 w-4 mr-2 text-red-600" />
                  View Overdue Tasks ({overdueTasks.length})
                </Button>
              </Link>
              <Link to="/tasks?filter=completed">
                <Button variant="outline" fullWidth className="justify-start">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  View Completed Tasks ({completedTasks.length})
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tasks Completed Today</span>
                <span className="font-semibold">{tasksCompletedToday}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tasks Created This Week</span>
                <span className="font-semibold">{tasksCreatedThisWeek}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tasks Due Tomorrow</span>
                <span className="font-semibold">{tasksDueTomorrow}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((task: Task) => (
                  <div key={task.id} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          Updated {new Date(task.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          loading={isCreating}
        />
      </Modal>
    </div>
  );
};