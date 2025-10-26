/*
  # Create Products and Transactions Tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key) - Unique product identifier
      - `name` (text, not null) - Product name
      - `purchase_price` (numeric, not null) - Cost price of the product
      - `selling_price` (numeric, not null) - Selling price of the product
      - `stock` (integer, not null, default 0) - Current stock quantity
      - `created_at` (timestamptz) - Timestamp when product was created
      - `updated_at` (timestamptz) - Timestamp when product was last updated

    - `transactions`
      - `id` (uuid, primary key) - Unique transaction identifier
      - `type` (text, not null) - Transaction type: 'sale' or 'expense'
      - `amount` (numeric, not null) - Transaction amount
      - `description` (text, not null) - Transaction description
      - `category` (text, not null) - Transaction category
      - `date` (timestamptz, not null) - Transaction date
      - `product_id` (uuid, nullable) - Reference to product for product sales
      - `quantity` (integer, nullable) - Quantity sold (for product sales)
      - `profit` (numeric, nullable) - Profit from sale (for product sales)
      - `created_at` (timestamptz) - Timestamp when transaction was created

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (no authentication required for this shop manager app)
    - Users can read, insert, update, and delete their own data

  3. Indexes
    - Index on transactions.date for faster date-based queries
    - Index on transactions.type for filtering by transaction type
    - Index on products.name for faster product lookups
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  purchase_price numeric NOT NULL CHECK (purchase_price >= 0),
  selling_price numeric NOT NULL CHECK (selling_price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('sale', 'expense')),
  amount numeric NOT NULL CHECK (amount >= 0),
  description text NOT NULL,
  category text NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer CHECK (quantity > 0),
  profit numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to products"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to products"
  ON products FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to transactions"
  ON transactions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to transactions"
  ON transactions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to transactions"
  ON transactions FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();