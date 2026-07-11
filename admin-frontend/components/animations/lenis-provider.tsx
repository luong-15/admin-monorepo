"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
      prevent: (node: HTMLElement) => {
        // Allow native scroll for scrollable containers
        let el: HTMLElement | null = node;
        while (el && el !== document.body) {
          const style = window.getComputedStyle(el);
          const overflowY = style.overflowY;
          if (
            overflowY === "auto" ||
            overflowY === "scroll" ||
            el.hasAttribute("data-lenis-prevent")
          ) {
            return false; // Don't prevent default — let native scroll handle it
          }
          el = el.parentElement;
        }
        return true; // Use Lenis smooth scroll
      },
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
