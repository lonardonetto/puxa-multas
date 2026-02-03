-- Adicionar coluna para URL do PDF gerado
ALTER TABLE recursos ADD COLUMN IF NOT EXISTS pdf_url text;

-- Adicionar coluna para marcar recurso como finalizado (não editável)
ALTER TABLE recursos ADD COLUMN IF NOT EXISTS finalizado boolean DEFAULT false;