"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import {
  Package, ShoppingCart, Users, BarChart3,
  Settings2, LayoutDashboard, ArrowRight
} from "lucide-react"

const quickLinks = [
  {
    href: "/admin/stats",
    label: "Thống kê",
    description: "Doanh thu, đơn hàng, khách hàng",
    icon: BarChart3,
    color: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  },
  {
    href: "/admin/products",
    label: "Sản phẩm",
    description: "Quản lý danh sách sản phẩm",
    icon: Package,
    color: "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
  },
  {
    href: "/admin/orders",
    label: "Đơn hàng",
    description: "Xem và cập nhật trạng thái đơn",
    icon: ShoppingCart,
    color: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  },
  {
    href: "/admin/users",
    label: "Người dùng",
    description: "Quản lý tài khoản khách hàng",
    icon: Users,
    color: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  },
  {
    href: "/admin/categories",
    label: "Danh mục",
    description: "Phân loại sản phẩm",
    icon: Package,
    color: "bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
  },
  {
    href: "/admin/settings",
    label: "Cài đặt",
    description: "Cấu hình hệ thống cửa hàng",
    icon: Settings2,
    color: "bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400",
  },
]

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <LayoutDashboard className="h-9 w-9 text-primary" />
          Hệ thống Quản trị
        </h1>
        <p className="text-muted-foreground text-sm">
          Chọn mục cần quản lý từ bên dưới hoặc dùng sidebar bên trái.
        </p>
      </div>

      {/* Quick links grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {quickLinks.map(({ href, label, description, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <Card className="group border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all rounded-2xl cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground truncate">{description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}