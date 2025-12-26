"use client";

import { useState } from "react";
import { Header, DashboardGrid, AddWidgetModal } from "@/components";
import { useDashboardStore } from "@/store";
import { WidgetType } from "@/types";

export default function Home() {
  const { widgets, addWidget, removeWidget, reorderWidgets } = useDashboardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddWidget = (type: WidgetType, title: string) => {
    addWidget(type, title);
  };

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
