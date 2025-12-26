"use client";

import { useStockQuote } from "@/hooks";
import { HiOutlineExclamation, HiTrendingUp, HiTrendingDown } from "react-icons/hi";

interface StockCardProps {
  symbol: string;
  refreshInterval?: number;
}

export default function StockCard({ symbol, refreshInterval = 60000 }: StockCardProps) {
  const { data, isLoading, error, refetch } = useStockQuote(symbol, refreshInterval);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-9 bg-muted rounded-lg w-28" />
        <div className="h-5 bg-muted rounded-lg w-40" />
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="h-16 bg-muted rounded-lg" />
          <div className="h-16 bg-muted rounded-lg" />
          <div className="h-16 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <HiOutlineExclamation className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-3">Unable to load {symbol}</p>
        <button onClick={refetch} className="text-sm text-accent hover:underline font-medium">
          Try again
        </button>
      </div>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-3xl font-bold">${data.price.toFixed(2)}</span>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isPositive ? "text-accent" : "text-destructive"}`}>
          {isPositive ? <HiTrendingUp className="w-4 h-4" /> : <HiTrendingDown className="w-4 h-4" />}
          <span className="font-semibold">
            {isPositive ? "+" : ""}{data.change.toFixed(2)} ({isPositive ? "+" : ""}{data.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <span className="text-xs text-muted-foreground block mb-1">High</span>
          <p className="font-semibold">${data.high.toFixed(2)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <span className="text-xs text-muted-foreground block mb-1">Low</span>
          <p className="font-semibold">${data.low.toFixed(2)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <span className="text-xs text-muted-foreground block mb-1">Volume</span>
          <p className="font-semibold">{(data.volume / 1000000).toFixed(1)}M</p>
        </div>
      </div>
    </div>
  );
}
