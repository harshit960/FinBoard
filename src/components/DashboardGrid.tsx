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
import { HiOutlineViewGrid } from "react-icons/hi";

interface DashboardGridProps {
  widgets: Widget[];
  onReorder: (widgets: Widget[]) => void;
  onRemove: (id: string) => void;
  onEdit: (widget: Widget) => void;
  onResize: (id: string, colSpan: 1 | 2 | 3, rowSpan: 1 | 2) => void;
}

export default function DashboardGrid({ widgets, onReorder, onRemove, onEdit, onResize }: DashboardGridProps) {
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
      <div className="border-2 border-dashed border-border rounded-2xl py-20 px-8">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <HiOutlineViewGrid className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-3">No widgets yet</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Start building your dashboard by adding widgets to track stocks, view market gainers, or monitor price charts.
          </p>
          <p className="text-sm text-muted-foreground">
            Click <span className="font-medium text-foreground">&quot;Add Widget&quot;</span> to get started
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
        <div 
          className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{
            gridAutoRows: "minmax(180px, auto)",
          }}
        >
          {widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              onRemove={onRemove}
              onEdit={onEdit}
              onResize={onResize}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
