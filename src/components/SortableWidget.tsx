"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Widget } from "@/types";
import { StockCard, GainersTable, PriceChart, CustomWidget } from "./widgets";
import { HiX, HiOutlineDotsVertical, HiPencil, HiOutlineRefresh } from "react-icons/hi";

interface SortableWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
  onEdit: (widget: Widget) => void;
  onResize: (id: string, colSpan: 1 | 2 | 3, rowSpan: 1 | 2) => void;
}

const DEFAULT_REFRESH = 300000;
const CELL_WIDTH = 280;
const CELL_HEIGHT = 180;

export default function SortableWidget({ widget, onRemove, onEdit, onResize }: SortableWidgetProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [previewSize, setPreviewSize] = useState<{ col: number; row: number } | null>(null);
  
  const previewSizeRef = useRef<{ col: number; row: number } | null>(null);
  const startPosRef = useRef<{ x: number; y: number; col: number; row: number } | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  // Handle legacy size format
  const colSpan = (widget.size as { colSpan?: number })?.colSpan || 1;
  const rowSpan = (widget.size as { rowSpan?: number })?.rowSpan || 1;

  // Keep ref in sync with state
  useEffect(() => {
    previewSizeRef.current = previewSize;
  }, [previewSize]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing ? undefined : transition,
  };

  const refreshInterval = widget.config.refreshInterval || DEFAULT_REFRESH;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    startPosRef.current = { x: clientX, y: clientY, col: colSpan, row: rowSpan };
    setIsResizing(true);
    setPreviewSize({ col: colSpan, row: rowSpan });

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!startPosRef.current) return;
      
      const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const deltaX = moveX - startPosRef.current.x;
      const deltaY = moveY - startPosRef.current.y;
      
      // Calculate new size based on drag distance
      let newCol = Math.round(startPosRef.current.col + deltaX / CELL_WIDTH);
      let newRow = Math.round(startPosRef.current.row + deltaY / CELL_HEIGHT);
      
      // Clamp values
      newCol = Math.max(1, Math.min(3, newCol));
      newRow = Math.max(1, Math.min(2, newRow));
      
      setPreviewSize({ col: newCol, row: newRow });
    };

    const handleEnd = () => {
      const finalSize = previewSizeRef.current;
      if (finalSize) {
        onResize(widget.id, finalSize.col as 1 | 2 | 3, finalSize.row as 1 | 2);
      }
      setIsResizing(false);
      setPreviewSize(null);
      startPosRef.current = null;
      
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  };

  const renderContent = () => {
    switch (widget.type) {
      case "card":
        return widget.config.symbol ? (
          <StockCard key={refreshKey} symbol={widget.config.symbol} refreshInterval={refreshInterval} />
        ) : (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No symbol configured
          </div>
        );
      case "table":
        return <GainersTable key={refreshKey} refreshInterval={refreshInterval} />;
      case "chart":
        return widget.config.symbol ? (
          <PriceChart key={refreshKey} symbol={widget.config.symbol} interval={widget.config.chartInterval} refreshInterval={refreshInterval} />
        ) : (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No symbol configured
          </div>
        );
      case "custom":
        return widget.config.customApi ? (
          <CustomWidget key={refreshKey} config={widget.config.customApi} refreshInterval={refreshInterval} />
        ) : (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No API configured
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Unknown widget type
          </div>
        );
    }
  };

  const typeLabels: Record<string, string> = {
    card: "Stock",
    table: "Table",
    chart: "Chart",
    custom: "API",
  };

  const formatRefresh = (ms: number) => {
    const seconds = ms / 1000;
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      return `${mins}m`;
    }
    return `${seconds}s`;
  };

  const getSubtitle = () => {
    if (widget.config.symbol) return widget.config.symbol;
    if (widget.config.customApi) {
      try {
        const url = new URL(widget.config.customApi.url);
        return url.hostname;
      } catch {
        return "Custom";
      }
    }
    return null;
  };

  // Use preview size while resizing, otherwise use actual size
  const displayCol = previewSize?.col ?? colSpan;
  const displayRow = previewSize?.row ?? rowSpan;

  // CSS class for grid span based on size
  const getSizeClass = () => {
    const classes: string[] = [];
    
    // Column span (responsive)
    if (displayCol === 2) classes.push("md:col-span-2");
    if (displayCol === 3) classes.push("lg:col-span-3");
    
    // Row span
    if (displayRow === 2) classes.push("row-span-2");
    
    return classes.join(" ");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border rounded-xl shadow-sm transition-all flex flex-col relative group ${getSizeClass()} ${
        isDragging ? "opacity-60 shadow-xl scale-[1.02] rotate-1" : "hover:shadow-md"
      } ${isResizing ? "ring-2 ring-accent z-10" : ""}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-3 cursor-grab active:cursor-grabbing flex-1 min-w-0"
        >
          <HiOutlineDotsVertical className="w-5 h-5 text-muted-foreground/50" />
          <div className="min-w-0">
            <h3 className="font-semibold text-card-foreground truncate">{widget.title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="px-1.5 py-0.5 bg-muted rounded">{typeLabels[widget.type]}</span>
              {getSubtitle() && <span className="truncate max-w-[100px]">{getSubtitle()}</span>}
              {widget.type === "chart" && widget.config.chartInterval && (
                <span className="capitalize">{widget.config.chartInterval}</span>
              )}
              <span>{formatRefresh(refreshInterval)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors p-2 rounded-lg disabled:opacity-50"
            title="Refresh data"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => onEdit(widget)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors p-2 rounded-lg"
            title="Edit widget"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(widget.id)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors p-2 rounded-lg"
            title="Remove widget"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-auto">{renderContent()}</div>

      {/* Resize handle - bottom right corner */}
      <div
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
        className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-1"
        title="Drag to resize"
      >
        <svg
          className="w-4 h-4 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
        </svg>
      </div>

      {/* Resize preview overlay */}
      {isResizing && previewSize && (
        <div className="absolute inset-0 bg-accent/10 border-2 border-accent rounded-xl pointer-events-none flex items-center justify-center">
          <span className="bg-accent text-accent-foreground px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">
            {previewSize.col} × {previewSize.row}
          </span>
        </div>
      )}
    </div>
  );
}
