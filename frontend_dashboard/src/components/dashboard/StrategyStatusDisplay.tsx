'use client';

import React from 'react';
import { useWebSocket } from '../../contexts/WebSocketDataContext';

const StrategyStatusDisplay: React.FC = () => {
  const { strategyStatus } = useWebSocket();

  if (!strategyStatus) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white text-center">
        <h2 className="text-lg font-semibold mb-2">Strategy Status</h2>
        <p className="text-gray-500">No strategy status data available.</p>
      </div>
    );
  }

  const statusColor = strategyStatus.isActive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
      <h2 className="text-lg font-semibold mb-2">Strategy Status: {strategyStatus.strategyName}</h2>
      <div className="space-y-1 text-sm">
        <p>Trading Pair: <span className="font-medium">{strategyStatus.tradingPair}</span></p>
        <p>Status: <span className={`font-medium ${statusColor}`}>{strategyStatus.isActive ? 'Active' : 'Inactive'}</span></p>
        <p>Uptime: <span className="font-medium">{strategyStatus.uptime}</span></p>
        <div>
          <p>Parameters:</p>
          <ul className="list-disc list-inside ml-4 text-gray-400">
            {Object.entries(strategyStatus.parameters).map(([key, value]) => (
              <li key={key}>{key}: {JSON.stringify(value)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StrategyStatusDisplay;