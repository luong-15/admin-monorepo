"use client";

import React, { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FilterState } from "@/components/sidebar-filter";
import { SidebarFilter } from "@/components/sidebar-filter";

type Props = {
  categorySlug: string;
};

function parseCsvParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toQuery(filters: FilterState, existing: URLSearchParams) {
  const next = new URLSearchParams(existing);

  // price
  if (filters.priceRange?.min !== undefined) {
    next.set("price_min", String(filters.priceRange.min));
  } else {
    next.delete("price_min");
  }
  if (filters.priceRange?.max !== undefined) {
    next.set("price_max", String(filters.priceRange.max));
  } else {
    next.delete("price_max");
  }

  // brand
  const brands = (filters.brands ?? []).join(",");
  if (brands) next.set("brand", brands);
  else next.delete("brand");

  // categories (not used by CategoryPage query currently; keep as forward-compat)
  const cats = (filters.categories ?? []).join(",");
  if (cats) next.set("category", cats);
  else next.delete("category");

  // in_stock - derive from categories? SidebarFilter currently doesn't expose it.
  // Keep existing value; CategoryPage already supports it via searchParams.

  return next;
}

export function CategorySidebarFilterClient({ categorySlug }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFilters: FilterState = useMemo(() => {
    const priceMin = searchParams.get("price_min");
    const priceMax = searchParams.get("price_max");
    const brand = searchParams.get("brand");

    const min = priceMin ? Number.parseInt(priceMin, 10) : 0;
    const max = priceMax ? Number.parseInt(priceMax, 10) : 100000000;

    return {
      priceRange: { min, max },
      brands: parseCsvParam(brand),
      categories: [],
    };
  }, [searchParams]);

  const onFiltersChange = useCallback(
    (nextFilters: FilterState) => {
      // Build new URL query; preserve other params like sort
      const base = new URLSearchParams(searchParams.toString());
      const updated = toQuery(nextFilters, base);

      router.push(`${pathname}?${updated.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const onReset = useCallback(() => {
    const base = new URLSearchParams(searchParams.toString());
    base.delete("price_min");
    base.delete("price_max");
    base.delete("brand");
    base.delete("category");

    router.push(`${pathname}?${base.toString()}`);
  }, [pathname, router, searchParams]);

  return (
    <SidebarFilter filters={currentFilters} onFiltersChange={onFiltersChange} onReset={onReset} />
  );
}

