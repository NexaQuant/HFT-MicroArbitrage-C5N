// src/app/page.tsx
'use client';

import ExchangeStatusDisplay from '@/components/dashboard/ExchangeStatusDisplay';
import DataFlowRateDisplay from '@/components/dashboard/DataFlowRateDisplay';
import SystemLogsSummaryDisplay from '@/components/dashboard/SystemLogsSummaryDisplay';
import ServiceHealthDisplay from '@/components/dashboard/ServiceHealthDisplay';
import OrderBookDisplay from '@/components/OrderBookDisplay'; // 保留，如果仍需显示
import TradingViewWidget from '@/components/TradingViewWidget'; // 保留，如果仍需显示
import StrategyControlPanel from '@/components/StrategyControlPanel'; // 保留，如果仍需显示
import KpiDashboard from '@/components/KpiDashboard'; // 保留，如果仍需显示
import { Toaster } from '@/components/ui/toaster';
import TickerDisplay from '@/components/dashboard/TickerDisplay';
import StrategyStatusDisplay from '@/components/dashboard/StrategyStatusDisplay';

export default function Home() {
  return (
    <main className="container mx-auto p-4 space-y-8 text-white">
      <header className="text-center py-8">
        <h1 className="text-5xl font-bold text-cyber-primary tracking-wide">HFT 监控仪表盘</h1>
        <p className="text-lg text-cyber-text mt-2">实时监控系统关键指标</p>
      </header>

      {/* 核心指标展示区域 - 使用 Grid 布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExchangeStatusDisplay />
        <DataFlowRateDisplay />
        <SystemLogsSummaryDisplay />
        <ServiceHealthDisplay />
      </div>

      {/* 保留原有的其他组件，如果需要的话可以放在这里或新的 section */}
      {/* 例如，可以将 KpiDashboard, OrderBookDisplay 等放在下方 */}
      <section className="mt-8">
        <h2 className="text-3xl font-semibold text-cyber-secondary mb-6 text-center">详细数据与控制</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg">
            <OrderBookDisplay symbol="BTCUSDT" />
            <TickerDisplay symbol="BTCUSDT" />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <StrategyStatusDisplay />
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <TradingViewWidget />
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <StrategyControlPanel />
            </div>
          </div>
        </div>
      </section>
      
      <section className="mt-8 p-6 bg-gray-800 rounded-lg shadow-lg">
        <KpiDashboard />
      </section>

      <Toaster />
    </main>
  );
}