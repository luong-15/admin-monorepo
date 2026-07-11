"use client";

import React from "react";
import { toast as shadcnToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastAction } from "@/components/ui/toast";

type Variant = "success" | "error" | "warning" | "info" | "loading";

// Tối ưu cấu trúc: Gộp toàn bộ style và icon vào một map duy nhất để không phải if/else nhiều lần
const VARIANT_STYLES: Record<
  Variant,
  { bg: string; icon: React.ElementType; iconClass: string }
> = {
  success: {
    bg: "bg-emerald-500/15",
    icon: CheckCircle2,
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  error: {
    bg: "bg-red-500/15",
    icon: XCircle,
    iconClass: "text-red-600 dark:text-red-400",
  },
  warning: {
    bg: "bg-amber-500/15",
    icon: AlertTriangle,
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  info: {
    bg: "bg-blue-500/15",
    icon: Info,
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  loading: {
    bg: "bg-slate-500/15",
    icon: Loader2,
    iconClass: "text-slate-600 dark:text-slate-400 animate-spin",
  },
};

const MESSAGES = {
  cartAdded: (name: string) => `${name} đã được thêm vào giỏ hàng!`,
  wishlistAdded: (name: string) => `${name} đã được thêm vào yêu thích!`,
  wishlistRemoved: (name: string) => `${name} đã được xóa khỏi yêu thích`,
  comparisonAdded: (name: string) => `${name} đã được thêm vào so sánh!`,
  shareCopied: "Đã sao chép liên kết sản phẩm!",
  loginRequired: "Vui lòng đăng nhập để tiếp tục",
  genericError: "Có lỗi xảy ra, vui lòng thử lại!",
  genericSuccess: "Thành công!",
  orderPlaced: "Đơn hàng đã được đặt thành công!",
  paymentSuccess: "Thanh toán thành công!",
  stockLow: "Sản phẩm sắp hết hàng!",
  outOfStock: "Sản phẩm đã hết hàng!",
  checkoutStarted: "Bắt đầu thanh toán...",
} as const;

type NotifyOptions = {
  duration?: number;
  undo?: () => void;
};

export function notify(
  content: React.ReactNode,
  variant: Variant = "info",
  options: NotifyOptions = {},
) {
  const { bg, icon: Icon, iconClass } = VARIANT_STYLES[variant];

  const toastDescription = (
    <div
      className="flex w-full items-center gap-3.5 pr-2"
      role="alert"
      aria-live="polite"
    >
      {/* Icon Background được lấy động từ cấu hình, không lặp code */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          bg,
        )}
      >
        <Icon className={cn("h-5 w-5", iconClass)} />
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-[13px] font-bold leading-snug text-foreground line-clamp-2">
          {content}
        </p>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          TechNova Store
        </p>
      </div>
    </div>
  );

  const toastVariant = variant === "error" ? "destructive" : "default";

  // Nút Hoàn Tác: Pill shape (rounded-full), hiệu ứng hover nổi bật
  const toastAction = options.undo ? (
    <ToastAction
      altText="Hoàn tác"
      onClick={(e) => {
        e.stopPropagation(); // Ngăn chặn nổi bọt sự kiện
        if (options.undo) options.undo();
      }}
      className="ml-auto flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-border/50 bg-background/80 px-4 text-xs font-bold text-foreground shadow-sm transition-all hover:bg-foreground hover:text-background focus:ring-2 focus:ring-ring focus:ring-offset-1"
    >
      <RotateCcw className="h-3 w-3 shrink-0" />
      Hoàn tác
    </ToastAction>
  ) : undefined;

  shadcnToast({
    variant: toastVariant,
    description: toastDescription,
    action: toastAction,
    duration: options.duration ?? (variant === "loading" ? 6000 : 3500),
    className: cn(
      "group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border bg-background/80 p-4 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl !z-[99999] sm:max-w-[400px]",
      variant === "error" ? "border-red-500/30" : "border-border/40",
    ),
  });
}

// --- Generic helpers ---
export const notifySuccess = (
  content: React.ReactNode,
  options?: NotifyOptions,
) => notify(content, "success", options);
export const notifyError = (
  content: React.ReactNode,
  options?: NotifyOptions,
) => notify(content, "error", options);
export const notifyWarning = (
  content: React.ReactNode,
  options?: NotifyOptions,
) => notify(content, "warning", options);
export const notifyInfo = (content: React.ReactNode, options?: NotifyOptions) =>
  notify(content, "info", options);
export const notifyLoading = (
  content: React.ReactNode,
  options?: NotifyOptions,
) => notify(content, "loading", options);

// --- E-commerce specific notifications ---
export const notifyCartAdded = (name: string, undo?: () => void) =>
  notifySuccess(MESSAGES.cartAdded(name), { duration: 2500, undo });
export const notifyWishlistAdded = (name: string, undo?: () => void) =>
  notifySuccess(MESSAGES.wishlistAdded(name), { duration: 2500, undo });
export const notifyWishlistRemoved = (name: string) =>
  notifyInfo(MESSAGES.wishlistRemoved(name), { duration: 2500 });
export const notifyComparisonAdded = (name: string) =>
  notifySuccess(MESSAGES.comparisonAdded(name), { duration: 2500 });
export const notifyShareCopied = () =>
  notifyInfo(MESSAGES.shareCopied, { duration: 2000 });
export const notifyLoginRequired = () =>
  notifyWarning(MESSAGES.loginRequired, { duration: 2500 });
export const notifyOrderPlaced = (orderNumber: string) =>
  notifySuccess(
    `Đơn hàng #${orderNumber} ${MESSAGES.orderPlaced.toLowerCase()}`,
    { duration: 3000 },
  );
export const notifyPaymentSuccess = () =>
  notifySuccess(MESSAGES.paymentSuccess, { duration: 3000 });
export const notifyOutOfStock = (name: string) =>
  notifyError(`${name}: ${MESSAGES.outOfStock.toLowerCase()}`, {
    duration: 3000,
  });
export const notifyStockLow = (name: string) =>
  notifyWarning(`${name}: ${MESSAGES.stockLow.toLowerCase()}`, {
    duration: 3500,
  });
