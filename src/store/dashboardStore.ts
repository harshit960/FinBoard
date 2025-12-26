import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Widget, WidgetType, WidgetConfig } from "@/types";

interface DashboardStore {
  widgets: Widget[];
  addWidget: (type: WidgetType, title: string, config?: WidgetConfig) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  reorderWidgets: (widgets: Widget[]) => void;
  clearAll: () => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      widgets: [],

      addWidget: (type, title, config = {}) => {
        const newWidget: Widget = {
          id: crypto.randomUUID(),
          type,
          title,
          config,
          position: { x: 0, y: 0 },
          size: { colSpan: 1, rowSpan: 1 },
        };
        set((state) => ({ widgets: [...state.widgets, newWidget] }));
      },

      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        }));
      },

      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
      },

      reorderWidgets: (widgets) => {
        set({ widgets });
      },

      clearAll: () => {
        set({ widgets: [] });
      },
    }),
    {
      name: "finboard-dashboard",
    }
  )
);
