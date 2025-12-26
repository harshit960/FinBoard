"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Widget } from "@/types";
import { StockCard, GainersTable, PriceChart } from "./widgets";
import { HiX, HiOutlineDotsVertical, HiPencil } from "react-icons/hi";

interface SortableWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
  onEdit: (widget: Widget) => void;
}

export default function SortableWidget({ widget, onRemove, onEdit }: SortableWidgetProps) {
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
          <div className="text-sm text-muted-foreground py-8 text-center">
            No symbol configured
          </div>
        );
      case "table":
        return <GainersTable />;
      case "chart":
        return widget.config.symbol ? (
          <PriceChart symbol={widget.config.symbol} interval={widget.config.chartInterval} />
        ) : (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No symbol configured
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground py-8 text-center">
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
      className={`bg-card border border-border rounded-xl shadow-sm transition-all ${
        isDragging ? "opacity-60 shadow-xl scale-[1.02] rotate-1" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-3 cursor-grab active:cursor-grabbing flex-1 min-w-0"
        >
          <HiOutlineDotsVertical className="w-5 h-5 text-muted-foreground/50" />
          <div className="min-w-0">
            <h3 className="font-semibold text-card-foreground truncate">{widget.title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="px-1.5 py-0.5 bg-muted rounded">{typeLabels[widget.type]}</span>
              {widget.config.symbol && <span>{widget.config.symbol}</span>}
              {widget.type === "chart" && widget.config.chartInterval && (
                <span className="capitalize">{widget.config.chartInterval}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => onEdit(widget)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-2 rounded-lg"
            title="Edit widget"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(widget.id)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors p-2 rounded-lg"
            title="Remove widget"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5">{renderContent()}</div>
    </div>
  );
}
