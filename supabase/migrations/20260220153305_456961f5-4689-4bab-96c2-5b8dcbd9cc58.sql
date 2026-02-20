-- Adicionar campo plano_expiracao_em na organizations para controlar o ciclo de vida do plano
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS plano_expiracao_em timestamp with time zone;

-- Adicionar campo para armazenar o ciclo atual do plano
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS plano_ciclo text DEFAULT 'mensal';

-- Índice para a edge function de verificação diária
CREATE INDEX IF NOT EXISTS idx_organizations_plano_expiracao 
ON public.organizations(plano_expiracao_em) 
WHERE plano IS NOT NULL AND plano != 'gratuito';