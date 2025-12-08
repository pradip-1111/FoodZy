-- Fix Infinite Recursion in admin_users policy

-- 1. Drop the recursive policy
DROP POLICY IF EXISTS "Admins can view all admins" ON public.admin_users;

-- 2. Ensure the safe "view own" policy exists
-- (Dropping first to ensure we don't have duplicates or conflicts)
DROP POLICY IF EXISTS "Admins can view own admin status" ON public.admin_users;

CREATE POLICY "Admins can view own admin status" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() = id);

-- 3. Optional: Create a secure function to check admin status without recursion
-- This is useful if you need policies that check admin status
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;
-- SECURITY DEFINER means this function runs with the privileges of the creator (superuser),
-- bypassing RLS on the admin_users table, thus avoiding recursion.
