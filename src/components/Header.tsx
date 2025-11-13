import React, { useMemo } from 'react';
import { 
    LayoutDashboard, Wand2, Inbox, Users, Target, Telescope, Package, BarChart2, Phone, Zap, Settings, Rocket, Sun, Moon, GitFork, BookOpen, GraduationCap
} from 'lucide-react';
import { View, User } from '../types';
import { useHasPermission } from '../contexts/PermissionContext';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  currentUser: User;
  onLogout: () => void;
  availableViews: View[];
}

const navItems: { view: View; icon: React.ElementType }[] = [
    { view: 'Dashboard', icon: LayoutDashboard },
    { view: 'Email Inbox', icon: Inbox },
    { view: 'Prospects', icon: Users },
    { view: 'Campaigns', icon: Target },
    { view: 'Workflows', icon: GitFork },
    { view: 'Lead Generation', icon: Telescope },
    { view: 'Playbooks', icon: BookOpen },
    { view: 'Training Center', icon: GraduationCap },
    { view: 'AI Generator', icon: Wand2 },
    { view: 'Products', icon: Package },
    { view: 'Analytics', icon: BarChart2 },
    { view: 'Live Call', icon: Phone },
    { view: 'Integrations', icon: Zap },
    { view: 'Settings', icon: Settings },
];

const useTheme = () => {
    const [isDarkMode, setIsDarkMode] = React.useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newIsDark = !prev;
            localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
            document.documentElement.classList.toggle('dark', newIsDark);
            return newIsDark;
        });
    };

    return { isDarkMode, toggleTheme };
};

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, currentUser, onLogout, availableViews }) => {
    const { isDarkMode, toggleTheme } = useTheme();

    const accessibleNavItems = useMemo(() => {
        const allowedViewsSet = new Set(availableViews);
        return navItems.filter(item => allowedViewsSet.has(item.view));
    }, [availableViews]);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center">
        <Rocket className="text-blue-600 h-8 w-8" />
        <span className="text-xl font-bold text-gray-900 dark:text-slate-100 ml-3">SalesPulse AI</span>
      </div>
      <nav className="hidden md:flex items-center space-x-1 overflow-x-auto">
        {accessibleNavItems.map(({ view, icon: Icon }) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center flex-shrink-0 ${
              activeView === view
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50'
            }`}
            title={view}
          >
            <Icon className="h-5 w-5" />
            <span className="ml-2 hidden lg:inline">{view}</span>
          </button>
        ))}
      </nav>
      <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        <div className="relative">
          <button className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: currentUser.avatarColor }}>
              {currentUser.initials}
            </div>
            <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{currentUser.name}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">{currentUser.role}</span>
            </div>
          </button>
        </div>
         <button onClick={onLogout} className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
            Logout
        </button>
      </div>
    </header>
  );
};