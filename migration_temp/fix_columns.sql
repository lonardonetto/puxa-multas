-- Adding missing columns to receiver to fix PostgREST cache issue and alignment
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS acesso_crm BOOLEAN DEFAULT false;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS acesso_crm BOOLEAN DEFAULT false;
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS nome_fantasia TEXT;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS rastreamento_ativo BOOLEAN DEFAULT false;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS rastreamento_valor NUMERIC DEFAULT 15.00;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS alerta_ativo BOOLEAN DEFAULT false;

-- Force a PostgREST cache reload by touching a dummy object or just re-running a DDL
NOTIFY pgrst, 'reload schema';
