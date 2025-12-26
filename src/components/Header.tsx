"use client";

interface HeaderProps {
  widgetCount: number;
  onAddWidget: () => void;
}

export default function Header({ widgetCount, onAddWidget }: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">FinBoard</h1>
        <p className="text-sm text-muted-foreground">
          {widgetCount} active widget{widgetCount !== 1 ? "s" : ""} · Real-time data
        </p>
      </div>

      <button
        onClick={onAddWidget}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
      >
        <span className="text-lg leading-none">+</span>
        Add Widget
      </button>
    </header>
  );
}

