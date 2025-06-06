// src/components/dashboard/DataFlowRateDisplay.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketDataContext';

const DataFlowRateDisplay: React.FC = () => {
  const { aggTrade, kpiData } = useWebSocket(); // kpiData might contain order-related rates
  const [orderProcessingRate, setOrderProcessingRate] = useState<number>(0);

  // Placeholder for order processing rate - to be derived from kpiData or other sources
  useEffect(() => {
    if (kpiData && kpiData.totalTrades) {
      // This is a very rough approximation.
      // A true order processing rate would need more specific data from the backend,
      // like orders submitted/filled per second.
      // For now, we can use totalTrades as a proxy if it updates frequently enough,
      // or set a placeholder if no suitable data is available.
      // setOrderProcessingRate(kpiData.totalTrades / some_time_interval_in_seconds);
      setOrderProcessingRate(0); // Default to 0 or a placeholder value
    }
  }, [kpiData]);

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-cyber-text">关键数据流速率</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
          <span className="text-gray-300">行情数据更新:</span>
          {aggTrade ? (
            <span className="font-semibold text-green-400">有更新</span>
          ) : (
            <span className="font-semibold text-gray-500">无更新</span>
          )}
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
          <span className="text-gray-300">订单处理速率 (占位):</span>
          <span className="font-semibold text-cyber-accent">{orderProcessingRate.toFixed(2)} 条/秒</span>
        </div>
        {aggTrade && (
          <div className="mt-2 p-2 bg-gray-750 rounded text-xs text-gray-400">
            <p>最新行情: {aggTrade.s.toUpperCase()}</p>
            <p>价格: {aggTrade.p}</p>
            <p>数量: {aggTrade.q}</p>
            <p>时间: {new Date(aggTrade.T).toLocaleTimeString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFlowRateDisplay;