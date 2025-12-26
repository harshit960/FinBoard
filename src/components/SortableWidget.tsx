"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Widget } from "@/types";

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
        </div>
        <button
          onClick={() => onRemove(widget.id)}
          className="text-muted-foreground hover:text-destructive transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      <div className="p-4 text-sm text-muted-foreground min-h-[120px]">
        <span className="inline-block px-2 py-1 bg-muted rounded text-xs">
          {widget.type}
        </span>
      </div>
    </div>
  );
}

