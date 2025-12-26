"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Widget } from "@/types";
import { StockCard, GainersTable, PriceChart } from "./widgets";

interface SortableWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

export default function SortableWidget({ widget, onRemove }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderContent = () => {
    switch (widget.type) {
      case "card":
        return widget.config.symbol ? (
          <StockCard symbol={widget.config.symbol} />
        ) : (
          <div className="text-sm text-muted-foreground">No symbol configured</div>
        );
      case "table":
        return <GainersTable />;
      case "chart":
        return widget.config.symbol ? (
          <PriceChart symbol={widget.config.symbol} interval={widget.config.chartInterval} />
        ) : (
          <div className="text-sm text-muted-foreground">No symbol configured</div>
        );
      default:
        return <div className="text-sm text-muted-foreground">Unknown widget type</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border rounded-lg shadow-sm ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
        >
          <span className="text-muted-foreground">⋮⋮</span>
          <h3 className="font-medium text-card-foreground">{widget.title}</h3>
          {widget.config.symbol && (
            <span className="text-xs text-muted-foreground">({widget.config.symbol})</span>
          )}
        </div>
        <button
          onClick={() => onRemove(widget.id)}
          className="text-muted-foreground hover:text-destructive transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      <div className="p-4">{renderContent()}</div>
    </div>
  );
}
