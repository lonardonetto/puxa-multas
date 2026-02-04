-- Adicionar campo de preço para Placa Protegida nos planos
-- Placa Protegida = rastreamento anual com recursos IA ilimitados

ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS rastreamento_placa_protegida_pf_preco NUMERIC DEFAULT 300,
ADD COLUMN IF NOT EXISTS rastreamento_placa_protegida_frota_preco NUMERIC DEFAULT 250;

-- Atualizar planos existentes com preços sugeridos (2x o preço anual como valor premium)
UPDATE public.planos 
SET 
  rastreamento_placa_protegida_pf_preco = COALESCE(rastreamento_anual_pf_preco * 2, 300),
  rastreamento_placa_protegida_frota_preco = COALESCE(rastreamento_anual_frota_preco * 2, 250)
WHERE rastreamento_placa_protegida_pf_preco IS NULL 
   OR rastreamento_placa_protegida_pf_preco = 300;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.planos.rastreamento_placa_protegida_pf_preco IS 'Preço anual Placa Protegida PF - inclui recursos IA ilimitados';
COMMENT ON COLUMN public.planos.rastreamento_placa_protegida_frota_preco IS 'Preço anual Placa Protegida Frota - inclui recursos IA ilimitados';

-- Refresh schema
NOTIFY pgrst, 'reload schema';