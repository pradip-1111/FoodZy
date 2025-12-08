-- Temporarily disable RLS to test if the issue is with auth or with the table structure
-- IMPORTANT: This is just for testing - we'll re-enable it after

ALTER TABLE public.user_addresses DISABLE ROW LEVEL SECURITY;

-- Check if the table structure is correct
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_addresses' 
ORDER BY ordinal_position;
