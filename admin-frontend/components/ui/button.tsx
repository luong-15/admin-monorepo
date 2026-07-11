import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Nâng cấp base styles: Bo góc tròn hơn (rounded-xl), font đậm hơn (font-bold), thêm hiệu ứng lún khi click (active:scale-[0.98])
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Tinh chỉnh nhẹ các biến thể mặc định
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-white shadow-sm shadow-destructive/20 hover:bg-destructive/90 hover:-translate-y-0.5",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        // --- CÁC BIẾN THỂ PREMIUM MỚI ---
        // Phù hợp cho nút "Mua ngay", "Thanh toán", Call-to-action chính
        premium:
          "bg-linear-to-r from-blue-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-90 hover:-translate-y-0.5 border-0",
        // Nền nhạt màu theo tone chủ đạo, dùng cho các nút hành động phụ (VD: Thêm vào giỏ)
        soft: "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/15 dark:hover:bg-primary/25",
        // Hiệu ứng kính mờ, tuyệt vời khi đặt đè lên hình ảnh hoặc nền gradient
        glass:
          "bg-white/20 backdrop-blur-md border border-white/30 text-slate-900 shadow-sm hover:bg-white/30 dark:text-white dark:bg-slate-900/30 dark:border-slate-700/50",
      },
      size: {
        default: "h-11 px-5 py-2", // Tăng kích thước chuẩn lên một chút cho dễ chạm
        sm: "h-9 rounded-lg px-4 text-xs gap-1.5",
        lg: "h-14 rounded-2xl px-8 text-base", // Nút to, bo góc lớn hơn
        icon: "size-11",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-14 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean; // Thêm prop cho trạng thái loading
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Tự động chèn spinner nếu đang loading và không dùng asChild */}
      {isLoading && !asChild ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
