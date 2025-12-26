import { Widget, WidgetType } from "@/types";

const CONFIG_VERSION = "1.0";

interface DashboardBackup {
  version: string;
  exportedAt: string;
  widgets: Widget[];
  theme?: "light" | "dark" | "system";
}

const VALID_WIDGET_TYPES: WidgetType[] = ["card", "table", "chart", "custom"];

export function validateBackup(data: unknown): { valid: boolean; error?: string; config?: DashboardBackup } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid file format" };
  }

  const backup = data as Record<string, unknown>;

  if (typeof backup.version !== "string") {
    return { valid: false, error: "Missing version field" };
  }

  if (!Array.isArray(backup.widgets)) {
    return { valid: false, error: "Missing or invalid widgets array" };
  }

  // Validate each widget
  for (let i = 0; i < backup.widgets.length; i++) {
    const widget = backup.widgets[i] as Record<string, unknown>;
    
    if (!widget.id || typeof widget.id !== "string") {
      return { valid: false, error: `Widget ${i + 1}: Missing or invalid id` };
    }
    
    if (!widget.type || !VALID_WIDGET_TYPES.includes(widget.type as WidgetType)) {
      return { valid: false, error: `Widget ${i + 1}: Invalid type "${widget.type}"` };
    }
    
    if (!widget.title || typeof widget.title !== "string") {
      return { valid: false, error: `Widget ${i + 1}: Missing or invalid title` };
    }
    
    if (!widget.config || typeof widget.config !== "object") {
      return { valid: false, error: `Widget ${i + 1}: Missing or invalid config` };
    }
  }

  const config: DashboardBackup = {
    version: backup.version,
    exportedAt: typeof backup.exportedAt === "string" ? backup.exportedAt : new Date().toISOString(),
    widgets: backup.widgets as Widget[],
  };

  if (typeof backup.theme === "string" && ["light", "dark", "system"].includes(backup.theme)) {
    config.theme = backup.theme as "light" | "dark" | "system";
  }

  return { valid: true, config };
}

export function exportDashboard(widgets: Widget[], theme?: string): void {
  const backup: DashboardBackup = {
    version: CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    widgets,
    theme: theme as "light" | "dark" | "system",
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split("T")[0];
  const filename = `finboard-backup-${date}.json`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackupFile(file: File): Promise<DashboardBackup> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith(".json")) {
      reject(new Error("Please select a JSON file"));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        const validation = validateBackup(data);
        if (!validation.valid) {
          reject(new Error(validation.error));
          return;
        }
        
        resolve(validation.config!);
      } catch (err) {
        reject(new Error("Failed to parse JSON file"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsText(file);
  });
}

