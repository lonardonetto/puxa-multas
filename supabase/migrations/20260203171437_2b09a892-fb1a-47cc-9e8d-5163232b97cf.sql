-- Atualizar preços de rastreamento diferenciados por plano

-- Plano Gratuito - Preços mais altos
UPDATE planos SET 
  rastreamento_mensal_pf_preco = 25,
  rastreamento_anual_pf_preco = 250,
  rastreamento_mensal_frota_preco = 20,
  rastreamento_anual_frota_preco = 200
WHERE slug = 'gratuito';

-- Plano Intermediário - Preços médios
UPDATE planos SET 
  rastreamento_mensal_pf_preco = 20,
  rastreamento_anual_pf_preco = 200,
  rastreamento_mensal_frota_preco = 15,
  rastreamento_anual_frota_preco = 150
WHERE slug = 'intermediario';

-- Plano Top - Preços com desconto
UPDATE planos SET 
  rastreamento_mensal_pf_preco = 15,
  rastreamento_anual_pf_preco = 150,
  rastreamento_mensal_frota_preco = 10,
  rastreamento_anual_frota_preco = 100
WHERE slug = 'top';