export type WidgetType = "table" | "card" | "chart" | "custom";

export type AuthType = "none" | "query_param" | "header" | "bearer";

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

export interface CustomApiConfig {
  url: string;
  auth: AuthConfig;
  fields: FieldMapping[];
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
