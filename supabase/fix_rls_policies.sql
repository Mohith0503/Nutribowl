-- ============================================================
-- FIX: RLS Policies for Nutribowl
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- ── menu_items ──────────────────────────────────────────────
-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Public read menu_items"   ON menu_items;
DROP POLICY IF EXISTS "Admin manage menu_items"  ON menu_items;
DROP POLICY IF EXISTS "Anon all menu_items"      ON menu_items;

-- Allow ANYONE (anon + authenticated) to SELECT
CREATE POLICY "Public read menu_items"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow ANYONE (anon + authenticated) to INSERT/UPDATE/DELETE (admin uses anon key)
CREATE POLICY "Admin write menu_items"
  ON menu_items FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ── orders ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public insert orders"  ON orders;
DROP POLICY IF EXISTS "Anon read orders"      ON orders;
DROP POLICY IF EXISTS "Anon update orders"    ON orders;

CREATE POLICY "Public insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon read orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anon update orders"
  ON orders FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ── subscribers ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Anon all subscribers" ON subscribers;

CREATE POLICY "Anon all subscribers"
  ON subscribers FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
