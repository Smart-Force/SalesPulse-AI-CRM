import React from 'react';
import { Header } from './Header';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};