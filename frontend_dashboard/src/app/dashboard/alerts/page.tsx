'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, Flex, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from '@tremor/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// 模拟告警数据
const mockAlerts = [
  { id: 1, message: '高频交易延迟异常', level: 'critical', timestamp: '2024-07-30 10:00:00', details: '系统检测到交易延迟持续高于阈值，请立即检查网络连接和服务器负载。' },
  { id: 2, message: '策略A持仓超出限制', level: 'warning', timestamp: '2024-07-30 09:30:00', details: '策略A的当前持仓量已达到设定的最大限制，请评估是否需要调整策略参数或手动干预。' },
  { id: 3, message: '数据库连接中断', level: 'critical', timestamp: '2024-07-30 08:45:00', details: '与数据库的连接意外中断，可能导致数据写入失败和策略运行异常。' },
  { id: 4, message: '市场数据流异常', level: 'warning', timestamp: '2024-07-30 08:00:00', details: '接收到的市场数据流存在异常，可能影响策略对市场行情的判断。' },
  { id: 5, message: 'CPU使用率过高', level: 'info', timestamp: '2024-07-30 07:30:00', details: '服务器CPU使用率持续处于较高水平，建议检查是否有不必要的进程运行。' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);

  // 实际应用中会从后端API获取数据
  useEffect(() => {
    // fetchRealtimeAlerts().then(data => setAlerts(data));
  }, []);

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'info':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <DashboardLayout>
      <Title>告警详情</Title>
      <Text>所有历史和实时告警的详细列表。</Text>

      <Card className="mt-6">
        <Flex className="items-center justify-between">
          <Title>告警列表</Title>
        </Flex>
        <Table className="mt-5">
          <TableHead>
            <TableRow>
              <TableHeaderCell>时间</TableHeaderCell>
              <TableHeaderCell>级别</TableHeaderCell>
              <TableHeaderCell>消息</TableHeaderCell>
              <TableHeaderCell>详情</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{alert.timestamp}</TableCell>
                <TableCell>
                  <Badge color={getBadgeColor(alert.level)}>{alert.level.toUpperCase()}</Badge>
                </TableCell>
                <TableCell>{alert.message}</TableCell>
                <TableCell>{alert.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </DashboardLayout>
  );
}