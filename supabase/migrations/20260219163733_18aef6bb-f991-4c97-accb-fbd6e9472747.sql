-- Allow authenticated users to upload any file to the 'documentos' bucket
CREATE POLICY "Usuarios autenticados podem fazer upload de documentos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documentos'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to read any file from the 'documentos' bucket
CREATE POLICY "Usuarios autenticados podem ler documentos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documentos'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploaded documents
CREATE POLICY "Usuarios autenticados podem deletar documentos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documentos'
  AND auth.role() = 'authenticated'
);