-- Add protein_g column to food_items if not exists
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS protein_g numeric DEFAULT 0;

-- Confirm
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'food_items' AND column_name IN ('calories', 'protein_g');
