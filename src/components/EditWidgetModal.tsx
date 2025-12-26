"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { Widget, WidgetConfig } from "@/types";
import { HiOutlineTrendingUp, HiOutlineTable, HiOutlineChartBar } from "react-icons/hi";

interface EditWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  widget: Widget | null;
  onSave: (id: string, updates: { title: string; config: WidgetConfig }) => void;
}

const INTERVALS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

export default function EditWidgetModal({ isOpen, onClose, widget, onSave }: EditWidgetModalProps) {
  const [title, setTitle] = useState("");
  const [symbol, setSymbol] = useState("");
  const [chartInterval, setChartInterval] = useState<"daily" | "weekly" | "monthly">("daily");

  useEffect(() => {
    if (widget) {
      setTitle(widget.title);
      setSymbol(widget.config.symbol || "");
      setChartInterval(widget.config.chartInterval || "daily");
    }
  }, [widget]);

  if (!widget) return null;

  const needsSymbol = widget.type === "card" || widget.type === "chart";
  const isChart = widget.type === "chart";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (needsSymbol && !symbol.trim()) return;

    const config: WidgetConfig = { ...widget.config };
    if (needsSymbol) {
      config.symbol = symbol.trim().toUpperCase();
    }
    if (isChart) {
      config.chartInterval = chartInterval;
    }

    onSave(widget.id, { title: title.trim(), config });
    onClose();
  };

  const getIcon = () => {
    switch (widget.type) {
      case "card": return <HiOutlineTrendingUp className="w-5 h-5" />;
      case "table": return <HiOutlineTable className="w-5 h-5" />;
      case "chart": return <HiOutlineChartBar className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (widget.type) {
      case "card": return "Stock Card";
      case "table": return "Top Gainers Table";
      case "chart": return "Price Chart";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Widget">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl mb-5">
          <div className="text-muted-foreground">{getIcon()}</div>
          <div>
            <div className="font-medium">{getTypeLabel()}</div>
            <div className="text-xs text-muted-foreground">Widget type cannot be changed</div>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">Widget Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Apple Stock"
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        {needsSymbol && (
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Stock Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g., AAPL, MSFT, GOOGL"
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all uppercase"
            />
          </div>
        )}

        {isChart && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Time Interval</label>
            <div className="flex gap-2">
              {INTERVALS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setChartInterval(value)}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                    chartInterval === value
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || (needsSymbol && !symbol.trim())}
            className="flex-1 px-4 py-3 text-sm font-medium bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

