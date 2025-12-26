"use client";

import { ReactNode } from "react";

interface DashboardGridProps {
  children: ReactNode;
  isEmpty?: boolean;
}

export default function DashboardGrid({ children, isEmpty }: DashboardGridProps) {
  if (isEmpty) {
    return (
      <div className="border border-dashed border-border rounded-lg p-16 text-center">
        <p className="text-muted-foreground">
          No widgets yet. Click "Add Widget" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}

