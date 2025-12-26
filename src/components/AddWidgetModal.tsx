"use client";

import { useState } from "react";
import Modal from "./Modal";
import { WidgetType } from "@/types";

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType, title: string) => void;
}

const WIDGET_TYPES: { type: WidgetType; label: string; description: string }[] = [
  { type: "card", label: "Finance Card", description: "Display key metrics and stats" },
  { type: "table", label: "Data Table", description: "Paginated list with search & filters" },
  { type: "chart", label: "Chart", description: "Line or candlestick price charts" },
];

export default function AddWidgetModal({ isOpen, onClose, onAdd }: AddWidgetModalProps) {
  const [selectedType, setSelectedType] = useState<WidgetType>("card");
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(selectedType, title.trim());
    setTitle("");
    setSelectedType("card");
    onClose();
  };

  const handleClose = () => {
    setTitle("");
    setSelectedType("card");
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

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Widget Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., My Watchlist"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
        </div>

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
            disabled={!title.trim()}
            className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Widget
          </button>
        </div>
      </form>
    </Modal>
  );
}

