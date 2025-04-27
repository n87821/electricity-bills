
import React from 'react';
import Sidebar from './Sidebar';
import { toast } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1">
        <header className="bg-white shadow-sm py-4 px-6">
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        </header>
        <main className="page-container">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
