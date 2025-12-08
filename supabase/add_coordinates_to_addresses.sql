-- Add latitude and longitude columns to user_addresses table
-- This allows storing precise location coordinates from map selection

ALTER TABLE public.user_addresses 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create index for geospatial queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_user_addresses_coordinates 
ON public.user_addresses(latitude, longitude);

-- Add comment to explain the columns
COMMENT ON COLUMN public.user_addresses.latitude IS 'Latitude coordinate from map selection';
COMMENT ON COLUMN public.user_addresses.longitude IS 'Longitude coordinate from map selection';
