"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HiPlus, HiSun, HiMoon, HiDesktopComputer, HiCog, HiDownload, HiUpload, HiInformationCircle } from "react-icons/hi";
import { RiStockLine } from "react-icons/ri";
import { useThemeStore, useDashboardStore } from "@/store";
import { exportDashboard, parseBackupFile } from "@/utils";

interface HeaderProps {
  widgetCount: number;
  onAddWidget: () => void;
}

export default function Header({ widgetCount, onAddWidget }: HeaderProps) {
  const [time, setTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const { widgets, importWidgets } = useDashboardStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<typeof widgets | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setIsSettingsOpen(false);
    if (isSettingsOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isSettingsOpen]);

  useEffect(() => {
    if (importStatus) {
      const timer = setTimeout(() => setImportStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [importStatus]);

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: <HiSun className="w-4 h-4" /> },
    { value: "dark" as const, label: "Dark", icon: <HiMoon className="w-4 h-4" /> },
    { value: "system" as const, label: "System", icon: <HiDesktopComputer className="w-4 h-4" /> },
  ];

  const handleExport = () => {
    if (widgets.length === 0) {
      setImportStatus({ type: "error", message: "No widgets to export" });
      return;
    }
    exportDashboard(widgets, theme);
    setImportStatus({ type: "success", message: "Dashboard exported!" });
    setIsSettingsOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const backup = await parseBackupFile(file);
      
      // If there are existing widgets, show confirmation
      if (widgets.length > 0) {
        setPendingImport(backup.widgets);
        setShowConfirm(true);
      } else {
        importWidgets(backup.widgets);
        if (backup.theme) setTheme(backup.theme);
        setImportStatus({ type: "success", message: `Imported ${backup.widgets.length} widget${backup.widgets.length !== 1 ? "s" : ""}!` });
      }
    } catch (err) {
      setImportStatus({ type: "error", message: err instanceof Error ? err.message : "Import failed" });
    }

    // Reset file input
    e.target.value = "";
    setIsSettingsOpen(false);
  };

  const confirmImport = () => {
    if (pendingImport) {
      importWidgets(pendingImport);
      setImportStatus({ type: "success", message: `Imported ${pendingImport.length} widget${pendingImport.length !== 1 ? "s" : ""}!` });
    }
    setShowConfirm(false);
    setPendingImport(null);
  };

  const cancelImport = () => {
    setShowConfirm(false);
    setPendingImport(null);
  };

  return (
    <>
      <header className="flex items-start sm:items-center justify-between mb-10 flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shadow-sm">
            <RiStockLine className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">FinBoard</h1>
            <p className="text-sm text-muted-foreground">
              {widgetCount === 0 ? "No widgets" : `${widgetCount} widget${widgetCount !== 1 ? "s" : ""}`}
              {time && <span className="hidden sm:inline"> · {time}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Menu */}
          {mounted && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingsOpen(!isSettingsOpen);
                }}
                className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Settings"
              >
                <HiCog className="w-5 h-5" />
              </button>

              {isSettingsOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg p-2 z-50 min-w-[200px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Theme Section */}
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Theme
                  </div>
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                        theme === option.value
                          ? "bg-accent/10 text-accent"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}

                  <div className="my-2 border-t border-border" />

                  {/* Backup Section */}
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Backup
                  </div>
                  <button
                    onClick={handleExport}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground transition-colors"
                  >
                    <HiDownload className="w-4 h-4" />
                    <span>Export Dashboard</span>
                  </button>
                  <button
                    onClick={handleImportClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted text-foreground transition-colors"
                  >
                    <HiUpload className="w-4 h-4" />
                    <span>Import Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <Link
            href="/about"
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="About Us"
          >
            <HiInformationCircle className="w-5 h-5" />
          </Link>

          <button
            onClick={onAddWidget}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm shadow-sm hover:bg-accent/90 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            <HiPlus className="w-4 h-4" />
            Add Widget
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </header>

      {/* Import Status Toast */}
      {importStatus && (
        <div 
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 ${
            importStatus.type === "success" 
              ? "bg-accent text-accent-foreground" 
              : "bg-destructive text-white"
          }`}
        >
          {importStatus.type === "success" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="font-medium">{importStatus.message}</span>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Replace Dashboard?</h3>
            <p className="text-muted-foreground mb-6">
              You have {widgets.length} existing widget{widgets.length !== 1 ? "s" : ""}. 
              Importing will replace your current dashboard with {pendingImport?.length} widget{pendingImport?.length !== 1 ? "s" : ""} from the backup.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelImport}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all"
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
