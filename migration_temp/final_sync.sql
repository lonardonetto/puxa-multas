-- FINAL COMPREHENSIVE ALIGNMENT
-- Adding columns that might have been missed or have specific names in the donor

-- organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS acesso_disparador BOOLEAN DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS acesso_crm BOOLEAN DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS acesso_institucional BOOLEAN DEFAULT false;

-- planos
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS acesso_institucional BOOLEAN DEFAULT false;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS acesso_crm BOOLEAN DEFAULT false;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS acesso_disparador BOOLEAN DEFAULT false;

-- servicos
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS campos_dinamicos JSONB DEFAULT '[]';
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- veiculos
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- contratos
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS alerta_ativo BOOLEAN DEFAULT false;

-- Force Cache Reload
NOTIFY pgrst, 'reload schema';
