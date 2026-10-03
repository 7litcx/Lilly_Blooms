-- ==============================================================================
-- Lilly Bloom's - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    rating NUMERIC(3, 1) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    badge TEXT,
    image TEXT NOT NULL,
    description TEXT,
    details JSONB DEFAULT '[]'::jsonb,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image TEXT,
    tag TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    promo_code TEXT,
    gift_message TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    payment_method TEXT NOT NULL DEFAULT 'mada',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Promo Codes Table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Initial Promo Code
INSERT INTO public.promo_codes (code, discount_percent, is_active)
VALUES ('BLOOM15', 15.00, true)
ON CONFLICT (code) DO NOTHING;

-- 7. Initial Categories
INSERT INTO public.categories (id, title, subtitle, image, tag)
VALUES 
  ('bouquets', 'باقات الورد', 'زهور نضرة وفاخرة لكل مناسبة', '/images/cat-bouquets.jpg', 'جميع الباقات'),
  ('birthday', 'أعياد الميلاد', 'احتفل بأجمل اللحظات والذكريات', '/images/cat-birthday.jpg', 'باقات الميلاد'),
  ('romantic', 'رومانسية', 'عبّر عن أصدق مشاعرك بأجمل زهور', '/images/cat-romantic.jpg', 'الحب والرومانسية'),
  ('gifts', 'هدايا فاخرة', 'تنسيقات وهدايا مدروسة تسعد أحبابك', '/images/cat-gifts.jpg', 'مجموعات الهدايا')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, image = EXCLUDED.image, tag = EXCLUDED.tag;

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- 9. Open Access Policies (Allows Storefront & Admin to interact seamlessly)
DROP POLICY IF EXISTS "Public read access for products" ON public.products;
CREATE POLICY "Public read access for products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full access for products" ON public.products;
CREATE POLICY "Full access for products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for categories" ON public.categories;
CREATE POLICY "Public read access for categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full access for categories" ON public.categories;
CREATE POLICY "Full access for categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for orders" ON public.orders;
CREATE POLICY "Public read access for orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full access for orders" ON public.orders;
CREATE POLICY "Full access for orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read access for promo_codes" ON public.promo_codes;
CREATE POLICY "Public read access for promo_codes" ON public.promo_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Full access for promo_codes" ON public.promo_codes;
CREATE POLICY "Full access for promo_codes" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);

-- 10. Storage Bucket Setup (for product images)
-- In the Supabase Dashboard, create a bucket named 'products' and set it to public.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access to product images" ON storage.objects;
CREATE POLICY "Public Access to product images" ON storage.objects FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow Uploads to product images" ON storage.objects;
CREATE POLICY "Allow Uploads to product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow Delete from product images" ON storage.objects;
CREATE POLICY "Allow Delete from product images" ON storage.objects FOR DELETE USING (bucket_id = 'products');

-- 11. Product Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    city TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT true,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Full access reviews" ON public.reviews;
CREATE POLICY "Full access reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- 12. Profiles / Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Full access profiles" ON public.profiles;
CREATE POLICY "Full access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Initial Admin Profile
INSERT INTO public.profiles (email, full_name, role)
VALUES ('sh2002@gmail.com', 'مدير المتجر', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 13. Users Table (Dedicated Users table in public schema)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns and constraints are set correctly even if table existed before
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash') THEN
      ALTER TABLE public.users RENAME COLUMN password_hash TO password;
    ELSE
      ALTER TABLE public.users ADD COLUMN password TEXT;
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name') THEN
    ALTER TABLE public.users ALTER COLUMN name DROP NOT NULL;
    ALTER TABLE public.users ALTER COLUMN name SET DEFAULT '';
  ELSE
    ALTER TABLE public.users ADD COLUMN name TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE public.users ADD COLUMN phone TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'customer';
  END IF;
END $$;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read users" ON public.users;
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert users" ON public.users;
CREATE POLICY "Public insert users" ON public.users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update users" ON public.users;
CREATE POLICY "Public update users" ON public.users FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public delete users" ON public.users;
CREATE POLICY "Public delete users" ON public.users FOR DELETE USING (true);

-- Insert admin into users table
INSERT INTO public.users (email, password, name, role)
VALUES ('sh2002@gmail.com', 'sh12345', 'مدير المتجر', 'admin')
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password, 
    role = 'admin',
    name = COALESCE(NULLIF(public.users.name, ''), 'مدير المتجر');

-- ==============================================================================
-- 14. Slider Slides Table (Main Hero Banner Slides)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.slider_slides (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    image TEXT NOT NULL,
    title TEXT DEFAULT '',
    subtitle TEXT DEFAULT '',
    link TEXT DEFAULT '#bouquets',
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.slider_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read slider_slides" ON public.slider_slides;
CREATE POLICY "Public read slider_slides" ON public.slider_slides FOR SELECT USING (true);
DROP POLICY IF EXISTS "Full access slider_slides" ON public.slider_slides;
CREATE POLICY "Full access slider_slides" ON public.slider_slides FOR ALL USING (true) WITH CHECK (true);



