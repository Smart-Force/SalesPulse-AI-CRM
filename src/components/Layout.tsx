import React from 'react';
import { Header } from './Header';
import { View, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
  currentUser: User;
  onLogout: () => void;
  availableViews: View[];
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, currentUser, onLogout, availableViews }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header 
        activeView={activeView} 
        setActiveView={setActiveView} 
        currentUser={currentUser} 
        onLogout={onLogout}
        availableViews={availableViews}
      />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};