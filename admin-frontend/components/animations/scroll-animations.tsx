"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollTriggerProps {
  children: ReactNode;
  className?: string;
  triggerOnce?: boolean;
}

export function ScrollTrigger({
  children,
  className = "",
  triggerOnce = true,
}: ScrollTriggerProps) {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: triggerOnce, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxProps {
  children: ReactNode;
  offset?: number;
  className?: string;
}

export function Parallax({
  children,
  offset = 50,
  className = "",
}: ParallaxProps) {
  const ref = useRef(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollY, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

interface CountUpProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
}

export function CountUp({
  from,
  to,
  duration = 2,
  className = "",
  suffix = "",
}: CountUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const motionValue = useTransform(
    useScroll({ target: ref, offset: ["0 1", "1 1"] }).scrollYProgress,
    [0, 1],
    [from, to],
  );

  const displayValue = useTransform(motionValue, (latest: number) =>
    Math.floor(latest).toLocaleString(),
  );

  return (
    <motion.div ref={ref} className={className}>
      <motion.span>{displayValue}</motion.span>
      {suffix && <span>{suffix}</span>}
    </motion.div>
  );
}

interface StickySectionProps {
  children: ReactNode;
  className?: string;
}

export function StickySection({
  children,
  className = "",
}: StickySectionProps) {
  return (
    <motion.section
      className={`sticky top-0 ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.section>
  );
}

interface RevealOnScrollProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}

export function RevealOnScroll({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: RevealOnScrollProps) {
  const getInitialState = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 40 };
      case "down":
        return { opacity: 0, y: -40 };
      case "left":
        return { opacity: 0, x: 40 };
      case "right":
        return { opacity: 0, x: -40 };
      default:
        return { opacity: 0, y: 40 };
    }
  };

  return (
    <motion.div
      initial={getInitialState()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
