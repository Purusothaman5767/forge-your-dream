
ALTER TABLE public.products ADD COLUMN customization_type text NOT NULL DEFAULT 'full';

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name text NOT NULL,
  description text,
  price_modifier numeric NOT NULL DEFAULT 0,
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Variants are publicly readable" ON public.product_variants FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert variants" ON public.product_variants FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update variants" ON public.product_variants FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete variants" ON public.product_variants FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.product_fixed_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  option_type text NOT NULL,
  option_value text NOT NULL,
  price_modifier numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_fixed_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fixed options are publicly readable" ON public.product_fixed_options FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert fixed options" ON public.product_fixed_options FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update fixed options" ON public.product_fixed_options FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete fixed options" ON public.product_fixed_options FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));
