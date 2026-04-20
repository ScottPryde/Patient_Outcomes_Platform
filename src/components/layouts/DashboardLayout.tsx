import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  FlaskConical, 
  Tags, 
  User, 
  Bell, 
  Menu,
  X,
  Sun,
  Moon,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { PatientSwitcher } from '../caregiver/PatientSwitcher';

export function DashboardLayout() {
  const { user, logout, activePatient } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (!user) return null;

  // Primary navigation – key flows grouped under the main dashboard
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    // "Under" Dashboard: information and consent flows
    { name: 'Information Hub', href: '/education', icon: BookOpen },
    { name: 'Consent & Privacy', href: '/consent', icon: Shield },
    // Other core areas
    { name: 'Observations', href: '/questionnaires', icon: ClipboardList },
    { name: 'Care Group', href: '/care-group', icon: User },
    { name: 'Results', href: '/results', icon: BarChart3 },
    { name: 'Trials & Innovation', href: '/trials', icon: FlaskConical },
    { name: 'Tags & Interests', href: '/tags', icon: Tags },
    { name: 'Profile & Settings', href: '/profile', icon: User },
  ];

  // Add admin link for administrators
  if (user.role === 'administrator') {
    navigation.push({
      name: 'Admin Panel',
      href: '/admin',
      icon: Settings,
    });
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top navigation bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="font-semibold text-lg hidden sm:inline">PRO Platform</span>
            </Link>

            {/* Patient switcher for caregivers */}
            {user.role === 'caregiver' && (
              <div className="hidden md:block ml-4">
                <PatientSwitcher />
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                        {getRoleLabel(user.role)}
                      </span>
                      {activePatient && (
                        <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                          Viewing: {activePatient.firstName} {activePatient.lastName}
                        </p>
                      )}
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile & Settings
                    </Link>
                    <Link
                      to="/consent"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      Consent Management
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)]
            w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notification panel */}
      <NotificationPanel 
        open={notificationPanelOpen} 
        onClose={() => setNotificationPanelOpen(false)} 
      />
    </div>
  );
}