"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { notifySuccess } from "@/lib/notifications";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  Zap,
  Check,
  X,
} from "lucide-react";

// ─── Animation variants ────────────────────────────────────────────────────────

const SLIDE = {
  login: { enter: 1, exit: -1 },
  signup: { enter: -1, exit: 1 },
};

const pageVariants = (direction: number) => ({
  initial: { opacity: 0, x: direction * 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: direction * -40 },
});

const transition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.8,
};

// Stagger container: each child fades + slides up in sequence
const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

// ─── Password strength helpers ──────────────────────────────────────────────

const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
];
const STRENGTH_LABELS = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];

function getPasswordStrength(password: string) {
  let s = 0;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[a-z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return s;
}

// ─── Shared sub-components ─────────────────────────────────────────────────

function OAuthButtons({
  onOAuth,
}: {
  onOAuth: (p: "google" | "github") => void;
}) {
  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
          <span className="bg-background px-2 text-muted-foreground">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <Button
          variant="outline"
          className="bg-transparent"
          onClick={() => onOAuth("google")}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
        <Button
          variant="outline"
          className="bg-transparent"
          onClick={() => onOAuth("github")}
        >
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </Button>
      </div>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [direction, setDirection] = useState(1); // 1 = đang sang phải, -1 = sang trái
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const passwordStrength = getPasswordStrength(signupPassword);

  const switchTab = (tab: "login" | "signup") => {
    if (tab === activeTab) return;
    setDirection(tab === "signup" ? -1 : 1);
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        notifySuccess(
          "Đăng nhập thành công! Chào mừng bạn quay trở lại TechNova.",
        );
        router.push("/");
        return; // giữ loading=true trong lúc redirect
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Vui lòng đồng ý với điều khoản sử dụng");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/dashboard`,
        data: { full_name: signupName },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
      );
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "github") => {
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left branding ── */}
      <div className="hidden w-1/2 bg-linear-to-br from-background via-primary/20 to-background lg:flex lg:flex-col lg:justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary-foreground">
            TechNova
          </span>
        </Link>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-primary-foreground">
            Khám phá thế giới
            <br />
            <span className="text-primary">công nghệ</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Đăng nhập để trải nghiệm mua sắm công nghệ tuyệt vời với hàng ngàn
            sản phẩm chính hãng.
          </p>
        </div>
        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <span>© 2025 TechNova</span>
          <Link href="#" className="hover:text-primary-foreground">
            Điều khoản
          </Link>
          <Link href="#" className="hover:text-primary-foreground">
            Bảo mật
          </Link>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex justify-center lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TechNova</span>
            </Link>
          </div>

          {/* ── Tab switcher ── */}
          <div className="relative flex rounded-lg bg-muted p-1">
            {/* Sliding pill */}
            <motion.div
              className="absolute inset-y-1 w-[calc(50%-4px)] rounded-md bg-background shadow-sm"
              layout
              layoutId="tab-indicator"
              transition={transition}
              style={{ left: activeTab === "login" ? "4px" : "calc(50%)" }}
            />
            {(["login", "signup"] as const).map((tab) => (
              <motion.button
                key={tab}
                className={`relative z-10 flex-1 rounded-md py-2.5 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                whileTap={{ scale: 0.97 }}
                onClick={() => switchTab(tab)}
              >
                {tab === "login" ? "Đăng nhập" : "Đăng ký"}
              </motion.button>
            ))}
          </div>

          {/* ── Alert messages ── */}
          <AnimatePresence mode="wait">
            {(error || success) && (
              <motion.div
                key={error ? "error" : "success"}
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                  error
                    ? "border-red-500/20 bg-red-500/10 text-red-500"
                    : "border-green-500/20 bg-green-500/10 text-green-500"
                }`}
              >
                {error ? (
                  <X className="h-4 w-4 shrink-0" />
                ) : (
                  <Check className="h-4 w-4 shrink-0" />
                )}
                {error ?? success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form panels ── */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {activeTab === "login" ? (
                <motion.div
                  key="login"
                  custom={direction}
                  variants={pageVariants(direction)}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                >
                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.div
                      variants={staggerItem}
                      className="space-y-2 text-center"
                    >
                      <h2 className="text-2xl font-bold">Chào mừng trở lại!</h2>
                      <p className="text-muted-foreground">
                        Đăng nhập để tiếp tục mua sắm
                      </p>
                    </motion.div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <motion.div variants={staggerItem} className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="email@example.com"
                            className="pl-10 bg-transparent rounded-xl"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={staggerItem} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">Mật khẩu</Label>
                          <Link
                            href="/auth/forgot-password"
                            className="text-sm text-primary hover:underline"
                          >
                            Quên mật khẩu?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 bg-transparent rounded-xl"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </motion.div>

                      <motion.div variants={staggerItem}>
                        <Button
                          type="submit"
                          className="w-full rounded-xl"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang đăng nhập...
                            </>
                          ) : (
                            "Đăng nhập"
                          )}
                        </Button>
                      </motion.div>
                    </form>

                    <motion.div variants={staggerItem}>
                      <OAuthButtons onOAuth={handleOAuth} />
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  custom={direction}
                  variants={pageVariants(direction)}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                >
                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.div
                      variants={staggerItem}
                      className="space-y-2 text-center"
                    >
                      <h2 className="text-2xl font-bold">Tạo tài khoản mới</h2>
                      <p className="text-muted-foreground">
                        Đăng ký để nhận ưu đãi độc quyền
                      </p>
                    </motion.div>

                    <form onSubmit={handleSignup} className="space-y-4">
                      <motion.div variants={staggerItem} className="space-y-2">
                        <Label htmlFor="signup-name">Họ và tên</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Nguyễn Văn A"
                            className="pl-10 bg-transparent rounded-xl"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            required
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={staggerItem} className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="email@example.com"
                            className="pl-10 bg-transparent rounded-xl"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={staggerItem} className="space-y-2">
                        <Label htmlFor="signup-password">Mật khẩu</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pl-10 pr-10 bg-transparent rounded-xl"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {/* Password strength meter */}
                        <AnimatePresence>
                          {signupPassword && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-1.5 overflow-hidden"
                            >
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                      i < passwordStrength
                                        ? STRENGTH_COLORS[passwordStrength - 1]
                                        : "bg-muted"
                                    }`}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{
                                      delay: i * 0.04,
                                      duration: 0.2,
                                    }}
                                    style={{ transformOrigin: "left" }}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Độ mạnh:{" "}
                                <span className="font-medium">
                                  {passwordStrength > 0
                                    ? STRENGTH_LABELS[passwordStrength - 1]
                                    : "Nhập mật khẩu"}
                                </span>
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div
                        variants={staggerItem}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id="terms"
                          checked={agreeTerms}
                          onCheckedChange={(checked) =>
                            setAgreeTerms(checked as boolean)
                          }
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm text-muted-foreground"
                        >
                          Tôi đồng ý với{" "}
                          <Link
                            href="#"
                            className="text-primary hover:underline"
                          >
                            Điều khoản sử dụng
                          </Link>{" "}
                          và{" "}
                          <Link
                            href="#"
                            className="text-primary hover:underline"
                          >
                            Chính sách bảo mật
                          </Link>
                        </label>
                      </motion.div>

                      <motion.div variants={staggerItem}>
                        <Button
                          type="submit"
                          className="w-full rounded-xl"
                          disabled={loading || !agreeTerms}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang đăng ký...
                            </>
                          ) : (
                            "Đăng ký"
                          )}
                        </Button>
                      </motion.div>
                    </form>

                    <motion.div variants={staggerItem}>
                      <OAuthButtons onOAuth={handleOAuth} />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
