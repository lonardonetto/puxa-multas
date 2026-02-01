-- FINAL SPECIFIC COLUMN ALIGNMENT
-- Adding all remaining missing columns identified in previous failures

-- organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cabecalho_texto TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS email_contato TEXT;

-- planos
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- servicos
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS contrato_modelo TEXT;
ALTER TABLE public.servicos ADD COLUMN IF NOT EXISTS icone TEXT;

-- clientes
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Force Cache Reload
NOTIFY pgrst, 'reload schema';
