import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
  count?: number;
}

export function LoadingState({ className, count = 6 }: LoadingStateProps) {
  return (
    <div className={cn("container mx-auto px-4 py-12", className)}>
      <div className="flex gap-10">
        <div className="hidden w-72 shrink-0 lg:block">
          <Skeleton className="h-125ull rounded-2xl" />
        </div>
        <div className="flex-1 space-y-8">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-70 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4 py-20", className)}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      <p className="text-muted-foreground font-medium animate-pulse">
        Đang tải...
      </p>
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-8 w-3/4 rounded-lg" />
      <Skeleton className="h-4 w-1/2 rounded-lg" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}
