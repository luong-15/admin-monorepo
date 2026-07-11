import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const buttonGroupVariants = cva(
  // Thêm shadow-sm để tạo khối thống nhất cho cả nhóm
  "flex w-fit items-stretch rounded-xl shadow-sm transition-all [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-xl has-[>[data-slot=button-group]]:gap-2",
  {
    variants: {
      orientation: {
        horizontal:
          // Khớp với rounded-xl của Button, xóa viền giữa để tránh double-border
          "[&>*:first-child]:rounded-l-xl [&>*:last-child]:rounded-r-xl [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        vertical:
          // Xử lý tương tự cho chiều dọc
          "flex-col [&>*:first-child]:rounded-t-xl [&>*:last-child]:rounded-b-xl [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        // Nâng cấp giao diện Text: Nền kính mờ, chữ nhạt tinh tế, padding tương xứng h-11 của Button
        "bg-muted/30/50 dark:bg-slate-800/30 text-muted-foreground flex items-center gap-2 border border-border/60 px-5 py-2 text-sm font-bold backdrop-blur-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
      {...props}
    />
  );
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        // Làm viền phân cách mỏng và hài hòa hơn với màu nền
        "bg-border/60 relative m-0! self-stretch data-[orientation=vertical]:h-auto data-[orientation=horizontal]:w-auto",
        className,
      )}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
