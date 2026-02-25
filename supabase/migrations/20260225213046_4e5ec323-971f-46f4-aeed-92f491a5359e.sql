
-- Fix Storage RLS for editais bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to editais"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'editais');

-- Allow authenticated users to read files
CREATE POLICY "Authenticated users can read editais files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'editais');

-- Allow authenticated users to update their files
CREATE POLICY "Authenticated users can update editais files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'editais');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete editais files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'editais');
