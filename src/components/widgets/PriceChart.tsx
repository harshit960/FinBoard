"use client";

import { useTimeSeries } from "@/hooks";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  TooltipItem,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface PriceChartProps {
  symbol: string;
  interval?: "daily" | "weekly" | "monthly";
}

export default function PriceChart({ symbol, interval = "daily" }: PriceChartProps) {
  const { data, isLoading, error, refetch } = useTimeSeries(symbol, interval);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-7 bg-muted rounded w-28 animate-pulse" />
        <div className="h-40 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center">
        <p className="text-sm text-muted-foreground mb-3">
          Unable to load chart for {symbol}
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

  const latest = data[data.length - 1];
  const first = data[0];
  const change = ((latest.close - first.close) / first.close) * 100;
  const isPositive = change >= 0;

  const chartData = {
    labels: data.map((d) => d.date.slice(5)),
    datasets: [
      {
        data: data.map((d) => d.close),
        borderColor: isPositive ? "#16a34a" : "#dc2626",
        backgroundColor: isPositive ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)",
        fill: true,
        tension: 0.3,
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
        backgroundColor: "#1c1917",
        titleColor: "#fafaf9",
        bodyColor: "#fafaf9",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: TooltipItem<"line">) => {
            const value = ctx.parsed.y;
            return value !== null ? `$${value.toFixed(2)}` : "";
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#78716c",
          maxTicksLimit: 5,
          font: { size: 10 },
        },
        border: { display: false },
      },
      y: {
        grid: { color: "#f5f5f4" },
        ticks: {
          color: "#78716c",
          callback: (value) => `$${value}`,
          font: { size: 10 },
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xl font-semibold">${latest.close.toFixed(2)}</span>
        <span className={`text-sm font-medium ${isPositive ? "text-accent" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{change.toFixed(2)}%
        </span>
        <span className="text-xs text-muted-foreground">30 days</span>
      </div>
      <div className="h-36">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
