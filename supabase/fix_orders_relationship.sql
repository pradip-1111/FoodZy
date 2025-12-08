-- Add foreign key from orders.user_id to user_profiles.id to enable joining
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey_profiles;

ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey_profiles
FOREIGN KEY (user_id)
REFERENCES public.user_profiles(id);
