import React, { useEffect, useState } from 'react';
import { useOrderBook } from '../hooks/useOrderBook';
import { API_CONFIG, UI_CONFIG } from '../config';

interface OrderBookDisplayProps {
  symbol: string;
}

const OrderBookDisplay: React.FC<OrderBookDisplayProps> = ({ symbol }) => {
  const { orderBook, isLoading, error, subscribeToOrderBook, unsubscribeFromOrderBook } = useOrderBook(symbol.toLowerCase());
  const [displayLevels, setDisplayLevels] = useState(UI_CONFIG.ORDER_BOOK_DISPLAY_LEVELS);

  useEffect(() => {
    subscribeToOrderBook(symbol);
    return () => {
      unsubscribeFromOrderBook(symbol);
    };
  }, [symbol, subscribeToOrderBook, unsubscribeFromOrderBook]);

  if (isLoading && !orderBook) {
    return <div className="p-4 text-center text-gray-500">Loading order book for {symbol.toUpperCase()}...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading order book: {error}</div>;
  }

  if (!orderBook) {
    return <div className="p-4 text-center text-gray-500">No order book data available for {symbol.toUpperCase()}.</div>;
  }

  // Sort bids (descending) and asks (ascending) by price
  const sortedBids = Array.from(orderBook.bids.entries())
    .map(([price, quantity]) => ({ price: parseFloat(price), quantity: parseFloat(quantity) }))
    .sort((a, b) => b.price - a.price)
    .slice(0, displayLevels);

  const sortedAsks = Array.from(orderBook.asks.entries())
    .map(([price, quantity]) => ({ price: parseFloat(price), quantity: parseFloat(quantity) }))
    .sort((a, b) => a.price - b.price)
    .slice(0, displayLevels);

  const maxCumulativeSize = Math.max(
    sortedBids.reduce((acc, curr) => acc + curr.quantity, 0),
    sortedAsks.reduce((acc, curr) => acc + curr.quantity, 0)
  );

  const formatPrice = (price: number) => {
    // Determine precision based on price magnitude, e.g., BTC vs SHIB
    if (price > 1000) return price.toFixed(2);
    if (price > 1) return price.toFixed(4);
    return price.toFixed(8);
  }

  const formatQuantity = (quantity: number) => {
    return quantity.toFixed(API_CONFIG.ORDER_BOOK_SNAPSHOT_LIMIT > 500 ? 2 : 4); // Adjust precision based on typical quantities
  }

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-3 text-center">
        Order Book: {symbol.toUpperCase()}
      </h2>
      <div className="text-xs text-gray-400 mb-2 text-center">
        Last Update ID: {orderBook.lastUpdateId} (Timestamp: {new Date(orderBook.timestamp).toLocaleTimeString()})
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-medium mb-2 text-green-400 text-center">Bids</h3>
          <div className="space-y-1 text-xs">
            <div className="grid grid-cols-3 font-semibold text-gray-400 px-1">
              <span>Price (USD)</span>
              <span className="text-right">Quantity</span>
              <span className="text-right">Total</span>
            </div>
            {sortedBids.map(({ price, quantity }, index) => {
              const cumulativeSize = sortedBids.slice(0, index + 1).reduce((acc, curr) => acc + curr.quantity, 0);
              const barWidth = (cumulativeSize / maxCumulativeSize) * 100;
              return (
                <div key={`bid-${price}`} className="grid grid-cols-3 items-center relative p-1 rounded hover:bg-gray-700">
                  <div className="absolute left-0 top-0 h-full bg-green-500 opacity-20 rounded" style={{ width: `${barWidth}%` }}></div>
                  <span className="text-green-400 z-10">{formatPrice(price)}</span>
                  <span className="text-right z-10">{formatQuantity(quantity)}</span>
                  <span className="text-right z-10">{formatQuantity(cumulativeSize)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2 text-red-400 text-center">Asks</h3>
          <div className="space-y-1 text-xs">
            <div className="grid grid-cols-3 font-semibold text-gray-400 px-1">
              <span>Price (USD)</span>
              <span className="text-right">Quantity</span>
              <span className="text-right">Total</span>
            </div>
            {sortedAsks.map(({ price, quantity }, index) => {
              const cumulativeSize = sortedAsks.slice(0, index + 1).reduce((acc, curr) => acc + curr.quantity, 0);
              const barWidth = (cumulativeSize / maxCumulativeSize) * 100;
              return (
                <div key={`ask-${price}`} className="grid grid-cols-3 items-center relative p-1 rounded hover:bg-gray-700">
                  <div className="absolute right-0 top-0 h-full bg-red-500 opacity-20 rounded" style={{ width: `${barWidth}%` }}></div>
                  <span className="text-red-400 z-10">{formatPrice(price)}</span>
                  <span className="text-right z-10">{formatQuantity(quantity)}</span>
                  <span className="text-right z-10">{formatQuantity(cumulativeSize)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <label htmlFor="displayLevels" className="mr-2 text-sm text-gray-300">Display Levels:</label>
        <select 
          id="displayLevels" 
          value={displayLevels} 
          onChange={(e) => setDisplayLevels(parseInt(e.target.value, 10))}
          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[5, 10, 15, 20, 25].map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default OrderBookDisplay;