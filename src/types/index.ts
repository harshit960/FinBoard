export type WidgetType = "table" | "card" | "chart";

export interface WidgetConfig {
  symbol?: string;
  refreshInterval?: number;
  chartInterval?: "daily" | "weekly" | "monthly";
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface DashboardState {
  widgets: Widget[];
  isLoading: boolean;
}
