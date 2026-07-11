"use client";

import { useState, useCallback, type ReactNode, type RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlyingItem {
  id: string;
  src: string;
  startRect: DOMRect;
  endRect: DOMRect;
}

let animationIdSeq = 0;
function createClientAnimationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  animationIdSeq = (animationIdSeq + 1) % Number.MAX_SAFE_INTEGER;
  return `flyto-cart-${Date.now()}-${animationIdSeq}`;
}


export function useFlyToCart() {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const flyToCart = useCallback(
    (
      imageSrc: string,
      startElement: HTMLElement,
      cartButtonSelector = "[data-cart-icon]",
    ) => {
      const cartBtn = document.querySelector(
        cartButtonSelector,
      ) as HTMLElement | null;
      if (!cartBtn) {
        console.warn("Cart button not found");
        return;
      }

      const startRect = startElement.getBoundingClientRect();
      const endRect = cartBtn.getBoundingClientRect();

      const id = createClientAnimationId();

      setFlyingItems((prev) => [
        ...prev,
        { id, src: imageSrc, startRect, endRect },
      ]);

      // Cleanup after animation
      setTimeout(() => {
        setFlyingItems((prev) => prev.filter((item) => item.id !== id));
      }, 900);
    },
    [],
  );

  const FlyingItemsLayer = useCallback(() => {
    return (
      <AnimatePresence>
        {flyingItems.map((item) => {
          const startX = item.startRect.left + item.startRect.width / 2;
          const startY = item.startRect.top + item.startRect.height / 2;
          const endX = item.endRect.left + item.endRect.width / 2;
          const endY = item.endRect.top + item.endRect.height / 2;

          return (
            <motion.img
              key={item.id}
              src={item.src}
              alt=""
              className="pointer-events-none fixed z-9999 w-16 h-16 object-cover rounded-lg shadow-2xl"
              initial={{
                x: startX - 32,
                y: startY - 32,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: endX - 32,
                y: endY - 32,
                scale: 0.2,
                opacity: 0,
              }}
              transition={{
                duration: 0.7,
                ease: [0.2, 0.8, 0.2, 1] as const,
              }}
              style={{ willChange: "transform, opacity" }}
            />
          );
        })}
      </AnimatePresence>
    );
  }, [flyingItems]);

  return { flyToCart, FlyingItemsLayer };
}

interface FlyToCartProps {
  children: ReactNode;
  imageUrl: string;
  imageRef: RefObject<HTMLImageElement | null>;
  onComplete?: () => void;
  cartButtonSelector?: string;
}

export function FlyToCart({
  children,
  imageUrl,
  imageRef,
  onComplete,
  cartButtonSelector = "[data-cart-icon]",
}: FlyToCartProps) {
  const { flyToCart, FlyingItemsLayer } = useFlyToCart();

  const handleClick = () => {
    const img = imageRef.current;
    if (img) {
      flyToCart(imageUrl, img, cartButtonSelector);
    }
    // Delay the actual cart action slightly so the animation starts first
    setTimeout(() => {
      onComplete?.();
    }, 150);
  };

  return (
    <>
      <div onClick={handleClick} className="contents">
        {children}
      </div>
      <FlyingItemsLayer />
    </>
  );
}

export function FlyToCartOverlay() {
  const { FlyingItemsLayer } = useFlyToCart();
  return <FlyingItemsLayer />;
}

function createFlyingItem(
  imageSrc: string,
  startRect: DOMRect,
  endRect: DOMRect,
) {
  const id = createClientAnimationId();

  const el = document.createElement("img");
  el.src = imageSrc;
  el.id = id;
  el.alt = "";
  el.style.position = "fixed";
  el.style.zIndex = "9999";
  el.style.width = "64px";
  el.style.height = "64px";
  el.style.objectFit = "cover";
  el.style.borderRadius = "8px";
  el.style.pointerEvents = "none";
  el.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
  el.style.left = `${startRect.left + startRect.width / 2 - 32}px`;
  el.style.top = `${startRect.top + startRect.height / 2 - 32}px`;
  el.style.willChange = "transform, opacity";
  el.style.transition =
    "transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)";

  document.body.appendChild(el);

  // Force reflow
  el.getBoundingClientRect();

  requestAnimationFrame(() => {
    const endX = endRect.left + endRect.width / 2 - 32;
    const endY = endRect.top + endRect.height / 2 - 32;
    el.style.transform = `translate(${endX - (startRect.left + startRect.width / 2 - 32)}px, ${endY - (startRect.top + startRect.height / 2 - 32)}px) scale(0.2)`;
    el.style.opacity = "0";
  });

  setTimeout(() => {
    el.remove();
  }, 900);
}

export function triggerFlyToCart(
  imageSrc: string,
  _productId?: string,
  eventOrElement?: React.MouseEvent | HTMLElement,
  cartButtonSelector = "[data-cart-icon]",
) {
  const cartBtn = document.querySelector(
    cartButtonSelector,
  ) as HTMLElement | null;
  if (!cartBtn) {
    console.warn("Cart button not found");
    return;
  }

  let startRect: DOMRect;
  if (eventOrElement instanceof HTMLElement) {
    startRect = eventOrElement.getBoundingClientRect();
  } else if (eventOrElement && "currentTarget" in eventOrElement && "target" in eventOrElement) {
    startRect = (
      eventOrElement.target as HTMLElement
    ).getBoundingClientRect();
  } else {
    // Fallback to cart button itself if no start element provided
    startRect = cartBtn.getBoundingClientRect();
  }

  const endRect = cartBtn.getBoundingClientRect();
  createFlyingItem(imageSrc, startRect, endRect);
}
