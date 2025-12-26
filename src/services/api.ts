const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || "demo";
const BASE_URL = "https://www.alphavantage.co/query";

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

export interface TimeSeriesData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const res = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = await res.json();

    if (data["Note"] || data["Information"]) {
      console.warn("API rate limit reached");
      return null;
    }

    const quote = data["Global Quote"];
    if (!quote || Object.keys(quote).length === 0) return null;

    return {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"]?.replace("%", "")),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      volume: parseInt(quote["06. volume"]),
    };
  } catch (error) {
    console.error("Failed to fetch quote:", error);
    return null;
  }
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  try {
    const res = await fetch(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
    );
    const data = await res.json();

    if (data["Note"] || data["Information"]) {
      console.warn("API rate limit reached");
      return [];
    }

    const matches = data["bestMatches"] || [];
    return matches.map((m: Record<string, string>) => ({
      symbol: m["1. symbol"],
      name: m["2. name"],
      type: m["3. type"],
      region: m["4. region"],
    }));
  } catch (error) {
    console.error("Failed to search stocks:", error);
    return [];
  }
}

export async function getTimeSeries(
  symbol: string,
  interval: "daily" | "weekly" | "monthly" = "daily"
): Promise<TimeSeriesData[]> {
  const functionMap = {
    daily: "TIME_SERIES_DAILY",
    weekly: "TIME_SERIES_WEEKLY",
    monthly: "TIME_SERIES_MONTHLY",
  };

  const keyMap = {
    daily: "Time Series (Daily)",
    weekly: "Weekly Time Series",
    monthly: "Monthly Time Series",
  };

  try {
    const res = await fetch(
      `${BASE_URL}?function=${functionMap[interval]}&symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = await res.json();

    if (data["Note"] || data["Information"]) {
      console.warn("API rate limit reached");
      return [];
    }

    const timeSeries = data[keyMap[interval]];
    if (!timeSeries) return [];

    return Object.entries(timeSeries)
      .slice(0, 30)
      .map(([date, values]) => {
        const v = values as Record<string, string>;
        return {
          date,
          open: parseFloat(v["1. open"]),
          high: parseFloat(v["2. high"]),
          low: parseFloat(v["3. low"]),
          close: parseFloat(v["4. close"]),
          volume: parseInt(v["5. volume"]),
        };
      })
      .reverse();
  } catch (error) {
    console.error("Failed to fetch time series:", error);
    return [];
  }
}

export async function getTopGainers(): Promise<StockQuote[]> {
  try {
    const res = await fetch(
      `${BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`
    );
    const data = await res.json();

    if (data["Note"] || data["Information"]) {
      console.warn("API rate limit reached");
      return [];
    }

    const gainers = data["top_gainers"] || [];
    return gainers.slice(0, 10).map((g: Record<string, string>) => ({
      symbol: g["ticker"],
      price: parseFloat(g["price"]),
      change: parseFloat(g["change_amount"]),
      changePercent: parseFloat(g["change_percentage"]?.replace("%", "")),
      high: 0,
      low: 0,
      volume: parseInt(g["volume"]),
    }));
  } catch (error) {
    console.error("Failed to fetch top gainers:", error);
    return [];
  }
}

