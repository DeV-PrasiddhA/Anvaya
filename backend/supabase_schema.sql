-- ================================================================
-- ANVAYA DATABASE SCHEMA FOR SUPABASE (WITH GOOGLE & EMAIL AUTH)
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PUBLIC USERS TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Farmer' CHECK (role IN ('Farmer', 'Retailer', 'Cooperative', 'Transport Provider')),
    phone TEXT,
    province TEXT,
    district TEXT,
    ward TEXT,
    local_location TEXT,
    extra_field_1 TEXT, -- (e.g. Primary Crop, Store Name, Registered Coop, Vehicle Type)
    extra_field_2 TEXT, -- (e.g. Land Size, Sourcing Volume, Member Count, License Plate)
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. AUTOMATIC PROFILE CREATION TRIGGER FOR GOOGLE & EMAIL OAUTH SIGNUPS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'Farmer'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = EXCLUDED.name,
      avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. PRODUCTS / CROP LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    seller_name TEXT NOT NULL,
    crop TEXT NOT NULL,
    district TEXT NOT NULL,
    local_location TEXT,
    physical_storefront TEXT,
    price_npr NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT DEFAULT 'kg' NOT NULL,
    grade TEXT DEFAULT 'A',
    harvest_date DATE,
    best_before DATE,
    pesticide_status TEXT DEFAULT '0% Synthetic Pesticides',
    badge TEXT DEFAULT 'Organic Verified',
    qr_code_data TEXT UNIQUE,
    description TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Sold', 'Delisted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    crop TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT DEFAULT 'kg',
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'In-Transit', 'Delivered', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TRANSPORT JOBS TABLE
CREATE TABLE IF NOT EXISTS public.transport_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    transporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    pickup_location TEXT NOT NULL,
    destination_location TEXT NOT NULL,
    crop TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    vehicle_type TEXT,
    freight_price_npr NUMERIC,
    status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'In-Transit', 'Delivered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. LIVE MARKET PRICES TABLE
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name TEXT UNIQUE NOT NULL,
    hub_name TEXT DEFAULT 'Kalimati Hub',
    price_npr NUMERIC NOT NULL,
    broker_price_npr NUMERIC NOT NULL,
    unit TEXT DEFAULT 'kg',
    change_pct NUMERIC DEFAULT 0,
    is_up BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ================================================================
-- INITIAL SEED DATA FOR MARKET PRICES
-- ================================================================

INSERT INTO public.market_prices (crop_name, hub_name, price_npr, broker_price_npr, unit, change_pct, is_up)
VALUES
  ('Large Cardamom (Elaichi)', 'Jhapa Hub', 1250, 920, 'kg', 2.4, true),
  ('Orthodox Tea', 'Ilam Hub', 850, 620, 'kg', -0.8, false),
  ('Mustang Apple', 'Mustang Hub', 280, 190, 'kg', 4.1, true),
  ('Red Potato', 'Pokhara Hub', 65, 42, 'kg', 1.2, true),
  ('Organic Ginger (Aduwa)', 'Surkhet Hub', 160, 110, 'kg', 5.7, true),
  ('Cabbage (Banda)', 'Kathmandu Hub', 45, 30, 'kg', -3.2, false),
  ('Cauliflower', 'Bhaktapur Hub', 80, 55, 'kg', 0.5, true)
ON CONFLICT (crop_name) DO UPDATE
SET price_npr = EXCLUDED.price_npr,
    broker_price_npr = EXCLUDED.broker_price_npr,
    change_pct = EXCLUDED.change_pct,
    is_up = EXCLUDED.is_up,
    updated_at = timezone('utc'::text, now());
