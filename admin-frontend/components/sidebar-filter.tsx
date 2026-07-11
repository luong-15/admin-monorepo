"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X, RotateCw, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

/* ================= TYPES ================= */
interface FilterSection {
  id: string;
  label: string;
  options: { value: string; label: string; count?: number }[];
}

interface PriceRange {
  min: number;
  max: number;
}

export interface FilterState {
  priceRange: PriceRange;
  brands: string[];
  categories: string[];
  [key: string]: any;
}

interface ApiFilters {
  brands: { value: string; label: string; count: number }[];
  categories: { value: string; label: string; count: number }[];
}

interface SidebarFilterProps {
  /** Controlled: state of selected values */
  filters: FilterState;
  /** called immediately (debounced inside) when user changes */
  onFiltersChange: (filters: FilterState) => void;
  /** optional: allow parent to reset */
  onReset?: () => void;
}



const PRICE_MIN = 0;
const PRICE_MAX = 100000000;
const SHOW_LIMIT = 6;

/* ================= OPTION ITEM ================= */
interface OptionItemProps {
  option: { value: string; label: string; count?: number };
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const OptionItem = React.memo(
  ({ option, checked, onChange }: OptionItemProps) => {
    const id = `filter-${option.value}`;

    return (
      <div
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
          "hover:bg-muted/70",
          checked && "bg-primary/8",
        )}
      >
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onChange(value === true)}
          className="shrink-0"
        />

        <Label
          htmlFor={id}
          className="min-w-0 flex-1 cursor-pointer text-sm leading-5"
        >
          <span className="block truncate">{option.label}</span>
        </Label>

        {option.count !== undefined && (
          <Badge
            variant="secondary"
            className="shrink-0 rounded-full px-2 py-0 text-[11px]"
          >
            {option.count}
          </Badge>
        )}
      </div>
    );
  },
);

OptionItem.displayName = "OptionItem";

/* ================= FILTER SECTION ================= */
interface FilterSectionUIProps {
  section: FilterSection;
  selectedValues: string[];
  expanded: boolean;
  toggle: (id: string) => void;
  onChange: (value: string, checked: boolean) => void;
  onClear: () => void;
  globalKeyword: string;
  forceOpen: boolean;
}

function FilterSectionUI({
  section,
  selectedValues,
  expanded,
  toggle,
  onChange,
  onClear,
  globalKeyword,
  forceOpen,
}: FilterSectionUIProps) {

  const isOpen = forceOpen || expanded;

  const [showAll, setShowAll] = useState(false);

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const filteredOptions = useMemo(() => {
    const keyword = globalKeyword.trim().toLowerCase();

    const list = keyword
      ? section.options.filter((option) =>
          option.label.toLowerCase().includes(keyword),
        )
      : section.options;

    return list.sort(
      (a, b) =>
        Number(selectedSet.has(b.value)) - Number(selectedSet.has(a.value)),
    );
  }, [section.options, globalKeyword, selectedSet]);

  const visibleOptions = useMemo(
    () => (showAll ? filteredOptions : filteredOptions.slice(0, SHOW_LIMIT)),
    [showAll, filteredOptions],
  );

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  const updateHeight = useCallback(() => {
    if (!isOpen || !contentRef.current) return;
    setHeight(contentRef.current.scrollHeight);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !contentRef.current) {
      setHeight(0);
      return;
    }

    let raf = 0;

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => updateHeight());
    };

    schedule();

    const node = contentRef.current;
    const resizeObserver = new ResizeObserver(() => {
      schedule();
    });

    resizeObserver.observe(node);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [isOpen, filteredOptions.length, showAll, globalKeyword, updateHeight]);

  useEffect(() => {
    setShowAll(false);
  }, [globalKeyword, section.id]);

  const handleOptionChange = useCallback(
    (value: string) => (checked: boolean) => onChange(value, checked),
    [onChange],
  );

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        type="button"
        onClick={() => toggle(section.id)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {section.label}
          </span>

          {selectedValues.length > 0 && (
            <Badge className="h-5 shrink-0 rounded-full px-2 text-[11px]">
              {selectedValues.length}
            </Badge>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {selectedValues.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Xóa bộ lọc ${section.label}`}
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onClear();
                }
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}

          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-300",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </button>

      <div
        className="overflow-hidden transition-[height] duration-300 ease-out"
        style={{ height }}
      >
        <div
          ref={contentRef}
          className="pb-4 will-change-transform"
        >
          <div
            className={cn(
              "space-y-1 pr-1",
              "lg:overflow-visible lg:max-h-none",
              showAll
                ? "overflow-visible [-webkit-overflow-scrolling:touch] touch-pan-y [scrollbar-gutter:stable]"
                : "max-h-[min(42dvh,360px)] overscroll-contain [-webkit-overflow-scrolling:touch] touch-pan-y [scrollbar-gutter:stable]",
              "[&::-webkit-scrollbar]:w-1.5",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-thumb]:bg-border",
              "[&::-webkit-scrollbar-track]:bg-transparent",
            )}
          >
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option) => (
                <OptionItem
                  key={option.value}
                  option={option}
                  checked={selectedSet.has(option.value)}
                  onChange={handleOptionChange(option.value)}
                />
              ))
            ) : (
              <div className="rounded-xl bg-muted/40 px-3 py-4 text-center text-sm text-muted-foreground">
                Không có kết quả phù hợp
              </div>
            )}
          </div>

          {filteredOptions.length > SHOW_LIMIT && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 w-full rounded-xl text-xs font-semibold"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll
                ? "Thu gọn"
                : `Xem thêm ${filteredOptions.length - SHOW_LIMIT}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= GLOBAL SEARCH ================= */

type GlobalFilterSearchProps = {
  keyword: string;
  setKeyword: (v: string) => void;
};

function GlobalFilterSearch({ keyword, setKeyword }: GlobalFilterSearchProps) {
  return (
    <input

      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      placeholder="Tìm trong tất cả bộ lọc..."
      className={cn(
        "h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm outline-none",
        "transition-colors placeholder:text-muted-foreground/70",
        "focus:border-primary/50 focus:ring-2 focus:ring-primary/15",
      )}
    />
  );
}

/* ================= MAIN ================= */

export function SidebarFilter({
  filters,
  onFiltersChange,
  onReset,
}: SidebarFilterProps) {

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);


  const trigger = useCallback(
    (newFilters: FilterState) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        onFiltersChange(newFilters);
      }, 300);
    },
    [onFiltersChange],
  );


  const [sections, setSections] = useState<FilterSection[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["brands"]));

  useEffect(() => {
    const fetchFilters = async () => {
      const res = await fetch("/api/products/filters");
      if (!res.ok) return;

      const data: ApiFilters = await res.json();

      setSections([
        { id: "brands", label: "Hãng sản xuất", options: data.brands },
        { id: "categories", label: "Danh mục", options: data.categories },
      ]);
    };

    fetchFilters();
  }, []);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleCheckbox = useCallback(
    (key: string, value: string, checked: boolean) => {
      const list = (filters[key] as string[]) ?? [];
      const nextList = checked
        ? [...list, value]
        : list.filter((item) => item !== value);

      const next: FilterState = { ...filters, [key]: nextList };
      trigger(next);
    },
    [filters, trigger],
  );


  const handleReset = useCallback(() => {
    const resetFilters: FilterState = {
      priceRange: { min: PRICE_MIN, max: PRICE_MAX },
      brands: [],
      categories: [],
    };

    onReset?.();
    trigger(resetFilters);
  }, [onReset, trigger]);

  const handleSectionClear = useCallback(
    (sectionId: string) => {
      const next = { ...filters, [sectionId]: [] } as FilterState;
      trigger(next);
    },
    [filters, trigger],
  );



  return (
    <div className="flex h-full min-h-0 max-h-full flex-col rounded-2xl overflow-hidden bg-card">
      <div className="shrink-0 border-b border-border/50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Filter className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold">Bộ lọc</h2>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="shrink-0 rounded-xl text-xs font-semibold"
          >
            <RotateCw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        {/* Search across all filter sections */}
        <div className="mt-3">
          <GlobalFilterSearch keyword={keyword} setKeyword={setKeyword} />
        </div>
      </div>


      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5",
          "touch-pan-y [scrollbar-gutter:stable]",
          "[&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-border",
          "[&::-webkit-scrollbar-track]:bg-transparent",
        )}
      >
        {sections.map((s) => (
          <FilterSectionUI
            key={s.id}
            section={s}
            selectedValues={(filters[s.id] as string[]) ?? []}
            expanded={expanded.has(s.id)}
            toggle={toggle}
            onChange={(value, checked) => handleCheckbox(s.id, value, checked)}
            onClear={() => handleSectionClear(s.id)}
            globalKeyword={keyword}
            forceOpen={
              keyword.trim().length > 0 &&
              s.options.some((o) =>
                o.label.toLowerCase().includes(keyword.trim().toLowerCase()),
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

