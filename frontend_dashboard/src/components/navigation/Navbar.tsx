// d:\HFT微套利\frontend_dashboard\src\components\navigation\Navbar.tsx
import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" legacyBehavior>
            <a className="text-2xl font-bold text-gray-800 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
              HFT微套利平台
            </a>
          </Link>
        </div>
        
        <div className="flex items-center">
          <Link href="/dashboard/monitoring" legacyBehavior>
            <a className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              策略监控
            </a>
          </Link>
          {/* 可以添加用户头像、通知图标等 */}
          <span className="text-gray-600 dark:text-gray-300 mr-4">用户: TestUser</span>
          {/* 主题切换按钮 - 示例 */}
          {/* <button 
            onClick={() => {
              // 实际项目中会使用状态管理来切换主题
              document.documentElement.classList.toggle('dark');
            }}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          >
            切换主题
          </button> */}
        </div>
      </div>
    </header>
  );
};

export default Navbar;