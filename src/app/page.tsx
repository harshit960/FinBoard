"use client";

import { useState } from "react";
import { Header, DashboardGrid, AddWidgetModal } from "@/components";
import { useDashboardStore } from "@/store";
import { useHydration } from "@/hooks";
import { WidgetType, WidgetConfig } from "@/types";

export default function Home() {
  const hydrated = useHydration();
  const { widgets, addWidget, removeWidget, reorderWidgets } = useDashboardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddWidget = (type: WidgetType, title: string, config: WidgetConfig) => {
    addWidget(type, title, config);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <Header widgetCount={widgets.length} onAddWidget={() => setIsModalOpen(true)} />

        <DashboardGrid
          widgets={widgets}
          onReorder={reorderWidgets}
          onRemove={removeWidget}
        />
      </div>

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWidget}
      />
    </div>
  );
}
