"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, BarChart3 } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

interface Stats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
}

function StatCard({ title, value, icon: Icon, description, trend }: {
  title: string
  value: string | number
  icon: any
  description: string
  trend?: string
}) {
  return (
    <Card className="relative overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-all bg-white dark:bg-card/50 rounded-2xl group">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="h-32 w-32" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tighter">{value}</div>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-xs text-muted-foreground font-medium">{description}</p>
          {trend && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              <TrendingUp className="h-3 w-3 mr-0.5" />{trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card className="rounded-2xl border-border/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-3 w-40" />
      </CardContent>
    </Card>
  )
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/admin/stats")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const statsData = json.data ?? json
      setStats(statsData)
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError("Không thể tải dữ liệu thống kê.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight uppercase flex items-center gap-3">
            <BarChart3 className="h-9 w-9 text-primary" />
            Thống kê
          </h1>
          <p className="text-muted-foreground text-sm">Tổng quan dữ liệu kinh doanh toàn thời gian.</p>
        </div>
        <button
          onClick={fetchStats}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors self-start sm:self-auto"
        >
          Làm mới
        </button>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive/40 bg-destructive/5 rounded-2xl">
          <CardContent className="py-4 text-sm text-destructive font-medium">{error}</CardContent>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
        ) : stats ? (
          <>
            <StatCard
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              icon={Package}
              description="Đang được kinh doanh"
            />
            <StatCard
              title="Tổng đơn hàng"
              value={stats.totalOrders}
              icon={ShoppingCart}
              description="Toàn thời gian"
            />
            <StatCard
              title="Khách hàng"
              value={stats.totalUsers}
              icon={Users}
              description="Thành viên đã đăng ký"
            />
            <StatCard
              title="Doanh thu"
              value={formatCurrency(stats.totalRevenue)}
              icon={DollarSign}
              description="Từ đơn đã thanh toán"
            />
          </>
        ) : null}
      </div>

      {/* Summary table */}
      {!loading && stats && (
        <Card className="rounded-2xl border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Tóm tắt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {[
                { label: "Tổng sản phẩm", value: `${stats.totalProducts} sản phẩm` },
                { label: "Tổng đơn hàng", value: `${stats.totalOrders} đơn` },
                { label: "Tổng khách hàng", value: `${stats.totalUsers} người dùng` },
                { label: "Doanh thu tích lũy", value: formatCurrency(stats.totalRevenue) },
                {
                  label: "Giá trị trung bình / đơn",
                  value: stats.totalOrders > 0
                    ? formatCurrency(stats.totalRevenue / stats.totalOrders)
                    : "—"
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}