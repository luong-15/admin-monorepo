"use client";

import type React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Camera, UploadCloud, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notifyError, notifySuccess } from "@/lib/notifications";
import type { UserProfile } from "@/lib/types";

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [usersSearch, setUsersSearch] = useState("");
  const [debouncedUsersSearch, setDebouncedUsersSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [userForm, setUserForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
    avatar_url: "",
  });

  // Xử lý đọc file ảnh
  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi định dạng",
        description: "Vui lòng chỉ chọn file hình ảnh.",
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setUserForm((prev) => ({ ...prev, avatar_url: result }));
    };
    reader.readAsDataURL(file);
  };

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams({
        page: usersPagination.page.toString(),
        limit: usersPagination.limit.toString(),
      });

      if (debouncedUsersSearch) {
        params.append("search", debouncedUsersSearch);
      }

      const response = await fetch(
        `http://localhost:8080/api/admin/users?${params}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();

      setUsers(data.data || []);
      setUsersPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  }, [usersPagination.page, debouncedUsersSearch]);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/admin/users", {
        method: "PATCH",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedUser?.id,
          ...userForm,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      notifySuccess("Lưu thành công!");
      setUserDialogOpen(false);
      setSelectedUser(null);
      setShowUrlInput(false);
      setUserForm({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        country: "",
        avatar_url: "",
      });

      setTimeout(() => {
        fetchUsers();
      }, 500);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật người dùng",
        variant: "destructive",
      });
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/admin/users?id=${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsersSearch(usersSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [usersSearch]);

  const filteredUsers = users.filter(
    (user) =>
      (user.full_name &&
        user.full_name
          .toLowerCase()
          .includes(debouncedUsersSearch.toLowerCase())) ||
      (user.phone &&
        user.phone.toLowerCase().includes(debouncedUsersSearch.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Quản lý Người dùng
        </h1>
        <p className="text-muted-foreground">
          Quản lý thông tin và tài khoản khách hàng
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={usersSearch}
            onChange={(e) => setUsersSearch(e.target.value)}
          />
        </div>

        <Dialog
          open={userDialogOpen}
          onOpenChange={(open) => {
            setUserDialogOpen(open);
            if (!open) setShowUrlInput(false);
          }}
        >
          <DialogContent className="sm:max-w-150">
            <DialogHeader>
              <DialogTitle>
                {selectedUser
                  ? "Chỉnh sửa thành viên"
                  : "Xem thông tin người dùng"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUserSubmit} className="space-y-6">
              {/* KHU VỰC CHỈNH SỬA AVATAR ĐÃ ĐƯỢC TINH CHỈNH */}
              <div className="flex flex-col items-center justify-center border-b pb-6 sm:flex-row sm:justify-start gap-6">
                <div
                  className="group relative h-24 w-24 cursor-pointer rounded-full border-2 border-primary/20 p-1 transition-all hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileProcess(file);
                  }}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-muted">
                    <img
                      src={userForm.avatar_url || "/placeholder-user.jpg"}
                      alt="avatar"
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 text-white">
                      <Camera className="h-5 w-5 mb-0.5" />
                      <span className="text-[10px] font-medium">Thay ảnh</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileProcess(file);
                    }}
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <Label className="text-base font-semibold">
                    Ảnh đại diện
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Kéo thả ảnh vào hình tròn, hoặc click để tải lên từ thiết
                    bị.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className="h-3.5 w-3.5" /> Tải ảnh lên
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                    >
                      <Link className="h-3.5 w-3.5" />{" "}
                      {showUrlInput ? "Ẩn URL" : "Nhập URL ảnh"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Ô nhập URL ẩn hiện linh hoạt */}
              {showUrlInput && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <Label htmlFor="avatar-url">Đường dẫn ảnh (URL)</Label>
                  <Input
                    id="avatar-url"
                    type="text"
                    value={
                      userForm.avatar_url.startsWith("data:")
                        ? ""
                        : userForm.avatar_url
                    }
                    placeholder="https://example.com/avatar.jpg"
                    onChange={(e) =>
                      setUserForm({ ...userForm, avatar_url: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Thông tin cá nhân */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Họ tên</Label>
                  <Input
                    value={userForm.full_name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, full_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={userForm.phone}
                    onChange={(e) =>
                      setUserForm({ ...userForm, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email</Label>
                  <Input
                    value={userForm.email}
                    readOnly
                    className="bg-muted/50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Địa chỉ</Label>
                  <Input
                    value={userForm.address}
                    onChange={(e) =>
                      setUserForm({ ...userForm, address: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Thành phố</Label>
                  <Input
                    value={userForm.city}
                    onChange={(e) =>
                      setUserForm({ ...userForm, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quốc gia</Label>
                  <Input
                    value={userForm.country}
                    onChange={(e) =>
                      setUserForm({ ...userForm, country: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mã bưu điện</Label>
                  <Input
                    value={userForm.postal_code}
                    onChange={(e) =>
                      setUserForm({ ...userForm, postal_code: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUserDialogOpen(false)}
                >
                  Đóng
                </Button>
                <Button type="submit" disabled={!selectedUser}>
                  Cập nhật
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {usersLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thành viên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Thành phố</TableHead>
                <TableHead>Quốc gia</TableHead>
                <TableHead>Mã bưu điện</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  {/* Bổ sung Avatar nhỏ ở Table cho UI sinh động */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          (user as any).avatar_url || "/placeholder-user.jpg"
                        }
                        alt=""
                        className="h-8 w-8 rounded-full object-cover border"
                      />
                      <span>{user.full_name || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {user.address || "-"}
                  </TableCell>
                  <TableCell>{user.city || "-"}</TableCell>
                  <TableCell>{user.country || "-"}</TableCell>
                  <TableCell>{user.postal_code || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedUser(user);
                          setUserForm({
                            full_name: user.full_name || "",
                            email: user.email || "",
                            phone: user.phone || "",
                            address: user.address || "",
                            city: user.city || "",
                            postal_code: user.postal_code || "",
                            country: user.country || "",
                            avatar_url: user.avatar_url || "",
                          });
                          setUserDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteUser(user.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không có người dùng phù hợp
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
