"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ViewToggleProps {
  children: ReactNode;
  viewMode: "grid" | "list";
  className?: string;
}

export function ViewToggle({ children, viewMode, className }: ViewToggleProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.215, 0.61, 0.355, 1] as const }}
        className={cn(className)}
        layout
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface LayoutItemProps {
  children: ReactNode;
  className?: string;
  layoutId?: string;
}

export function LayoutItem({ children, className, layoutId }: LayoutItemProps) {
  return (
    <motion.div
      layout={!!layoutId}
      layoutId={layoutId}
      transition={{
        layout: { duration: 0.4, ease: [0.215, 0.61, 0.355, 1] as const },
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
