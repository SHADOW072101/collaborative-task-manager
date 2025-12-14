import { Menu, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../shared/components/Button';
import { NotificationBell } from '../modules/notifications/components/NotificationBell';
import { useAuth } from '../modules/auth/hooks/useAuth';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};