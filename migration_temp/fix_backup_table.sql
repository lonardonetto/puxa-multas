-- FIX editais_backup MISSING COLUMNS
-- Project: acyqrpkdsxddkqfaakty (Receiver)

ALTER TABLE public.editais_backup ADD COLUMN IF NOT EXISTS quantidade_nomes INTEGER DEFAULT 0;
ALTER TABLE public.editais_backup ADD COLUMN IF NOT EXISTS nomes_vendidos INTEGER DEFAULT 0;
ALTER TABLE public.editais_backup ADD COLUMN IF NOT EXISTS preco_por_nome NUMERIC DEFAULT 0.0;

-- Force a PostgREST cache reload
NOTIFY pgrst, 'reload schema';
