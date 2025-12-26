export type WidgetType = "table" | "card" | "chart" | "custom";

export type AuthType = "none" | "query_param" | "header" | "bearer";

export type DisplayType = "card" | "table" | "chart";

export interface AuthConfig {
  type: AuthType;
  key?: string;
  value?: string;
}

export interface FieldMapping {
  path: string[];
  label: string;
  format?: "text" | "currency" | "percent" | "number";
}

export interface ChartConfig {
  xAxisPath: string[];
  yAxisPath: string[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface CustomApiConfig {
  url: string;
  auth: AuthConfig;
  displayType: DisplayType;
  fields: FieldMapping[];
  arrayPath?: string[];
  chartConfig?: ChartConfig;
}

export interface WidgetConfig {
  symbol?: string;
  refreshInterval?: number;
  chartInterval?: "daily" | "weekly" | "monthly";
  customApi?: CustomApiConfig;
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
