import React, { useMemo } from 'react';
import { 
    LayoutDashboard, Wand2, Inbox, Users, Target, Telescope, Package, BarChart2, Phone, Zap, Settings, Rocket, GitFork, BookOpen
} from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  availableViews: View[];
}

const mainNav: { view: View; icon: React.ElementType }[] = [
    { view: 'Dashboard', icon: LayoutDashboard },
    { view: 'Email Inbox', icon: Inbox },
    { view: 'Prospects', icon: Users },
    { view: 'Campaigns', icon: Target },
    { view: 'Workflows', icon: GitFork },
];

const toolsNav: { view: View; icon: React.ElementType }[] = [
    { view: 'Lead Generation', icon: Telescope },
    { view: 'Playbooks', icon: BookOpen },
    { view: 'AI Generator', icon: Wand2 },
    { view: 'Products', icon: Package },
    { view: 'Analytics', icon: BarChart2 },
    { view: 'Live Call', icon: Phone },
];

const generalNav: { view: View; icon: React.ElementType }[] = [
    { view: 'Integrations', icon: Zap },
    { view: 'Settings', icon: Settings },
];

const NavButton = ({ view, icon: Icon, activeView, setActiveView }: { view: View, icon: React.ElementType, activeView: View, setActiveView: (v: View) => void }) => (
    <button
        onClick={() => setActiveView(view)}
        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeView === view
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50'
        }`}
    >
        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
        <span>{view}</span>
    </button>
);

const NavSection: React.FC<{
    title: string;
    items: { view: View; icon: React.ElementType }[];
    activeView: View;
    setActiveView: (v: View) => void;
    availableViews: View[];
}> = ({ title, items, activeView, setActiveView, availableViews }) => {
    
    const accessibleItems = useMemo(() => {
        const allowedViewsSet = new Set(availableViews);
        // Always show Settings if it's in the list, as its internal tabs are permission-controlled
        return items.filter(item => allowedViewsSet.has(item.view) || item.view === 'Settings');
    }, [availableViews, items]);

    if (accessibleItems.length === 0) return null;

    return (
        <div>
            <h3 className="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-slate-400">{title}</h3>
            <div className="space-y-1">
                {accessibleItems.map(item => (
                    <NavButton key={item.view} view={item.view} icon={item.icon} activeView={activeView} setActiveView={setActiveView} />
                ))}
            </div>
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, availableViews }) => {
  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <Rocket className="w-8 h-8 text-blue-600" />
        <span className="ml-3 text-xl font-bold text-gray-900 dark:text-slate-100">SalesPulse AI</span>
      </div>
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <NavSection title="Main" items={mainNav} {...{ activeView, setActiveView, availableViews }} />
        <NavSection title="Tools" items={toolsNav} {...{ activeView, setActiveView, availableViews }} />
        <NavSection title="General" items={generalNav} {...{ activeView, setActiveView, availableViews }} />
      </nav>
    </aside>
  );
};