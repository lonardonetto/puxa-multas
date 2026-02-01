-- FINAL EXHAUSTIVE COLUMN ALIGNMENT
-- Project: acyqrpkdsxddkqfaakty (Receiver)

-- 1. Restore Permissions and Ownership (Fundamental for REST API)
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, authenticator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, authenticator;

-- 2. Organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS acesso_crm BOOLEAN DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS acesso_disparador BOOLEAN DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS acesso_institucional BOOLEAN DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cabecalho_texto TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS email_contato TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cabecalho_logo_url TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cor_primaria TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cor_secundaria TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS api_key TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS webhooks JSONB DEFAULT '[]';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cnpj_contrato TEXT;

-- 3. Users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 4. Planos
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS acesso_institucional BOOLEAN DEFAULT false;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS acesso_crm BOOLEAN DEFAULT false;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS acesso_disparador BOOLEAN DEFAULT false;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS limite_usuarios INTEGER DEFAULT 1;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS marketing_digital BOOLEAN DEFAULT false;

-- 5. Servicos
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS contrato_modelo TEXT;
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS icone TEXT;
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS campos_dinamicos JSONB DEFAULT '[]';
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- 6. Clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS crm_infracao BOOLEAN DEFAULT false;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS crm_origem TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS crm_status TEXT DEFAULT 'novo';
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS celular TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS tipo_pessoa TEXT DEFAULT 'fisica';

-- 7. Veiculos
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS rastreamento_ativo BOOLEAN DEFAULT false;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS rastreamento_inicio TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS rastreamento_valor NUMERIC DEFAULT 15.00;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 8. Contratos
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS alerta_ativo BOOLEAN DEFAULT false;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS assinatura_data TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS auto_infracao TEXT;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS data_vencimento DATE;

-- 9. Historique / Documentos
ALTER TABLE public.historico_atividades ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.historico_atividades ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Ensure correct Ownership for API access
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO postgres';
        EXECUTE 'GRANT ALL ON TABLE public.' || quote_ident(r.tablename) || ' TO anon, authenticated, service_role';
    END LOOP;
END $$;

-- Force Cache Reload
NOTIFY pgrst, 'reload schema';
