-- Ensure admin_users has RLS enabled
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow admins to view their own admin status
CREATE POLICY "Admins can view own admin status" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid() = id);

-- Allow admins to view other admins (optional, but good for management)
CREATE POLICY "Admins can view all admins" 
ON public.admin_users 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);
