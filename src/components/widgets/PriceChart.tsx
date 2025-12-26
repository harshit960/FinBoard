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
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface PriceChartProps {
  symbol: string;
  interval?: "daily" | "weekly" | "monthly";
}

export default function PriceChart({ symbol, interval = "daily" }: PriceChartProps) {
  const { data, isLoading, error } = useTimeSeries(symbol, interval);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-pulse bg-muted rounded w-full h-full" />
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        Unable to load chart for {symbol}
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.date.slice(5)),
    datasets: [
      {
        data: data.map((d) => d.close),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => `$${ctx.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: "#78716c",
          maxTicksLimit: 6,
          font: { size: 10 },
        },
      },
      y: {
        grid: { color: "#e7e5e4" },
        ticks: {
          color: "#78716c",
          callback: (value: number | string) => `$${value}`,
          font: { size: 10 },
        },
      },
    },
  };

  const latest = data[data.length - 1];
  const first = data[0];
  const change = ((latest.close - first.close) / first.close) * 100;
  const isPositive = change >= 0;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-semibold">${latest.close.toFixed(2)}</span>
        <span className={`text-sm ${isPositive ? "text-accent" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{change.toFixed(2)}%
        </span>
      </div>
      <div className="h-40">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

