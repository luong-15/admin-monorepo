"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery = React.memo(
  ({ images, productName }: ProductGalleryProps) => {
    const safeImages = useMemo(() => (images ?? []).filter(Boolean), [images]);
    const length = safeImages.length;

    const [selectedImage, setSelectedImage] = useState(0);

    const nextImage = () => {
      if (!length) return;
      setSelectedImage((prev) => (prev + 1) % length);
    };

    const prevImage = () => {
      if (!length) return;
      setSelectedImage((prev) => (prev - 1 + length) % length);
    };

    return (
      <div className="space-y-4">
        {/* Main Image */}
        <div className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={safeImages[selectedImage] || "/placeholder.svg"}
            alt={`${productName} - Image ${selectedImage + 1}`}
            fill
            className="object-cover"
            priority
          />

          {/* Navigation Buttons */}
          {length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                onClick={prevImage}
                type="button"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                onClick={nextImage}
                type="button"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {length > 1 && (
            <div className="absolute bottom-4 right-4 rounded-md bg-background/80 px-3 py-1 text-sm font-medium backdrop-blur-sm">
              {selectedImage + 1} / {length}
            </div>
          )}
        </div>

        {/* Thumbnail Row (max 4) */}
        {length > 1 && (
          <div className="group flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={prevImage}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Show only 1 row (4 thumbnails) */}
            <div className="grid grid-cols-4 gap-3 flex-1">
              {safeImages
                .slice(selectedImage, selectedImage + 4)
                .map((image, index) => {
                  const realIndex = selectedImage + index;
                  return (
                    <button
                      key={realIndex}
                      type="button"
                      onClick={() => setSelectedImage(realIndex)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:border-blue-500 ${
                        selectedImage === realIndex
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-border"
                      }`}
                      aria-label={`${productName} thumbnail ${realIndex + 1}`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${productName} thumbnail ${realIndex + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  );
                })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={nextImage}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }
);

