"use client";

import { useStockQuote } from "@/hooks";

interface StockCardProps {
  symbol: string;
  refreshInterval?: number;
}

export default function StockCard({ symbol, refreshInterval = 60000 }: StockCardProps) {
  const { data, isLoading, error } = useStockQuote(symbol, refreshInterval);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-muted rounded w-20" />
        <div className="h-6 bg-muted rounded w-32" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-sm text-muted-foreground">
        Unable to load data for {symbol}
      </div>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold">${data.price.toFixed(2)}</span>
        <span className={`text-sm font-medium ${isPositive ? "text-accent" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{data.change.toFixed(2)} ({isPositive ? "+" : ""}{data.changePercent.toFixed(2)}%)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">High</span>
          <p className="font-medium">${data.high.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Low</span>
          <p className="font-medium">${data.low.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Volume</span>
          <p className="font-medium">{(data.volume / 1000000).toFixed(2)}M</p>
        </div>
      </div>
    </div>
  );
}

