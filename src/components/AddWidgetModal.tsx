"use client";

import { useState } from "react";
import Modal from "./Modal";
import JsonExplorer from "./JsonExplorer";
import { WidgetType, WidgetConfig, AuthType, DisplayType, FieldMapping } from "@/types";
import { 
  HiOutlineTrendingUp, HiOutlineTable, HiOutlineChartBar, HiCheckCircle, 
  HiOutlineClock, HiOutlineCode, HiOutlineRefresh, HiX, HiInformationCircle 
} from "react-icons/hi";

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType, title: string, config: WidgetConfig) => void;
}

const WIDGET_TYPES: { type: WidgetType; label: string; description: string; icon: React.ReactNode; needsSymbol: boolean }[] = [
  { type: "card", label: "Stock Card", description: "Display price & stats for a stock", icon: <HiOutlineTrendingUp className="w-6 h-6" />, needsSymbol: true },
  { type: "table", label: "Top Gainers", description: "Table of top gaining stocks", icon: <HiOutlineTable className="w-6 h-6" />, needsSymbol: false },
  { type: "chart", label: "Price Chart", description: "Line chart showing price history", icon: <HiOutlineChartBar className="w-6 h-6" />, needsSymbol: true },
  { type: "custom", label: "Custom API", description: "Connect to any API endpoint", icon: <HiOutlineCode className="w-6 h-6" />, needsSymbol: false },
];

const AUTH_TYPES: { value: AuthType; label: string }[] = [
  { value: "none", label: "No Auth" },
  { value: "query_param", label: "API Key (Query)" },
  { value: "header", label: "API Key (Header)" },
  { value: "bearer", label: "Bearer Token" },
];

const DISPLAY_TYPES: { value: DisplayType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "card", label: "Card", icon: <HiOutlineTrendingUp className="w-5 h-5" />, description: "Key-value pairs (single object or first item from array)" },
  { value: "table", label: "Table", icon: <HiOutlineTable className="w-5 h-5" />, description: "Rows from an array of items" },
  { value: "chart", label: "Chart", icon: <HiOutlineChartBar className="w-5 h-5" />, description: "Line chart from time-series data" },
];

const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "GOOGL", name: "Alphabet (Google)" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "META", name: "Meta (Facebook)" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "JPM", name: "JPMorgan Chase" },
  { symbol: "V", name: "Visa" },
  { symbol: "WMT", name: "Walmart" },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "MA", name: "Mastercard" },
  { symbol: "PG", name: "Procter & Gamble" },
  { symbol: "UNH", name: "UnitedHealth" },
  { symbol: "HD", name: "Home Depot" },
  { symbol: "DIS", name: "Disney" },
  { symbol: "NFLX", name: "Netflix" },
  { symbol: "PYPL", name: "PayPal" },
  { symbol: "INTC", name: "Intel" },
  { symbol: "AMD", name: "AMD" },
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

function isResponseArray(obj: unknown): boolean {
  if (Array.isArray(obj)) return true;
  if (typeof obj === "object" && obj !== null) {
    const values = Object.values(obj);
    return values.some(v => Array.isArray(v));
  }
  return false;
}

export default function AddWidgetModal({ isOpen, onClose, onAdd }: AddWidgetModalProps) {
  const [selectedType, setSelectedType] = useState<WidgetType>("card");
  const [title, setTitle] = useState("");
  const [symbol, setSymbol] = useState("");
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
  const [itemIndex, setItemIndex] = useState(0);
  const [xAxisField, setXAxisField] = useState("");
  const [yAxisField, setYAxisField] = useState("");

  const selectedWidget = WIDGET_TYPES.find((w) => w.type === selectedType);
  const isCustom = selectedType === "custom";

  const availableArrayPaths = apiResponse ? findArrayPaths(apiResponse) : [];
  const hasArrays = availableArrayPaths.length > 0;
  
  // Get the data source based on array path
  const arrayData = arrayPath.length > 0 ? getValueByPath(apiResponse, arrayPath) : null;
  const arrayLength = Array.isArray(arrayData) ? arrayData.length : 0;
  
  // For card mode: get fields from first item if array selected, else from root
  const getFieldsSource = () => {
    if (displayType === "card") {
      if (arrayPath.length > 0 && Array.isArray(arrayData) && arrayData.length > 0) {
        return arrayData[0];
      }
      return apiResponse;
    }
    return arrayData;
  };
  
  const availableFields = getObjectKeys(getFieldsSource());

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
    setSelectedFields([]);
    setArrayPath([]);
    setItemIndex(0);
    setXAxisField("");
    setYAxisField("");

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
      setSelectedFields([...selectedFields, { path: [field], label: field, format: "text" }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isCustom) {
      if (!apiUrl) return;
      
      let isValid = false;
      if (displayType === "card") isValid = selectedFields.length > 0;
      if (displayType === "table") isValid = arrayPath.length > 0 && selectedFields.length > 0;
      if (displayType === "chart") isValid = arrayPath.length > 0 && !!xAxisField && !!yAxisField;
      
      if (!isValid) return;

      const config: WidgetConfig = {
        refreshInterval: refreshInterval * 1000,
        customApi: {
          url: apiUrl,
          auth: { type: authType, key: authKey, value: authValue },
          displayType,
          fields: selectedFields,
          arrayPath: arrayPath.length > 0 ? arrayPath : undefined,
          itemIndex: displayType === "card" && arrayPath.length > 0 ? itemIndex : undefined,
          chartConfig: displayType === "chart" ? {
            xAxisPath: [...arrayPath, "0", xAxisField],
            yAxisPath: [...arrayPath, "0", yAxisField],
            xAxisLabel: xAxisField,
            yAxisLabel: yAxisField,
          } : undefined,
        },
      };
      onAdd("custom", title.trim(), config);
    } else {
      if (selectedWidget?.needsSymbol && !symbol.trim()) return;
      const config: WidgetConfig = {
        refreshInterval: refreshInterval * 1000,
      };
      if (selectedWidget?.needsSymbol) {
        config.symbol = symbol.trim().toUpperCase();
      }
      onAdd(selectedType, title.trim(), config);
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setSymbol("");
    setSelectedType("card");
    setRefreshInterval(300);
    setApiUrl("");
    setAuthType("none");
    setAuthKey("");
    setAuthValue("");
    setApiResponse(null);
    setSelectedFields([]);
    setFetchError("");
    setDisplayType("card");
    setArrayPath([]);
    setItemIndex(0);
    setXAxisField("");
    setYAxisField("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canSubmit = () => {
    if (!title.trim()) return false;
    if (isCustom) {
      if (!apiUrl || !apiResponse) return false;
      if (displayType === "card") return selectedFields.length > 0;
      if (displayType === "table") return arrayPath.length > 0 && selectedFields.length > 0;
      if (displayType === "chart") return arrayPath.length > 0 && !!xAxisField && !!yAxisField;
      return false;
    }
    return !selectedWidget?.needsSymbol || !!symbol.trim();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Widget">
      <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="mb-5">
          <label className="block text-sm font-medium mb-3">Widget Type</label>
          <div className="grid grid-cols-2 gap-2">
            {WIDGET_TYPES.map(({ type, label, icon }) => (
              <label
                key={type}
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                  selectedType === type
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <input
                  type="radio"
                  name="widgetType"
                  value={type}
                  checked={selectedType === type}
                  onChange={() => setSelectedType(type)}
                  className="sr-only"
                />
                <div className="text-muted-foreground">{icon}</div>
                <span className="font-medium text-sm">{label}</span>
                {selectedType === type && (
                  <HiCheckCircle className="w-4 h-4 text-accent ml-auto" />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">Widget Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isCustom ? "e.g., Crypto Prices" : "e.g., Apple Stock"}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        {selectedWidget?.needsSymbol && !isCustom && (
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Stock Symbol</label>
            <div className="space-y-2">
              <select
                value={POPULAR_STOCKS.some(s => s.symbol === symbol.toUpperCase()) ? symbol.toUpperCase() : ""}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all cursor-pointer"
              >
                <option value="">Popular stocks...</option>
                {POPULAR_STOCKS.map((stock) => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} — {stock.name}
                  </option>
                ))}
              </select>
              <div className="relative">
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="Or type any symbol"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all uppercase"
                />
              </div>
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
                    placeholder={authType === "query_param" ? "Param name (e.g., apikey)" : "Header name (e.g., X-API-Key)"}
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

            {apiResponse && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Display Type</label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {DISPLAY_TYPES.map(({ value, label, icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setDisplayType(value);
                          setSelectedFields([]);
                          setArrayPath([]);
                          setItemIndex(0);
                          setXAxisField("");
                          setYAxisField("");
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

                {/* Array path selector - show for all modes if arrays exist */}
                {hasArrays && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      {displayType === "card" ? "Data Source (optional)" : "Select Array Path"}
                    </label>
                    <select
                      value={JSON.stringify(arrayPath)}
                      onChange={(e) => {
                        setArrayPath(JSON.parse(e.target.value));
                        setSelectedFields([]);
                        setItemIndex(0);
                        setXAxisField("");
                        setYAxisField("");
                      }}
                      className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer text-sm"
                    >
                      <option value="[]">
                        {displayType === "card" ? "Root object (no array)" : "Select array..."}
                      </option>
                      {availableArrayPaths.map((path) => (
                        <option key={JSON.stringify(path)} value={JSON.stringify(path)}>
                          {path.length === 0 ? "(root array)" : path.join(" → ")}
                        </option>
                      ))}
                    </select>
                    {displayType === "card" && arrayPath.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Will show data from item in this array
                      </p>
                    )}
                  </div>
                )}

                {/* Item index selector for Card mode with array */}
                {displayType === "card" && arrayPath.length > 0 && arrayLength > 1 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Select Item</label>
                    <select
                      value={itemIndex}
                      onChange={(e) => setItemIndex(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer text-sm"
                    >
                      {Array.from({ length: Math.min(arrayLength, 20) }, (_, i) => (
                        <option key={i} value={i}>
                          Item {i + 1} {i === 0 ? "(first)" : i === arrayLength - 1 ? "(last)" : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-2">
                      {arrayLength} items available
                    </p>
                  </div>
                )}

                {/* Field selection for Card and Table modes */}
                {(displayType === "card" || (displayType === "table" && arrayPath.length > 0)) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        {displayType === "card" ? "Select Fields" : "Select Columns"}
                      </label>
                      {selectedFields.length > 0 && (
                        <span className="text-xs text-muted-foreground">{selectedFields.length} selected</span>
                      )}
                    </div>
                    <div className="border border-border rounded-xl bg-muted/30 max-h-48 overflow-auto p-2">
                      {availableFields.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-2 text-center">
                          {displayType === "card" && !arrayPath.length 
                            ? "Select a data source above, or no fields found in root object"
                            : "No fields available"}
                        </div>
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

                {/* Chart axis selectors */}
                {displayType === "chart" && arrayPath.length > 0 && (
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

                {/* Selected fields tags */}
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
              </>
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
            onClick={handleClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit()}
            className="flex-1 px-4 py-3 text-sm font-medium bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Add Widget
          </button>
        </div>
      </form>
    </Modal>
  );
}
