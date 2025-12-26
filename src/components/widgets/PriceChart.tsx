"use client";

import { useTimeSeries } from "@/hooks";
import { HiOutlineExclamation, HiTrendingUp, HiTrendingDown } from "react-icons/hi";
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
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded-lg w-32 animate-pulse" />
        <div className="h-44 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="h-52 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <HiOutlineExclamation className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-3">Unable to load chart for {symbol}</p>
        <button onClick={refetch} className="text-sm text-accent hover:underline font-medium">
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
          color: "#6b6b6b",
          maxTicksLimit: 5,
          font: { size: 11 },
        },
        border: { display: false },
      },
      y: {
        grid: { color: "#f3f3f3" },
        ticks: {
          color: "#6b6b6b",
          callback: (value) => `$${value}`,
          font: { size: 11 },
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold">${latest.close.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">30d</span>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isPositive ? "text-accent" : "text-destructive"}`}>
          {isPositive ? <HiTrendingUp className="w-4 h-4" /> : <HiTrendingDown className="w-4 h-4" />}
          <span className="font-semibold">{isPositive ? "+" : ""}{change.toFixed(2)}%</span>
        </div>
      </div>
      <div className="h-40">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
