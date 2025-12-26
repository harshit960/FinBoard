"use client";

import { useState } from "react";
import { useTopGainers } from "@/hooks";

export default function GainersTable() {
  const { data, isLoading, error, refetch } = useTopGainers(300000);
  const [search, setSearch] = useState("");

  const filtered = data.filter(
    (stock) => stock.symbol.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-9 bg-muted rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground mb-3">
          Unable to load market data
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

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search symbol..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-accent"
      />

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm min-w-[280px]">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 font-medium text-muted-foreground">Symbol</th>
              <th className="pb-2 font-medium text-muted-foreground text-right">Price</th>
              <th className="pb-2 font-medium text-muted-foreground text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-muted-foreground">
                  No results found
                </td>
              </tr>
            ) : (
              filtered.map((stock) => (
                <tr key={stock.symbol} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 font-medium">{stock.symbol}</td>
                  <td className="py-2.5 text-right">${stock.price.toFixed(2)}</td>
                  <td className="py-2.5 text-right text-accent font-medium">
                    +{stock.changePercent.toFixed(2)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} of {data.length} items</span>
        <span>Updates every 5m</span>
      </div>
    </div>
  );
}
