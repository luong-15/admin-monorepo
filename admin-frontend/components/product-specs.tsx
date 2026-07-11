import { Card, CardContent } from "@/components/ui/card";
import {
  Cpu,
  Database,
  Monitor,
  Battery,
  Camera,
  Settings,
  Layers,
  Smartphone,
} from "lucide-react";

interface ProductSpecsProps {
  specifications: Record<string, any>;
}

// Map icons to categories
const CATEGORY_ICONS: Record<string, any> = {
  "Hiệu năng": Cpu,
  "Bộ nhớ": Database,
  "Màn hình": Monitor,
  "Pin & Sạc": Battery,
  Camera: Camera,
  "Hệ điều hành": Settings,
  "Tổng quan": Smartphone,
  "Thiết kế": Layers,
};

export function ProductSpecs({ specifications }: ProductSpecsProps) {
  if (!specifications || typeof specifications !== "object") {
    return (
      <div className="text-center py-12 rounded-3xl border border-dashed border-border/60 bg-muted/20">
        <p className="text-muted-foreground font-medium">
          Thông tin kỹ thuật chưa được cập nhật
        </p>
      </div>
    );
  }

  const specCategories: Record<string, Record<string, any>> = {};

  Object.entries(specifications).forEach(([key, value]) => {
    let category = "Tổng quan";
    const lowerKey = key.toLowerCase();

    if (
      lowerKey.includes("cpu") ||
      lowerKey.includes("chip") ||
      lowerKey.includes("gpu")
    )
      category = "Hiệu năng";
    else if (
      lowerKey.includes("ram") ||
      lowerKey.includes("storage") ||
      lowerKey.includes("ssd") ||
      lowerKey.includes("rom")
    )
      category = "Bộ nhớ";
    else if (
      lowerKey.includes("display") ||
      lowerKey.includes("screen") ||
      lowerKey.includes("màn hình") ||
      lowerKey.includes("tần số")
    )
      category = "Màn hình";
    else if (
      lowerKey.includes("battery") ||
      lowerKey.includes("pin") ||
      lowerKey.includes("sạc")
    )
      category = "Pin & Sạc";
    else if (lowerKey.includes("camera") || lowerKey.includes("ống kính"))
      category = "Camera";
    else if (
      lowerKey.includes("os") ||
      lowerKey.includes("android") ||
      lowerKey.includes("ios") ||
      lowerKey.includes("win")
    )
      category = "Hệ điều hành";
    else if (
      lowerKey.includes("kích thước") ||
      lowerKey.includes("trọng lượng") ||
      lowerKey.includes("vỏ")
    )
      category = "Thiết kế";

    if (!specCategories[category]) specCategories[category] = {};
    specCategories[category][key] = value;
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Object.entries(specCategories).map(([category, categorySpecs]) => {
        const Icon = CATEGORY_ICONS[category] || Smartphone;

        return (
          <Card
            key={category}
            className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl"
          >
            {/* Header Category */}
            <div className="flex items-center gap-3 px-6 py-4 bg-muted/40 border-b border-border/40">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground tracking-tight">
                {category}
              </h3>
            </div>

            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {Object.entries(categorySpecs).map(([key, value], index) => (
                  <div
                    key={index}
                    className="grid grid-cols-5 gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors group"
                  >
                    {/* Key: 40% width */}
                    <div className="col-span-2 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      {formatSpecKey(key)}
                    </div>
                    {/* Value: 60% width */}
                    <div className="col-span-3 text-sm font-medium text-foreground/90 text-right md:text-left">
                      {formatSpecValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function formatSpecKey(key: string): string {
  // Loại bỏ các từ lặp lại không cần thiết và format
  return key
    .replace(/^(màn hình|pin|camera|cpu|ram)\s+/gi, "") // Xóa tiền tố lặp
    .replaceAll(/([A-Z])/g, " $1")
    .replaceAll(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatSpecValue(value: any): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (Array.isArray(value)) return value.join(", ");

  const strValue = String(value);
  // Nếu là đơn vị đo lường, có thể thêm một chút style ở đây nếu cần
  return strValue;
}
