"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Facebook, Twitter, Instagram, Youtube, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Sản phẩm", path: "/products" },
  { name: "Khuyến mãi", path: "/deals" },
  { name: "Giới thiệu", path: "/about" },
  { name: "Liên hệ", path: "/contact" },
];

const SUPPORT_LINKS = [
  { name: "Chính sách bảo hành", path: "/warranty" },
  { name: "Vận chuyển & Giao nhận", path: "/shipping" },
  { name: "Đổi trả hàng", path: "/returns" },
  { name: "Câu hỏi thường gặp (FAQ)", path: "/faq" },
];

const SOCIALS = [
  {
    icon: Facebook,
    label: "Facebook",
    color: "hover:bg-blue-600",
    shareKey: "facebook",
  },
  {
    icon: Twitter,
    label: "Twitter",
    color: "hover:bg-sky-500",
    shareKey: "twitter",
  },
  {
    icon: Instagram,
    label: "Instagram",
    color: "hover:bg-pink-600",
    shareKey: "instagram",
  },
  {
    icon: Youtube,
    label: "YouTube",
    color: "hover:bg-red-600",
    shareKey: "youtube",
  },
] as const;

function FooterLink({ name, path }: { name: string; path: string }) {
  return (
    <li className="group">
      <Link
        href={path}
        className="inline-flex items-center text-muted-foreground font-medium transition-all duration-300 group-hover:text-primary group-hover:translate-x-1.5"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary/0 mr-2 transition-all duration-300 group-hover:bg-primary" />
        {name}
      </Link>
    </li>
  );
}

export function Footer() {
  const [currentUrl, setCurrentUrl] = useState("");
  const footerRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const siteTitle = "TechNova Store - Sản phẩm công nghệ chính hãng";

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const footer = footerRef.current;
    const spotlight = spotlightRef.current;
    if (!footer || !spotlight) return;

    const rect = footer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(99,102,241,0.12), transparent 70%)`;
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = "1";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = "0";
    }
  }, []);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    footer.addEventListener("mousemove", handleMouseMove);
    footer.addEventListener("mouseenter", handleMouseEnter);
    footer.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      footer.removeEventListener("mousemove", handleMouseMove);
      footer.removeEventListener("mouseenter", handleMouseEnter);
      footer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(siteTitle)}`,
    instagram: `https://www.instagram.com/?url=${encodeURIComponent(currentUrl)}`,
    youtube: `https://www.youtube.com/share?url=${encodeURIComponent(currentUrl)}`,
  };

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden border-t border-border/40 bg-muted/30 dark:bg-black"
    >
      {/* Spotlight overlay — follows mouse */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{ opacity: 0 }}
      />

      {/* Decorative top line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="flex flex-col">
            <Link href="/" className="mb-6 flex items-center gap-2 group w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                TechNova
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chuyên cung cấp các sản phẩm công nghệ chính hãng với giá tốt nhất
              thị trường. Định hình phong cách số của bạn với sự uy tín, chất
              lượng và dịch vụ hậu mãi chu đáo nhất.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-6 text-lg font-bold tracking-tight">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <FooterLink key={link.name} {...link} />
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-6 text-lg font-bold tracking-tight">
              Hỗ trợ khách hàng
            </h3>
            <ul className="space-y-3 text-sm">
              {SUPPORT_LINKS.map((link) => (
                <FooterLink key={link.name} {...link} />
              ))}
            </ul>
          </div>

          {/* Contact + Socials */}
          <div>
            <h3 className="mb-6 text-lg font-bold tracking-tight">Liên hệ</h3>
            <ul className="space-y-3 text-sm font-medium mb-8">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">Hotline:</span>
                <span className="font-bold text-primary hover:underline cursor-pointer">
                  1900 xxxx
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  support@technova.vn
                </span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="text-muted-foreground whitespace-nowrap">
                  Địa chỉ:
                </span>
                <span className="text-muted-foreground">
                  123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
                </span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-3">
              {SOCIALS.map(({ icon: Icon, label, color, shareKey }) => (
                <a
                  key={label}
                  href={shareUrls[shareKey]}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Chia sẻ trên ${label}`}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl bg-background dark:bg-card border border-border/50 text-muted-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:text-white hover:border-transparent hover:shadow-lg",
                    color,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 pt-4 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-muted-foreground">
          <p>&copy; 2025 TechNova Store. All rights reserved.</p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Bảo mật
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
