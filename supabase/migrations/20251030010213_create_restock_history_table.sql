/*
  # Create Restock History Table for Price Tracking and Forecasting

  ## Overview
  This migration creates a comprehensive restock history tracking system to support:
  - Price trend analysis and forecasting
  - Weighted average cost calculation
  - Profit margin tracking over time
  - Historical purchase and selling price data
  - Data science applications (time series analysis, demand forecasting, etc.)

  ## Changes

  1. New Tables
    - `restock_history`
      - `id` (uuid, primary key) - Unique identifier for each restock event
      - `product_id` (uuid, foreign key) - References the product being restocked
      - `quantity_added` (integer) - Amount of stock added in this restock
      - `purchase_price` (decimal) - Purchase price per unit at time of restock
      - `selling_price` (decimal) - Selling price per unit at time of restock
      - `previous_stock` (integer) - Stock level before this restock
      - `new_stock` (integer) - Stock level after this restock
      - `previous_avg_cost` (decimal) - Weighted average cost before restock
      - `new_avg_cost` (decimal) - Weighted average cost after restock
      - `supplier` (text, optional) - Supplier name or identifier
      - `notes` (text, optional) - Additional notes about the restock
      - `user_id` (uuid, foreign key) - User who performed the restock
      - `created_at` (timestamptz) - Timestamp of the restock event

  2. Table Modifications
    - Add `weighted_avg_cost` column to `products` table
    - Add `last_restock_date` column to `products` table
    - Add `restock_count` column to `products` table

  3. Security
    - Enable RLS on `restock_history` table
    - Users can only view their own restock history
    - Users can only insert their own restock records
    - No updates or deletes allowed to maintain data integrity

  ## Notes
  - The restock history provides complete audit trail for all price changes
  - Weighted average cost is calculated and stored for each restock event
  - This data supports time series analysis, forecasting, and ML applications
  - Historical data is immutable (no updates/deletes) to ensure data integrity
*/

-- Add new columns to products table for weighted average tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'weighted_avg_cost'
  ) THEN
    ALTER TABLE products ADD COLUMN weighted_avg_cost decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'last_restock_date'
  ) THEN
    ALTER TABLE products ADD COLUMN last_restock_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'restock_count'
  ) THEN
    ALTER TABLE products ADD COLUMN restock_count integer DEFAULT 0;
  END IF;
END $$;

-- Initialize weighted_avg_cost with current purchase_price for existing products
UPDATE products 
SET weighted_avg_cost = purchase_price 
WHERE weighted_avg_cost = 0 AND purchase_price > 0;

-- Create restock_history table
CREATE TABLE IF NOT EXISTS restock_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_added integer NOT NULL CHECK (quantity_added > 0),
  purchase_price decimal(10,2) NOT NULL CHECK (purchase_price >= 0),
  selling_price decimal(10,2) NOT NULL CHECK (selling_price >= 0),
  previous_stock integer NOT NULL DEFAULT 0,
  new_stock integer NOT NULL,
  previous_avg_cost decimal(10,2) NOT NULL DEFAULT 0,
  new_avg_cost decimal(10,2) NOT NULL,
  supplier text,
  notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_restock_history_product_id ON restock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_restock_history_user_id ON restock_history(user_id);
CREATE INDEX IF NOT EXISTS idx_restock_history_created_at ON restock_history(created_at);

-- Enable RLS
ALTER TABLE restock_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restock_history
CREATE POLICY "Users can view own restock history"
  ON restock_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own restock records"
  ON restock_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No update or delete policies - restock history is immutable for data integrity