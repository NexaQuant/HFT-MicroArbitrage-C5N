// src/components/dashboard/SystemLogsSummaryDisplay.tsx
'use client';

import React from 'react';
import { useWebSocket } from '@/contexts/WebSocketDataContext';

// 定义一个日志条目类型，即使我们现在主要显示 lastError
interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
}

const SystemLogsSummaryDisplay: React.FC = () => {
  const { lastError } = useWebSocket();

  // 未来可以扩展从 context 获取更详细的日志数组
  // const logs: LogEntry[] = context?.systemLogs || []; 

  const getLogLevelClass = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-cyber-text">系统日志摘要</h2>
      <div className="space-y-2">
        {lastError && (
          <div className={`p-2 rounded-md bg-gray-700 ${getLogLevelClass('error')}`}>
            <span className="font-mono text-xs mr-2">[{new Date().toLocaleTimeString()}]</span>
            <span className="font-semibold capitalize mr-1">Error:</span>
            <span>{lastError}</span>
          </div>
        )}
        {!lastError && (
            <div className="p-2 rounded-md bg-gray-700 text-gray-400">
                暂无新的系统错误或警告。
            </div>
        )}
        {/* Placeholder for other types of logs if they become available */}
        {/* Example of how other logs might be displayed:
        {logs.slice(-5).map(log => (
          <div key={log.id} className={`p-2 rounded-md bg-gray-700 ${getLogLevelClass(log.level)}`}>
            <span className="font-mono text-xs mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className="font-semibold capitalize mr-1">{log.level}:</span>
            <span>{log.message}</span>
          </div>
        ))}
        {logs.length === 0 && !lastError && (
           <div className="p-2 rounded-md bg-gray-700 text-gray-400">
               暂无系统日志。
           </div>
        )} 
        */}
      </div>
    </div>
  );
};

export default SystemLogsSummaryDisplay;