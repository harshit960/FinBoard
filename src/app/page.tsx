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
      <main className="min-h-screen p-6 max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">FinBoard</h1>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      <Header widgetCount={widgets.length} onAddWidget={() => setIsModalOpen(true)} />

      <DashboardGrid
        widgets={widgets}
        onReorder={reorderWidgets}
        onRemove={removeWidget}
      />

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWidget}
      />
    </main>
  );
}
