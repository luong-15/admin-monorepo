"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ImageIcon,
  FolderTree,
  ExternalLink,
} from "lucide-react";
import { notifyError, notifySuccess } from "@/lib/notifications";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [categoriesSearch, setCategoriesSearch] = useState("");
  const [debouncedCategoriesSearch, setDebouncedCategoriesSearch] =
    useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image_url: "",
  });

  // Lấy danh sách danh mục
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch("/api/admin/categories", {
        cache: "no-store",
      });
      const data = await response.json();
      // Đảm bảo data là một mảng
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Xử lý tìm kiếm (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategoriesSearch(categoriesSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [categoriesSearch]);

  // Gửi Form (Tạo mới hoặc Cập nhật)
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[ ^\w\s-]/g, "") // Remove special chars (simple char class)
      .replace(/\\s+|[ _-]+/g, "-") // Replace spaces/_ with single -
      .replace(/^-|-$/g, ""); // Trim leading/trailing -
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      notifyError("Tên danh mục không được để trống.");
      return;
    }

    try {
      const isEdit = !!selectedCategory;
      const slug = isEdit
        ? selectedCategory.slug
        : generateSlug(categoryForm.name);

      const payload: any = {
        name: categoryForm.name,
        description: categoryForm.description || null,
        image_url: categoryForm.image_url || null,
        ...(isEdit && { id: selectedCategory!.id }),
        ...(isEdit && { slug }), // Preserve existing slug
        ...(!isEdit && { slug }), // New slug for create
        sort_order: 0,
        is_active: true,
      };

      const method = isEdit ? "PUT" : "POST";
      const url = "/api/admin/categories";

      const response = await fetch(url, {
        cache: "no-store",
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData.message ||
            `HTTP ${response.status}: Failed to save category`,
        );
      }

      notifySuccess(isEdit ? "Đã cập nhật danh mục." : "Đã tạo danh mục mới.");
      setCategoryDialogOpen(false);
      setSelectedCategory(null);
      setCategoryForm({ name: "", description: "", image_url: "" });

      // Wait then refresh data directly
      setTimeout(async () => {
        try {
          const freshResponse = await fetch(`/api/admin/categories`, {
            cache: "no-store",
          });
          const freshData = await freshResponse.json();

          setCategories(
            Array.isArray(freshData) ? freshData : freshData?.data || [],
          );
        } catch (error) {}
      }, 500);
    } catch (error) {
      notifyError(
        error instanceof Error
          ? error.message
          : "Lỗi khi lưu danh mục. Vui lòng thử lại.",
      );
      console.error(error);
    }
  };

  // Xóa danh mục
  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm(
        "Xóa danh mục này có thể ảnh hưởng đến các sản phẩm liên quan. Bạn chắc chắn muốn xóa?",
      )
    )
      return;
    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete category");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name
        .toLowerCase()
        .includes(debouncedCategoriesSearch.toLowerCase()) ||
      (category.description &&
        category.description
          .toLowerCase()
          .includes(debouncedCategoriesSearch.toLowerCase())),
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Danh mục sản phẩm
          </h1>
          <p className="text-muted-foreground">
            Phân loại sản phẩm để khách hàng dễ dàng tìm kiếm.
          </p>
        </div>
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedCategory(null);
                setCategoryForm({ name: "", description: "", image_url: "" });
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCategorySubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục</Label>
                <Input
                  id="name"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  placeholder="VD: Điện thoại, Phụ kiện..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Giới thiệu ngắn về nhóm sản phẩm này..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Link ảnh đại diện</Label>
                <div className="flex gap-2">
                  <Input
                    id="image_url"
                    value={categoryForm.image_url}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        image_url: e.target.value,
                      })
                    }
                    placeholder="https://images.com/category.png"
                  />
                  {categoryForm.image_url && (
                    <div className="w-10 h-10 shrink-0 border rounded overflow-hidden">
                      <img
                        src={categoryForm.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCategoryDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  {selectedCategory ? "Lưu thay đổi" : "Tạo danh mục"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên danh mục..."
                className="pl-8"
                value={categoriesSearch}
                onChange={(e) => setCategoriesSearch(e.target.value)}
              />
            </div>
            <div className="hidden sm:flex items-center text-sm text-muted-foreground">
              <FolderTree className="mr-2 h-4 w-4" />
              Tổng cộng: {filteredCategories.length} danh mục
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-20">Ảnh</TableHead>
                    <TableHead>Tên danh mục</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Mô tả
                    </TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id} className="group">
                        <TableCell>
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="w-12 h-12 object-cover rounded-lg border shadow-sm group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted flex items-center justify-center rounded-lg border">
                              <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-base">
                            {category.name}
                          </div>
                          <div className="text-xs text-muted-foreground md:hidden truncate max-w-37.5">
                            {category.description || "Không có mô tả"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground max-w-md">
                          <p className="line-clamp-2 text-sm italic">
                            {category.description || "Chưa có thông tin mô tả."}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:text-blue-600"
                              onClick={() => {
                                setSelectedCategory(category);
                                setCategoryForm({
                                  name: category.name,
                                  description: category.description || "",
                                  image_url: category.image_url || "",
                                });
                                setCategoryDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-32 text-center text-muted-foreground italic"
                      >
                        <FolderTree className="mx-auto h-8 w-8 mb-2 opacity-20" />
                        Không tìm thấy danh mục nào phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
