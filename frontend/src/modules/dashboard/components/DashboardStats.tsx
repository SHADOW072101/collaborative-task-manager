import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

interface DashboardStatsProps {
  assignedTasks: number;
  createdTasks: number;
  overdueTasks: number;
  completedTasks: number;
}

export const DashboardStats = ({
  assignedTasks,
  createdTasks,
  overdueTasks,
  completedTasks,
}: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Assigned to Me"
        value={assignedTasks}
        icon={<Users className="h-6 w-6 text-blue-600" />}
        color="bg-blue-100"
        subtitle="Tasks assigned to you"
      />

      <StatCard
        title="Created by Me"
        value={createdTasks}
        icon={<CheckCircle className="h-6 w-6 text-green-600" />}
        color="bg-green-100"
        subtitle="Tasks you created"
      />

      <StatCard
        title="Overdue"
        value={overdueTasks}
        icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
        color="bg-red-100"
        subtitle="Past due date"
      />

      <StatCard
        title="Completed"
        value={completedTasks}
        icon={<Clock className="h-6 w-6 text-purple-600" />}
        color="bg-purple-100"
        subtitle="Successfully completed"
      />
    </div>
  );
};