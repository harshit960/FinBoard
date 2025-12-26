"use client";

import { useState } from "react";
import { useTopGainers } from "@/hooks";
import { HiOutlineExclamation, HiSearch, HiTrendingUp } from "react-icons/hi";

export default function GainersTable() {
  const { data, isLoading, error, refetch } = useTopGainers(300000);
  const [search, setSearch] = useState("");

  const filtered = data.filter(
    (stock) => stock.symbol.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-11 bg-muted rounded-lg animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <HiOutlineExclamation className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-3">Unable to load market data</p>
        <button onClick={refetch} className="text-sm text-accent hover:underline font-medium">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <HiSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search symbol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Symbol</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Change</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No results found
                </td>
              </tr>
            ) : (
              filtered.slice(0, 6).map((stock, i) => (
                <tr key={stock.symbol} className={`${i !== filtered.length - 1 && i !== 5 ? "border-b border-border" : ""} hover:bg-muted/30 transition-colors`}>
                  <td className="px-4 py-3 font-semibold">{stock.symbol}</td>
                  <td className="px-4 py-3 text-right">${stock.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-accent font-medium">
                      <HiTrendingUp className="w-3 h-3" />
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{Math.min(filtered.length, 6)} of {data.length} gainers</span>
      </div>
    </div>
  );
}
