import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '../../../shared/components/Button';
import { TaskFilters } from '../components/TaskFilters';
import { TaskCard } from '../components/TaskCard';
import { TaskListSkeleton } from '../components/TaskListSkeleton';
import { Modal } from '../../../shared/components/Modal';
import { TaskForm } from '../components/TaskForm';
import { useTasks } from '../hooks/useTasks';
import { useTaskMutations } from '../hooks/useTaskMutations';
import type { Task } from '../types';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

interface TasksPageProps {
  view?: 'all' | 'my' | 'assigned';
}

export const TasksPage = ({ view = 'my' }: TasksPageProps) => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('dueDate-asc');

  // Fetch tasks based on view
  const { tasks, loading: tasksLoading, refetch } = useTasks({
    view,
    search,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    sortBy,
  });

  const { createTask, updateTask, deleteTask, isLoading: mutationsLoading } = useTaskMutations();

  const handleCreateTask = async (data: any) => {
    try {
      setError(null);
      await createTask(data);
      setShowCreateModal(false);
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, data: any) => {
    try {
      setError(null);
      await updateTask(taskId, data);
      setEditingTask(null);
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setError(null);
        await deleteTask(taskId);
        refetch();
      } catch (err: any) {
        setError(err.message || 'Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      setError(null);
      await updateTask(taskId, { status: newStatus });
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setSortBy('dueDate-asc');
  };

  const pageTitle = view === 'all' ? 'All Tasks' : view === 'assigned' ? 'Assigned Tasks' : 'My Tasks';

  // Format date for form (safely handle different date formats)
  const formatDateForForm = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "yyyy-MM-dd'T'HH:mm"); // Fixed format for datetime-local
    } catch {
      return '';
    }
  };

  // Debug task filtering
  useEffect(() => {
    if (tasks) {
      console.log('🔍 Task filtering analysis:', {
        allTasks: tasks.length,
        view,
        user: user?.id,
        filteredByView: view === 'my' 
          ? tasks.filter(t => t.createdById === user?.id).length 
          : tasks.length,
        hasSearch: !!search,
        searchMatches: search 
          ? tasks.filter(t => 
              t.title.toLowerCase().includes(search.toLowerCase()) ||
              t.description?.toLowerCase().includes(search.toLowerCase())
            ).length
          : tasks.length,
      });
    }
  }, [tasks, view, user, search]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600 mt-1">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} found
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          disabled={mutationsLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-500">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

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

      {tasksLoading ? (
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
          <Button 
            onClick={() => setShowCreateModal(true)}
            disabled={mutationsLoading}
          >
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
        onClose={() => !mutationsLoading && setShowCreateModal(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          loading={mutationsLoading}
          // No users prop needed - TaskForm fetches users internally
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => !mutationsLoading && setEditingTask(null)}
        title="Edit Task"
        size="lg"
      >
        {editingTask && (
          <TaskForm
            onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
            loading={mutationsLoading}
            // No users prop needed - TaskForm fetches users internally
            initialData={{
              title: editingTask.title,
              description: editingTask.description || '',
              dueDate: formatDateForForm(editingTask.dueDate),
              priority: editingTask.priority,
              status: editingTask.status,
              assignedToId: editingTask.assignedToId || '',
            }}
          />
        )}
      </Modal>
    </div>
  );
};