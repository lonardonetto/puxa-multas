-- FINAL EXHAUSTIVE ALIGNMENT AND PERMISSIONS
-- Project: acyqrpkdsxddkqfaakty (Receiver)

-- 1. Restore Permissions (Post-Clean Slate)
GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, authenticator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, authenticator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, authenticator;

-- 2. Final Missing Column Alignment
-- organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cor_primaria TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cor_secundaria TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cabecalho_logo_url TEXT;

-- planos
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS limite_usuarios INTEGER DEFAULT 1;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS descricao TEXT;

-- servicos
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS contrato_modelo TEXT;
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS descricao TEXT;

-- clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS crm_origem TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS crm_status TEXT DEFAULT 'novo';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- veiculos
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- contratos
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS auto_infracao TEXT;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS data_vencimento DATE;

-- historico_atividades
ALTER TABLE public.historico_atividades ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 3. Bypass Permissions for Service Role REST API
ALTER TABLE public.users OWNER TO postgres;
ALTER TABLE public.organizations OWNER TO postgres;
ALTER TABLE public.clientes OWNER TO postgres;
ALTER TABLE public.veiculos OWNER TO postgres;
ALTER TABLE public.planos OWNER TO postgres;
ALTER TABLE public.servicos OWNER TO postgres;
ALTER TABLE public.contratos OWNER TO postgres;
ALTER TABLE public.historico_atividades OWNER TO postgres;
ALTER TABLE public.user_organizations OWNER TO postgres;

-- Force cache reload
NOTIFY pgrst, 'reload schema';
