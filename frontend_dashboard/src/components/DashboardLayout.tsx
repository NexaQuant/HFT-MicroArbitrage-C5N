// src/components/DashboardLayout.tsx
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-cyber-bg text-cyber-text">
      <header className="bg-cyber-secondary/20 p-4 shadow-md">
        <h1 className="text-2xl font-bold text-cyber-primary">HFT 微套利仪表盘</h1>
      </header>

      <main className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主内容区域将通过 children 传入 */}
        {children}
      </main>

      <footer className="bg-cyber-secondary/10 p-4 text-center text-sm">
        © {new Date().getFullYear()} HFT 微套利平台. All rights reserved.
      </footer>
    </div>
  );
};

export default DashboardLayout;