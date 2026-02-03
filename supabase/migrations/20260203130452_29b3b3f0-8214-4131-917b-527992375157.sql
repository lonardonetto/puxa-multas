-- Adicionar campos para armazenar arquivos na base de conhecimento
ALTER TABLE public.recursos_conhecimento
ADD COLUMN IF NOT EXISTS arquivo_ait_url TEXT,
ADD COLUMN IF NOT EXISTS arquivo_deferimento_url TEXT,
ADD COLUMN IF NOT EXISTS dados_extraidos_ia JSONB;

-- Criar bucket para arquivos da base de conhecimento
INSERT INTO storage.buckets (id, name, public)
VALUES ('conhecimento-ia', 'conhecimento-ia', true)
ON CONFLICT (id) DO NOTHING;

-- Policy para permitir upload autenticado
CREATE POLICY "Authenticated users can upload conhecimento-ia files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'conhecimento-ia');

-- Policy para leitura pública
CREATE POLICY "Public can read conhecimento-ia files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'conhecimento-ia');

-- Policy para delete por usuários autenticados
CREATE POLICY "Authenticated users can delete conhecimento-ia files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'conhecimento-ia');