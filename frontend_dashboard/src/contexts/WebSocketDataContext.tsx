'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { websocketService } from '../lib/websocketService';
import { API_CONFIG, BINANCE_FUTURES_API_URL } from '../config';
import {
  OrderBookData,
  TickerSummaryData, // This is now BinanceAggTradeStreamPayload
  StrategyStatus,
  KpiData,
  BinanceDepthStreamPayload,
  BinanceAggTradeStreamPayload,
  BinanceOrderBookLevel
} from '../lib/types';

interface WebSocketContextState {
  isConnected: boolean;


  aggTrade: BinanceAggTradeStreamPayload | null;
  strategyStatus: StrategyStatus | null;
  kpiData: KpiData | null;
  lastError: string | null;
  connect: () => void;
  disconnect: () => void;
  subscribe: (streams: string[]) => void;
  unsubscribe: (streams: string[]) => void;


}

const WebSocketContext = createContext<WebSocketContextState | undefined>(undefined);

export const useWebSocket = (): WebSocketContextState => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
  initialSubscriptions?: string[]; // e.g. ['btcusdt@depth', 'btcusdt@aggTrade']
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, initialSubscriptions = [] }) => {
  const [isConnected, setIsConnected] = useState(false);


  const [currentSymbolAggTrade, setCurrentSymbolAggTrade] = useState<BinanceAggTradeStreamPayload | null>(null);
  
  const [strategyStatus, setStrategyStatus] = useState<StrategyStatus | null>(null);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Ref for primary symbol for aggTrade, order book symbol will be managed by useOrderBook
  const primaryAggTradeSymbolRef = useRef<string | null>(null); 

  const handleConnect = useCallback(() => {
    console.log('WebSocketProvider: Connecting...');
    websocketService.connect();
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('WebSocketProvider: Disconnecting...');
    websocketService.disconnect();
    // Reset aggTrade, order book state will be managed by individual hooks
    setCurrentSymbolAggTrade(null);
  }, []);

  const handleSubscribe = useCallback((streams: string[]) => {
    console.log('WebSocketProvider: Subscribing to streams:', streams);
    
    const aggTradeStream = streams.find(s => s.endsWith('@aggTrade'));
    if (aggTradeStream) {
        primaryAggTradeSymbolRef.current = aggTradeStream.split('@')[0];
    }
  


    websocketService.subscribeToStreams(streams);
  }, []);

  const handleUnsubscribe = useCallback((streams: string[]) => {
    console.log('WebSocketProvider: Unsubscribing from streams:', streams);
    websocketService.unsubscribeFromStreams(streams);
    
    streams.forEach(streamName => {
        const symbol = streamName.split('@')[0];
        if (streamName.endsWith('@aggTrade') && primaryAggTradeSymbolRef.current === symbol) {
            setCurrentSymbolAggTrade(null);
        }


    });
  }, []);




  useEffect(() => {
    const onOpenUnsubscribe = websocketService.onOpen(() => {
      console.log('WebSocketProvider: Connected');
      setIsConnected(true);
      setLastError(null);
      if (initialSubscriptions && initialSubscriptions.length > 0) {
        // Filter out depth streams as they are handled by useOrderBook
        const nonDepthStreams = initialSubscriptions.filter(s => !s.endsWith('@depth'));
        if (nonDepthStreams.length > 0) {
            handleSubscribe(nonDepthStreams);
        }
      }
    });

    const onCloseUnsubscribe = websocketService.onClose((event) => {
      console.log('WebSocketProvider: Disconnected', event.reason);
      setIsConnected(false);
      if (event.code !== 1000) {
        setLastError(`WebSocket closed: ${event.reason || 'Unknown reason'} (Code: ${event.code})`);
      }
    });

    const onErrorUnsubscribe = websocketService.onError((error) => {
      console.error('WebSocketProvider: Error', error);
      const errorMessage = typeof error === 'string' ? error : (error instanceof Event ? 'WebSocket connection error' : 'Unknown WebSocket error');
      setLastError(errorMessage);
      setIsConnected(false);
    });

    const onSubscriptionSuccessUnsubscribe = websocketService.onSubscriptionSuccess(response => {
        console.log('WebSocketProvider: Subscription success response', response);
    });




    const onAggTradeUnsubscribe = websocketService.onAggTradeUpdate((data) => {
      const symbol = data.s.toLowerCase();
      if (primaryAggTradeSymbolRef.current === symbol) {
        setCurrentSymbolAggTrade(data);
      }
    });

    // --- Placeholder for internal messages, if they were to be used ---
    const onStrategyStatusUnsubscribe = websocketService.onStrategyStatusUpdate((data) => {
      // console.log('WebSocketProvider: StrategyStatus Update', data);
      setStrategyStatus(data);
    });

    const onKpiUnsubscribe = websocketService.onKpiUpdate((data) => {
      // console.log('WebSocketProvider: KPI Update', data);
      setKpiData(data);
    });
    // --- End Placeholder ---

    // Optional: Auto-connect on mount
    handleConnect(); 

    return () => {
      onOpenUnsubscribe();
      onCloseUnsubscribe();
      onErrorUnsubscribe();
      onSubscriptionSuccessUnsubscribe();
  

      onAggTradeUnsubscribe();
      onStrategyStatusUnsubscribe();
      onKpiUnsubscribe();
      // Consider if disconnect should happen on unmount. 
      // If app-wide, probably not. If specific to a page/component tree, then yes.
      // websocketService.disconnect(); 
    };
  }, [handleConnect, handleSubscribe, initialSubscriptions]); // Dependencies updated


  const contextValue: WebSocketContextState = {
    isConnected,


    aggTrade: currentSymbolAggTrade,
    strategyStatus,
    kpiData,
    lastError,
    connect: handleConnect,
    disconnect: handleDisconnect,
    subscribe: handleSubscribe,
    unsubscribe: handleUnsubscribe,


  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};