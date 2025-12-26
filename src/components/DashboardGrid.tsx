"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Widget } from "@/types";
import SortableWidget from "./SortableWidget";

interface DashboardGridProps {
  widgets: Widget[];
  onReorder: (widgets: Widget[]) => void;
  onRemove: (id: string) => void;
}

export default function DashboardGrid({ widgets, onReorder, onRemove }: DashboardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      onReorder(arrayMove(widgets, oldIndex, newIndex));
    }
  };

  if (widgets.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-xl p-12 md:p-16 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="font-medium mb-2">No widgets yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first widget to start tracking stocks, view market gainers, or monitor price charts.
          </p>
          <p className="text-xs text-muted-foreground">
            Click the "Add Widget" button above to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
