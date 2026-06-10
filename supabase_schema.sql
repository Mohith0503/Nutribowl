-- ============================================================
-- Nutribowl Supabase Schema + Seed
-- Run this in your Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- 1. Create Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS menu_items (
    id text PRIMARY KEY,
    type text NOT NULL,
    name text NOT NULL,
    price numeric NOT NULL,
    tags text[],
    image text,
    category text,
    in_stock boolean DEFAULT true,
    description text,
    ingredients text[],
    nutrition jsonb,
    prep_time text,
    base_item text,
    addon_items text[],
    combo_tag text
);

CREATE TABLE IF NOT EXISTS orders (
    id text PRIMARY KEY,
    items jsonb NOT NULL,
    customer jsonb NOT NULL,
    total_price numeric NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public to READ menu_items
CREATE POLICY "Public read menu_items" ON menu_items
  FOR SELECT USING (true);

-- Allow public to INSERT orders (place orders)
CREATE POLICY "Public insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow anyone with anon key to read/update/delete (Admin uses the anon key for now)
-- In a production setup, you'd use service_role key in a backend or Supabase Edge Functions.
CREATE POLICY "Anon read orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Anon update orders" ON orders
  FOR UPDATE USING (true);

CREATE POLICY "Anon all menu_items" ON menu_items
  FOR ALL USING (true);

-- ============================================================
-- 2. Seed Menu Items - Bases
-- ============================================================

INSERT INTO menu_items (id, type, name, price, tags, image, description, ingredients, nutrition, prep_time, in_stock) VALUES
('b1', 'base', 'Peanut Butter Power Oats', 130, ARRAY['High Protein','Healthy Fats'],
 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&q=80',
 'A powerful blend of organic oats and creamy peanut butter, perfect for a high-energy start to your day.',
 ARRAY['Organic Rolled Oats','Peanut Butter','Honey','Chia Seeds'],
 '{"calories":350,"protein":"15g","carbs":"45g","fiber":"8g","fat":"12g"}', '5 min', true),

('b2', 'base', 'Cocoa Banana Oat Cup', 140, ARRAY['Energy Booster','Rich Taste'],
 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
 'Delicious cocoa and fresh bananas mixed with rolled oats for a sweet, nutritious morning treat.',
 ARRAY['Organic Rolled Oats','Cocoa Powder','Fresh Banana','Almond Milk'],
 '{"calories":320,"protein":"10g","carbs":"55g","fiber":"9g","fat":"6g"}', '5 min', true),

('b3', 'base', 'Cinnamon Apple Oat Porridge', 120, ARRAY['Classic','Fiber Rich'],
 'https://images.unsplash.com/photo-1614961909372-5e11b6a0ae54?w=600&q=80',
 'Warm and comforting oat porridge topped with cinnamon-spiced apples. A classic, healthy breakfast.',
 ARRAY['Organic Rolled Oats','Fresh Apples','Cinnamon','Honey'],
 '{"calories":290,"protein":"8g","carbs":"60g","fiber":"7g","fat":"4g"}', '5 min', true),

('b4', 'base', 'Peanut Butter Banana Overnight Oats', 150, ARRAY['High Protein','Overnight'],
 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&q=80',
 'Creamy overnight oats layered with rich peanut butter and fresh banana slices.',
 ARRAY['Organic Rolled Oats','Peanut Butter','Banana','Almond Milk','Chia Seeds'],
 '{"calories":380,"protein":"16g","carbs":"50g","fiber":"10g","fat":"14g"}', 'Overnight', true),

('b5', 'base', 'Apple Cinnamon Overnight Oats', 135, ARRAY['Fiber Rich','Overnight'],
 'https://images.unsplash.com/photo-1504308805006-0f7a5f1adea4?w=600&q=80',
 'Refreshingly cool overnight oats infused with apple chunks and a dash of cinnamon.',
 ARRAY['Organic Rolled Oats','Apple','Cinnamon','Almond Milk','Flax Seeds'],
 '{"calories":310,"protein":"9g","carbs":"58g","fiber":"8g","fat":"6g"}', 'Overnight', true),

('b6', 'base', 'Chocolate Fiber Overnight Oats', 145, ARRAY['Fiber Rich','Overnight'],
 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=600&q=80',
 'Indulgent yet healthy chocolate overnight oats packed with dietary fiber.',
 ARRAY['Organic Rolled Oats','Dark Cocoa','Chia Seeds','Almond Milk'],
 '{"calories":330,"protein":"12g","carbs":"48g","fiber":"12g","fat":"8g"}', 'Overnight', true),

('b7', 'base', 'Brown Bread', 80, ARRAY['Fiber Rich'],
 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
 'Two slices of freshly baked, wholesome brown bread made from local organic wheat.',
 ARRAY['Organic Whole Wheat Flour','Yeast','Salt','Water'],
 '{"calories":180,"protein":"6g","carbs":"35g","fiber":"4g","fat":"2g"}', 'Ready to serve', true),

('b8', 'base', 'Multi Grain Bread', 95, ARRAY['Fiber Rich','High Protein'],
 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=600&q=80',
 'Two slices of rustic multi-grain bread baked fresh with linseed, sunflowers, pumpkin, and sesame seeds.',
 ARRAY['Multi-grain Flour','Linseed','Sunflower Seeds','Pumpkin Seeds','Sesame Seeds'],
 '{"calories":210,"protein":"9g","carbs":"38g","fiber":"6g","fat":"5g"}', 'Ready to serve', true),

('b9', 'base', 'Whole Grain Bread', 90, ARRAY['Fiber Rich'],
 'https://images.unsplash.com/photo-1565181152879-bc96b4ccfd69?w=600&q=80',
 'Dense, nutrient-dense whole wheat grain loaf. Fresh, earthy, and deeply satisfying.',
 ARRAY['Whole Wheat Flour','Oat Bran','Flax Seeds','Water','Salt'],
 '{"calories":190,"protein":"7g","carbs":"37g","fiber":"5g","fat":"3g"}', 'Ready to serve', true);

-- ============================================================
-- 3. Seed Menu Items - Addons (Spreads & Sweeteners)
-- ============================================================

INSERT INTO menu_items (id, type, name, price, tags, image, category, in_stock) VALUES
('bu1', 'addon', 'Almond Butter (Creamy Crunchy)', 40, ARRAY['Healthy Fats'],
 'https://images.unsplash.com/photo-1612459284970-e8f027596582?w=300&q=80', 'Spreads & Sweeteners', true),
('bu2', 'addon', 'Dark Chocolate Peanut Butter', 45, ARRAY['Healthy Fats','High Protein'],
 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80', 'Spreads & Sweeteners', true),
('bu3', 'addon', 'Peanut Butter', 35, ARRAY['Healthy Fats','High Protein'],
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80', 'Spreads & Sweeteners', true),
('bu4', 'addon', 'Honey', 20, ARRAY[]::text[],
 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&q=80', 'Spreads & Sweeteners', true),
('bu5', 'addon', 'Cinnamon', 15, ARRAY[]::text[],
 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&q=80', 'Spreads & Sweeteners', true),

-- Fresh Fruits
('f1', 'addon', 'Apple', 20, ARRAY['Fresh Fruits'],
 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&q=80', 'Fresh Fruits', true),
('f2', 'addon', 'Banana', 15, ARRAY['Fresh Fruits'],
 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&q=80', 'Fresh Fruits', true),
('f3', 'addon', 'Blueberry', 35, ARRAY['Fresh Fruits'],
 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=300&q=80', 'Fresh Fruits', true),
('f4', 'addon', 'Dragon Fruit', 50, ARRAY['Fresh Fruits'],
 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=300&q=80', 'Fresh Fruits', true),
('f5', 'addon', 'Grapes', 25, ARRAY['Fresh Fruits'],
 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300&q=80', 'Fresh Fruits', true),
('f6', 'addon', 'Mango', 30, ARRAY['Fresh Fruits'],
 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&q=80', 'Fresh Fruits', true),
('f7', 'addon', 'Muskmelon', 25, ARRAY['Fresh Fruits'],
 'https://images.unsplash.com/photo-1571575309168-a4ad8e4e30f4?w=300&q=80', 'Fresh Fruits', true),
('f8', 'addon', 'Mulberries', 40, ARRAY['Fresh Fruits'],
 'https://images.unsplash.com/photo-1559734840-f9509ee5677f?w=300&q=80', 'Fresh Fruits', true),
('f9', 'addon', 'Pomegranate', 35, ARRAY['Fresh Fruits'],
 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&q=80', 'Fresh Fruits', true),
('f10', 'addon', 'Raspberries', 45, ARRAY['Fresh Fruits'],
 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&q=80', 'Fresh Fruits', true),
('f11', 'addon', 'Strawberry', 40, ARRAY['Fresh Fruits'],
 'https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=300&q=80', 'Fresh Fruits', true),

-- Premium Nuts
('n1', 'addon', 'All Mix Nuts', 50, ARRAY['Healthy Fats','High Protein'],
 'https://images.unsplash.com/photo-1571236252609-e6e0e3b25254?w=300&q=80', 'Premium Nuts', true),
('n2', 'addon', 'Almonds', 40, ARRAY['Healthy Fats'],
 'https://images.unsplash.com/photo-1574570173583-e0a7a5e39f5e?w=300&q=80', 'Premium Nuts', true),
('n3', 'addon', 'Black Raisins', 30, ARRAY[]::text[],
 'https://images.unsplash.com/photo-1596591868231-05e808fd3b44?w=300&q=80', 'Premium Nuts', true),
('n4', 'addon', 'Cashews', 45, ARRAY['Healthy Fats'],
 'https://images.unsplash.com/photo-1567892737950-30c366a89102?w=300&q=80', 'Premium Nuts', true),
('n5', 'addon', 'Cranberries', 35, ARRAY[]::text[],
 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=300&q=80', 'Premium Nuts', true),
('n6', 'addon', 'Dates', 30, ARRAY[]::text[],
 'https://images.unsplash.com/photo-1600189020440-5a5ff59a2a39?w=300&q=80', 'Premium Nuts', true),
('n7', 'addon', 'Green Raisin', 30, ARRAY[]::text[],
 'https://images.unsplash.com/photo-1596591868231-05e808fd3b44?w=300&q=80', 'Premium Nuts', true),
('n8', 'addon', 'Hazel Nuts', 50, ARRAY['Healthy Fats'],
 'https://images.unsplash.com/photo-1574570173583-e0a7a5e39f5e?w=300&q=80', 'Premium Nuts', true),
('n9', 'addon', 'Peanuts', 25, ARRAY['High Protein'],
 'https://images.unsplash.com/photo-1567567379834-1e4ea7eecb01?w=300&q=80', 'Premium Nuts', true),
('n10', 'addon', 'Walnuts', 45, ARRAY['Healthy Fats'],
 'https://images.unsplash.com/photo-1611238573218-4efea4f4accd?w=300&q=80', 'Premium Nuts', true),

-- Healthy Seeds
('s1', 'addon', 'Chia Seeds', 25, ARRAY['Fiber Rich'],
 'https://images.unsplash.com/photo-1609246397806-36b3cdb7e71e?w=300&q=80', 'Healthy Seeds', true),
('s2', 'addon', 'Pumpkin Seeds', 30, ARRAY['Healthy Fats'],
 'https://images.unsplash.com/photo-1596593046893-a4c5a0ef8f09?w=300&q=80', 'Healthy Seeds', true),
('s3', 'addon', 'Sunflower Seeds', 25, ARRAY['Healthy Fats'],
 'https://images.unsplash.com/photo-1503027572-46cbe74e49eb?w=300&q=80', 'Healthy Seeds', true),
('s4', 'addon', 'Watermelon Seeds', 20, ARRAY[]::text[],
 'https://images.unsplash.com/photo-1582655008695-a1db8c59b9bb?w=300&q=80', 'Healthy Seeds', true);

-- ============================================================
-- 4. Seed Menu Items - Combos
-- ============================================================

INSERT INTO menu_items (id, type, name, price, tags, image, base_item, addon_items, combo_tag, in_stock) VALUES
('c1', 'combo', 'Peanut Butter Power Oats', 130, ARRAY['High Protein'],
 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&q=80',
 'Peanut Butter Power Oats', ARRAY['Peanut Butter','Honey'], 'High Protein', true),

('c2', 'combo', 'Cocoa Banana Oat Cup', 140, ARRAY['Energy Booster'],
 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
 'Cocoa Banana Oat Cup', ARRAY['Banana','Cocoa Powder'], 'Energy Booster', true),

('c3', 'combo', 'Cinnamon Apple Oat Porridge', 120, ARRAY['Classic'],
 'https://images.unsplash.com/photo-1614961909372-5e11b6a0ae54?w=400&q=80',
 'Cinnamon Apple Oat Porridge', ARRAY['Apple','Cinnamon'], 'Classic', true),

('c4', 'combo', 'Peanut Butter Banana Overnight Oats', 150, ARRAY['Overnight'],
 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80',
 'Peanut Butter Banana Overnight Oats', ARRAY['Peanut Butter','Banana'], 'Overnight', true),

('c5', 'combo', 'Apple Cinnamon Overnight Oats', 135, ARRAY['Overnight'],
 'https://images.unsplash.com/photo-1504308805006-0f7a5f1adea4?w=400&q=80',
 'Apple Cinnamon Overnight Oats', ARRAY['Apple','Cinnamon'], 'Overnight', true),

('c6', 'combo', 'Chocolate Fiber Overnight Oats', 145, ARRAY['Fiber Rich'],
 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=400&q=80',
 'Chocolate Fiber Overnight Oats', ARRAY['Dark Cocoa','Chia Seeds'], 'Fiber Rich', true);
