"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { fetchWithAuth } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Printer,
  Search,
  Package,
  MapPin,
  User,
  Calendar,
  Save,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";
import { notifyError, notifySuccess } from "@/lib/notifications";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [ordersPagination, setOrdersPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [ordersSearch, setOrdersSearch] = useState("");
  const [debouncedOrdersSearch, setDebouncedOrdersSearch] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState("all");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; icon: any }
    > = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: Clock,
      },
      processing: {
        label: "Đang xử lý",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        icon: Package,
      },
      shipped: {
        label: "Đang giao",
        color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        icon: Truck,
      },
      delivered: {
        label: "Hoàn thành",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        icon: CheckCircle2,
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-red-500/10 text-red-500 border-red-500/20",
        icon: Package,
      },
    };
    const config = statusMap[status] || {
      label: status,
      color: "bg-muted/300/10 text-slate-500",
      icon: Package,
    };
    const Icon = config.icon;
    return (
      <Badge
        variant="outline"
        className={cn(
          "flex w-fit items-center gap-1.5 font-medium px-2.5 py-0.5 rounded-full",
          config.color,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      unpaid: {
        label: "Chưa thanh toán",
        color:
          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      },
      paid: {
        label: "Đã thanh toán",
        color:
          "bg-emerald-500 text-primary-foreground shadow-sm shadow-emerald-500/20",
      },
      failed: {
        label: "Thất bại",
        color: "bg-red-500 text-primary-foreground",
      },
      cancelled: {
        label: "Hủy",
        color: "bg-slate-400 text-primary-foreground",
      },
    };
    const config = statusMap[status] || {
      label: status,
      color: "bg-outline text-outline",
    };
    return (
      <Badge
        className={cn(
          "text-[10px] uppercase tracking-wider px-2 font-bold rounded-md",
          config.color,
        )}
      >
        {config.label}
      </Badge>
    );
  };

  // --- Logic Fetch & Save (Giữ nguyên logic của bạn) ---
  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const params = new URLSearchParams({
        page: ordersPagination.page.toString(),
        limit: ordersPagination.limit.toString(),
      });
      if (debouncedOrdersSearch) params.append("search", debouncedOrdersSearch);
      if (ordersStatusFilter && ordersStatusFilter !== "all")
        params.append("status", ordersStatusFilter);
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/orders?${params}`,
        { cache: "no-store" },
      );
      const data = await response.json();
      setOrders(data.data || []);
      setOrdersPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setOrdersLoading(false);
    }
  }, [
    ordersPagination.page,
    ordersPagination.limit,
    debouncedOrdersSearch,
    ordersStatusFilter,
  ]);

  const saveAllChanges = async () => {
    if (!selectedOrder) return;
    const updates: any = {};
    if (newOrderStatus && newOrderStatus !== selectedOrder.status)
      updates.status = newOrderStatus;
    if (newPaymentStatus && newPaymentStatus !== selectedOrder.payment_status)
      updates.payment_status = newPaymentStatus;
    if (Object.keys(updates).length === 0) return;
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/admin/orders/${selectedOrder.id}`,
        {
          method: "PATCH",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        },
      );
      if (response.ok) {
        notifySuccess("Lưu thành công! Đã cập nhật trạng thái đơn hàng.");
        setOrderDialogOpen(false);
        setSelectedOrder(null);
        setNewOrderStatus("");
        setNewPaymentStatus("");

        // Wait then refresh data directly
        setTimeout(async () => {
          try {
            const params = new URLSearchParams({ page: "1", limit: "50" });
            const freshResponse = await fetchWithAuth(
              `http://localhost:8080/api/admin/orders?${params}`,
              {
                cache: "no-store",
              },
            );
            const freshData = await freshResponse.json();

            setOrders(freshData.data || []);
            setOrdersPagination((prev) => ({
              ...prev,
              total: freshData.pagination?.total || 0,
              totalPages: freshData.pagination?.totalPages || 0,
            }));
          } catch (error) {}
        }, 500);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedOrdersSearch(ordersSearch), 500);
    return () => clearTimeout(timer);
  }, [ordersSearch]);

  return (
    <div className="p-6 space-y-8 bg-background/50">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight uppercase">
            Đơn hàng
          </h1>
          <p className="text-muted-foreground text-sm">
            Quản lý vòng đời đơn hàng và vận chuyển.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Tìm mã đơn, tên khách..."
              className="pl-10 bg-muted/50 border-none focus-visible:ring-1"
              value={ordersSearch}
              onChange={(e) => setOrdersSearch(e.target.value)}
            />
          </div>
          <Select
            value={ordersStatusFilter}
            onValueChange={setOrdersStatusFilter}
          >
            <SelectTrigger className="w-45 bg-muted/50 border-none">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="shipped">Đang giao</SelectItem>
              <SelectItem value="delivered">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-black/5 bg-card/60 backdrop-blur-md overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="py-4 font-bold uppercase text-[11px] tracking-widest pl-6">
                  Đơn hàng
                </TableHead>
                <TableHead className="font-bold uppercase text-[11px] tracking-widest">
                  Khách hàng
                </TableHead>
                <TableHead className="font-bold uppercase text-[11px] tracking-widest">
                  Thanh toán
                </TableHead>
                <TableHead className="font-bold uppercase text-[11px] tracking-widest">
                  Vận chuyển
                </TableHead>
                <TableHead className="font-bold uppercase text-[11px] tracking-widest">
                  Tổng tiền
                </TableHead>
                <TableHead className="text-right pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6} className="p-6">
                          <Skeleton className="h-8 w-full rounded-lg" />
                        </TableCell>
                      </TableRow>
                    ))
                : orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="group hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="pl-6">
                        <div className="font-mono text-xs font-bold text-primary mb-1">
                          #{order.order_number}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />{" "}
                          {new Date(order.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm">
                          {order.shipping_name || "Khách lẻ"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {order.shipping_phone || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="mb-1.5">
                          {getPaymentBadge(order.payment_status)}
                        </div>
                        <div className="text-[10px] font-medium flex items-center gap-1 text-muted-foreground italic">
                          <CreditCard className="h-3 w-3" />{" "}
                          {order.payment_method === "online"
                            ? "Chuyển khoản"
                            : "COD"}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="font-black text-sm">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all shadow-none"
                          onClick={async () => {
                            const res = await fetchWithAuth(
                              `http://localhost:8080/api/admin/orders/${order.id}`,
                              { cache: "no-store" },
                            );
                            if (res.ok) {
                              const details = await res.json();
                              setSelectedOrder(details);
                              setNewOrderStatus(details.status || "");
                              setNewPaymentStatus(details.payment_status || "");
                              setOrderDialogOpen(true);
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0 border-none shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 bg-muted/20 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black">
                  CHI TIẾT ĐƠN #{selectedOrder?.order_number}
                </DialogTitle>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Khởi tạo lúc:{" "}
                  {selectedOrder &&
                    new Date(selectedOrder.created_at).toLocaleString("vi-VN")}
                </div>
              </div>
              <Button
                variant="secondary"
                className="mr-10 rounded-full shadow-sm"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" /> In hóa đơn
              </Button>
            </div>
          </DialogHeader>

          <div
            className="flex-1 min-h-0 overflow-y-auto p-6 space-y-8 overscroll-contain"
            data-lenis-prevent
            onWheel={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cột 1: Khách hàng */}
              <Card className="border-none bg-muted/30 shadow-none rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground whitespace-nowrap">
                      Tên:
                    </span>
                    <span
                      className="font-semibold truncate ml-2 text-right"
                      title={selectedOrder?.shipping_name}
                    >
                      {selectedOrder?.shipping_name}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground whitespace-nowrap">
                      SĐT:
                    </span>
                    <span className="font-semibold truncate ml-2 text-right">
                      {selectedOrder?.shipping_phone}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-muted-foreground whitespace-nowrap">
                      Email:
                    </span>
                    <span
                      className="font-semibold truncate ml-2 text-right"
                      title={selectedOrder?.shipping_email}
                    >
                      {selectedOrder?.shipping_email || "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Cột 2: Giao hàng */}
              <Card className="border-none bg-muted/30 shadow-none rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Địa chỉ nhận
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="font-semibold leading-relaxed">
                    Địa chỉ: {selectedOrder?.shipping_address}
                  </p>
                  <p className="text-muted-foreground">
                    Thành ph��: {selectedOrder?.shipping_city}
                  </p>
                  <p className="text-muted-foreground">
                    Mã bưu điện: {selectedOrder?.shipping_postal_code}
                  </p>
                </CardContent>
              </Card>

              {/* Cột 3: Quản lý Trạng thái */}
              <Card className="border-2 border-primary/10 bg-primary/5 shadow-none rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Save className="h-4 w-4 text-primary" /> Xử lý nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">
                      Trạng thái vận chuyển
                    </label>
                    <Select
                      value={newOrderStatus || selectedOrder?.status}
                      onValueChange={setNewOrderStatus}
                    >
                      <SelectTrigger className="h-9 rounded-xl border-none shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="processing">Đang xử lý</SelectItem>
                        <SelectItem value="shipped">Đang giao</SelectItem>
                        <SelectItem value="delivered">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Hủy đơn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">
                      Trạng thái thanh toán
                    </label>
                    <Select
                      value={newPaymentStatus || selectedOrder?.payment_status}
                      onValueChange={setNewPaymentStatus}
                    >
                      <SelectTrigger className="h-9 rounded-xl border-none shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                        <SelectItem value="paid">Đã thanh toán</SelectItem>
                        <SelectItem value="failed">Thất bại</SelectItem>
                        <SelectItem value="cancelled">Hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bảng sản phẩm */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h3 className="font-black uppercase tracking-tighter text-lg">
                  Danh sách sản phẩm
                </h3>
              </div>
              <div className="rounded-3xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="py-4">Sản phẩm</TableHead>
                      <TableHead className="text-center w-24">SL</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right pr-6">
                        Thành tiền
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder?.order_items?.map(
                      (item: any, index: number) => (
                        <TableRow
                          key={item.id || index}
                          className="border-b last:border-0"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-4">
                              {item.product_image ? (
                                <img
                                  src={item.product_image}
                                  alt=""
                                  className="w-14 h-14 object-cover rounded-2xl shadow-sm border border-border/50"
                                />
                              ) : (
                                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
                                  <Package className="h-6 w-6 opacity-20" />
                                </div>
                              )}
                              <div className="space-y-0.5">
                                <div className="font-bold text-sm leading-tight line-clamp-2">
                                  {item.product_name || item.products?.name}
                                </div>
                                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                                  ID: {item.product_id?.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-black">
                            × {item.quantity}
                          </TableCell>
                          <TableCell className="text-right font-medium text-muted-foreground">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell className="text-right font-black text-primary pr-6">
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-4 bg-muted/20 p-6 rounded-3xl border border-border/40">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground font-medium">
                    <span>Tạm tính</span>
                    <span>
                      {formatCurrency(
                        selectedOrder?.subtotal || selectedOrder?.total,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground font-medium">
                    <span>Phí vận chuyển</span>
                    <span>
                      {formatCurrency(selectedOrder?.shipping_fee || 0)}
                    </span>
                  </div>
                </div>
                <Separator className="bg-border/60" />
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Tổng thanh toán
                  </span>
                  <span className="text-3xl font-black text-primary leading-none">
                    {selectedOrder && formatCurrency(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 border-t flex justify-end gap-3 px-6">
            <Button
              variant="ghost"
              className="rounded-full px-6"
              onClick={() => setOrderDialogOpen(false)}
            >
              Đóng
            </Button>
            <Button
              className="rounded-full px-8 shadow-lg shadow-primary/20"
              onClick={saveAllChanges}
              disabled={
                (!newOrderStatus || newOrderStatus === selectedOrder?.status) &&
                (!newPaymentStatus ||
                  newPaymentStatus === selectedOrder?.payment_status)
              }
            >
              Cập nhật đơn hàng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
