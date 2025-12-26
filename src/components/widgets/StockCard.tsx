"use client";

import { useStockQuote } from "@/hooks";

interface StockCardProps {
  symbol: string;
  refreshInterval?: number;
}

export default function StockCard({ symbol, refreshInterval = 60000 }: StockCardProps) {
  const { data, isLoading, error, refetch } = useStockQuote(symbol, refreshInterval);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 bg-muted rounded w-24" />
        <div className="h-5 bg-muted rounded w-36" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-3">
          Unable to load {symbol}
        </p>
        <button
          onClick={refetch}
          className="text-sm text-accent hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl font-semibold">${data.price.toFixed(2)}</span>
        <span className={`text-sm font-medium ${isPositive ? "text-accent" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{data.change.toFixed(2)} ({isPositive ? "+" : ""}{data.changePercent.toFixed(2)}%)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="bg-muted/50 rounded p-2">
          <span className="text-muted-foreground text-xs">High</span>
          <p className="font-medium">${data.high.toFixed(2)}</p>
        </div>
        <div className="bg-muted/50 rounded p-2">
          <span className="text-muted-foreground text-xs">Low</span>
          <p className="font-medium">${data.low.toFixed(2)}</p>
        </div>
        <div className="bg-muted/50 rounded p-2">
          <span className="text-muted-foreground text-xs">Vol</span>
          <p className="font-medium">{(data.volume / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Updates every {refreshInterval / 1000}s
      </p>
    </div>
  );
}
