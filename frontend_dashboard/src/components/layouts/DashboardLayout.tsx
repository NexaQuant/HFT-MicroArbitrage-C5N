// d:\HFT微套利\frontend_dashboard\src\components\layouts\DashboardLayout.tsx
import React from 'react';
import Navbar from '@/components/navigation/Navbar'; // 假设已存在或将创建 Navbar 组件
import Sidebar from '@/components/navigation/Sidebar'; // 假设已存在或将创建 Sidebar 组件

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* <Sidebar /> */}
      {/* 暂时注释掉 Sidebar，如果需要可以取消注释并实现 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;