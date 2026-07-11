"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BorderGlowProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
  borderRadius?: string;
}

export function BorderGlow({
  children,
  className,
  glowColor = "hsl(var(--primary))",
  glowSize = 2,
  borderRadius = "1rem",
}: BorderGlowProps) {
  return (
    <div
      className={cn("group relative overflow-hidden", className)}
      style={{ borderRadius }}
    >
      {/* Rotating conic gradient behind */}
      <div
        className="pointer-events-none absolute -inset-px overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ borderRadius: `calc(${borderRadius} + 1px)` }}
      >
        <div
          className="absolute inset-0 animate-spin-slow"
          style={{
            background: `conic-gradient(from 0deg, transparent 0 340deg, ${glowColor} 360deg)`,
            filter: `blur(${glowSize}px)`,
          }}
        />
      </div>
      {children}
    </div>
  );
}
