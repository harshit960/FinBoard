"use client";

import { useState } from "react";
import { Header, DashboardGrid, WidgetCard, AddWidgetModal } from "@/components";
import { useDashboardStore } from "@/store";
import { WidgetType } from "@/types";

export default function Home() {
  const { widgets, addWidget, removeWidget } = useDashboardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddWidget = (type: WidgetType, title: string) => {
    addWidget(type, title);
  };

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      <Header widgetCount={widgets.length} onAddWidget={() => setIsModalOpen(true)} />

      <DashboardGrid isEmpty={widgets.length === 0}>
        {widgets.map((widget) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            onRemove={removeWidget}
          />
        ))}
      </DashboardGrid>

      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWidget}
      />
    </main>
  );
}
