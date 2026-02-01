-- FIX MISSING COLUMNS IN NEW TABLES
-- Project: acyqrpkdsxddkqfaakty (Receiver)

-- editais
ALTER TABLE public.editais ADD COLUMN IF NOT EXISTS comprado_por UUID REFERENCES public.users(id);
ALTER TABLE public.editais ADD COLUMN IF NOT EXISTS arquivos JSONB DEFAULT '[]';

-- faturamento
ALTER TABLE public.faturamento ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.faturamento ADD COLUMN IF NOT EXISTS is_bonus BOOLEAN DEFAULT false;
ALTER TABLE public.faturamento ADD COLUMN IF NOT EXISTS data_expiracao TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.faturamento ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT; -- Enum mismatch workaround if needed, or cast

-- Force a PostgREST cache reload
NOTIFY pgrst, 'reload schema';
