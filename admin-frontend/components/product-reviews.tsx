"use client";

import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ProductReviewsProps {
  reviews: Review[];
  productId: string;
  averageRating: number;
  totalReviews: number;
}

export function ProductReviews({
  reviews,
  productId,
  averageRating,
  totalReviews,
}: ProductReviewsProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => Math.floor(r.rating) === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <h2 className="text-2xl font-bold md:text-3xl">Đánh giá sản phẩm</h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Rating Summary */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-blue-400">
                {averageRating.toFixed(1)}
              </div>
              <div className="mb-2 flex justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {totalReviews} đánh giá
              </p>
            </div>

            <div className="mt-6 space-y-2">
              {ratingDistribution.map((dist) => (
                <div key={dist.rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{dist.rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={dist.percentage} className="flex-1" />
                  <span className="w-8 text-right text-sm text-muted-foreground">
                    {dist.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-4 lg:col-span-2">
          {displayedReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage
                      src={review.user?.avatar_url || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {review.user?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {review.user?.full_name || "Người dùng ẩn danh"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="mb-2 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(review.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="mb-4 text-pretty">{review.comment}</p>

                    <Button variant="ghost" size="sm" className="gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      Hữu ích
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {reviews.length > 5 && (
            <div className="text-center">
              <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                {showAll
                  ? "Thu gọn"
                  : `Xem thêm ${reviews.length - 5} đánh giá`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
