-- FIX FINAL SCHEMA ISSUES
-- Project: acyqrpkdsxddkqfaakty (Receiver)

-- editais_backup
ALTER TABLE public.editais_backup ADD COLUMN IF NOT EXISTS descricao TEXT;

-- faturamento
ALTER TABLE public.faturamento ALTER COLUMN data_vencimento DROP NOT NULL;

-- Force a PostgREST cache reload
NOTIFY pgrst, 'reload schema';
