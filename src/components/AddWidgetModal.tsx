"use client";

import { useState } from "react";
import Modal from "./Modal";
import { WidgetType, WidgetConfig } from "@/types";

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType, title: string, config: WidgetConfig) => void;
}

const WIDGET_TYPES: { type: WidgetType; label: string; description: string; needsSymbol: boolean }[] = [
  { type: "card", label: "Stock Card", description: "Display price & stats for a stock", needsSymbol: true },
  { type: "table", label: "Top Gainers", description: "Table of top gaining stocks", needsSymbol: false },
  { type: "chart", label: "Price Chart", description: "Line chart showing price history", needsSymbol: true },
];

export default function AddWidgetModal({ isOpen, onClose, onAdd }: AddWidgetModalProps) {
  const [selectedType, setSelectedType] = useState<WidgetType>("card");
  const [title, setTitle] = useState("");
  const [symbol, setSymbol] = useState("");

  const selectedWidget = WIDGET_TYPES.find((w) => w.type === selectedType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (selectedWidget?.needsSymbol && !symbol.trim()) return;

    const config: WidgetConfig = {};
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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Widget">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Widget Type</label>
          <div className="space-y-2">
            {WIDGET_TYPES.map(({ type, label, description }) => (
              <label
                key={type}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedType === type
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="widgetType"
                  value={type}
                  checked={selectedType === type}
                  onChange={() => setSelectedType(type)}
                  className="mt-1 accent-accent"
                />
                <div>
                  <div className="font-medium text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Widget Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Apple Stock"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>

        {selectedWidget?.needsSymbol && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Stock Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g., AAPL, MSFT, GOOGL"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent uppercase"
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || (selectedWidget?.needsSymbol && !symbol.trim())}
            className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Widget
          </button>
        </div>
      </form>
    </Modal>
  );
}
