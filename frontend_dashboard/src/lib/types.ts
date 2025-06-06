// Shared TypeScript types for the HFT micro-arbitrage dashboard, adapted for Binance WebSocket API

// Binance Order Book Level (price, quantity)
export type BinanceOrderBookLevel = [string, string]; // [price, quantity]

// Binance L2 Order Book Depth Update (depthUpdate)
// https://binance-docs.github.io/apidocs/futures/cn/#L2
export interface BinanceDepthStreamPayload {
  e: "depthUpdate"; // Event type
  E: number;        // Event time (timestamp)
  T: number;        // Transaction time (timestamp)
  s: string;        // Symbol
  U: number;        // First update ID in event
  u: number;        // Final update ID in event
  pu: number;       // Previous event update ID
  b: BinanceOrderBookLevel[]; // Bids to be updated
  a: BinanceOrderBookLevel[]; // Asks to be updated
}

// Combined Order Book Data structure for local state management
export interface OrderBookData {
  symbol: string;
  lastUpdateId: number; // For managing incremental updates
  bids: Map<string, string>; // Price -> Quantity
  asks: Map<string, string>; // Price -> Quantity
  timestamp: number; // Last update timestamp from event
}

// Binance Aggregate Trade Stream (aggTrade)
// https://binance-docs.github.io/apidocs/futures/cn/#trade-streams
export interface BinanceAggTradeStreamPayload {
  e: "aggTrade";  // Event type
  E: number;      // Event time
  s: string;      // Symbol
  a: number;      // Aggregate trade ID
  p: string;      // Price
  q: string;      // Quantity
  f: number;      // First trade ID
  l: number;      // Last trade ID
  T: number;      // Trade time
  m: boolean;     // Is the buyer the market maker?
}

// TickerSummaryData can be derived from aggTrade or other streams if needed, or a dedicated ticker stream
// For now, we'll use aggTrade as a proxy for ticker-like updates
export type TickerSummaryData = BinanceAggTradeStreamPayload;

// Strategy Status (remains as previously defined, assuming it's internal)
export interface StrategyStatus {
  strategyName: string;
  tradingPair: string;
  isActive: boolean;
  uptime: string; 
  parameters: Record<string, any>;
}

// Key Performance Indicators (KPIs) (remains as previously defined)
export interface KpiData {
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  maxDrawdown: number;
}

// Binance WebSocket request message structure for subscribe/unsubscribe
export interface BinanceWebSocketRequest {
  method: "SUBSCRIBE" | "UNSUBSCRIBE" | "LIST_SUBSCRIPTIONS" | "SET_PROPERTY" | "GET_PROPERTY";
  params: string[]; // e.g., ["btcusdt@depth", "btcusdt@aggTrade"]
  id: number;       // Unique ID for the request
}

// General WebSocket message structure from Binance (wrapper for different payloads)
export interface BinanceWebSocketMessage<T = any> {
  stream: string; // e.g., "btcusdt@depth"
  data: T;        // The actual payload, like BinanceDepthStreamPayload or BinanceAggTradeStreamPayload
}

// Union type for all possible Binance stream payloads we handle
export type BinanceStreamPayload = 
  | BinanceDepthStreamPayload 
  | BinanceAggTradeStreamPayload;

// WebSocket message types for internal state management (can be simplified if directly using Binance types)
export type InternalWebSocketMessageType =
  | 'orderBookUpdate'       // Corresponds to BinanceDepthStreamPayload
  | 'aggTradeUpdate'        // Corresponds to BinanceAggTradeStreamPayload
  | 'strategyStatusUpdate'  // Internal, not from Binance
  | 'kpiUpdate'             // Internal, not from Binance
  | 'tradeNotification'     // Internal or could be a Binance stream like user data stream
  | 'errorNotification';

// Generic message structure for internal event bus, if needed
// However, when directly connecting to Binance, we'll mostly deal with BinanceWebSocketMessage
export interface InternalWebSocketMessage<T = any> {
  type: InternalWebSocketMessageType;
  payload: T;
  timestamp?: number; // Optional, as Binance messages have their own timestamps
  symbol?: string;    // Optional, as Binance messages have their own symbols
}

// Add more shared types as needed during development
// For example, types for user data streams (balance updates, order updates) if those are needed later.