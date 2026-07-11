"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  LayoutDashboard,
  Settings2,
  BarChart3,
} from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

const adminSidebarItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/stats", label: "Thống kê", icon: BarChart3 },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: Package },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings2 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    // Khởi tạo ở đây để đảm bảo an toàn và không bị tạo lại khi re-render
    const supabase = createBrowserClient(); 

    const checkAuth = async () => {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (authError || !authUser) {
          router.replace("/auth/login");
          return;
        }

        setEmail(authUser.email || null);

        const appMetadata = authUser.app_metadata || {};
        const userMetadata = authUser.user_metadata || {};
        
        const rawRole = appMetadata.role || userMetadata.role;
        const role = typeof rawRole === "string" ? rawRole.toLowerCase() : null;
        const isAdmin = role === "admin" || appMetadata.is_admin === true;

        if (isAdmin) {
          setUser({
            id: authUser.id,
            full_name:
              userMetadata.full_name ||
              appMetadata.full_name ||
              userMetadata.name ||
              authUser.email ||
              "Admin",
            role: "admin",
            email: authUser.email || null,
            avatar_url: userMetadata.avatar_url,
            country: appMetadata.country,
            created_at: authUser.created_at || new Date().toISOString(),
            updated_at: authUser.updated_at || new Date().toISOString(),
          } as UserProfile);
          setLoading(false);
        } else {
          router.replace("/unauthorized");
        }
      } catch (error) {
        if (isMounted) router.replace("/auth/login");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth/login");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]); // XÓA pathname khỏi đây để không bị check lại khi bấm chuyển link

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <AdminSkeleton />;

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="hidden text-xl font-black tracking-tight sm:block uppercase">
              Admin Panel
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-full">
              <Link href="/">Xem Website</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r p-6 transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:p-0 lg:bg-transparent lg:border-none",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="sticky top-24 flex flex-col gap-6">
              {/* Profile Card */}
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarImage src={user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold">
                      {user?.full_name?.[0] || email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {user?.full_name || "Administrator"}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                      {email?.split("@")[0]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="flex flex-col gap-1">
                {adminSidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-card",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-transform group-hover:scale-110",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-6 border-t border-border/40">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                >
                  <LogOut className="h-5 w-5" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </aside>

          {/* Overlay cho Mobile Sidebar */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Floating Mobile Toggle Button */}
          <Button
            size="icon"
            className="fixed bottom-8 right-8 z-[60] h-14 w-14 rounded-full shadow-2xl lg:hidden active:scale-90 transition-transform"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {/* Content Area */}
          <div className="flex-1 min-w-0 pb-20 lg:pb-0">{children}</div>
        </div>
      </main>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="flex gap-10">
        <Skeleton className="hidden lg:block h-[600px] w-64 rounded-2xl" />
        <Skeleton className="flex-1 h-[800px] rounded-3xl" />
      </div>
    </div>
  );
}