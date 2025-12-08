-- Create a new storage bucket for banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to view banner images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'banners' );

-- Policy to allow authenticated users (admins) to upload banner images
CREATE POLICY "Authenticated users can upload banners" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'banners' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users (admins) to update banner images
CREATE POLICY "Authenticated users can update banners" 
ON storage.objects FOR UPDATE
USING ( 
  bucket_id = 'banners' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users (admins) to delete banner images
CREATE POLICY "Authenticated users can delete banners" 
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'banners' 
  AND auth.role() = 'authenticated'
);
