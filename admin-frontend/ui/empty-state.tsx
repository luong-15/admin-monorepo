import { cn } from "@/lib/utils";
import { Button } from "./button";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-muted/20 py-28 animate-fade-in-scale",
        className,
      )}
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-background shadow-inner">
        <Icon className="h-12 w-12 text-muted-foreground/50" />
      </div>
      <h3 className="mb-2 text-2xl font-bold tracking-tight">{title}</h3>
      {description && (
        <p className="max-w-xs text-center text-muted-foreground/80 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button asChild variant="outline" className="mt-6 bg-transparent">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
