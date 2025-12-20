import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Task } from '../../tasks/types';

interface TaskOverviewProps {
  tasks: Task[];
}

export const TaskOverview = ({ tasks }: TaskOverviewProps) => {
  // Calculate status distribution
  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'TODO').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length },
    { name: 'Review', value: tasks.filter(t => t.status === 'REVIEW').length },
    { name: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length },
  ];

  // Calculate priority distribution
  const priorityData = [
    { name: 'Low', value: tasks.filter(t => t.priority === 'LOW').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'MEDIUM').length },
    { name: 'High', value: tasks.filter(t => t.priority === 'HIGH').length },
    { name: 'Urgent', value: tasks.filter(t => t.priority === 'URGENT').length },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Overview</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Status Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Priority Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar dataKey="value" fill="#EF4444" name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};