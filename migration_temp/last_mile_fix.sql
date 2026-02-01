-- FINAL PERMISSIONS AND COLUMN FIX
-- Project: acyqrpkdsxddkqfaakty (Receiver)

-- 1. Restore Permissions (Crucial after DROP SCHEMA CASCADE)
GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, authenticator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, authenticator;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, authenticator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, authenticator;

-- 2. Exhaustive Column Fix (based on latest 400 errors)
-- organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cnpj_contrato TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cabecalho_texto TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- planos
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS acesso_institucional BOOLEAN DEFAULT false;

-- servicos
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS contrato_modelo TEXT;
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS crm_infracao BOOLEAN DEFAULT false; 

-- contratos
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS assinatura_data TIMESTAMP WITH TIME ZONE;

-- historico_atividades
ALTER TABLE public.historico_atividades ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Force Cache Reload
NOTIFY pgrst, 'reload schema';
