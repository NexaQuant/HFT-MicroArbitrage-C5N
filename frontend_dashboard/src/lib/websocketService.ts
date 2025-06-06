// WebSocket service for handling real-time data communication with Binance

import {
  BinanceDepthStreamPayload,
  BinanceAggTradeStreamPayload,
  BinanceWebSocketRequest,
  BinanceWebSocketMessage,
  BinanceStreamPayload,
  StrategyStatus, // Assuming these are still internal and not from Binance
  KpiData,        // Assuming these are still internal and not from Binance
} from './types';

import { WEBSOCKET_CONFIG, BINANCE_FUTURES_WEBSOCKET_URL } from '../config';

const WEBSOCKET_URL = BINANCE_FUTURES_WEBSOCKET_URL;

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
// MAX_RECONNECT_ATTEMPTS, INITIAL_RECONNECT_DELAY_MS, MAX_RECONNECT_DELAY_MS, RECONNECT_BACKOFF_FACTOR are now from WEBSOCKET_CONFIG
let pingTimeout: NodeJS.Timeout | null = null;
let serverPongTimeout: NodeJS.Timeout | null = null;
// PING_INTERVAL_MS and PONG_WAIT_MS are for reference, actual handling is via browser WebSocket API or server PINGs
// const PING_INTERVAL_MS = WEBSOCKET_CONFIG.PING_INTERVAL_MS; 
// const PONG_WAIT_MS = WEBSOCKET_CONFIG.PONG_WAIT_MS;

// Define callback types for different message types
type BinanceDepthCallback = (data: BinanceDepthStreamPayload) => void;
type BinanceAggTradeCallback = (data: BinanceAggTradeStreamPayload) => void;
type StrategyStatusCallback = (data: StrategyStatus) => void; // Internal
type KpiCallback = (data: KpiData) => void; // Internal
type ErrorCallback = (error: Event | string) => void;
type OpenCallback = () => void;
type CloseCallback = (event: CloseEvent) => void;
type SubscriptionSuccessCallback = (response: any) => void; // For subscribe/unsubscribe confirmations

// Store callbacks
const listeners: {
  onDepthUpdate?: BinanceDepthCallback[];
  onAggTradeUpdate?: BinanceAggTradeCallback[];
  onStrategyStatusUpdate?: StrategyStatusCallback[]; // Internal
  onKpiUpdate?: KpiCallback[]; // Internal
  onError?: ErrorCallback[];
  onOpen?: OpenCallback[];
  onClose?: CloseCallback[];
  onSubscriptionSuccess?: SubscriptionSuccessCallback[];
} = {
  onDepthUpdate: [],
  onAggTradeUpdate: [],
  onStrategyStatusUpdate: [],
  onKpiUpdate: [],
  onError: [],
  onOpen: [],
  onClose: [],
  onSubscriptionSuccess: [],
};

const resetTimeouts = () => {
  if (pingTimeout) clearTimeout(pingTimeout);
  if (serverPongTimeout) clearTimeout(serverPongTimeout);
};

const schedulePing = () => {
  resetTimeouts();
  pingTimeout = setTimeout(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('Sending PING to Binance');
      socket.send(JSON.stringify({ method: "PING" })); // Or just rely on server PINGs
      // Binance server sends PINGs, we should send PONG
      // This custom PING might not be necessary if server PINGs are handled
      // For now, let's assume we primarily react to server PINGs by sending PONGs.
      // The server will send a PING frame every 3 minutes. If the server does not receive a PONG frame back from the connection within a 10 minute period, the connection will be disconnected.
      // So, we need to listen for PING and send PONG.
    }
    schedulePing(); // Reschedule
  }, WEBSOCKET_CONFIG.PING_INTERVAL_MS);
};

const connect = () => {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log('WebSocket already connected or connecting.');
    return;
  }

  console.log(`Attempting to connect to WebSocket: ${WEBSOCKET_URL}`);
  socket = new WebSocket(WEBSOCKET_URL);

  socket.onopen = () => {
    console.log('WebSocket connection established.');
    reconnectAttempts = 0;
    listeners.onOpen?.forEach(cb => cb());
    // schedulePing(); // Start PING cycle or wait for server PING
    // Binance expects PONG in response to its PING. We don't need to send PING ourselves usually.
  };

  socket.onmessage = (event) => {
    try {
      // Binance sends PING frames as actual WebSocket PING opcodes, not JSON messages.
      // However, some APIs might send JSON pings. The official doc says PING frames.
      // The `ws` library on Node.js handles PING/PONG opcodes automatically.
      // Browsers' WebSocket API also handles PING/PONG opcodes transparently.
      // We might need to handle a JSON-based ping if the server sends one, but typically it's at the protocol level.
      // For now, assume PING/PONG is handled at WebSocket protocol level by the browser.
      // If server sends a JSON message like { "method": "PING", "params": [], "id": 123 }, handle it.
      // Or if it's a specific string "ping", respond with "pong".
      // The Binance documentation states: "The websocket server will send a PING frame every 3 minutes.
      // If the websocket server does not receive a PONG frame back from the connection within a 10 minute period, the connection will be disconnected."
      // This implies the browser's WebSocket should auto-reply with PONG to a PING frame.
      // If not, we might need to send a PONG message if we detect a PING message (though PING frames are usually not exposed to onmessage).

      const message = JSON.parse(event.data as string);

      if (message.result !== undefined && message.id !== undefined) {
        // This is a response to a subscription/unsubscription request
        console.log('Subscription response received:', message);
        listeners.onSubscriptionSuccess?.forEach(cb => cb(message));
        return;
      }
      
      // Check for Binance specific error format
      if (message.error) {
        console.error('Binance WebSocket API Error:', message.error);
        const errorMessage = `Binance WebSocket API Error: ${message.error.msg} (Code: ${message.error.code}, Stream: ${message.stream || 'N/A'})`;
        console.error(errorMessage);
        listeners.onError?.forEach(cb => cb(errorMessage));
        return;
      }

      const parsedMessage = message as BinanceWebSocketMessage<BinanceStreamPayload>;
      // console.log('Binance WebSocket message received:', parsedMessage);

      if (parsedMessage.stream && parsedMessage.data) {
        const streamType = parsedMessage.data.e;
        switch (streamType) {
          case 'depthUpdate':
            listeners.onDepthUpdate?.forEach(cb => cb(parsedMessage.data as BinanceDepthStreamPayload));
            break;
          case 'aggTrade':
            listeners.onAggTradeUpdate?.forEach(cb => cb(parsedMessage.data as BinanceAggTradeStreamPayload));
            break;
          // Add more cases for other stream types as needed (e.g., kline, ticker, etc.)
          default:
            // Handle internal messages if they were to come through this same socket, though unlikely
            if ((parsedMessage.data as any).strategyName) { // Heuristic for StrategyStatus
                 listeners.onStrategyStatusUpdate?.forEach(cb => cb(parsedMessage.data as StrategyStatus));
            } else if ((parsedMessage.data as any).totalPnl !== undefined) { // Heuristic for KpiData
                 listeners.onKpiUpdate?.forEach(cb => cb(parsedMessage.data as KpiData));
            } else {
                console.warn('Received unknown Binance stream data type:', streamType, parsedMessage.data);
            }
        }
      } else {
        console.warn('Received message not in expected Binance stream format:', message);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error, 'Raw data:', event.data);
      const parseErrorMessage = `Error parsing WebSocket message: ${(error as Error).message}`;
      console.error(parseErrorMessage, 'Raw data:', event.data);
      listeners.onError?.forEach(cb => cb(parseErrorMessage));
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    const socketErrorMessage = `WebSocket error: ${error.type || 'Unknown error'}`;
    console.error(socketErrorMessage, error);
    listeners.onError?.forEach(cb => cb(socketErrorMessage));
    // No need to call resetTimeouts here as onclose will handle it
  };

  socket.onclose = (event) => {
    console.log('WebSocket connection closed:', event.reason, `Code: ${event.code}`);
    resetTimeouts();
    listeners.onClose?.forEach(cb => cb(event));
    if (reconnectAttempts < WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS && event.code !== 1000) { // Don't auto-reconnect on normal closure (1000)
      reconnectAttempts++;
      const delay = Math.min(
        WEBSOCKET_CONFIG.INITIAL_RECONNECT_DELAY_MS * Math.pow(WEBSOCKET_CONFIG.RECONNECT_BACKOFF_FACTOR, reconnectAttempts -1),
        WEBSOCKET_CONFIG.MAX_RECONNECT_DELAY_MS
      );
      console.log(`Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${reconnectAttempts}/${WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS})`);
      setTimeout(connect, delay);
    } else if (event.code !== 1000) {
      console.error('Max WebSocket reconnect attempts reached or connection closed normally and not retrying.');
      const reconnectErrorMessage = 'Max WebSocket reconnect attempts reached or connection closed normally and not retrying.';
      console.error(reconnectErrorMessage);
      listeners.onError?.forEach(cb => cb(reconnectErrorMessage));
    }
  };
};

const disconnect = () => {
  if (socket) {
    console.log('Disconnecting WebSocket.');
    resetTimeouts();
    reconnectAttempts = WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS; // Prevent reconnection attempts after explicit disconnect
    socket.close(1000, 'User initiated disconnect');
    socket = null;
  }
};

let messageIdCounter = 1;
const sendMessage = (message: BinanceWebSocketRequest) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    message.id = messageIdCounter++; // Assign a unique ID to the request
    socket.send(JSON.stringify(message));
    console.log('Sent WebSocket message:', message);
  } else {
    console.error('WebSocket is not connected. Cannot send message.');
    listeners.onError?.forEach(cb => cb('WebSocket is not connected. Cannot send message.'));
  }
};

// Subscribe to streams (e.g., ['btcusdt@depth', 'btcusdt@aggTrade'])
const subscribeToStreams = (streams: string[]) => {
  const message: BinanceWebSocketRequest = {
    method: 'SUBSCRIBE',
    params: streams,
    id: 0 // Will be set by sendMessage
  };
  sendMessage(message);
};

// Unsubscribe from streams
const unsubscribeFromStreams = (streams: string[]) => {
  const message: BinanceWebSocketRequest = {
    method: 'UNSUBSCRIBE',
    params: streams,
    id: 0 // Will be set by sendMessage
  };
  sendMessage(message);
};

// Functions to subscribe to specific message types
const onDepthUpdate = (callback: BinanceDepthCallback) => {
  listeners.onDepthUpdate?.push(callback);
  return () => {
    listeners.onDepthUpdate = listeners.onDepthUpdate?.filter(cb => cb !== callback);
  };
};

const onAggTradeUpdate = (callback: BinanceAggTradeCallback) => {
  listeners.onAggTradeUpdate?.push(callback);
  return () => {
    listeners.onAggTradeUpdate = listeners.onAggTradeUpdate?.filter(cb => cb !== callback);
  };
};

// --- Internal message types (if still needed, though less likely with direct Binance connection for market data) ---
const onStrategyStatusUpdate = (callback: StrategyStatusCallback) => {
  listeners.onStrategyStatusUpdate?.push(callback);
  return () => {
    listeners.onStrategyStatusUpdate = listeners.onStrategyStatusUpdate?.filter(cb => cb !== callback);
  };
};

const onKpiUpdate = (callback: KpiCallback) => {
  listeners.onKpiUpdate?.push(callback);
  return () => {
    listeners.onKpiUpdate = listeners.onKpiUpdate?.filter(cb => cb !== callback);
  };
};
// --- End Internal --- 

const onError = (callback: ErrorCallback) => {
  listeners.onError?.push(callback);
  return () => {
    listeners.onError = listeners.onError?.filter(cb => cb !== callback);
  };
};

const onOpen = (callback: OpenCallback) => {
  listeners.onOpen?.push(callback);
  return () => {
    listeners.onOpen = listeners.onOpen?.filter(cb => cb !== callback);
  };
};

const onClose = (callback: CloseCallback) => {
  listeners.onClose?.push(callback);
  return () => {
    listeners.onClose = listeners.onClose?.filter(cb => cb !== callback);
  };
};

const onSubscriptionSuccess = (callback: SubscriptionSuccessCallback) => {
    listeners.onSubscriptionSuccess?.push(callback);
    return () => {
        listeners.onSubscriptionSuccess = listeners.onSubscriptionSuccess?.filter(cb => cb !== callback);
    };
};

export const websocketService = {
  connect,
  disconnect,
  subscribeToStreams,
  unsubscribeFromStreams,
  onDepthUpdate,
  onAggTradeUpdate,
  onStrategyStatusUpdate, // Keep if internal messages are still relevant
  onKpiUpdate,          // Keep if internal messages are still relevant
  onError,
  onOpen,
  onClose,
  onSubscriptionSuccess,
  getReadyState: () => socket?.readyState ?? WebSocket.CLOSED,
  // sendMessage is not exposed directly for Binance, use subscribe/unsubscribe helpers
};

// Auto-connect can be initiated from WebSocketDataContext or a global app setup
// For example: if (typeof window !== 'undefined') connect(); // Basic auto-connect for client-side