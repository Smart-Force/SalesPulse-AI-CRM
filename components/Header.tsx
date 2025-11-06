import React, { useState, useEffect, useRef } from 'react';
import type { NavItem, View } from '../types';
import {
  Rocket, LayoutDashboard, Mail, Bot, BarChart, Settings, LifeBuoy, Zap, Users, Target, CheckCircle, Clock, XCircle, ChevronDown, Telescope, Workflow, FilePlay, Package
} from 'lucide-react';

const navigationItems: NavItem[] = [
  { name: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  { name: 'Lead Generation', view: 'lead-generation', icon: Telescope },
  { name: 'Prospects', view: 'prospects', icon: Users },
  { name: 'Campaigns', view: 'campaigns', icon: Target },
  { name: 'Products', view: 'products', icon: Package },
  { name: 'Email Inbox', view: 'email-inbox', icon: Mail, badge: 3 },
  { name: 'Playbooks', view: 'playbooks', icon: FilePlay },
  { name: 'Analytics', view: 'analytics', icon: BarChart },
  { name: 'Integrations', view: 'integrations', icon: Zap },
  { name: 'Settings', view: 'settings', icon: Settings },
];


export const Header: React.FC<{ activeView: View; setActiveView: (view: View) => void; }> = ({ activeView, setActiveView }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <header className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-700 fixed w-full top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Rocket className="text-blue-600 h-7 w-7" />
              <span className="text-xl font-bold text-gray-900 dark:text-slate-100 ml-2">SalesPulse AI</span>
            </div>
            <nav className="hidden md:ml-10 md:flex md:space-x-1">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  onClick={() => setActiveView(item.view)}
                  className={`relative inline-flex items-center px-3 py-2 text-sm font-medium cursor-pointer transition-colors rounded-md ${
                    activeView === item.view
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-slate-400">All Systems Go</span>
            </div>
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(prev => !prev)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  JD
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-slate-400 ml-1" />
              </button>
              {showProfileMenu && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black dark:ring-slate-700 ring-opacity-5"
                >
                  <div className="py-1">
                    <a onClick={() => { setActiveView('settings'); setShowProfileMenu(false); }} href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">Profile</a>
                    <a onClick={() => { setActiveView('settings'); setShowProfileMenu(false); }} href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">Settings</a>
                     <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700">Help Center</a>
                    <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>
                    <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">Sign out</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
