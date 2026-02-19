-- Allow authenticated users to upload files to avatars bucket
CREATE POLICY "Usuarios autenticados podem upload avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Allow public read access to avatars
CREATE POLICY "Avatars sao publicos para leitura"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to update their avatars
CREATE POLICY "Usuarios autenticados podem atualizar avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their avatars
CREATE POLICY "Usuarios autenticados podem deletar avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);