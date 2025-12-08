-- Enable RLS on order_status_history (ensure it is enabled)
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all order status history
DROP POLICY IF EXISTS "Admins can view all order status history" ON public.order_status_history;
CREATE POLICY "Admins can view all order status history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- Policy: Users can view history for their own orders
DROP POLICY IF EXISTS "Users can view own order status history" ON public.order_status_history;
CREATE POLICY "Users can view own order status history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Policy: Admins can insert order status history (needed for status updates)
DROP POLICY IF EXISTS "Admins can insert order status history" ON public.order_status_history;
CREATE POLICY "Admins can insert order status history" ON public.order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- Policy: Users can insert own order status history (needed if they cancel orders)
DROP POLICY IF EXISTS "Users can insert own order status history" ON public.order_status_history;
CREATE POLICY "Users can insert own order status history" ON public.order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_status_history.order_id
      AND orders.user_id = auth.uid()
    )
  );
