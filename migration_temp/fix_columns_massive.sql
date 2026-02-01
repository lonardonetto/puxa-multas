-- COMPREHENSIVE SCHEMA FIX FOR RECEIVER
-- Project: acyqrpkdsxddkqfaakty (Receiver)

-- organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS acesso_disparador BOOLEAN DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS acesso_crm BOOLEAN DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS api_key TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS webhooks JSONB DEFAULT '[]';

-- users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- planos
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS acesso_disparador BOOLEAN DEFAULT false;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS acesso_crm BOOLEAN DEFAULT false;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS limite_mensagens INTEGER;

-- servicos
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS campos_dinamicos JSONB DEFAULT '[]';
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS organizacao_id UUID;

-- clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS nome_fantasia TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS estado_civil TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS profissao TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS rg TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS data_nascimento DATE;

-- veiculos
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS rastreamento_ativo BOOLEAN DEFAULT false;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS rastreamento_valor NUMERIC DEFAULT 15.00;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS rastreamento_inicio TIMESTAMP WITH TIME ZONE;

-- contratos
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS alerta_ativo BOOLEAN DEFAULT false;

-- Force PostgREST cache reload
NOTIFY pgrst, 'reload schema';
