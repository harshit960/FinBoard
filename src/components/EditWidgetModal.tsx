"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import JsonExplorer from "./JsonExplorer";
import { Widget, WidgetConfig, AuthType, DisplayType, FieldMapping } from "@/types";
import { 
  HiOutlineTrendingUp, HiOutlineTable, HiOutlineChartBar, HiOutlineClock, 
  HiOutlineCode, HiOutlineRefresh, HiX, HiInformationCircle 
} from "react-icons/hi";

interface EditWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  widget: Widget | null;
  onSave: (id: string, updates: { title: string; config: WidgetConfig }) => void;
}

const INTERVALS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

const AUTH_TYPES: { value: AuthType; label: string }[] = [
  { value: "none", label: "No Auth" },
  { value: "query_param", label: "API Key (Query)" },
  { value: "header", label: "API Key (Header)" },
  { value: "bearer", label: "Bearer Token" },
];

const DISPLAY_TYPES: { value: DisplayType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "card", label: "Card", icon: <HiOutlineTrendingUp className="w-5 h-5" />, description: "Key-value pairs from a single object" },
  { value: "table", label: "Table", icon: <HiOutlineTable className="w-5 h-5" />, description: "Rows from an array of items" },
  { value: "chart", label: "Chart", icon: <HiOutlineChartBar className="w-5 h-5" />, description: "Line chart from time-series data" },
];

function findArrayPaths(obj: unknown, currentPath: string[] = []): string[][] {
  const paths: string[][] = [];
  if (Array.isArray(obj) && obj.length > 0) {
    paths.push(currentPath);
  }
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      paths.push(...findArrayPaths(value, [...currentPath, key]));
    }
  }
  return paths;
}

function getValueByPath(obj: unknown, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function getObjectKeys(obj: unknown): string[] {
  if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
    return Object.keys(obj);
  }
  if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === "object") {
    return Object.keys(obj[0] as object);
  }
  return [];
}

export default function EditWidgetModal({ isOpen, onClose, widget, onSave }: EditWidgetModalProps) {
  const [title, setTitle] = useState("");
  const [symbol, setSymbol] = useState("");
  const [chartInterval, setChartInterval] = useState<"daily" | "weekly" | "monthly">("daily");
  const [refreshInterval, setRefreshInterval] = useState(300);

  // Custom API state
  const [apiUrl, setApiUrl] = useState("");
  const [authType, setAuthType] = useState<AuthType>("none");
  const [authKey, setAuthKey] = useState("");
  const [authValue, setAuthValue] = useState("");
  const [apiResponse, setApiResponse] = useState<unknown>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // Display type state
  const [displayType, setDisplayType] = useState<DisplayType>("card");
  const [selectedFields, setSelectedFields] = useState<FieldMapping[]>([]);
  const [arrayPath, setArrayPath] = useState<string[]>([]);
  const [xAxisField, setXAxisField] = useState("");
  const [yAxisField, setYAxisField] = useState("");

  useEffect(() => {
    if (widget) {
      setTitle(widget.title);
      setSymbol(widget.config.symbol || "");
      setChartInterval(widget.config.chartInterval || "daily");
      setRefreshInterval((widget.config.refreshInterval || 300000) / 1000);

      if (widget.config.customApi) {
        setApiUrl(widget.config.customApi.url);
        setAuthType(widget.config.customApi.auth.type);
        setAuthKey(widget.config.customApi.auth.key || "");
        setAuthValue(widget.config.customApi.auth.value || "");
        setDisplayType(widget.config.customApi.displayType || "card");
        setSelectedFields(widget.config.customApi.fields);
        setArrayPath(widget.config.customApi.arrayPath || []);
        if (widget.config.customApi.chartConfig) {
          setXAxisField(widget.config.customApi.chartConfig.xAxisLabel || "");
          setYAxisField(widget.config.customApi.chartConfig.yAxisLabel || "");
        }
      }
    }
  }, [widget]);

  if (!widget) return null;

  const needsSymbol = widget.type === "card" || widget.type === "chart";
  const isChart = widget.type === "chart";
  const isCustom = widget.type === "custom";

  const availableArrayPaths = apiResponse ? findArrayPaths(apiResponse) : [];
  const arrayData = arrayPath.length > 0 ? getValueByPath(apiResponse, arrayPath) : null;
  const availableFields = arrayData ? getObjectKeys(arrayData) : (apiResponse ? getObjectKeys(apiResponse) : []);

  const buildFetchUrl = () => {
    if (authType === "query_param" && authKey && authValue) {
      const url = new URL(apiUrl);
      url.searchParams.set(authKey, authValue);
      return url.toString();
    }
    return apiUrl;
  };

  const buildFetchHeaders = (): HeadersInit => {
    const headers: HeadersInit = {};
    if (authType === "header" && authKey && authValue) {
      headers[authKey] = authValue;
    }
    if (authType === "bearer" && authValue) {
      headers["Authorization"] = `Bearer ${authValue}`;
    }
    return headers;
  };

  const handleFetchApi = async () => {
    if (!apiUrl) return;
    setIsFetching(true);
    setFetchError("");
    setApiResponse(null);

    try {
      const response = await fetch(buildFetchUrl(), {
        headers: buildFetchHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch API");
    } finally {
      setIsFetching(false);
    }
  };

  const handleFieldToggle = (field: string) => {
    const exists = selectedFields.find((f) => f.label === field);
    if (exists) {
      setSelectedFields(selectedFields.filter((f) => f.label !== field));
    } else {
      const path = displayType === "card" ? [field] : [...arrayPath, "0", field];
      setSelectedFields([...selectedFields, { path, label: field, format: "text" }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const config: WidgetConfig = {
      ...widget.config,
      refreshInterval: refreshInterval * 1000,
    };

    if (needsSymbol) {
      if (!symbol.trim()) return;
      config.symbol = symbol.trim().toUpperCase();
    }
    if (isChart) {
      config.chartInterval = chartInterval;
    }
    if (isCustom) {
      if (!apiUrl || selectedFields.length === 0) return;
      config.customApi = {
        url: apiUrl,
        auth: { type: authType, key: authKey, value: authValue },
        displayType,
        fields: selectedFields,
        arrayPath: displayType !== "card" ? arrayPath : undefined,
        chartConfig: displayType === "chart" ? {
          xAxisPath: [...arrayPath, "0", xAxisField],
          yAxisPath: [...arrayPath, "0", yAxisField],
          xAxisLabel: xAxisField,
          yAxisLabel: yAxisField,
        } : undefined,
      };
    }

    onSave(widget.id, { title: title.trim(), config });
    onClose();
  };

  const getIcon = () => {
    switch (widget.type) {
      case "card": return <HiOutlineTrendingUp className="w-5 h-5" />;
      case "table": return <HiOutlineTable className="w-5 h-5" />;
      case "chart": return <HiOutlineChartBar className="w-5 h-5" />;
      case "custom": return <HiOutlineCode className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (widget.type) {
      case "card": return "Stock Card";
      case "table": return "Top Gainers Table";
      case "chart": return "Price Chart";
      case "custom": return "Custom API";
    }
  };

  const canSubmit = () => {
    if (!title.trim()) return false;
    if (needsSymbol && !symbol.trim()) return false;
    if (isCustom) {
      if (!apiUrl) return false;
      if (displayType === "card") return selectedFields.length > 0;
      if (displayType === "table") return arrayPath.length > 0 && selectedFields.length > 0;
      if (displayType === "chart") return arrayPath.length > 0 && xAxisField && yAxisField;
    }
    return true;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Widget">
      <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl mb-5">
          <div className="text-muted-foreground">{getIcon()}</div>
          <div>
            <div className="font-medium">{getTypeLabel()}</div>
            <div className="text-xs text-muted-foreground">Widget type cannot be changed</div>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">Widget Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Apple Stock"
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        {needsSymbol && (
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Stock Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g., AAPL, MSFT, GOOGL"
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all uppercase"
            />
          </div>
        )}

        {isChart && (
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Time Interval</label>
            <div className="flex gap-2">
              {INTERVALS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setChartInterval(value)}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                    chartInterval === value
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isCustom && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">API URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.example.com/data"
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={handleFetchApi}
                  disabled={!apiUrl || isFetching}
                  className="px-4 py-2.5 bg-accent text-accent-foreground rounded-xl font-medium text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <HiOutlineRefresh className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                  Fetch
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Authentication</label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value as AuthType)}
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer text-sm"
              >
                {AUTH_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {authType !== "none" && (
              <div className="mb-4 flex gap-2">
                {authType !== "bearer" && (
                  <input
                    type="text"
                    value={authKey}
                    onChange={(e) => setAuthKey(e.target.value)}
                    placeholder={authType === "query_param" ? "Param name" : "Header name"}
                    className="flex-1 px-4 py-2.5 border border-border rounded-xl bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                )}
                <input
                  type="text"
                  value={authValue}
                  onChange={(e) => setAuthValue(e.target.value)}
                  placeholder={authType === "bearer" ? "Bearer token" : "API key value"}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
            )}

            {fetchError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                {fetchError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Display Type</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {DISPLAY_TYPES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setDisplayType(value);
                      if (apiResponse) {
                        setSelectedFields([]);
                        setXAxisField("");
                        setYAxisField("");
                      }
                    }}
                    className={`flex items-center justify-center gap-2 p-3 border rounded-xl transition-all ${
                      displayType === value
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    {icon}
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl text-sm">
                <HiInformationCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  {DISPLAY_TYPES.find(d => d.value === displayType)?.description}
                </span>
              </div>
            </div>

            {apiResponse && (displayType === "table" || displayType === "chart") && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Array Path</label>
                {availableArrayPaths.length === 0 ? (
                  <div className="p-3 bg-muted/50 rounded-xl text-sm text-muted-foreground">
                    No arrays found. Try Card display type.
                  </div>
                ) : (
                  <select
                    value={JSON.stringify(arrayPath)}
                    onChange={(e) => {
                      setArrayPath(JSON.parse(e.target.value));
                      setSelectedFields([]);
                      setXAxisField("");
                      setYAxisField("");
                    }}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer text-sm"
                  >
                    <option value="[]">Select array...</option>
                    {availableArrayPaths.map((path) => (
                      <option key={JSON.stringify(path)} value={JSON.stringify(path)}>
                        {path.length === 0 ? "(root)" : path.join(" → ")}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {apiResponse && displayType === "card" && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Select Fields</label>
                  {selectedFields.length > 0 && (
                    <span className="text-xs text-muted-foreground">{selectedFields.length} selected</span>
                  )}
                </div>
                <div className="border border-border rounded-xl bg-muted/30 max-h-48 overflow-auto p-2">
                  {availableFields.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-2 text-center">No fields available</div>
                  ) : (
                    <div className="space-y-1">
                      {availableFields.map((field) => (
                        <label
                          key={field}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${
                            selectedFields.some(f => f.label === field) ? "bg-accent/10" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFields.some(f => f.label === field)}
                            onChange={() => handleFieldToggle(field)}
                            className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                          />
                          <span className="text-sm">{field}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {apiResponse && displayType === "table" && arrayPath.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Select Columns</label>
                  {selectedFields.length > 0 && (
                    <span className="text-xs text-muted-foreground">{selectedFields.length} selected</span>
                  )}
                </div>
                <div className="border border-border rounded-xl bg-muted/30 max-h-48 overflow-auto p-2">
                  {availableFields.length === 0 ? (
                    <div className="text-sm text-muted-foreground p-2 text-center">No fields in array items</div>
                  ) : (
                    <div className="space-y-1">
                      {availableFields.map((field) => (
                        <label
                          key={field}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 ${
                            selectedFields.some(f => f.label === field) ? "bg-accent/10" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFields.some(f => f.label === field)}
                            onChange={() => handleFieldToggle(field)}
                            className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                          />
                          <span className="text-sm">{field}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {apiResponse && displayType === "chart" && arrayPath.length > 0 && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">X-Axis (Date/Time)</label>
                  <select
                    value={xAxisField}
                    onChange={(e) => setXAxisField(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer text-sm"
                  >
                    <option value="">Select field...</option>
                    {availableFields.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Y-Axis (Value)</label>
                  <select
                    value={yAxisField}
                    onChange={(e) => setYAxisField(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer text-sm"
                  >
                    <option value="">Select field...</option>
                    {availableFields.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {selectedFields.length > 0 && displayType !== "chart" && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Selected Fields</label>
                <div className="flex flex-wrap gap-2">
                  {selectedFields.map((field) => (
                    <div
                      key={field.label}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-sm"
                    >
                      <span>{field.label}</span>
                      <button
                        type="button"
                        onClick={() => handleFieldToggle(field.label)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <HiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {apiResponse && (
              <div className="mb-4">
                <details className="group">
                  <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                    View Raw Response
                  </summary>
                  <div className="mt-2">
                    <JsonExplorer
                      data={apiResponse}
                      selectedFields={[]}
                      onFieldToggle={() => {}}
                    />
                  </div>
                </details>
              </div>
            )}

            {!apiResponse && (
              <div className="mb-4 p-3 bg-muted/50 rounded-xl text-sm text-muted-foreground text-center">
                Click &quot;Fetch&quot; to reload API and modify fields
              </div>
            )}
          </>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Refresh Interval</label>
          <div className="relative">
            <HiOutlineClock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="number"
              min={30}
              max={3600}
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Math.max(30, parseInt(e.target.value) || 300))}
              className="w-full pl-11 pr-20 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">seconds</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit()}
            className="flex-1 px-4 py-3 text-sm font-medium bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
