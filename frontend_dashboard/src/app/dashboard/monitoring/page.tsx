'use client';

import { useState, useEffect } from 'react';
// import { Card, Title, Text, Grid, Col, Flex, Metric, BadgeDelta } from '@tremor/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '@/components/DashboardLayout';

// 模拟数据
// 模拟数据
const defaultMockStrategyMetrics = {
  pnl: 12345.67,
  position: 0.5,
  latency: 150,
  riskExposure: 10000.00,
  volume: 50000.00, // 新增交易量指标
  alerts: [
    { id: 1, message: '高频交易延迟异常', level: 'critical', timestamp: '2024-07-30 10:00:00' },
    { id: 2, message: '策略A持仓超出限制', level: 'warning', timestamp: '2024-07-30 09:30:00' },
  ],
};

const defaultMockHistoricalData = [
  { name: '00:00', pnl: 4000, latency: 2400, position: 2400 },
  { name: '02:00', pnl: 3000, latency: 1398, position: 2210 },
  { name: '04:00', pnl: 2000, latency: 9800, position: 2290 },
  { name: '06:00', pnl: 2780, latency: 3908, position: 2000 },
  { name: '08:00', pnl: 1890, latency: 4800, position: 2181 },
  { name: '10:00', pnl: 2390, latency: 3800, position: 2500, volume: 12000 }, // 增加交易量数据
  { name: '12:00', pnl: 3490, latency: 4300, position: 2100, volume: 15000 }, // 增加交易量数据
];

interface MonitoringPageProps {
  initialMetrics?: typeof defaultMockStrategyMetrics;
  initialHistoricalData?: typeof defaultMockHistoricalData;
}

export default function MonitoringPage({ initialMetrics, initialHistoricalData }: MonitoringPageProps) {
  const [metrics, setMetrics] = useState(initialMetrics || defaultMockStrategyMetrics);
  const [historicalData, setHistoricalData] = useState(initialHistoricalData || defaultMockHistoricalData);

  // 模拟数据刷新
  useEffect(() => {
    const interval = setInterval(() => {
      // 实际应用中会从后端API获取数据
      // setMetrics(fetchRealtimeMetrics());
      // setHistoricalData(fetchHistoricalData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <h1>策略监控大屏</h1>
      <p>实时监控高频交易策略的关键指标和告警信息。</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">总盈亏 (PNL)</p>
          <p className="text-2xl font-bold">{metrics.pnl.toFixed(2)} USDT</p>
          <span className="text-green-600 text-sm">+1.2%</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">当前持仓</p>
          <p className="text-2xl font-bold">{metrics.position.toFixed(2)} BTC</p>
          <span className="text-gray-600 text-sm">0.0%</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">平均延迟</p>
          <p className="text-2xl font-bold">{metrics.latency} ms</p>
          <span className="text-red-600 text-sm">-0.5%</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">风险敞口</p>
          <p className="text-2xl font-bold">{metrics.riskExposure.toFixed(2)} USDT</p>
          <span className="text-green-600 text-sm">+0.1%</span>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">总交易量</p>
          <p className="text-2xl font-bold">{metrics.volume.toFixed(2)} USDT</p>
          <span className="text-green-600 text-sm">+5.0%</span>
        </div>
       </div>

       <div className="bg-white p-4 rounded-lg shadow mt-6">
         <h2 className="text-lg font-semibold mb-4">历史盈亏与延迟趋势</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={historicalData}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pnl" stroke="#8884d8" activeDot={{ r: 8 }} name="盈亏" />
            <Line type="monotone" dataKey="latency" stroke="#82ca9d" name="延迟" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">历史交易量趋势</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={historicalData}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="volume" stroke="#ffc658" name="交易量" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">实时告警</h2>
          <a href="/dashboard/alerts" className="text-blue-500 hover:underline text-sm">查看更多</a>
        </div>
        <p className="mt-2 text-gray-600">
          最近的告警信息。
        </p>
        <div className="mt-4 space-y-2">
          {metrics.alerts.length > 0 ? (
            metrics.alerts.map((alert) => (
              <div key={alert.id} className="border p-3 rounded-md flex items-center justify-between">
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.timestamp}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  alert.level === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {alert.level.toUpperCase()}
                </span>
              </div>
            ))
          ) : (
            <p>暂无告警信息。</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}