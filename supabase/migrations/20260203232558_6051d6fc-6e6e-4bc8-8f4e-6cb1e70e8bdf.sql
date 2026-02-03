-- Criar políticas de storage para o bucket 'documentos' permitir upload de recursos

-- Política para permitir usuários autenticados fazer upload de arquivos de recursos
CREATE POLICY "Usuarios podem fazer upload de recursos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos' AND
  (storage.foldername(name))[1] = 'recursos'
);

-- Política para permitir leitura pública dos PDFs de recursos
CREATE POLICY "PDFs de recursos são públicos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'documentos' AND
  (storage.foldername(name))[1] = 'recursos'
);

-- Política para permitir usuários autenticados atualizar seus arquivos
CREATE POLICY "Usuarios podem atualizar recursos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos' AND
  (storage.foldername(name))[1] = 'recursos'
);

-- Política para permitir usuários autenticados deletar seus arquivos
CREATE POLICY "Usuarios podem deletar recursos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos' AND
  (storage.foldername(name))[1] = 'recursos'
);