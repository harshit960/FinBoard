import { useState, useEffect, useCallback } from "react";
import { getStockQuote, getTimeSeries, getTopGainers, StockQuote, TimeSeriesData } from "@/services";

interface UseStockQuoteResult {
  data: StockQuote | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStockQuote(symbol: string, refreshInterval?: number): UseStockQuoteResult {
  const [data, setData] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);

    const result = await getStockQuote(symbol);
    if (result) {
      setData(result);
    } else {
      setError("Failed to fetch data");
    }
    setIsLoading(false);
  }, [symbol]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refetch: fetchData };
}

interface UseTimeSeriesResult {
  data: TimeSeriesData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTimeSeries(
  symbol: string,
  interval: "daily" | "weekly" | "monthly" = "daily"
): UseTimeSeriesResult {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);

    const result = await getTimeSeries(symbol, interval);
    if (result.length > 0) {
      setData(result);
    } else {
      setError("Failed to fetch data");
    }
    setIsLoading(false);
  }, [symbol, interval]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

interface UseTopGainersResult {
  data: StockQuote[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTopGainers(refreshInterval?: number): UseTopGainersResult {
  const [data, setData] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getTopGainers();
    if (result.length > 0) {
      setData(result);
    } else {
      setError("Failed to fetch data");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refetch: fetchData };
}

