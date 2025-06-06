//! HFT微套利系统主程序
//! 针对C5N实例优化的高频交易微套利系统

use hft_micro_arbitrage::*;
use binance_websocket::client::BinanceWebsocketClient;
use binance_websocket::BinanceWebsocketMessage;
use log::{info, warn, debug};
use order_book::snapshot::{OrderBookSnapshot, SharedOrderBookSnapshot};
use tracing_subscriber::{fmt, EnvFilter};
use crate::order_book::OrderBookManagement;
use crate::order_book_imbalance::{DefaultImbalanceCalculator, ImbalanceCalculator};
use crate::trading_signal::{TradingSignal, SignalDirection};
use crate::config::AppConfig;

use rust_decimal_macros::dec;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::sync::mpsc;

use dotenv::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;
use anyhow::Context;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // 初始化环境变量和日志
    dotenv().ok();
    
    let log_level = std::env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string());
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::new(log_level))
        .init();

    info!("Starting HFT微套利 application...");

    // 初始化数据库连接池
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let _pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .context("Failed to create database pool.")?;

    info!("Database connection pool initialized.");

    // 创建WebSocket消息通道
    let (tx, mut rx) = mpsc::unbounded_channel::<BinanceWebsocketMessage>();

    let ws_client = BinanceWebsocketClient::new(tx);
    let client_clone = ws_client.clone();

    // 启动WebSocket客户端
    tokio::spawn(async move {
        client_clone.run().await;
    });

    // 等待连接建立后订阅数据流
    tokio::time::sleep(std::time::Duration::from_secs(1)).await;
    
    let symbols_to_subscribe = vec![
        "BTCUSDT", "ETHUSDT", "SOLUSDT", "LINKUSDT", "SUIUSDT", "MKRUSDT"
    ];
    
    let mut streams_to_subscribe = Vec::new();
    for symbol in symbols_to_subscribe {
        streams_to_subscribe.push(format!("{}@bookTicker", symbol.to_lowercase()));
        streams_to_subscribe.push(format!("{}@depth5@100ms", symbol.to_lowercase()));
    }
    
    ws_client.subscribe_to_streams(streams_to_subscribe).await;

    info!("WebSocket client started and subscriptions initiated.");
    info!("Listening for incoming messages...");

    // 订单簿管理
    let order_books: Arc<RwLock<HashMap<String, SharedOrderBookSnapshot>>> = 
        Arc::new(RwLock::new(HashMap::new()));

    // API密钥配置
    let api_key = std::env::var("BINANCE_API_KEY").ok();
    let secret_key = std::env::var("BINANCE_SECRET_KEY").ok();

    if api_key.is_none() || secret_key.is_none() {
        log::warn!("API Key或Secret Key未在环境变量中设置，部分功能可能受限");
    }

    // 创建Binance客户端
    let binance_client = Arc::new(BinanceClient::new(
        "wss://stream.binance.com:9443/ws",
        HttpClientConfig {
            api_key: api_key,
            secret_key: secret_key,
            base_url: "https://api.binance.com".to_string(),
        },
    ));

    // 主消息处理循环
    while let Some(message) = rx.recv().await {
        match message {
            BinanceWebsocketMessage::BookTicker(book_ticker) => {
                debug!("Received BookTicker for {}: bid={}, ask={}", 
                    book_ticker.symbol, book_ticker.best_bid_price, book_ticker.best_ask_price);
                
                // 处理订单簿更新
                let mut order_books_guard = order_books.write().await;
                let order_book = order_books_guard
                    .entry(book_ticker.symbol.clone())
                    .or_insert_with(|| Arc::new(RwLock::new(OrderBookSnapshot::new())));
                
                // 更新订单簿
                let mut ob = order_book.write().await;
                ob.update_from_book_ticker(&book_ticker);
                drop(ob);
                drop(order_books_guard);

                // 计算不平衡度
                let calculator = DefaultImbalanceCalculator::new();
                let order_book_read = order_book.read().await;
                let imbalance = calculator.calculate_imbalance(&*order_book_read);
                drop(order_book_read);

                // 生成交易信号
                if let Some(imbalance_value) = imbalance {
                    let signal = TradingSignal::from_imbalance(
                        book_ticker.symbol.clone(),
                        imbalance_value,
                        dec!(0.3), // 阈值
                    );

                    if let Some(trading_signal) = signal {
                        info!("Generated trading signal: {:?}", trading_signal);
                        
                        // 这里可以添加交易执行逻辑
                        // execute_trade(trading_signal, &binance_client).await;
                    }
                }
            }
            BinanceWebsocketMessage::DepthUpdate(depth_update) => {
                debug!("Received DepthUpdate for {}", depth_update.symbol);
                
                // 处理深度更新
                let mut order_books_guard = order_books.write().await;
                let order_book = order_books_guard
                    .entry(depth_update.symbol.clone())
                    .or_insert_with(|| Arc::new(RwLock::new(OrderBookSnapshot::new())));
                
                let mut ob = order_book.write().await;
                ob.update_from_depth(&depth_update);
            }
            BinanceWebsocketMessage::Error(error) => {
                warn!("WebSocket error: {}", error);
            }
        }
    }

    Ok(())
}

// 健康检查端点
pub async fn health_check() -> &'static str {
    "OK"
}

// 交易执行函数（示例）
// async fn execute_trade(signal: TradingSignal, client: &Arc<BinanceClient>) {
//     // 实现交易执行逻辑
//     info!("Executing trade for signal: {:?}", signal);
// }
