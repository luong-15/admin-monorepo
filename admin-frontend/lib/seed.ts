import { createAdminServerClient } from "./supabase/server";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  brand: string;
  image_url?: string;
  stock: number;
  is_featured?: boolean;
  is_deal?: boolean;
  rating?: number;
  review_count?: number;
  category_id: string;
  specs?: Record<string, string>;
  category?: Category;
  created_at: string;
  updated_at: string;
};

async function seedCategories() {
  const supabase = await createAdminServerClient();

  const categories: Omit<Category, "id" | "created_at" | "updated_at">[] = [
    {
      name: "Điện thoại",
      slug: "dien-thoai",
      description: "Smartphones cao cấp",
    },
    { name: "Laptop", slug: "laptop", description: "Máy tính xách tay" },
    { name: "Tai nghe", slug: "tai-nghe", description: "Tai nghe không dây" },
    { name: "Đồng hồ", slug: "dong-ho", description: "Smartwatch" },
    { name: "Phụ kiện", slug: "phu-kien", description: "Phụ kiện công nghệ" },
  ];

  const { error } = await supabase
    .from("categories")
    .upsert(categories, { ignoreDuplicates: true });
  if (error) throw error;
  console.log("✅ Seeded categories");
}

async function seedProfiles() {
  const supabase = await createAdminServerClient();

  const profiles = [
    {
      id: "00000000-0000-0000-0000-000000000001", // admin user id placeholder
      full_name: "Admin User",
      role: "admin",
      email: "admin@technova.com",
    },
    {
      id: "00000000-0000-0000-0000-000000000002", // user
      full_name: "John Doe",
      role: "user",
      email: "user@technova.com",
    },
  ];

  const { error } = await supabase
    .from("profiles")
    .upsert(profiles, { ignoreDuplicates: true });
  if (error) {
    console.log("Profiles seed skipped (table not found?)", error.message);
  } else {
    console.log("✅ Seeded profiles");
  }
}

async function seedCartItems() {
  const supabase = await createAdminServerClient();

  // Get first user and first product
  const { data: firstUser } = await supabase
    .from("profiles")
    .select("id")
    .limit(1)
    .single();

  const { data: firstProduct } = await supabase
    .from("products")
    .select("id")
    .limit(1)
    .single();

  if (!firstUser || !firstProduct) {
    console.log("No user/product for cart sample");
    return;
  }

  const cartItems = [
    {
      user_id: firstUser.id,
      product_id: firstProduct.id,
      quantity: 2,
    },
  ];

  const { error } = await supabase
    .from("cart_items")
    .upsert(cartItems, { ignoreDuplicates: true });
  if (error) {
    console.log("Cart items seed skipped", error.message);
  } else {
    console.log("✅ Seeded sample cart_items");
  }
}

async function seedProducts() {
  const supabase = await createAdminServerClient();

  const products: Omit<
    Product,
    "id" | "category" | "created_at" | "updated_at"
  >[] = [
    {
      name: "iPhone 16 Pro Max",
      slug: "iphone-16-pro-max",
      description: "Flagship smartphone 2024",
      price: 35000000,
      original_price: 38000000,
      brand: "Apple",
      image_url:
        "https://images.unsplash.com/photo-1592899678534-257cafac9de5?w=500",
      stock: 50,
      is_featured: true,
      is_deal: true,
      rating: 4.9,
      review_count: 120,
      category_id: "1", // Assume categories ids start from 1 or use slug later
      specs: { screen: '6.9"', chip: "A18 Pro", camera: "48MP" },
    },
    {
      name: "Samsung Galaxy S25 Ultra",
      slug: "samsung-galaxy-s25-ultra",
      description: "Android flagship với S Pen",
      price: 32000000,
      brand: "Samsung",
      image_url:
        "https://images.unsplash.com/photo-1685522532144-344f8d9d2f1d?w=500",
      stock: 30,
      is_featured: true,
      rating: 4.8,
      review_count: 89,
      category_id: "1",
      specs: { screen: '6.8"', chip: "Snapdragon 8 Gen 4", camera: "200MP" },
    },
    // Add 18 more...
    {
      name: "MacBook Pro M3",
      slug: "macbook-pro-m3",
      description: "Laptop chuyên nghiệp Apple",
      price: 55000000,
      brand: "Apple",
      image_url:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500",
      stock: 20,
      rating: 4.9,
      review_count: 67,
      category_id: "2",
    },
    {
      name: "Dell XPS 14",
      slug: "dell-xps-14",
      price: 42000000,
      brand: "Dell",
      image_url:
        "https://images.unsplash.com/photo-1611003229189-11550a98365a?w=500",
      stock: 25,
      rating: 4.7,
      category_id: "2",
    },
    {
      name: "AirPods Pro 2",
      slug: "airpods-pro-2",
      price: 6500000,
      brand: "Apple",
      image_url:
        "https://images.unsplash.com/photo-1588423771079-1a5f6d8b4f37?w=500",
      stock: 100,
      is_deal: true,
      rating: 4.8,
      category_id: "3",
    },
    {
      name: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      price: 12000000,
      brand: "Sony",
      image_url:
        "https://images.unsplash.com/photo-1613644716394-9baff22d1e8f?w=500",
      stock: 40,
      rating: 4.9,
      category_id: "3",
    },
    {
      name: "Apple Watch Ultra 2",
      slug: "apple-watch-ultra-2",
      price: 22000000,
      brand: "Apple",
      image_url:
        "https://images.unsplash.com/photo-1668810793284-0a9ab32e8787?w=500",
      stock: 35,
      rating: 4.7,
      category_id: "4",
    },
    {
      name: "Samsung Galaxy Watch 7",
      slug: "samsung-galaxy-watch-7",
      price: 9500000,
      brand: "Samsung",
      image_url:
        "https://images.unsplash.com/photo-1524592094714-0f0654.0f12?w=500",
      stock: 50,
      rating: 4.6,
      category_id: "4",
    },
    // Phụ kiện
    {
      name: "iPhone Case Pro",
      slug: "iphone-case-pro",
      price: 450000,
      brand: "Spigen",
      image_url:
        "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500",
      stock: 200,
      category_id: "5",
    },
    {
      name: "USB-C Charger 65W",
      slug: "usb-c-charger-65w",
      price: 750000,
      brand: "Anker",
      image_url:
        "https://images.unsplash.com/photo-1628258334165-e4e793a876e2?w=500",
      stock: 150,
      category_id: "5",
    },
    // More products to make 20...
    {
      name: "iPad Air M2",
      slug: "ipad-air-m2",
      price: 18500000,
      brand: "Apple",
      image_url:
        "https://images.unsplash.com/photo-1561163588-32dba1604e5e?w=500",
      stock: 25,
      category_id: "2",
    },
    {
      name: "Surface Laptop 6",
      slug: "surface-laptop-6",
      price: 38000000,
      brand: "Microsoft",
      image_url:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
      stock: 15,
      category_id: "2",
    },
    {
      name: "Bose QuietComfort Ultra",
      slug: "bose-quietcomfort-ultra",
      price: 11000000,
      brand: "Bose",
      image_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
      stock: 30,
      category_id: "3",
    },
    {
      name: "Garmin Venu 3",
      slug: "garmin-venu-3",
      price: 14000000,
      brand: "Garmin",
      image_url:
        "https://images.unsplash.com/photo-1526506118088-341dce449469?w=500",
      stock: 20,
      category_id: "4",
    },
    {
      name: "MagSafe Charger",
      slug: "magsafe-charger",
      price: 1200000,
      brand: "Apple",
      image_url:
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
      stock: 80,
      category_id: "5",
    },
    {
      name: "Laptop Stand",
      slug: "laptop-stand",
      price: 800000,
      brand: "Rain Design",
      image_url:
        "https://images.unsplash.com/photo-1585366926148-536a54112a31?w=500",
      stock: 60,
      category_id: "5",
    },
    {
      name: "iPhone 16",
      slug: "iphone-16",
      price: 25000000,
      brand: "Apple",
      image_url:
        "https://images.unsplash.com/photo-1632287718679-263f291fcf08?w=500",
      stock: 40,
      category_id: "1",
    },
    {
      name: "Pixel 9 Pro",
      slug: "pixel-9-pro",
      price: 24000000,
      brand: "Google",
      image_url:
        "https://images.unsplash.com/photo-1725892951429-8cdee3d05885?w=500",
      stock: 25,
      category_id: "1",
    },
    {
      name: "OnePlus Buds Pro 3",
      slug: "oneplus-buds-pro-3",
      price: 4500000,
      brand: "OnePlus",
      image_url:
        "https://images.unsplash.com/photo-1610691236643-25b53ba5b5be?w=500",
      stock: 70,
      category_id: "3",
    },
    {
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      price: 28000000,
      brand: "Apple",
      image_url:
        "https://images.unsplash.com/photo-1693612518797-1f1d73d4d6cb?w=500",
      stock: 35,
      rating: 4.8,
      review_count: 200,
      category_id: "1",
    },
  ];

  // First upsert categories to get real ids, then products
  const { data: cats } = await supabase.from("categories").select("id, slug");
  const catMap = new Map(
    (cats as { id: string; slug: string }[]).map((c) => [c.slug, c.id]),
  );

  const productsWithId = products
    .map((p) => ({
      ...p,
      category_id:
        catMap.get(
          p.category_id === "1"
            ? "dien-thoai"
            : p.category_id === "2"
              ? "laptop"
              : p.category_id === "3"
                ? "tai-nghe"
                : p.category_id === "4"
                  ? "dong-ho"
                  : "phu-kien",
        ) || p.category_id,
    }))
    .filter((p) => p.category_id);

  const { error } = await supabase
    .from("products")
    .upsert(productsWithId, { ignoreDuplicates: true });
  if (error) throw error;
  console.log("✅ Seeded", products.length, "products");
}

async function main() {
  console.log("🌱 Seeding TechNova Store DB...");
  try {
    await seedCategories();
    await seedProducts();
    await seedProfiles();
    await seedCartItems();
    console.log("🎉 Full seed complete! Including profiles and cart samples");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
