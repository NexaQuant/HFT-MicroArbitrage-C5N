//! HFT微套利系统库文件
//! 模块导出和公共接口定义

pub mod binance_websocket;
pub mod order_book;
pub mod order_book_imbalance;
pub mod trading_signal;
pub mod trade_executor;
pub mod trading_costs;
pub mod strategy_executor;
pub mod database_manager;
pub mod config;

// 重新导出常用类型
pub use binance_websocket::client::BinanceWebsocketClient;
pub use order_book::snapshot::OrderBookSnapshot;
pub use trading_signal::{TradingSignal, SignalDirection};
pub use config::AppConfig;

// 版本信息
pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const NAME: &str = env!("CARGO_PKG_NAME");

// 健康检查
pub fn health() -> &'static str {
    "HFT MicroArbitrage System - Healthy"
}
