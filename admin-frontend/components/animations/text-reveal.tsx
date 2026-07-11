"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/*  TextReveal — word-by-word 3D reveal                               */
/* ------------------------------------------------------------------ */

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  once?: boolean;
}

export function TextReveal({
  children,
  className,
  delay = 0,
  duration = 0.5,
  staggerDelay = 0.04,
  as: Tag = "span",
  once = true,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const words = containerRef.current.querySelectorAll(".tr-word");

      gsap.set(words, {
        opacity: 0,
        y: 20,
        rotateX: -90,
        transformPerspective: 600,
      });

      gsap.to(words, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration,
        stagger: staggerDelay,
        delay,
        ease: "power3.out",
        scrollTrigger: once
          ? {
              trigger: containerRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            }
          : undefined,
      });
    },
    { scope: containerRef },
  );

  const words = children.split(" ");

  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      <Tag className={className}>
        {words.map((word, i) => (
          <span
            key={i}
            className="tr-word inline-block mr-[0.25em]"
            style={{ willChange: "transform, opacity" }}
          >
            {word}
          </span>
        ))}
      </Tag>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LineReveal — directional slide-in                                 */
/* ------------------------------------------------------------------ */

interface LineRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
}

export function LineReveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = "up",
  once = true,
}: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  useGSAP(
    () => {
      if (!ref.current) return;

      const inner = ref.current.querySelector(".lr-inner");

      gsap.set(inner, {
        opacity: 0,
        ...directions[direction],
      });

      gsap.to(inner, {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease: "power3.out",
        scrollTrigger: once
          ? {
              trigger: ref.current,
              start: "top 85%",
              toggleActions: "play none none none",
            }
          : undefined,
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div className="lr-inner" style={{ willChange: "transform, opacity" }}>
        {children}
      </div>
    </div>
  );
}
