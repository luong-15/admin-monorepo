import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MaintenanceScreen() {
  return (
    <div className="min-h-screen bg-linear-to-br from-muted to-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-32 h-32 mx-auto bg-destructive/10 rounded-3xl flex items-center justify-center">
          <svg
            className="w-20 h-20 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-destructive via-destructive/75 to-destructive/50 bg-clip-text text-transparent">
            Bảo trì hệ thống
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Website tạm thời không khả dụng
          </p>
          <p className="text-muted-foreground/80 max-w-sm mx-auto leading-relaxed">
            Chúng tôi đang nâng cấp hệ thống để mang đến trải nghiệm tốt hơn.
            Vui lòng quay lại sau!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            asChild
            className="flex-1 bg-destructive hover:bg-destructive/90"
          >
            <Link href="mailto:contact@techstore.vn">Liên hệ hỗ trợ</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground/60 tracking-wide uppercase font-medium">
          {`Thời gian dự kiến hoàn thành: < 30 phút`}
        </p>
      </div>
    </div>
  );
}
