//! 配置管理模块
//! 处理应用程序配置、API密钥、交易参数等

use serde::{Deserialize, Serialize};
use rust_decimal::Decimal;
use std::path::Path;
use config::{Config, ConfigError, File};

/// API密钥配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiKeysConfig {
    pub binance_api_key: String,
    pub binance_api_secret: String,
}

impl Default for ApiKeysConfig {
    fn default() -> Self {
        ApiKeysConfig {
            binance_api_key: "".to_string(),
            binance_api_secret: "".to_string(),
        }
    }
}

/// 交易参数配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingParametersConfig {
    pub symbol: String,
    pub capital_per_trade_percentage: Decimal,
    pub max_concurrent_trades: u32,
}

impl Default for TradingParametersConfig {
    fn default() -> Self {
        TradingParametersConfig {
            symbol: "BTCUSDT".to_string(),
            capital_per_trade_percentage: Decimal::from_f64(0.01).unwrap(),
            max_concurrent_trades: 1,
        }
    }
}

/// 订单类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OrderType {
    Market,
    Limit,
    StopLoss,
    TakeProfit,
}

/// 开仓配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntryConfig {
    pub order_type: OrderType,
    pub reprice_attempts: u32,
    pub reprice_delay_ms: u64,
    pub slippage_tolerance: Decimal,
}

impl Default for EntryConfig {
    fn default() -> Self {
        EntryConfig {
            order_type: OrderType::Limit,
            reprice_attempts: 3,
            reprice_delay_ms: 100,
            slippage_tolerance: Decimal::from_f64(0.001).unwrap(),
        }
    }
}

/// 平仓配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExitConfig {
    pub order_type: OrderType,
    pub reprice_attempts: u32,
    pub reprice_delay_ms: u64,
    pub slippage_tolerance: Decimal,
}

impl Default for ExitConfig {
    fn default() -> Self {
        ExitConfig {
            order_type: OrderType::Market,
            reprice_attempts: 2,
            reprice_delay_ms: 50,
            slippage_tolerance: Decimal::from_f64(0.002).unwrap(),
        }
    }
}

/// 风险管理配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskManagementConfig {
    pub max_drawdown_percentage: Decimal,
    pub stop_loss_percentage: Decimal,
    pub take_profit_percentage: Decimal,
    pub max_position_size: Decimal,
    pub daily_loss_limit: Decimal,
}

impl Default for RiskManagementConfig {
    fn default() -> Self {
        RiskManagementConfig {
            max_drawdown_percentage: Decimal::from_f64(0.05).unwrap(),
            stop_loss_percentage: Decimal::from_f64(0.02).unwrap(),
            take_profit_percentage: Decimal::from_f64(0.01).unwrap(),
            max_position_size: Decimal::from_f64(1000.0).unwrap(),
            daily_loss_limit: Decimal::from_f64(500.0).unwrap(),
        }
    }
}

/// 策略配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrategyConfig {
    pub name: String,
    pub enabled: bool,
    pub imbalance_threshold: Decimal,
    pub min_spread: Decimal,
    pub max_spread: Decimal,
    pub volume_threshold: Decimal,
}

impl Default for StrategyConfig {
    fn default() -> Self {
        StrategyConfig {
            name: "OrderBookImbalance".to_string(),
            enabled: true,
            imbalance_threshold: Decimal::from_f64(0.3).unwrap(),
            min_spread: Decimal::from_f64(0.0001).unwrap(),
            max_spread: Decimal::from_f64(0.01).unwrap(),
            volume_threshold: Decimal::from_f64(1000.0).unwrap(),
        }
    }
}

/// 主应用配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub api_keys: ApiKeysConfig,
    pub trading_parameters: TradingParametersConfig,
    pub entry: EntryConfig,
    pub exit: ExitConfig,
    pub risk_management: RiskManagementConfig,
    pub strategy: StrategyConfig,
    pub database_url: String,
    pub redis_url: String,
    pub log_level: String,
    pub server_port: u16,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            api_keys: ApiKeysConfig::default(),
            trading_parameters: TradingParametersConfig::default(),
            entry: EntryConfig::default(),
            exit: ExitConfig::default(),
            risk_management: RiskManagementConfig::default(),
            strategy: StrategyConfig::default(),
            database_url: "postgresql://hft_user:hft_password@localhost:5432/hft_db".to_string(),
            redis_url: "redis://localhost:6379".to_string(),
            log_level: "info".to_string(),
            server_port: 8080,
        }
    }
}

impl AppConfig {
    /// 从配置文件加载配置
    pub fn from_file<P: AsRef<Path>>(path: P) -> Result<Self, ConfigError> {
        let mut config = Config::builder();
        
        // 添加配置文件
        config = config.add_source(File::from(path.as_ref()));
        
        // 添加环境变量覆盖
        config = config.add_source(config::Environment::with_prefix("HFT"));
        
        let config = config.build()?;
        config.try_deserialize()
    }
    
    /// 从环境变量加载配置
    pub fn from_env() -> Result<Self, ConfigError> {
        let config = Config::builder()
            .add_source(config::Environment::with_prefix("HFT"))
            .build()?;
        config.try_deserialize()
    }
    
    /// 验证配置
    pub fn validate(&self) -> Result<(), String> {
        if self.api_keys.binance_api_key.is_empty() {
            return Err("Binance API key is required".to_string());
        }
        
        if self.api_keys.binance_api_secret.is_empty() {
            return Err("Binance API secret is required".to_string());
        }
        
        if self.trading_parameters.capital_per_trade_percentage <= Decimal::ZERO {
            return Err("Capital per trade percentage must be positive".to_string());
        }
        
        if self.risk_management.max_drawdown_percentage <= Decimal::ZERO {
            return Err("Max drawdown percentage must be positive".to_string());
        }
        
        Ok(())
    }
    
    /// 保存配置到文件
    pub fn save_to_file<P: AsRef<Path>>(&self, path: P) -> Result<(), Box<dyn std::error::Error>> {
        let toml_string = toml::to_string_pretty(self)?;
        std::fs::write(path, toml_string)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_default_config() {
        let config = AppConfig::default();
        assert_eq!(config.server_port, 8080);
        assert_eq!(config.log_level, "info");
    }
    
    #[test]
    fn test_config_validation() {
        let mut config = AppConfig::default();
        
        // 应该失败，因为API密钥为空
        assert!(config.validate().is_err());
        
        // 设置API密钥后应该成功
        config.api_keys.binance_api_key = "test_key".to_string();
        config.api_keys.binance_api_secret = "test_secret".to_string();
        assert!(config.validate().is_ok());
    }
}
