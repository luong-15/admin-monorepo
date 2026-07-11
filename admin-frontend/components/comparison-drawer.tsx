"use client"

import { useComparisonStore } from "@/lib/store/comparison-store"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { X, GitCompare, ArrowRight, Package, Star } from "lucide-react"
import { formatPrice } from "@/lib/currency"
import Image from "next/image"
import Link from "next/link"

export function ComparisonDrawer() {
  const { products, isOpen, closeComparison, removeProduct, getProductCount } = useComparisonStore()

  const productCount = getProductCount()

  return (
    <Sheet open={isOpen} onOpenChange={closeComparison}>
      <SheetContent className="flex h-full w-full flex-col border-l border-border/50 bg-background/95 backdrop-blur-xl sm:max-w-lg sm:h-[calc(100dvh-4rem)] sm:top-16 sm:mt-0 sm:rounded-l-2xl overflow-hidden p-3.75">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <GitCompare className="h-5 w-5 text-primary" />
            So sánh sản phẩm
            <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary transition-all duration-300">
              {productCount} sản phẩm
            </span>
          </SheetTitle>
        </SheetHeader>

        {products.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/5">
                <GitCompare className="h-14 w-14 text-primary/50" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <span className="text-2xl">⚖️</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">Chưa có sản phẩm để so sánh</h3>
              <p className="mt-2 max-w-62.5 text-sm text-muted-foreground">
                Thêm sản phẩm vào danh sách so sánh để xem chi tiết và so sánh thông số kỹ thuật.
              </p>
            </div>
            <Button asChild onClick={closeComparison} size="lg" className="mt-2 gap-2">
              <Link href="/products">
                Khám phá sản phẩm
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-500">
                <GitCompare className="h-4 w-4" />
                <span>Đã thêm {productCount} sản phẩm để so sánh</span>
              </div>
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative flex gap-4 rounded-xl border border-border/50 bg-card/50 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-card hover:shadow-lg"
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    {/* Product Image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted/50">
                      <Image
                        src={product.image_url || "/placeholder.svg?height=80&width=80&query=tech product"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h4 className="line-clamp-2 text-sm font-medium leading-tight transition-colors group-hover:text-primary">
                          {product.name}
                        </h4>
                        {product.brand && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{product.brand}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">({product.review_count})</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-destructive/10 opacity-0 shadow-sm transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                      onClick={() => removeProduct(product.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border/50 pt-4">
              {/* Benefits */}
              <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/30 p-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">So sánh chi tiết</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/30 p-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Đánh giá sản phẩm</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/30 p-2">
                  <GitCompare className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Thông số kỹ thuật</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full gap-2" size="lg" onClick={closeComparison}>
                  <Link href="/compare">
                    <GitCompare className="h-4 w-4" />
                    So sánh chi tiết
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent" onClick={closeComparison}>
                  <Link href="/products">Tiếp tục mua sắm</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
