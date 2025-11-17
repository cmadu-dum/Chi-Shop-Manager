/*
  # Add Barcode Field to Products

  1. Changes
    - Add `barcode` column to `products` table
      - Optional text field for storing product barcodes
      - Unique constraint to prevent duplicate barcodes
      - Indexed for fast lookups during scanning

  2. Notes
    - Barcode is optional to maintain backward compatibility
    - Unique constraint ensures no two products share the same barcode
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE products ADD COLUMN barcode text UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
  END IF;
END $$;