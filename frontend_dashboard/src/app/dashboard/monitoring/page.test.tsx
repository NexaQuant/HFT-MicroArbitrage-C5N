import React from 'react';
import { render, screen } from '@testing-library/react';
import MonitoringPage from './page';
import { defaultMockStrategyMetrics, defaultMockHistoricalData } from './page'; // 导入模拟数据
import '@testing-library/jest-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock the DashboardLayout component to simplify testing of MonitoringPage
jest.mock('@/components/DashboardLayout', () => {
  return function MockDashboardLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="dashboard-layout">{children}</div>;
  };
});

// Mock recharts components to avoid issues with their rendering in a test environment
// This is a common practice when testing components that use complex charting libraries
jest.mock('recharts', () => ({
  LineChart: jest.fn(({ children }) => <div data-testid="line-chart">{children}</div>),
  Line: jest.fn(() => null),
  XAxis: jest.fn(() => null),
  YAxis: jest.fn(() => null),
  CartesianGrid: jest.fn(() => null),
  Tooltip: jest.fn(() => null),
  Legend: jest.fn(() => null),
  ResponsiveContainer: jest.fn(({ children }) => <div data-testid="responsive-container">{children}</div>),
}));

describe('MonitoringPage', () => {
  // 测试目标：确保 MonitoringPage 组件能够正确渲染。
  // 输入条件：无特定输入，组件直接渲染。
  // 预期结果：页面标题“策略监控大屏”和描述文本“实时监控高频交易策略的关键指标和告警信息。”能够被正确渲染。
  test('renders the main monitoring page elements', () => {
    render(<MonitoringPage />);

    expect(screen.getByText('策略监控大屏')).toBeInTheDocument();
    expect(screen.getByText('实时监控高频交易策略的关键指标和告警信息。')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
  });

  // 测试目标：验证关键策略指标是否正确显示。
  // 输入条件：组件使用模拟数据渲染。
  // 预期结果：PNL、持仓、延迟、风险敞口和交易量等指标的数值能够正确显示。
  test('displays strategy metrics correctly', () => {
    render(<MonitoringPage initialMetrics={defaultMockStrategyMetrics} initialHistoricalData={defaultMockHistoricalData} />);

    expect(screen.getByText('总盈亏 (PNL)')).toBeInTheDocument();
    expect(screen.getByText('12345.67 USDT')).toBeInTheDocument();

    expect(screen.getByText('当前持仓')).toBeInTheDocument();
    expect(screen.getByText('0.50 BTC')).toBeInTheDocument();

    expect(screen.getByText('平均延迟')).toBeInTheDocument();
    expect(screen.getByText('150 ms')).toBeInTheDocument();

    expect(screen.getByText('风险敞口')).toBeInTheDocument();
    expect(screen.getByText('10000.00 USDT')).toBeInTheDocument();

    expect(screen.getByText('总交易量')).toBeInTheDocument();
    expect(screen.getByText('50000.00 USDT')).toBeInTheDocument();
  });

  // 测试目标：验证历史数据图表是否被渲染。
  // 输入条件：组件使用模拟数据渲染。
  // 预期结果：历史盈亏与延迟趋势图和历史交易量趋势图的标题存在，并且 Recharts 的 LineChart 组件被调用。
  test('renders historical data charts', () => {
    render(<MonitoringPage initialMetrics={defaultMockStrategyMetrics} initialHistoricalData={defaultMockHistoricalData} />);

    expect(screen.getByText('历史盈亏与延迟趋势')).toBeInTheDocument();
    expect(screen.getByText('历史交易量趋势')).toBeInTheDocument();

    // Verify that the mocked LineChart components are rendered
    expect(screen.getAllByTestId('line-chart').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThanOrEqual(2);
  });

  // 测试目标：验证实时告警信息是否正确显示。
  // 输入条件：组件使用模拟告警数据渲染。
  // 预期结果：告警消息、时间戳和告警级别能够正确显示，并且“查看更多”链接存在。
  test('displays real-time alerts correctly', () => {
    render(<MonitoringPage initialMetrics={defaultMockStrategyMetrics} initialHistoricalData={defaultMockHistoricalData} />);

    expect(screen.getByText('实时告警')).toBeInTheDocument();
    expect(screen.getByText('高频交易延迟异常')).toBeInTheDocument();
    expect(screen.getByText('2024-07-30 10:00:00')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();

    expect(screen.getByText('策略A持仓超出限制')).toBeInTheDocument();
    expect(screen.getByText('2024-07-30 09:30:00')).toBeInTheDocument();
    expect(screen.getByText('WARNING')).toBeInTheDocument();

    const viewMoreLink = screen.getByRole('link', { name: /查看更多/i });
    expect(viewMoreLink).toBeInTheDocument();
    expect(viewMoreLink).toHaveAttribute('href', '/dashboard/alerts');
  });

  // 测试目标：验证当没有告警信息时，显示“暂无告警信息”。
  // 输入条件：传入一个空的 alerts 数组作为 initialMetrics。
  // 预期结果：显示“暂无告警信息”。
  test('displays no alerts message when alerts array is empty', () => {
    const emptyAlertsMetrics = { ...defaultMockStrategyMetrics, alerts: [] };
    render(<MonitoringPage initialMetrics={emptyAlertsMetrics} initialHistoricalData={defaultMockHistoricalData} />);

    expect(screen.getByText('暂无告警信息。')).toBeInTheDocument();
    expect(screen.queryByText('高频交易延迟异常')).not.toBeInTheDocument();
  });
});