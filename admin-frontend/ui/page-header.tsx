import { cn } from "@/lib/utils";
import type React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8",
        className,
      )}
    >
      <div>
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground font-medium mt-1">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
