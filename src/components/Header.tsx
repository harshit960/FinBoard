"use client";

import { useState, useEffect } from "react";
import { HiPlus } from "react-icons/hi";
import { RiStockLine } from "react-icons/ri";

interface HeaderProps {
  widgetCount: number;
  onAddWidget: () => void;
}

export default function Header({ widgetCount, onAddWidget }: HeaderProps) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-start sm:items-center justify-between mb-10 flex-col sm:flex-row gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shadow-sm">
          <RiStockLine className="w-6 h-6 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">FinBoard</h1>
          <p className="text-sm text-muted-foreground">
            {widgetCount === 0 ? "No widgets" : `${widgetCount} widget${widgetCount !== 1 ? "s" : ""}`}
            {time && <span className="hidden sm:inline"> · {time}</span>}
          </p>
        </div>
      </div>

      <button
        onClick={onAddWidget}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm shadow-sm hover:bg-accent/90 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      >
        <HiPlus className="w-4 h-4" />
        Add Widget
      </button>
    </header>
  );
}
