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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/currency";
import type { Product, Category } from "@/lib/types";
import { notifyError, notifySuccess } from "@/lib/notifications";
import {
  Plus,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Box,
  ImageIcon,
  Settings2,
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [productsPagination, setProductsPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [productsSearch, setProductsSearch] = useState("");
  const [debouncedProductsSearch, setDebouncedProductsSearch] = useState("");
  const [productsCategoryFilter, setProductsCategoryFilter] = useState("all");
  const [productsLoading, setProductsLoading] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    discount_price: "",
    stock: "",
    brand: "",
    category_id: "",
    image_url: "",
    images: "",
    is_featured: false,
    is_deal: false,
    specs: "{}",
  });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/categories",
        { cache: "no-store" },
      );
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const params = new URLSearchParams({
        page: productsPagination.page.toString(),
        limit: productsPagination.limit.toString(),
      });
      if (debouncedProductsSearch)
        params.append("search", debouncedProductsSearch);
      if (productsCategoryFilter !== "all")
        params.append("category_id", productsCategoryFilter);

      const response = await fetch(
        `http://localhost:8080/api/admin/products?${params}`,
        {
          cache: "no-store",
        },
      );
      const data = await response.json();

      setProducts(data.data || []);
      setProductsPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  }, [
    productsPagination.page,
    productsPagination.limit,
    debouncedProductsSearch,
    productsCategoryFilter,
  ]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedProductsSearch(productsSearch),
      500,
    );
    return () => clearTimeout(timer);
  }, [productsSearch]);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: Number(productForm.price),
        original_price: productForm.original_price
          ? Number(productForm.original_price)
          : null,
        discount_price: productForm.discount_price
          ? Number(productForm.discount_price)
          : null,
        stock: Number(productForm.stock),
        images: productForm.images
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i !== ""),
        specs: JSON.parse(productForm.specs || "{}"),
      };

      const method = selectedProduct ? "PUT" : "POST";
      const response = await fetch("http://localhost:8080/api/admin/products", {
        cache: "no-store",
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          selectedProduct
            ? { id: selectedProduct.id, ...productData }
            : productData,
        ),
      });

      if (!response.ok) throw new Error("Failed to save");

      notifySuccess("Lưu thành công!");
      setProductDialogOpen(false);
      setSelectedProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        original_price: "",
        discount_price: "",
        stock: "",
        brand: "",
        category_id: "",
        image_url: "",
        is_featured: false,
        is_deal: false,
        images: "",
        specs: "",
      });

      // Wait a bit then refresh data directly with fresh fetch
      setTimeout(async () => {
        try {
          const params = new URLSearchParams({
            page: "1",
            limit: "50",
          });

          const freshResponse = await fetch(
            `http://localhost:8080/api/admin/products?${params}`,
            {
              cache: "no-store",
            },
          );
          const freshData = await freshResponse.json();

          setProducts(freshData.data || []);
          setProductsPagination((prev) => ({
            ...prev,
            total: freshData.pagination?.total || 0,
            totalPages: freshData.pagination?.totalPages || 0,
          }));
        } catch (error) {}
      }, 500);
    } catch (error) {
      notifyError("Lỗi khi lưu sản phẩm: " + (error as Error).message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    await fetch(`http://localhost:8080/api/admin/products?id=${id}`, {
      method: "DELETE",
    });
    fetchProducts();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sản phẩm</h1>
          <p className="text-muted-foreground">
            Quản lý kho hàng và thông tin sản phẩm.
          </p>
        </div>
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedProduct(null);
                setProductForm({
                  name: "",
                  description: "",
                  price: "",
                  original_price: "",
                  discount_price: "",
                  stock: "",
                  brand: "",
                  category_id: "",
                  image_url: "",
                  images: "",
                  is_featured: false,
                  is_deal: false,
                  specs: "",
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 backdrop-blur-xl">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="text-xl flex items-center gap-2">
                {selectedProduct ? (
                  <Edit className="h-5 w-5 text-primary" />
                ) : (
                  <Plus className="h-5 w-5 text-emerald-500" />
                )}
                {selectedProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleProductSubmit}
              className="overflow-y-auto px-6 py-4 space-y-8 flex-1"
              data-lenis-prevent
              onWheel={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
            >
              {/* Section 1: Thông tin */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
                  <Info className="h-4 w-4" /> Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Tên sản phẩm *</Label>
                    <Input
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Danh mục</Label>
                    <Select
                      value={productForm.category_id}
                      onValueChange={(v) =>
                        setProductForm({ ...productForm, category_id: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Thương hiệu</Label>
                    <Input
                      value={productForm.brand}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          brand: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Mô tả ngắn</Label>
                    <Textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section 2: Tài chính */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
                  <DollarSign className="h-4 w-4" /> Giá bán & Kho
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Giá bán (VND) *</Label>
                    <Input
                      type="number"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Giá gốc</Label>
                    <Input
                      type="number"
                      value={productForm.original_price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          original_price: e.target.value,
                        })
                      }
                      placeholder="Tùy chọn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Giá KM</Label>
                    <Input
                      type="number"
                      value={productForm.discount_price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          discount_price: e.target.value,
                        })
                      }
                      placeholder="Tùy chọn"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Số lượng tồn *</Label>
                    <Input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section 3: Hình ảnh */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
                  <ImageIcon className="h-4 w-4" /> Hình ảnh
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>URL Ảnh chính</Label>
                    <div className="flex gap-3">
                      <Input
                        value={productForm.image_url}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            image_url: e.target.value,
                          })
                        }
                        placeholder="https://..."
                      />
                      {productForm.image_url && (
                        <img
                          src={productForm.image_url}
                          alt="preview"
                          className="h-10 w-10 rounded border object-cover"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>URL Ảnh phụ (Cách nhau bằng dấu phẩy)</Label>
                    <Textarea
                      value={productForm.images}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          images: e.target.value,
                        })
                      }
                      placeholder="https://img1.jpg, https://img2.jpg"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section 4: Nâng cao */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
                  <Settings2 className="h-4 w-4" /> Cấu hình nâng cao
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Thông số kỹ thuật (JSON Format)</Label>
                    <Textarea
                      className="font-mono text-sm"
                      value={productForm.specs}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          specs: e.target.value,
                        })
                      }
                      placeholder='{"RAM": "8GB", "CPU": "Intel i5"}'
                      rows={4}
                    />
                  </div>
                  <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sản phẩm nổi bật</Label>
                        <p className="text-xs text-muted-foreground">
                          Hiển thị ở banner trang chủ
                        </p>
                      </div>
                      <Checkbox
                        checked={productForm.is_featured}
                        onCheckedChange={(c) =>
                          setProductForm({ ...productForm, is_featured: !!c })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Hot Deal</Label>
                        <p className="text-xs text-muted-foreground">
                          Gắn nhãn khuyến mãi đặc biệt
                        </p>
                      </div>
                      <Checkbox
                        checked={productForm.is_deal}
                        onCheckedChange={(c) =>
                          setProductForm({ ...productForm, is_deal: !!c })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fake div for scrolling spacing */}
              <div className="pb-4"></div>
            </form>

            <div className="px-6 py-4 border-t bg-muted/20 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setProductDialogOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button onClick={handleProductSubmit}>
                {selectedProduct ? "Lưu thay đổi" : "Tạo sản phẩm"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Products */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-16 text-center">Ảnh</TableHead>
                <TableHead className="min-w-62.5">Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead className="text-center">Kho</TableHead>
                <TableHead className="text-right pr-4">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell className="text-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover border mx-auto"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center mx-auto border border-dashed">
                          <ImageIcon className="h-5 w-5 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {product.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex gap-2 items-center">
                        {product.brand && (
                          <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                            {product.brand}
                          </span>
                        )}
                        {product.is_featured && (
                          <span className="text-orange-500 font-semibold text-[10px]">
                            ★ NỔI BẬT
                          </span>
                        )}
                        {product.is_deal && (
                          <span className="text-destructive font-semibold text-[10px]">
                            🔥 DEAL
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {categories.find((c) => c.id === product.category_id)
                        ?.name || "Chưa phân loại"}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-primary">
                        {formatCurrency(product.price)}
                      </div>
                      {product.original_price && (
                        <div className="text-xs line-through text-muted-foreground">
                          {formatCurrency(product.original_price)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          product.stock > 10
                            ? "secondary"
                            : product.stock > 0
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => {
                            setSelectedProduct(product);
                            setProductForm({
                              ...product,
                              price: product.price.toString(),
                              original_price:
                                product.original_price?.toString() || "",
                              discount_price:
                                product.discount_price?.toString() || "",
                              stock: product.stock.toString(),
                              brand: product.brand || "",
                              category_id: product.category_id || "",
                              image_url: product.image_url || "",
                              images: product.images?.join(", ") || "",
                              specs: product.specs
                                ? JSON.stringify(product.specs, null, 2)
                                : "",
                            } as any);
                            setProductDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
