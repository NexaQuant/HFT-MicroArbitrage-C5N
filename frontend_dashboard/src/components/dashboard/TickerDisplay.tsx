'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../contexts/WebSocketDataContext';
import { BinanceAggTradeStreamPayload } from '../../lib/types';

interface TickerDisplayProps {
  symbol: string;
}

const TickerDisplay: React.FC<TickerDisplayProps> = ({ symbol }) => {
  const { subscribe, unsubscribe, aggTrade } = useWebSocket();
  const [currentPrice, setCurrentPrice] = useState<string | null>(null);
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const streamName = `${symbol.toLowerCase()}@aggTrade`;
    subscribe([streamName]);

    return () => {
      unsubscribe([streamName]);
    };
  }, [symbol, subscribe, unsubscribe]);

  useEffect(() => {
    if (aggTrade && aggTrade.s.toLowerCase() === symbol.toLowerCase()) {
      const newPrice = aggTrade.p;
      if (currentPrice) {
        if (parseFloat(newPrice) > parseFloat(currentPrice)) {
          setPriceChange('up');
        } else if (parseFloat(newPrice) < parseFloat(currentPrice)) {
          setPriceChange('down');
        } else {
          setPriceChange(null);
        }
      } else {
        setPriceChange(null);
      }
      setCurrentPrice(newPrice);

      // Reset price change indicator after a short delay
      const timer = setTimeout(() => setPriceChange(null), 500);
      return () => clearTimeout(timer);
    }
  }, [aggTrade, symbol, currentPrice]);

  const formatPrice = (price: string | null) => {
    if (!price) return 'N/A';
    const numPrice = parseFloat(price);
    if (numPrice > 1000) return numPrice.toFixed(2);
    if (numPrice > 1) return numPrice.toFixed(4);
    return numPrice.toFixed(8);
  };

  const priceClass = priceChange === 'up' ? 'text-green-500' : priceChange === 'down' ? 'text-red-500' : 'text-white';

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-xs mx-auto text-center">
      <h2 className="text-lg font-semibold text-white mb-2">{symbol.toUpperCase()}</h2>
      <div className={`text-3xl font-bold ${priceClass}`}>
        {formatPrice(currentPrice)}
      </div>
      {aggTrade && (
        <div className="text-sm text-gray-400 mt-2">
          <p>Last Trade Qty: {parseFloat(aggTrade.q).toFixed(4)}</p>
          <p>Trade Time: {new Date(aggTrade.T).toLocaleTimeString()}</p>
        </div>
      )}
      {!currentPrice && <p className="text-gray-500 mt-2">Loading real-time data...</p>}
    </div>
  );
};

export default TickerDisplay;