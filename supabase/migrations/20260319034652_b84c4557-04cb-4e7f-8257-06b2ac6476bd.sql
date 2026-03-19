ALTER TABLE public.builds ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS brand text;