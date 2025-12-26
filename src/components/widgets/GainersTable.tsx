"use client";

import { useState, useMemo } from "react";
import { useTopGainers } from "@/hooks";
import { HiOutlineExclamation, HiSearch, HiTrendingUp, HiChevronLeft, HiChevronRight, HiSelector } from "react-icons/hi";

type SortField = "symbol" | "price" | "changePercent";
type SortOrder = "asc" | "desc";

export default function GainersTable() {
  const { data, isLoading, error, refetch } = useTopGainers(300000);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [sortField, setSortField] = useState<SortField>("changePercent");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [minChange, setMinChange] = useState(0);

  const processedData = useMemo(() => {
    let result = [...data];

    if (search) {
      result = result.filter((stock) =>
        stock.symbol.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (minChange > 0) {
      result = result.filter((stock) => stock.changePercent >= minChange);
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [data, search, sortField, sortOrder, minChange]);

  const totalPages = Math.ceil(processedData.length / perPage);
  const paginatedData = processedData.slice((page - 1) * perPage, page * perPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <HiSelector className={`w-3 h-3 inline ml-1 ${sortField === field ? "text-accent" : "text-muted-foreground/50"}`} />
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 bg-muted rounded-lg animate-pulse flex-1" />
          <div className="h-9 bg-muted rounded-lg animate-pulse w-24" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-11 bg-muted rounded-lg animate-pulse" />
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
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <HiSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search symbol..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>
        <select
          value={minChange}
          onChange={(e) => { setMinChange(Number(e.target.value)); setPage(1); }}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
        >
          <option value={0}>All</option>
          <option value={5}>+5%</option>
          <option value={10}>+10%</option>
          <option value={15}>+15%</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th
                onClick={() => handleSort("symbol")}
                className="px-3 py-2.5 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                Symbol<SortIcon field="symbol" />
              </th>
              <th
                onClick={() => handleSort("price")}
                className="px-3 py-2.5 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                Price<SortIcon field="price" />
              </th>
              <th
                onClick={() => handleSort("changePercent")}
                className="px-3 py-2.5 text-right font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                Change<SortIcon field="changePercent" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                  No results found
                </td>
              </tr>
            ) : (
              paginatedData.map((stock, i) => (
                <tr
                  key={stock.symbol}
                  className={`${i !== paginatedData.length - 1 ? "border-b border-border" : ""} hover:bg-muted/30 transition-colors`}
                >
                  <td className="px-3 py-2.5 font-semibold">{stock.symbol}</td>
                  <td className="px-3 py-2.5 text-right">${stock.price.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right">
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="px-2 py-1 text-xs border border-border rounded bg-background focus:outline-none cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span className="text-xs text-muted-foreground">
            {processedData.length} items
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <HiChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (page === 1) {
                pageNum = i + 1;
              } else if (page === totalPages) {
                pageNum = totalPages - 2 + i;
              } else {
                pageNum = page - 1 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 text-xs rounded transition-colors ${
                    page === pageNum
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-muted"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || totalPages === 0}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
