"use client";

import { useState, useEffect } from "react";

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
    <header className="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">FinBoard</h1>
        <p className="text-sm text-muted-foreground">
          {widgetCount} widget{widgetCount !== 1 ? "s" : ""}
          {time && <span className="mx-1">·</span>}
          {time && <span>Updated {time}</span>}
        </p>
      </div>

      <button
        onClick={onAddWidget}
        className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
      >
        <span className="text-lg leading-none">+</span>
        Add Widget
      </button>
    </header>
  );
}
