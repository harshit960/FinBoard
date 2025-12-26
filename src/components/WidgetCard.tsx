"use client";

import { Widget } from "@/types";

interface WidgetCardProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

export default function WidgetCard({ widget, onRemove }: WidgetCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-card-foreground">{widget.title}</h3>
        <button
          onClick={() => onRemove(widget.id)}
          className="text-muted-foreground hover:text-destructive transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      <div className="text-sm text-muted-foreground">
        Widget content goes here
      </div>
    </div>
  );
}

