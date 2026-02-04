-- Adicionar campo de preço anual para assinatura do sistema
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS preco_anual NUMERIC DEFAULT 0;

-- Comentário explicativo
COMMENT ON COLUMN public.planos.preco_anual IS 'Preço anual da assinatura do sistema (desconto em relação ao mensal)';

-- Atualizar planos existentes com valor anual padrão (10 meses = 2 meses grátis)
UPDATE public.planos SET preco_anual = preco_mensal * 10 WHERE preco_anual IS NULL OR preco_anual = 0;

-- Forçar reload do schema
NOTIFY pgrst, 'reload schema';