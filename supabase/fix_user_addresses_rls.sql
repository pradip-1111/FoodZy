-- Drop existing policies and recreate them to fix RLS issues
-- This ensures policies work correctly with the current auth setup

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.user_addresses;

-- Recreate policies with proper auth checks
CREATE POLICY "Users can view own addresses"
ON public.user_addresses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
ON public.user_addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
ON public.user_addresses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
ON public.user_addresses
FOR DELETE
USING (auth.uid() = user_id);

-- Verify the table has latitude and longitude columns
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_addresses' 
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE public.user_addresses ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_addresses' 
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE public.user_addresses ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_addresses_coordinates 
ON public.user_addresses(latitude, longitude);
