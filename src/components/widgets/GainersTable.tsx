"use client";

import { useState } from "react";
import { useTopGainers } from "@/hooks";

export default function GainersTable() {
  const { data, isLoading, error } = useTopGainers(300000);
  const [search, setSearch] = useState("");

  const filtered = data.filter(
    (stock) => stock.symbol.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-muted-foreground">
        Unable to load gainers data
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:border-accent"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
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
                <td colSpan={3} className="py-4 text-center text-muted-foreground">
                  No results
                </td>
              </tr>
            ) : (
              filtered.map((stock) => (
                <tr key={stock.symbol} className="border-b border-border last:border-0">
                  <td className="py-2 font-medium">{stock.symbol}</td>
                  <td className="py-2 text-right">${stock.price.toFixed(2)}</td>
                  <td className="py-2 text-right text-accent">
                    +{stock.changePercent.toFixed(2)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {data.length} items
      </p>
    </div>
  );
}

