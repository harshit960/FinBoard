"use client";

import { useState, useEffect } from "react";
import { HiPlus, HiSun, HiMoon, HiDesktopComputer } from "react-icons/hi";
import { RiStockLine } from "react-icons/ri";
import { useThemeStore } from "@/store";

interface HeaderProps {
  widgetCount: number;
  onAddWidget: () => void;
}

export default function Header({ widgetCount, onAddWidget }: HeaderProps) {
  const [time, setTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsThemeMenuOpen(false);
    if (isThemeMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isThemeMenuOpen]);

  const themeIcon = {
    light: <HiSun className="w-5 h-5" />,
    dark: <HiMoon className="w-5 h-5" />,
    system: <HiDesktopComputer className="w-5 h-5" />,
  };

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: <HiSun className="w-4 h-4" /> },
    { value: "dark" as const, label: "Dark", icon: <HiMoon className="w-4 h-4" /> },
    { value: "system" as const, label: "System", icon: <HiDesktopComputer className="w-4 h-4" /> },
  ];

  return (
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
        {/* Theme Toggle */}
        {mounted && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsThemeMenuOpen(!isThemeMenuOpen);
              }}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Change theme"
            >
              {themeIcon[theme]}
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg p-1.5 z-50 min-w-[140px]">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTheme(option.value);
                      setIsThemeMenuOpen(false);
                    }}
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
              </div>
            )}
          </div>
        )}

        <button
          onClick={onAddWidget}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium text-sm shadow-sm hover:bg-accent/90 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        >
          <HiPlus className="w-4 h-4" />
          Add Widget
        </button>
      </div>
    </header>
  );
}
