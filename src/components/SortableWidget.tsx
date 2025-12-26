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
          <div className="text-sm text-muted-foreground py-4 text-center">
            No symbol configured
          </div>
        );
      case "table":
        return <GainersTable />;
      case "chart":
        return widget.config.symbol ? (
          <PriceChart symbol={widget.config.symbol} interval={widget.config.chartInterval} />
        ) : (
          <div className="text-sm text-muted-foreground py-4 text-center">
            No symbol configured
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Unknown widget type
          </div>
        );
    }
  };

  const typeLabels: Record<string, string> = {
    card: "Stock",
    table: "Table",
    chart: "Chart",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border rounded-xl shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "opacity-50 shadow-lg scale-[1.02]" : ""
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing flex-1 min-w-0"
        >
          <span className="text-muted-foreground select-none">⋮⋮</span>
          <div className="min-w-0">
            <h3 className="font-medium text-card-foreground truncate">{widget.title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{typeLabels[widget.type]}</span>
              {widget.config.symbol && (
                <>
                  <span>·</span>
                  <span>{widget.config.symbol}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemove(widget.id)}
          className="text-muted-foreground hover:text-destructive transition-colors p-1 hover:bg-muted rounded"
          title="Remove widget"
        >
          ✕
        </button>
      </div>

      <div className="p-4">{renderContent()}</div>
    </div>
  );
}
