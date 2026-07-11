export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  discount_price?: number;
  category_id?: string;
  brand?: string;
  image_url?: string;
  images?: string[];
  stock: number;
  is_featured: boolean;
  is_deal: boolean;
  specs?: Record<string, any>;
  specifications?: Record<string, any>;
  rating: number;
  review_count: number;
  sold_count?: number;
  created_at?: string;
  updated_at?: string;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface Order {
  order_items_count: number;
  id: string;
  order_number: string;
  user_id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "cancelled";
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  role?: "admin" | "user";
  phone?: string;
  email?: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Settings {
  id: string;
  store_name: string;
  store_description: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
  maintenance_mode: boolean;
  auto_approve_orders: boolean;
  default_tax_rate: number;
  logo_url: string;
  favicon_url: string;
}
