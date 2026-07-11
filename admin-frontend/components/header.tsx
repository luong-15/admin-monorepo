"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Search,
  User as UserIcon,
  Menu,
  LogOut,
  GitCompare,
  Home,
  Smartphone,
  FolderTree,
  Flame,
  Info,
  Laptop,
  Tablet,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store/cart-store";
import { useComparisonStore } from "@/lib/store/comparison-store";
import { CartDrawer } from "@/components/cart/cart-drawer";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function CartButton() {
  const totalItems = useCartStore((state) => state.getItemCount());
  const openCart = useCartStore((state) => state.openCart);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-primary/10 hover:text-primary transition-colors"
      onClick={openCart}
      data-cart-icon
    >
      <ShoppingCart className="h-5 w-5" />
      {isClient && totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in">
          {totalItems}
        </span>
      )}
    </Button>
  );
}

function ComparisonButton() {
  const productCount = useComparisonStore((state) => state.getProductCount());
  const openComparison = useComparisonStore((state) => state.openComparison);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-primary/10 hover:text-primary transition-colors"
      onClick={openComparison}
    >
      <GitCompare className="h-5 w-5" />
      {isClient && productCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in">
          {productCount}
        </span>
      )}
    </Button>
  );
}

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const cartMerge = useCartStore((s) => s.mergeLocalCartToServer);
  const syncCart = useCartStore((s) => s.syncCart);
  const lastSyncedRef = React.useRef<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    const checkAuth = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) setUser(authUser);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // When user just logged in: merge local cart to DB, then sync from DB.
  useEffect(() => {
    const userId = user?.id ?? null;
    if (!userId) {
      lastSyncedRef.current = null;
      return;
    }
    // prevent repeat on re-render
    if (lastSyncedRef.current === userId) return;

    // merge & then sync
    (async () => {
      try {
        // ensure merge runs before reading DB cart
        await cartMerge();
        await syncCart();
      } catch (e) {
        console.warn("Cart merge/sync after login failed", e);
      } finally {
        lastSyncedRef.current = userId;
      }
    })();
  }, [user, cartMerge, syncCart]);


  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  // Gộp logic tìm kiếm chung để tái sử dụng
  const executeSearch = (query: string) => {
    setIsSearching(true);
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      router.push(`/products?search=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push("/products");
    }

    setTimeout(() => setIsSearching(false), 300);
    setIsMobileSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-(--z-sticky) w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm group-hover:scale-105 transition-transform">
                <span className="text-base font-bold text-primary-foreground tracking-tight">
                  TN
                </span>
              </div>
              <span className="hidden text-xl font-bold tracking-tight md:inline-block">
                TechNova
              </span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden flex-1 max-w-xl lg:block">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeSearch(searchQuery);
                }}
                className="relative group"
              >
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm laptop, smartphone, phụ kiện..."
                  className="w-full pl-10 pr-10 bg-muted/40 border-transparent hover:border-border focus-visible:bg-background focus-visible:ring-primary/20 rounded-full h-10 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </form>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-7 lg:flex">
              <Link
                href="/products"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sản phẩm
              </Link>
              <Link
                href="/deals"
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <Flame className="h-4 w-4" /> Deal hot
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Giới thiệu
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* Mobile Search Toggle */}
              <Sheet
                open={isMobileSearchOpen}
                onOpenChange={setIsMobileSearchOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden hover:bg-primary/10"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="top"
                  className="h-auto pb-6 p-4 rounded-b-2xl"
                >
                  <SheetTitle className="sr-only">Tìm kiếm sản phẩm</SheetTitle>
                  <div className="space-y-5">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        executeSearch(mobileSearchQuery);
                      }}
                      className="space-y-4 pt-2"
                    >
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Nhập tên sản phẩm..."
                          className="pl-11 h-12 text-base rounded-xl bg-muted/50 border-border/50"
                          value={mobileSearchQuery}
                          onChange={(e) => setMobileSearchQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full h-11 rounded-xl"
                        size="lg"
                      >
                        Tìm kiếm
                      </Button>
                    </form>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Từ khóa phổ biến
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "iPhone 15",
                          "MacBook M3",
                          "Samsung S24",
                          "Bàn phím cơ",
                          "Tai nghe",
                        ].map((term) => (
                          <Button
                            key={term}
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs rounded-full bg-muted/60 hover:bg-primary hover:text-primary-foreground"
                            onClick={() => {
                              setMobileSearchQuery(term);
                              executeSearch(term);
                            }}
                          >
                            {term}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* User Dropdown */}
              {!loading &&
                (user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full h-9 w-9 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <Avatar className="h-8 w-8 border border-border/50">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {user.email?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-60 rounded-xl p-2"
                    >
                      <DropdownMenuLabel className="font-normal px-2.5 py-2">
                        <div className="flex flex-col space-y-1.5">
                          <p className="text-sm font-semibold leading-none text-foreground">
                            {user.user_metadata?.full_name ||
                              "Thành viên TechNova"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem
                        asChild
                        className="rounded-lg cursor-pointer py-2.5"
                      >
                        <Link href="/dashboard">
                          <UserIcon className="mr-2.5 h-4 w-4 text-muted-foreground" />
                          Quản lý tài khoản
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="rounded-lg cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <LogOut className="mr-2.5 h-4 w-4" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Link href="/auth/login">
                      <UserIcon className="h-5 w-5" />
                    </Link>
                  </Button>
                ))}

              <ComparisonButton />
              <CartButton />

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden hover:bg-muted"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[85vw] sm:w-96 p-0 border-l-0"
                >
                  <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
                  <div className="flex flex-col h-full bg-background">
                    <div className="flex items-center justify-between p-5 border-b border-border/40 bg-muted/20">
                      <span className="text-lg font-bold tracking-tight">
                        Menu
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                      <div className="space-y-1">
                        <Link
                          href="/"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-muted transition-colors"
                        >
                          <Home className="h-5 w-5 text-muted-foreground" />{" "}
                          Trang chủ
                        </Link>
                        <Link
                          href="/products"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-muted transition-colors"
                        >
                          <Smartphone className="h-5 w-5 text-muted-foreground" />{" "}
                          Tất cả sản phẩm
                        </Link>
                        <Link
                          href="/categories"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-muted transition-colors"
                        >
                          <FolderTree className="h-5 w-5 text-muted-foreground" />{" "}
                          Danh mục
                        </Link>
                        <Link
                          href="/deals"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors"
                        >
                          <Flame className="h-5 w-5" /> Deal hot
                        </Link>
                        <Link
                          href="/about"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-muted transition-colors"
                        >
                          <Info className="h-5 w-5 text-muted-foreground" />{" "}
                          Giới thiệu
                        </Link>
                      </div>

                      <div className="mt-8 px-3">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                          Danh mục nổi bật
                        </h3>
                        <div className="space-y-1">
                          <Link
                            href="/categories/laptop"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors"
                          >
                            <Laptop className="h-4 w-4 text-muted-foreground" />{" "}
                            Laptop
                          </Link>
                          <Link
                            href="/categories/smartphone"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors"
                          >
                            <Smartphone className="h-4 w-4 text-muted-foreground" />{" "}
                            Smartphone
                          </Link>
                          <Link
                            href="/categories/tablet"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors"
                          >
                            <Tablet className="h-4 w-4 text-muted-foreground" />{" "}
                            Tablet
                          </Link>
                          <Link
                            href="/categories/accessories"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors"
                          >
                            <Headphones className="h-4 w-4 text-muted-foreground" />{" "}
                            Phụ kiện
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-border/40 bg-muted/10">
                      {user ? (
                        <div className="space-y-2">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                          >
                            <UserIcon className="h-4 w-4" /> Quản lý tài khoản
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-xl hover:bg-muted transition-colors"
                          >
                            <LogOut className="h-4 w-4" /> Đăng xuất
                          </button>
                        </div>
                      ) : (
                        <Link
                          href="/auth/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                        >
                          <UserIcon className="h-4 w-4" /> Đăng nhập / Đăng ký
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
