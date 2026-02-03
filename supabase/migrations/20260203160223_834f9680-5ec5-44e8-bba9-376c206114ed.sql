-- Adicionar campos de controle de rastreamento na tabela veículos
-- rastreamento_tipo: 'mensal' ou 'anual'
-- rastreamento_vencimento: data de vencimento do rastreamento

ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS rastreamento_tipo TEXT DEFAULT NULL CHECK (rastreamento_tipo IN ('mensal', 'anual'));
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS rastreamento_vencimento TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS rastreamento_notificado BOOLEAN DEFAULT FALSE;

-- Adicionar preços de rastreamento mensal e anual na tabela planos
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS rastreamento_mensal_pf_preco NUMERIC DEFAULT 15;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS rastreamento_anual_pf_preco NUMERIC DEFAULT 150;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS rastreamento_mensal_frota_preco NUMERIC DEFAULT 10;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS rastreamento_anual_frota_preco NUMERIC DEFAULT 100;

-- Criar índice para buscas de vencimento
CREATE INDEX IF NOT EXISTS idx_veiculos_rastreamento_vencimento 
ON public.veiculos(rastreamento_vencimento) 
WHERE rastreamento_ativo = true;

-- Comentário explicativo
COMMENT ON COLUMN public.veiculos.rastreamento_tipo IS 'Tipo de plano de rastreamento: mensal ou anual';
COMMENT ON COLUMN public.veiculos.rastreamento_vencimento IS 'Data de vencimento do rastreamento ativo';
COMMENT ON COLUMN public.veiculos.rastreamento_notificado IS 'Se já foi notificado sobre vencimento próximo';