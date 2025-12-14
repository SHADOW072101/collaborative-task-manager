import { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../shared/components/Button';
import { TaskFilters } from '../components/TaskFilters';
import { TaskCard } from '../components/TaskCard';
import { TaskListSkeleton } from '../components/TaskListSkeleton';
import { Modal } from '../../../shared/components/Modal';
import { TaskForm } from '../components/TaskForm';
import { useTasks } from '../hooks/useTasks';
import { useTaskMutations } from '../hooks/useTaskMutations';;
import type { Task } from '../types';
import { Plus } from 'lucide-react';

interface TasksPageProps {
  view?: 'all' | 'my' | 'assigned';
}

export const TasksPage = ({ view = 'my' }: TasksPageProps) => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // State for filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('dueDate-asc');

  // Fetch tasks based on view
  const { tasks, loading, refetch } = useTasks({
    view,
    search,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    sortBy,
  });

  const { createTask, updateTask, deleteTask } = useTaskMutations();

  const handleCreateTask = async (data: any) => {
    await createTask(data);
    setShowCreateModal(false);
    refetch();
  };

  const handleUpdateTask = async (taskId: string, data: any) => {
    await updateTask(taskId, data);
    setEditingTask(null);
    refetch();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
      refetch();
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await updateTask(taskId, { status: newStatus });
    refetch();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setSortBy('dueDate-asc');
  };

  const pageTitle = view === 'all' ? 'All Tasks' : view === 'assigned' ? 'Assigned Tasks' : 'My Tasks';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600 mt-1">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} found
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      {loading ? (
        <TaskListSkeleton />
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-6">
            {search || statusFilter || priorityFilter
              ? 'Try changing your filters'
              : 'Get started by creating your first task'}
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Your First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              currentUserId={user?.id || ''}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          loading={false}
          users={[]} // You'll need to fetch users here
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        size="lg"
      >
        {editingTask && (
          <TaskForm
            onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
            loading={false}
            users={[]} // You'll need to fetch users here
            initialData={{
              title: editingTask.title,
              description: editingTask.description,
              dueDate: editingTask.dueDate.split('T')[0],
              priority: editingTask.priority,
              status: editingTask.status,
              assignedToId: editingTask.assignedToId,
            }}
          />
        )}
      </Modal>
    </div>
  );
};