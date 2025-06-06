// src/components/dashboard/ExchangeStatusDisplay.tsx
'use client';

import React from 'react';
import { useWebSocket } from '@/contexts/WebSocketDataContext';

const ExchangeStatusDisplay: React.FC = () => {
  const { isConnected, lastError, connect } = useWebSocket();

  // Display a loading or initial state if not yet connected and no error
  // We can refine this logic further, e.g. by adding an explicit 'connecting' state in the context
  if (!isConnected && !lastError) {
    // Optionally, provide a button to attempt connection if not auto-connecting
    // For now, just show a loading-like message or a prompt to connect
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-cyber-text">交易所连接状态</h2>
        <div className="p-4 rounded-md flex items-center justify-between bg-yellow-600">
          <span className="font-medium text-white">主要交易所</span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800">
            正在连接...
          </span>
        </div>
        {/* <button onClick={connect} className="mt-2 p-2 bg-blue-500 text-white rounded">Connect</button> */}
      </div>
    );
  }

  if (lastError) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-cyber-text">交易所连接状态</h2>
        <div className="p-4 rounded-md flex items-center justify-between bg-red-700">
          <span className="font-medium text-white">主要交易所</span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-300 text-red-900">
            连接错误
          </span>
        </div>
        <p className="text-sm text-red-400 mt-2">错误: {lastError}</p>
        {/* <button onClick={connect} className="mt-2 p-2 bg-blue-500 text-white rounded">Retry Connection</button> */}
      </div>
    );
  }

  // If connected
  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-cyber-text">交易所连接状态</h2>
      <div 
        className={`p-4 rounded-md flex items-center justify-between ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}
      >
        <span className="font-medium text-white">主要交易所</span>
        <span 
          className={`px-3 py-1 text-xs font-semibold rounded-full ${isConnected ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}
        >
          {isConnected ? '已连接' : '未连接'}
        </span>
      </div>
    </div>
  );
};

export default ExchangeStatusDisplay;