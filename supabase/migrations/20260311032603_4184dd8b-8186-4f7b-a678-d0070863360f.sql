-- Make builds publicly readable for shared build links
DROP POLICY IF EXISTS "Users can view own builds" ON public.builds;
CREATE POLICY "Anyone can view builds" ON public.builds FOR SELECT TO public USING (true);

-- Create storage bucket for custom product uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('custom-uploads', 'custom-uploads', true);

-- Allow authenticated users to upload to custom-uploads
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'custom-uploads');

-- Allow public reads from custom-uploads
CREATE POLICY "Public read access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'custom-uploads');

-- Allow users to delete own uploads
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'custom-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);