"use client";

import { useState } from "react";
import { Header, DashboardGrid, WidgetCard } from "@/components";
import { Widget } from "@/types";

export default function Home() {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  const handleAddWidget = () => {
    const newWidget: Widget = {
      id: crypto.randomUUID(),
      type: "card",
      title: `Widget ${widgets.length + 1}`,
      config: {},
      position: { x: 0, y: 0 },
      size: { width: 1, height: 1 },
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      <Header widgetCount={widgets.length} onAddWidget={handleAddWidget} />

      <DashboardGrid isEmpty={widgets.length === 0}>
        {widgets.map((widget) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            onRemove={handleRemoveWidget}
          />
        ))}
      </DashboardGrid>
    </main>
  );
}
