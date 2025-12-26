"use client";

import { Header, DashboardGrid, WidgetCard } from "@/components";
import { useDashboardStore } from "@/store";

export default function Home() {
  const { widgets, addWidget, removeWidget } = useDashboardStore();

  const handleAddWidget = () => {
    addWidget("card", `Widget ${widgets.length + 1}`);
  };

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      <Header widgetCount={widgets.length} onAddWidget={handleAddWidget} />

      <DashboardGrid isEmpty={widgets.length === 0}>
        {widgets.map((widget) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            onRemove={removeWidget}
          />
        ))}
      </DashboardGrid>
    </main>
  );
}
