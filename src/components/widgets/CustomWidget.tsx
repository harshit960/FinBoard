"use client";

import { useState, useEffect, useCallback } from "react";
import { CustomApiConfig } from "@/types";
import { HiOutlineExclamation, HiOutlineRefresh } from "react-icons/hi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface CustomWidgetProps {
  config: CustomApiConfig;
  refreshInterval?: number;
}

function getValueByPath(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    if (Array.isArray(current)) {
      const index = parseInt(key);
      if (isNaN(index)) return undefined;
      current = current[index];
    } else {
      current = (current as Record<string, unknown>)[key];
    }
  }
  return current;
}

function formatValue(value: unknown, format?: string): string {
  if (value === null || value === undefined) return "—";

  if (typeof value === "number") {
    if (format === "currency") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
    }
    if (format === "percent") {
      return `${value.toFixed(2)}%`;
    }
    if (Number.isInteger(value)) {
      return new Intl.NumberFormat("en-US").format(value);
    }
    return value.toFixed(2);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function CardView({ data, config }: { data: unknown; config: CustomApiConfig }) {
  // Get the data source - if arrayPath is set, get that item
  let sourceData = data;
  
  if (config.arrayPath && config.arrayPath.length > 0) {
    const arrayData = getValueByPath(data, config.arrayPath);
    if (Array.isArray(arrayData) && arrayData.length > 0) {
      const index = config.itemIndex ?? 0;
      sourceData = arrayData[Math.min(index, arrayData.length - 1)];
    }
  }

  return (
    <div className="space-y-3">
      {config.fields.map((field) => {
        // For card view, field.path contains just the field name
        const value = typeof sourceData === "object" && sourceData !== null
          ? (sourceData as Record<string, unknown>)[field.label]
          : undefined;
        return (
          <div key={field.label} className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">{field.label}</span>
            <span className="font-semibold">{formatValue(value, field.format)}</span>
          </div>
        );
      })}
    </div>
  );
}

function TableView({ data, config }: { data: unknown; config: CustomApiConfig }) {
  const arrayData = config.arrayPath ? getValueByPath(data, config.arrayPath) : data;

  if (!Array.isArray(arrayData) || arrayData.length === 0) {
    return <div className="text-sm text-muted-foreground text-center py-4">No data available</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            {config.fields.map((field) => (
              <th key={field.label} className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {arrayData.slice(0, 10).map((item, index) => (
            <tr key={index} className={`${index !== arrayData.length - 1 && index !== 9 ? "border-b border-border" : ""} hover:bg-muted/30 transition-colors`}>
              {config.fields.map((field) => {
                const value = typeof item === "object" && item !== null
                  ? (item as Record<string, unknown>)[field.label]
                  : undefined;
                return (
                  <td key={field.label} className="px-3 py-2.5">
                    {formatValue(value, field.format)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {arrayData.length > 10 && (
        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
          Showing 10 of {arrayData.length} items
        </div>
      )}
    </div>
  );
}

function ChartView({ data, config }: { data: unknown; config: CustomApiConfig }) {
  const arrayData = config.arrayPath ? getValueByPath(data, config.arrayPath) : data;

  if (!Array.isArray(arrayData) || arrayData.length === 0 || !config.chartConfig) {
    return <div className="text-sm text-muted-foreground text-center py-4">No chart data available</div>;
  }

  const xField = config.chartConfig.xAxisLabel || "x";
  const yField = config.chartConfig.yAxisLabel || "y";

  const labels = arrayData.map((item) => {
    const val = typeof item === "object" && item !== null
      ? (item as Record<string, unknown>)[xField]
      : "";
    return String(val).slice(0, 10);
  });

  const values = arrayData.map((item) => {
    const val = typeof item === "object" && item !== null
      ? (item as Record<string, unknown>)[yField]
      : 0;
    return typeof val === "number" ? val : parseFloat(String(val)) || 0;
  });

  const first = values[0] || 0;
  const last = values[values.length - 1] || 0;
  const isPositive = last >= first;

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: isPositive ? "#059669" : "#dc2626",
        backgroundColor: isPositive ? "rgba(5, 150, 105, 0.08)" : "rgba(220, 38, 38, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1a1a",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b6b6b", maxTicksLimit: 5, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: "#f3f3f3" },
        ticks: { color: "#6b6b6b", font: { size: 11 } },
        border: { display: false },
      },
    },
  };

  const change = first !== 0 ? ((last - first) / first) * 100 : 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{formatValue(last, "number")}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{yField}</span>
        </div>
        <div className={`text-sm font-medium mt-1 ${isPositive ? "text-accent" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{change.toFixed(2)}%
        </div>
      </div>
      <div className="h-40">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default function CustomWidget({ config, refreshInterval = 300000 }: CustomWidgetProps) {
  const [data, setData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildFetchUrl = useCallback(() => {
    if (config.auth.type === "query_param" && config.auth.key && config.auth.value) {
      const url = new URL(config.url);
      url.searchParams.set(config.auth.key, config.auth.value);
      return url.toString();
    }
    return config.url;
  }, [config.url, config.auth]);

  const buildFetchHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = {};
    if (config.auth.type === "header" && config.auth.key && config.auth.value) {
      headers[config.auth.key] = config.auth.value;
    }
    if (config.auth.type === "bearer" && config.auth.value) {
      headers["Authorization"] = `Bearer ${config.auth.value}`;
    }
    return headers;
  }, [config.auth]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildFetchUrl(), {
        headers: buildFetchHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setIsLoading(false);
    }
  }, [buildFetchUrl, buildFetchHeaders]);

  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  if (isLoading && !data) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-muted rounded w-20 animate-pulse" />
            <div className="h-5 bg-muted rounded w-24 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <HiOutlineExclamation className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-2">{error}</p>
        <button
          onClick={fetchData}
          className="text-sm text-accent hover:underline font-medium inline-flex items-center gap-1"
        >
          <HiOutlineRefresh className="w-3 h-3" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {config.displayType === "card" && <CardView data={data} config={config} />}
      {config.displayType === "table" && <TableView data={data} config={config} />}
      {config.displayType === "chart" && <ChartView data={data} config={config} />}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-3">
          <HiOutlineRefresh className="w-3 h-3 animate-spin" />
          Refreshing...
        </div>
      )}
    </div>
  );
}
