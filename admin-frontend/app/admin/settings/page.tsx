"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette,
  DollarSign,
  Package,
  Shield,
  Clock,
  Users,
  Settings2,
  Webhook,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    store_name: "TechStore VN",
    store_description: "Cửa hàng công nghệ hàng đầu Việt Nam",
    email: "contact@techstore.vn",
    phone: "0123456789",
    address: "123 Nguyễn Trãi, Quận 5, TP.HCM",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
    maintenance_mode: false,
    auto_approve_orders: false,
    default_tax_rate: 10,
    logo_url: "",
    favicon_url: "",
    webhook_url: "",
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchWithAuth(
      `${process.env.NEXT_PUBLIC_ADMIN_API_BASE}/api/admin/settings`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setSettings(data);
        }
      })
      .catch(console.error);
  }, []);

  const { toast } = useToast();
  const [tabs, setTabs] = useState("general");

  const handleSave = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_ADMIN_API_BASE}/api/admin/settings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        },
      );
      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã lưu cài đặt thành công!",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Lỗi lưu cài đặt",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu cài đặt",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Cài đặt hệ thống
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Quản lý cấu hình cửa hàng và hệ thống.
          </p>
        </div>
        <Button onClick={handleSave} className="px-8 h-12 font-bold shadow-lg">
          <Save className="mr-2 h-4 w-4" />
          Lưu tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar tabs */}
        <Card className="lg:col-span-1 border-0 shadow-none">
          <CardContent className="pt-6 space-y-2">
            {[
              { id: "general", label: "Chung", icon: Settings2 },
              { id: "store", label: "Cửa hàng", icon: Package },
              { id: "contact", label: "Liên hệ", icon: Mail },
              { id: "security", label: "Bảo mật", icon: Shield },
              { id: "payment", label: "Thanh toán", icon: Webhook },
              { id: "advanced", label: "Nâng cao", icon: Clock },
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={tabs === id ? "secondary" : "ghost"}
                className="w-full justify-start h-12 px-4 py-3 rounded-xl"
                onClick={() => setTabs(id)}
              >
                <Icon className="mr-3 h-4 w-4 shrink-0" />
                {label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {tabs === "general" && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <Settings2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Cài đặt chung</CardTitle>
                    <p className="text-muted-foreground">
                      Cấu hình cơ bản hệ thống
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Tên cửa hàng</Label>
                    <Input
                      value={settings.store_name}
                      onChange={(e) =>
                        setSettings({ ...settings, store_name: e.target.value })
                      }
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Mô tả cửa hàng</Label>
                    <Input
                      value={settings.store_description}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          store_description: e.target.value,
                        })
                      }
                      className="h-12"
                    />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Tiền tệ mặc định</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(v) =>
                        setSettings({ ...settings, currency: v })
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">VND - Việt Nam Đồng</SelectItem>
                        <SelectItem value="USD">USD - Đô la Mỹ</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Múi giờ</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(v) =>
                        setSettings({ ...settings, timezone: v })
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Ho_Chi_Minh">
                          GMT+7 - Việt Nam
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          GMT-5 - New York
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          GMT+0 - London
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {tabs === "store" && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl">
                    <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      Thông tin cửa hàng
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Logo, favicon và thông tin hiển thị
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Logo cửa hàng (URL)</Label>
                  <Input
                    value={settings.logo_url}
                    onChange={(e) =>
                      setSettings({ ...settings, logo_url: e.target.value })
                    }
                    placeholder="https://your-logo.png"
                    className="h-12"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Favicon (URL)</Label>
                  <Input
                    value={settings.favicon_url}
                    onChange={(e) =>
                      setSettings({ ...settings, favicon_url: e.target.value })
                    }
                    placeholder="https://favicon.ico"
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {tabs === "contact" && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      Thông tin liên hệ
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Hiển thị trên footer và contact page
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Email liên hệ</Label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    className="h-12"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                    className="h-12"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Địa chỉ cửa hàng</Label>
                  <Textarea
                    value={settings.address}
                    onChange={(e) =>
                      setSettings({ ...settings, address: e.target.value })
                    }
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {tabs === "security" && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
                    <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      Bảo mật & Hiệu suất
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Chế độ bảo trì và approve đơn hàng
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-2xl">
                  <div className="p-3 bg-destructive/10 rounded-xl">
                    <Shield className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">Chế độ bảo trì</h3>
                    <p className="text-sm text-muted-foreground">
                      Tạm khóa website khi bảo trì
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, maintenance_mode: checked })
                    }
                    className="ml-auto"
                  />
                </div>
                <Separator />
                <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-2xl">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">Tự động duyệt đơn</h3>
                    <p className="text-sm text-muted-foreground">
                      Approve đơn hàng COD ngay lập tức
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_approve_orders}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, auto_approve_orders: checked })
                    }
                    className="ml-auto"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {tabs === "payment" && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                    <Webhook className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      Cấu hình thanh toán
                    </CardTitle>
                    <p className="text-muted-foreground">PayOS Webhook URL</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Webhook URL</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sao chép URL này vào PayOS Dashboard để nhận thông báo thanh
                    toán
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={settings.webhook_url}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          webhook_url: e.target.value,
                        })
                      }
                      placeholder={`${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/payos/webhook`}
                      className="h-12 font-mono text-sm"
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const url =
                          settings.webhook_url ||
                          `${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/payos/webhook`;
                        navigator.clipboard.writeText(url);
                        toast({
                          title: "Đã sao chép",
                          description:
                            "Webhook URL đã được sao chép vào clipboard",
                        });
                      }}
                      className="h-12 w-12 shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {tabs === "advanced" && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Cài đặt nâng cao</CardTitle>
                    <p className="text-muted-foreground">
                      Thuế, hiệu suất và tùy chỉnh
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Thuế mặc định (%)</Label>
                  <Input
                    type="number"
                    value={settings.default_tax_rate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        default_tax_rate: Number(e.target.value),
                      })
                    }
                    className="h-12 max-w-xs"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
