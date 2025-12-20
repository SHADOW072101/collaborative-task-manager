import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Users,Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'All Tasks', href: '/tasks/all', icon: Users },
  // { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/profile', icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="hidden lg:block w-64 border-r border-gray-200 bg-white">
      <nav className="h-full px-4 py-6">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};