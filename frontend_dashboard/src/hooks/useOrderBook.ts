// d:\HFT微套利\frontend_dashboard\src\hooks\useOrderBook.ts
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { OrderBookData, BinanceDepthStreamPayload, BinanceOrderBookLevel } from '../lib/types';
import { API_CONFIG, BINANCE_FUTURES_API_URL } from '../config';
import { websocketService } from '../lib/websocketService'; // Assuming websocketService can be used directly or events passed

// Helper to update order book map (can be moved to a utils file if shared)
const updateOrderBookSide = (currentLevels: Map<string, string>, updates: BinanceOrderBookLevel[]): Map<string, string> => {
  const newLevels = new Map(currentLevels);
  updates.forEach(([price, quantity]) => {
    if (parseFloat(quantity) === 0) {
      newLevels.delete(price);
    } else {
      newLevels.set(price, quantity);
    }
  });
  return newLevels;
};

interface OrderBookManagerEntry {
  snapshot: OrderBookData | null;
  isLoadingSnapshot: boolean;
  updateQueue: BinanceDepthStreamPayload[];
  lastProcessedUpdateId: number;
  isSubscribed: boolean;
}

const orderBookManagers = new Map<string, OrderBookManagerEntry>();

interface UseOrderBookReturn {
  orderBook: OrderBookData | null;
  isLoading: boolean;
  error: string | null;
  subscribeToOrderBook: (symbol: string) => void;
  unsubscribeFromOrderBook: (symbol: string) => void;
}

export const useOrderBook = (symbol?: string): UseOrderBookReturn => {
  const [currentOrderBook, setCurrentOrderBook] = useState<OrderBookData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const currentSymbolRef = useRef<string | null>(symbol || null);

  const getManagerEntry = useCallback((sym: string): OrderBookManagerEntry => {
    if (!orderBookManagers.has(sym)) {
      orderBookManagers.set(sym, {
        snapshot: null,
        isLoadingSnapshot: false,
        updateQueue: [],
        lastProcessedUpdateId: 0,
        isSubscribed: false,
      });
    }
    return orderBookManagers.get(sym)!;
  }, []);

  const fetchOrderBookSnapshot = useCallback(async (sym: string) => {
    const managerEntry = getManagerEntry(sym);
    if (managerEntry.isLoadingSnapshot || managerEntry.snapshot) return;

    console.log(`useOrderBook: Fetching order book snapshot for ${sym}...`);
    managerEntry.isLoadingSnapshot = true;
    if (currentSymbolRef.current === sym) setIsLoading(true);
    setError(null);

    try {
      const apiUrl = `${BINANCE_FUTURES_API_URL}/fapi/v1/depth?symbol=${sym.toUpperCase()}&limit=${API_CONFIG.ORDER_BOOK_SNAPSHOT_LIMIT}`;
      const response = await fetch(apiUrl, { signal: AbortSignal.timeout(API_CONFIG.REQUEST_TIMEOUT_MS) });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `Failed to fetch snapshot for ${sym}: ${response.status} ${response.statusText}. Server: ${errorData.msg || 'No additional error message'}`;
        throw new Error(errorMessage);
      }
      const snapshotData = await response.json();
      if (!snapshotData || typeof snapshotData.lastUpdateId === 'undefined') {
        throw new Error(`Invalid snapshot data received for ${sym}.`);
      }

      const newSnapshot: OrderBookData = {
        symbol: sym,
        lastUpdateId: snapshotData.lastUpdateId,
        bids: new Map(snapshotData.bids.map((level: BinanceOrderBookLevel) => [level[0], level[1]])),
        asks: new Map(snapshotData.asks.map((level: BinanceOrderBookLevel) => [level[0], level[1]])),
        timestamp: snapshotData.E || Date.now(),
      };
      managerEntry.snapshot = newSnapshot;
      managerEntry.lastProcessedUpdateId = newSnapshot.lastUpdateId;
      console.log(`useOrderBook: Snapshot for ${sym} loaded, lastUpdateId: ${newSnapshot.lastUpdateId}`);
      
      if (currentSymbolRef.current === sym) setCurrentOrderBook(newSnapshot);
      processDepthQueue(sym); // Process any queued updates

    } catch (err) {
      const fetchError = err as Error;
      console.error(`useOrderBook: Error fetching snapshot for ${sym}:`, fetchError);
      if (currentSymbolRef.current === sym) setError(fetchError.message);
    } finally {
      managerEntry.isLoadingSnapshot = false;
      if (currentSymbolRef.current === sym) setIsLoading(false);
    }
  }, [getManagerEntry]); // Added getManagerEntry dependency

  const processDepthQueue = useCallback((sym: string) => {
    const managerEntry = getManagerEntry(sym);
    if (!managerEntry.snapshot || managerEntry.isLoadingSnapshot) return;

    let currentSnapshot = { ...managerEntry.snapshot, bids: new Map(managerEntry.snapshot.bids), asks: new Map(managerEntry.snapshot.asks) };
    let processedAny = false;

    const remainingQueue: BinanceDepthStreamPayload[] = [];
    managerEntry.updateQueue.forEach(update => {
      if (update.u <= currentSnapshot.lastUpdateId) return; // Skip old event

      if (update.U > currentSnapshot.lastUpdateId + 1) {
        console.warn(`Gap detected in depth update for ${sym}: U=${update.U}, lastUpdateId=${currentSnapshot.lastUpdateId}. Re-fetching snapshot.`);
        managerEntry.updateQueue = [];
        managerEntry.snapshot = null;
        fetchOrderBookSnapshot(sym);
        processedAny = false; // Stop processing this queue
        return; // Exit forEach for this symbol
      }

      currentSnapshot.bids = updateOrderBookSide(currentSnapshot.bids, update.b);
      currentSnapshot.asks = updateOrderBookSide(currentSnapshot.asks, update.a);
      currentSnapshot.lastUpdateId = update.u;
      currentSnapshot.timestamp = update.E;
      managerEntry.lastProcessedUpdateId = update.u;
      processedAny = true;
    });

    managerEntry.updateQueue = remainingQueue; 
    if (processedAny) {
      managerEntry.snapshot = { ...currentSnapshot };
      if (currentSymbolRef.current === sym) {
        setCurrentOrderBook({ ...currentSnapshot });
      }
    }
  }, [fetchOrderBookSnapshot, getManagerEntry]); // Added dependencies

  const handleDepthUpdate = useCallback((data: BinanceDepthStreamPayload) => {
    const sym = data.s.toLowerCase();
    const managerEntry = getManagerEntry(sym);

    if (!managerEntry.isSubscribed) return; // Only process if subscribed via this hook instance for this symbol

    if (!managerEntry.snapshot || managerEntry.isLoadingSnapshot) {
      managerEntry.updateQueue.push(data);
    } else {
      managerEntry.updateQueue.push(data);
      processDepthQueue(sym);
    }
  }, [processDepthQueue, getManagerEntry]); // Added dependencies

  const subscribeToOrderBook = useCallback((sym: string) => {
    currentSymbolRef.current = sym.toLowerCase();
    const managerEntry = getManagerEntry(currentSymbolRef.current);
    managerEntry.isSubscribed = true;

    setCurrentOrderBook(null); // Reset on new subscription
    setIsLoading(true);
    setError(null);

    // Check if already has snapshot from another instance, use it
    if(managerEntry.snapshot){
        setCurrentOrderBook(managerEntry.snapshot);
        setIsLoading(false);
    }

    websocketService.subscribeToStreams([`${currentSymbolRef.current}@depth`]);
    fetchOrderBookSnapshot(currentSymbolRef.current);
  }, [fetchOrderBookSnapshot, getManagerEntry]); // Added dependencies

  const unsubscribeFromOrderBook = useCallback((sym: string) => {
    const s = sym.toLowerCase();
    const managerEntry = getManagerEntry(s);
    managerEntry.isSubscribed = false; // Mark as unsubscribed for this hook instance
    websocketService.unsubscribeFromStreams([`${s}@depth`]);
    
    // Clean up if this was the active symbol for this hook instance
    if (currentSymbolRef.current === s) {
      setCurrentOrderBook(null);
      currentSymbolRef.current = null;
    }
    // Note: Global managerEntry for the symbol is not cleared here,
    // as other hook instances might still be using it.
    // A more robust cleanup might involve reference counting for global subscriptions.
  }, [getManagerEntry]); // Added getManagerEntry

  useEffect(() => {
    const depthUnsubscribe = websocketService.onDepthUpdate(handleDepthUpdate);
    // Potentially listen to websocketService errors or connection status to update hook's error/loading state
    // const errorUnsubscribe = websocketService.onError((err) => {
    //   if(currentSymbolRef.current) setError(typeof err === 'string' ? err : 'WebSocket error');
    // });

    return () => {
      depthUnsubscribe();
      // errorUnsubscribe();
      // If the component using this hook unmounts, unsubscribe from its specific symbol
      if (currentSymbolRef.current) {
        unsubscribeFromOrderBook(currentSymbolRef.current);
      }
    };
  }, [handleDepthUpdate, unsubscribeFromOrderBook]);

  // Initial subscription if symbol is provided
  useEffect(() => {
    if (symbol && !currentSymbolRef.current) {
      subscribeToOrderBook(symbol.toLowerCase());
    }
  }, [symbol, subscribeToOrderBook]);

  return { orderBook: currentOrderBook, isLoading, error, subscribeToOrderBook, unsubscribeFromOrderBook };
};