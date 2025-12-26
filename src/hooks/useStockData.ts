import { useState, useEffect, useCallback, useRef } from "react";
import { getStockQuote, getTimeSeries, getTopGainers, StockQuote, TimeSeriesData } from "@/services";

const RETRY_DELAY = 3000;
const MAX_RETRIES = 3;

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
  const retryCount = useRef(0);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (isRetry = false) => {
    if (!symbol) return;
    setIsLoading(true);
    if (!isRetry) {
      setError(null);
      retryCount.current = 0;
    }

    const result = await getStockQuote(symbol);
    if (result) {
      setData(result);
      setError(null);
      retryCount.current = 0;
    } else {
      setError("Failed to fetch data");
      // Auto-retry after 3s if under max retries
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        retryTimeout.current = setTimeout(() => fetchData(true), RETRY_DELAY);
      }
    }
    setIsLoading(false);
  }, [symbol]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(() => fetchData(), refreshInterval);
      return () => {
        clearInterval(interval);
        if (retryTimeout.current) clearTimeout(retryTimeout.current);
      };
    }

    return () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refetch: () => fetchData() };
}

interface UseTimeSeriesResult {
  data: TimeSeriesData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTimeSeries(
  symbol: string,
  interval: "daily" | "weekly" | "monthly" = "daily",
  refreshInterval?: number
): UseTimeSeriesResult {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (isRetry = false) => {
    if (!symbol) return;
    setIsLoading(true);
    if (!isRetry) {
      setError(null);
      retryCount.current = 0;
    }

    const result = await getTimeSeries(symbol, interval);
    if (result.length > 0) {
      setData(result);
      setError(null);
      retryCount.current = 0;
    } else {
      setError("Failed to fetch data");
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        retryTimeout.current = setTimeout(() => fetchData(true), RETRY_DELAY);
      }
    }
    setIsLoading(false);
  }, [symbol, interval]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const timer = setInterval(() => fetchData(), refreshInterval);
      return () => {
        clearInterval(timer);
        if (retryTimeout.current) clearTimeout(retryTimeout.current);
      };
    }

    return () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refetch: () => fetchData() };
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
  const retryCount = useRef(0);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (isRetry = false) => {
    setIsLoading(true);
    if (!isRetry) {
      setError(null);
      retryCount.current = 0;
    }

    const result = await getTopGainers();
    if (result.length > 0) {
      setData(result);
      setError(null);
      retryCount.current = 0;
    } else {
      setError("Failed to fetch data");
      if (retryCount.current < MAX_RETRIES) {
        retryCount.current++;
        retryTimeout.current = setTimeout(() => fetchData(true), RETRY_DELAY);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(() => fetchData(), refreshInterval);
      return () => {
        clearInterval(interval);
        if (retryTimeout.current) clearTimeout(retryTimeout.current);
      };
    }

    return () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
  }, [fetchData, refreshInterval]);

  return { data, isLoading, error, refetch: () => fetchData() };
}
