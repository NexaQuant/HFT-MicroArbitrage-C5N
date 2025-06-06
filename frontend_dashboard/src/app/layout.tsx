import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardLayout from '@/components/layouts/DashboardLayout'; // 更正 DashboardLayout 路径
import { WebSocketProvider } from "@/contexts/WebSocketDataContext"; // 导入 WebSocketProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HFT 微套利仪表盘",
  description: "高频交易微套利平台 - 实时监控与分析",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} min-h-screen`}> {/* 移除 bg-cyber-bg 和 text-cyber-text，这些应由 globals.css 或组件控制 */}
        <WebSocketProvider initialSubscriptions={['btcusdt@aggTrade']}>
          <DashboardLayout>{children}</DashboardLayout>
        </WebSocketProvider>
      </body>
    </html>
  );
}