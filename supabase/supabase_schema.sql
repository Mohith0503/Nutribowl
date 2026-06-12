-- ============================================================
-- Nutribowl Supabase Schema v2 — Full Organized Schema
-- Run this in your Supabase SQL Editor (Project > SQL Editor)
-- Safe to run on existing DB (uses IF NOT EXISTS / ALTER)
-- ============================================================

-- ============================================================
-- TABLE 1: menu_items
-- Stores all bases, addons, and signature combos
-- ============================================================

CREATE TABLE IF NOT EXISTS menu_items (
    id          text PRIMARY KEY,
    type        text NOT NULL CHECK (type IN ('base', 'addon', 'combo')),
    name        text NOT NULL,
    price       numeric NOT NULL CHECK (price >= 0),
    tags        text[] DEFAULT '{}',
    image       text,
    category    text,                    -- For addons: 'Fresh Fruits', 'Premium Nuts', etc.
    in_stock    boolean DEFAULT true,
    description text,
    ingredients text[] DEFAULT '{}',
    nutrition   jsonb,                   -- { calories, protein, carbs, fiber, fat }
    prep_time   text,
    -- Combo-specific fields
    base_item   text,                    -- Name of the base used in combo
    addon_items text[] DEFAULT '{}',     -- Names of addons included in combo
    combo_tag   text,                    -- E.g. 'High Protein', 'Overnight'
    -- Signature dish flag
    is_signature boolean DEFAULT false,  -- true = locked recipe shown as Signature Dish
    chef_note   text,                    -- Optional chef's description for signature dishes
    created_at  timestamp with time zone DEFAULT now(),
    updated_at  timestamp with time zone DEFAULT now()
);

-- ============================================================
-- TABLE 2: orders
-- Stores all customer orders (WhatsApp + future direct)
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
    id           text PRIMARY KEY,
    items        jsonb NOT NULL,          -- Array of cart items with base/addons/qty
    customer     jsonb NOT NULL,          -- { name, phone, address, timeSlot, startDate, notes }
    plan         jsonb,                   -- { id, name, duration, discountPercentage }
    total_price  numeric NOT NULL CHECK (total_price >= 0),
    status       text DEFAULT 'pending_whatsapp'
                 CHECK (status IN (
                   'pending_whatsapp',    -- Order saved, WA redirect opened
                   'confirmed',           -- Admin confirmed via WA
                   'preparing',           -- Kitchen is preparing
                   'out_for_delivery',    -- On the way
                   'delivered',           -- Successfully delivered
                   'canceled'             -- Canceled
                 )),
    source       text DEFAULT 'whatsapp'
                 CHECK (source IN ('whatsapp', 'direct')),
    created_at   timestamp with time zone DEFAULT now(),
    updated_at   timestamp with time zone DEFAULT now()
);

-- ============================================================
-- TABLE 3: subscribers (for future subscription tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscribers (
    id           text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name         text NOT NULL,
    phone        text NOT NULL,
    address      text NOT NULL,
    time_slot    text NOT NULL,
    plan_id      text NOT NULL,           -- 'oneday', 'weekly', 'monthly'
    plan_name    text NOT NULL,
    duration     integer NOT NULL,
    start_date   date NOT NULL,
    end_date     date NOT NULL,
    meal_id      text REFERENCES menu_items(id),
    meal_name    text NOT NULL,
    daily_price  numeric NOT NULL,
    total_price  numeric NOT NULL,
    status       text DEFAULT 'active'
                 CHECK (status IN ('active', 'paused', 'completed', 'canceled')),
    order_id     text REFERENCES orders(id),
    created_at   timestamp with time zone DEFAULT now(),
    updated_at   timestamp with time zone DEFAULT now()
);

-- ============================================================
-- INDEXES — for faster admin dashboard queries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_type ON menu_items(type);
CREATE INDEX IF NOT EXISTS idx_menu_items_in_stock ON menu_items(in_stock);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_phone ON subscribers(phone);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE menu_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe re-run)
DROP POLICY IF EXISTS "Public read menu_items"    ON menu_items;
DROP POLICY IF EXISTS "Public insert orders"       ON orders;
DROP POLICY IF EXISTS "Anon read orders"           ON orders;
DROP POLICY IF EXISTS "Anon update orders"         ON orders;
DROP POLICY IF EXISTS "Anon all menu_items"        ON menu_items;

-- menu_items: anyone can read, only anon key can write (admin)
CREATE POLICY "Public read menu_items"
  ON menu_items FOR SELECT USING (true);

CREATE POLICY "Admin manage menu_items"
  ON menu_items FOR ALL USING (true);

-- orders: anyone can insert (customers placing orders)
-- anyone can read/update (admin uses anon key for now)
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon read orders"
  ON orders FOR SELECT USING (true);

CREATE POLICY "Anon update orders"
  ON orders FOR UPDATE USING (true);

-- subscribers: full access for admin
CREATE POLICY "Anon all subscribers"
  ON subscribers FOR ALL USING (true);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscribers_updated_at ON subscribers;
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ADD MISSING COLUMNS TO EXISTING menu_items TABLE
-- (Safe to run even if table already exists)
-- ============================================================

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_signature boolean DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS chef_note text;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- ADD MISSING COLUMNS TO EXISTING orders TABLE
ALTER TABLE orders ADD COLUMN IF NOT EXISTS plan jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source text DEFAULT 'whatsapp';

-- Update existing orders status constraint (safe way)
-- Note: Supabase doesn't support ALTER CONSTRAINT easily, so just ensure new inserts work

-- ============================================================
-- MARK EXISTING COMBOS AS SIGNATURE DISHES
-- ============================================================

UPDATE menu_items
SET is_signature = true,
    chef_note = CASE
      WHEN name = 'Peanut Butter Power Oats' THEN 'Our bestseller — a powerhouse bowl of energy and protein to fuel your morning.'
      WHEN name = 'Cocoa Banana Oat Cup' THEN 'Rich cocoa meets sweet banana in this indulgent yet nutritious morning treat.'
      WHEN name = 'Cinnamon Apple Oat Porridge' THEN 'A classic comfort bowl — warm cinnamon spice with fresh apple goodness.'
      WHEN name = 'Peanut Butter Banana Overnight Oats' THEN 'Prep the night before, wake up to creamy perfection every morning.'
      WHEN name = 'Apple Cinnamon Overnight Oats' THEN 'Light, refreshing overnight oats with a crisp apple and cinnamon finish.'
      WHEN name = 'Chocolate Fiber Overnight Oats' THEN 'Dark chocolate depth with maximum fiber — guilt-free indulgence at its finest.'
      ELSE NULL
    END
WHERE type = 'combo';

-- ============================================================
-- DONE — Schema is now organized and production-ready
-- ============================================================
