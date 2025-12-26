"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Header, DashboardGrid } from "@/components";
import { useDashboardStore } from "@/store";
import { useHydration } from "@/hooks";
import { Widget, WidgetType, WidgetConfig } from "@/types";

// Lazy load modals - only loaded when opened
const AddWidgetModal = dynamic(() => import("@/components/AddWidgetModal"), {
  loading: () => null,
  ssr: false,
});

const EditWidgetModal = dynamic(() => import("@/components/EditWidgetModal"), {
  loading: () => null,
  ssr: false,
});

export default function Home() {
  const hydrated = useHydration();
  const { widgets, addWidget, removeWidget, updateWidget, reorderWidgets } = useDashboardStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);

  const handleAddWidget = (type: WidgetType, title: string, config: WidgetConfig) => {
    addWidget(type, title, config);
  };

  const handleEditWidget = (id: string, updates: { title: string; config: WidgetConfig }) => {
    updateWidget(id, updates);
  };

  const handleResizeWidget = (id: string, colSpan: 1 | 2 | 3, rowSpan: 1 | 2) => {
    updateWidget(id, { size: { colSpan, rowSpan } });
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
      <div className="max-w-7xl mx-auto">
        <Header widgetCount={widgets.length} onAddWidget={() => setIsAddModalOpen(true)} />

        <DashboardGrid
          widgets={widgets}
          onReorder={reorderWidgets}
          onRemove={removeWidget}
          onEdit={setEditingWidget}
          onResize={handleResizeWidget}
        />
      </div>

      {/* Modals are lazy loaded */}
      {isAddModalOpen && (
        <Suspense fallback={null}>
          <AddWidgetModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddWidget}
          />
        </Suspense>
      )}

      {editingWidget && (
        <Suspense fallback={null}>
          <EditWidgetModal
            isOpen={!!editingWidget}
            onClose={() => setEditingWidget(null)}
            widget={editingWidget}
            onSave={handleEditWidget}
          />
        </Suspense>
      )}
    </div>
  );
}
