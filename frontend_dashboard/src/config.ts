// Application-wide configurations

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  // Default Binance Futures WebSocket URL (can be overridden by .env.local)
  DEFAULT_URL: 'wss://fstream.binance.com/ws',
  // Reconnection strategy parameters
  MAX_RECONNECT_ATTEMPTS: 5,
  INITIAL_RECONNECT_DELAY_MS: 1000, // Start with 1 second
  MAX_RECONNECT_DELAY_MS: 30000,    // Cap at 30 seconds
  RECONNECT_BACKOFF_FACTOR: 2,      // Exponential backoff factor
  // PING/PONG and timeout settings (Binance specific)
  // Binance server sends PING every 3 minutes. Client should respond with PONG.
  // If server doesn't receive PONG within 10 minutes, it disconnects.
  // Browser WebSocket API usually handles PING/PONG automatically.
  // These values are more for custom logic if needed or for server-side implementations.
  PING_INTERVAL_MS: 180000, // How often server PINGs (for reference)
  PONG_WAIT_MS: 10000,      // How long server waits for PONG (for reference)
};

// API Configuration
export const API_CONFIG = {
  // Default Binance Futures API URL for REST calls (e.g., order book snapshot)
  // (can be overridden by .env.local)
  DEFAULT_FUTURES_API_URL: 'https://fapi.binance.com',
  ORDER_BOOK_SNAPSHOT_LIMIT: 500, // Default limit for order book snapshot depth
  REQUEST_TIMEOUT_MS: 10000,       // Default timeout for API requests (e.g., fetch)
};

// UI Configuration
export const UI_CONFIG = {
  ORDER_BOOK_DISPLAY_LEVELS: 15, // Number of price levels to display in UI order book
  TOAST_DURATION_MS: 5000,     // Default duration for toast notifications
};

// Feature Flags (example)
export const FEATURE_FLAGS = {
  ENABLE_ADVANCED_TRADING_CHARTS: true,
  SHOW_KPI_METRICS_BY_DEFAULT: false,
};

// Helper function to get environment variables with a fallback
export const getEnv = (key: string, defaultValue: string): string => {
  // In Next.js, process.env is available on both server and client (for NEXT_PUBLIC_ variables)
  // For client-side, Next.js replaces process.env.NEXT_PUBLIC_VAR_NAME with its value at build time.
  // For server-side, it's the actual Node.js process.env.
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
};

// Example of using getEnv for URLs that might be in .env.local
export const BINANCE_FUTURES_WEBSOCKET_URL = getEnv('NEXT_PUBLIC_BINANCE_FUTURES_WEBSOCKET_URL', WEBSOCKET_CONFIG.DEFAULT_URL);
export const BINANCE_FUTURES_API_URL = getEnv('NEXT_PUBLIC_BINANCE_FUTURES_API_URL', API_CONFIG.DEFAULT_FUTURES_API_URL);