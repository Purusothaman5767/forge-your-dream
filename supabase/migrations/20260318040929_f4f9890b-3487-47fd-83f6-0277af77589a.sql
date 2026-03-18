
CREATE TABLE public.product_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  brand_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, brand_name)
);

ALTER TABLE public.product_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands are publicly readable" ON public.product_brands FOR SELECT USING (true);
CREATE POLICY "Admins can manage brands" ON public.product_brands FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update brands" ON public.product_brands FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete brands" ON public.product_brands FOR DELETE USING (has_role(auth.uid(), 'admin'));
