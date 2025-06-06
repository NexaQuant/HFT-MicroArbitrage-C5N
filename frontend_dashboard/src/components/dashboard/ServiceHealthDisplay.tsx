// src/components/dashboard/ServiceHealthDisplay.tsx
'use client';

import React from 'react';
import { useWebSocket } from '@/contexts/WebSocketDataContext';

interface ServiceStatus {
  name: string;
  status: 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED' | 'UNKNOWN';
  details?: string; // 可选的详细信息
}

const ServiceHealthDisplay: React.FC = () => {
  const { strategyStatus, isConnected } = useWebSocket();

  const servicesHealth: ServiceStatus[] = [
    {
      name: 'WebSocket连接',
      status: isConnected ? 'HEALTHY' : 'UNHEALTHY',
      details: isConnected ? '已连接到行情和数据服务器' : '未连接或连接中断',
    },
    {
      name: '交易策略引擎',
      status: strategyStatus && strategyStatus.isActive ? 'HEALTHY' : (strategyStatus ? 'DEGRADED' : 'UNKNOWN'),
      details: strategyStatus ? `策略 ${strategyStatus.strategyName} (${strategyStatus.tradingPair}): ${strategyStatus.isActive ? '运行中' : '已停止'}` : '状态未知',
    },
    {
      name: '订单执行服务',
      status: 'UNKNOWN', // Placeholder - needs actual data
      details: '订单服务状态未知，等待后端数据...',
    },
    {
      name: '数据记录服务',
      status: 'UNKNOWN', // Placeholder - needs actual data
      details: '数据记录服务状态未知，等待后端数据...',
    },
  ];

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-500';
      case 'UNHEALTHY':
        return 'bg-red-500';
      case 'DEGRADED':
        return 'bg-yellow-500';
      case 'UNKNOWN':
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: ServiceStatus['status']) => {
    const map = {
      'HEALTHY': '健康',
      'UNHEALTHY': '异常',
      'DEGRADED': '性能下降',
      'UNKNOWN': '未知'
    };
    return map[status] || '未知';
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-cyber-text">核心服务健康状态</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicesHealth.map((service) => (
          <div key={service.name} className="p-4 bg-gray-700 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-200">{service.name}</h3>
              <span 
                className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(service.status)}`}
              >
                {getStatusText(service.status)}
              </span>
            </div>
            {service.details && (
              <p className="text-sm text-gray-400">{service.details}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceHealthDisplay;