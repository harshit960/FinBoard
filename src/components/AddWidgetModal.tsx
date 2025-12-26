"use client";

import { useState } from "react";
import Modal from "./Modal";
import { WidgetType, WidgetConfig } from "@/types";
import { HiOutlineTrendingUp, HiOutlineTable, HiOutlineChartBar, HiCheckCircle, HiOutlineClock } from "react-icons/hi";

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType, title: string, config: WidgetConfig) => void;
}

const WIDGET_TYPES: { type: WidgetType; label: string; description: string; icon: React.ReactNode; needsSymbol: boolean }[] = [
  { type: "card", label: "Stock Card", description: "Display price & stats for a stock", icon: <HiOutlineTrendingUp className="w-6 h-6" />, needsSymbol: true },
  { type: "table", label: "Top Gainers", description: "Table of top gaining stocks", icon: <HiOutlineTable className="w-6 h-6" />, needsSymbol: false },
  { type: "chart", label: "Price Chart", description: "Line chart showing price history", icon: <HiOutlineChartBar className="w-6 h-6" />, needsSymbol: true },
];

export default function AddWidgetModal({ isOpen, onClose, onAdd }: AddWidgetModalProps) {
  const [selectedType, setSelectedType] = useState<WidgetType>("card");
  const [title, setTitle] = useState("");
  const [symbol, setSymbol] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(300);

  const selectedWidget = WIDGET_TYPES.find((w) => w.type === selectedType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (selectedWidget?.needsSymbol && !symbol.trim()) return;

    const config: WidgetConfig = {
      refreshInterval: refreshInterval * 1000,
    };
    if (selectedWidget?.needsSymbol) {
      config.symbol = symbol.trim().toUpperCase();
    }

    onAdd(selectedType, title.trim(), config);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setSymbol("");
    setSelectedType("card");
    setRefreshInterval(300);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Widget">
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-sm font-medium mb-3">Widget Type</label>
          <div className="space-y-2">
            {WIDGET_TYPES.map(({ type, label, description, icon }) => (
              <label
                key={type}
                className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                  selectedType === type
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <input
                  type="radio"
                  name="widgetType"
                  value={type}
                  checked={selectedType === type}
                  onChange={() => setSelectedType(type)}
                  className="sr-only"
                />
                <div className="text-muted-foreground">{icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-muted-foreground">{description}</div>
                </div>
                {selectedType === type && (
                  <HiCheckCircle className="w-5 h-5 text-accent" />
                )}
              </label>
            ))}
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

        {selectedWidget?.needsSymbol && (
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

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Refresh Interval</label>
          <div className="relative">
            <HiOutlineClock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="number"
              min={30}
              max={3600}
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Math.max(30, parseInt(e.target.value) || 300))}
              className="w-full pl-11 pr-20 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">seconds</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Data refreshes automatically (min: 30s, default: 5min)</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || (selectedWidget?.needsSymbol && !symbol.trim())}
            className="flex-1 px-4 py-3 text-sm font-medium bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Add Widget
          </button>
        </div>
      </form>
    </Modal>
  );
}
