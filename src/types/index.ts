export type WidgetType = "table" | "card" | "chart";

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface WidgetConfig {
  apiEndpoint?: string;
  refreshInterval?: number;
  fields?: string[];
  chartType?: "line" | "candle";
}

export interface DashboardState {
  widgets: Widget[];
  isLoading: boolean;
}

