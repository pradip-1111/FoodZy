-- Temporarily disable RLS on user_profiles to test profile updates
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Check if user_profiles table exists and has data
SELECT * FROM public.user_profiles LIMIT 5;
