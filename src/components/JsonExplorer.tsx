"use client";

import { useState } from "react";
import { HiChevronRight, HiChevronDown, HiCheck } from "react-icons/hi";
import { FieldMapping } from "@/types";

interface JsonExplorerProps {
  data: unknown;
  selectedFields: FieldMapping[];
  onFieldToggle: (path: string[], value: unknown) => void;
}

interface JsonNodeProps {
  keyName: string;
  value: unknown;
  path: string[];
  selectedFields: FieldMapping[];
  onFieldToggle: (path: string[], value: unknown) => void;
  depth: number;
}

function isPrimitive(value: unknown): boolean {
  return value === null || typeof value !== "object";
}

function getValuePreview(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value.length > 30 ? value.slice(0, 30) + "..." : value}"`;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `Array(${value.length})`;
  return `Object`;
}

function getValueType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function JsonNode({ keyName, value, path, selectedFields, onFieldToggle, depth }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const isObject = typeof value === "object" && value !== null;
  const isArray = Array.isArray(value);
  const primitive = isPrimitive(value);

  const isSelected = selectedFields.some(
    (f) => JSON.stringify(f.path) === JSON.stringify(path)
  );

  const typeColors: Record<string, string> = {
    string: "text-emerald-600",
    number: "text-amber-600",
    boolean: "text-purple-600",
    null: "text-gray-400",
    array: "text-muted-foreground",
    object: "text-muted-foreground",
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-muted/50 cursor-pointer group ${
          isSelected ? "bg-accent/10" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isObject ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-4 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <HiChevronDown className="w-3 h-3" />
            ) : (
              <HiChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <span className="font-medium text-sm">{keyName}</span>
        <span className="text-muted-foreground text-sm">:</span>

        {primitive ? (
          <>
            <span className={`text-sm ${typeColors[getValueType(value)]}`}>
              {getValuePreview(value)}
            </span>
            <button
              onClick={() => onFieldToggle(path, value)}
              className={`ml-auto w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                isSelected
                  ? "bg-accent border-accent text-accent-foreground"
                  : "border-border opacity-0 group-hover:opacity-100 hover:border-accent"
              }`}
            >
              {isSelected && <HiCheck className="w-3 h-3" />}
            </button>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">
            {isArray ? `[${(value as unknown[]).length}]` : `{${Object.keys(value as object).length}}`}
          </span>
        )}
      </div>

      {isObject && isExpanded && (
        <div>
          {isArray
            ? (value as unknown[]).slice(0, 5).map((item, index) => (
                <JsonNode
                  key={index}
                  keyName={`[${index}]`}
                  value={item}
                  path={[...path, String(index)]}
                  selectedFields={selectedFields}
                  onFieldToggle={onFieldToggle}
                  depth={depth + 1}
                />
              ))
            : Object.entries(value as object).map(([key, val]) => (
                <JsonNode
                  key={key}
                  keyName={key}
                  value={val}
                  path={[...path, key]}
                  selectedFields={selectedFields}
                  onFieldToggle={onFieldToggle}
                  depth={depth + 1}
                />
              ))}
          {isArray && (value as unknown[]).length > 5 && (
            <div
              className="text-xs text-muted-foreground py-1"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              ... and {(value as unknown[]).length - 5} more items
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function JsonExplorer({ data, selectedFields, onFieldToggle }: JsonExplorerProps) {
  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Fetch an API to explore its response
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl bg-muted/30 max-h-64 overflow-auto">
      <div className="p-2">
        {typeof data === "object" && data !== null ? (
          Object.entries(data).map(([key, value]) => (
            <JsonNode
              key={key}
              keyName={key}
              value={value}
              path={[key]}
              selectedFields={selectedFields}
              onFieldToggle={onFieldToggle}
              depth={0}
            />
          ))
        ) : (
          <div className="text-sm text-muted-foreground p-2">
            Response is not a valid JSON object
          </div>
        )}
      </div>
    </div>
  );
}

