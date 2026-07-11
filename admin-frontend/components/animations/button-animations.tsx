"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" },
  tap: { scale: 0.95 },
};

const pulseRingVariants: Variants = {
  initial: { scale: 0.8, opacity: 1 },
  animate: {
    scale: 1.4,
    opacity: 0,
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "loop" as const,
    },
  },
};

export function AnimatedButton({
  children,
  onClick,
  disabled = false,
  className = "",
  variant = "default",
  size = "md",
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={className}
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled ? "hover" : "initial"}
      whileTap={!disabled ? "tap" : "initial"}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

export function PulseButton({
  children,
  onClick,
  className = "",
}: Omit<AnimatedButtonProps, "variant" | "size">) {
  return (
    <motion.button
      className={`relative ${className}`}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulse ring effect */}
      <motion.span
        className="absolute inset-0 rounded-lg bg-primary/20"
        variants={pulseRingVariants}
        initial="initial"
        animate="animate"
      />
      <span className="relative">{children}</span>
    </motion.button>
  );
}

interface LoadingButtonProps extends Omit<AnimatedButtonProps, "children"> {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText = "Loading...",
  children,
  disabled = false,
  ...props
}: LoadingButtonProps) {
  return (
    <motion.button
      disabled={disabled || loading}
      {...props}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
    >
      <motion.div
        initial={false}
        animate={
          loading ? { opacity: 0, width: 0 } : { opacity: 1, width: "auto" }
        }
        transition={{ duration: 0.2 }}
        style={{ overflow: "hidden" }}
      >
        {children}
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
          />
          <span>{loadingText}</span>
        </motion.div>
      )}
    </motion.button>
  );
}
