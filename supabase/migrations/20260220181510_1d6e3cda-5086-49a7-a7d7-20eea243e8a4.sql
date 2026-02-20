
-- Inserir o registro de assinatura do plano Elite da Atualiza Brasil que ficou faltando
INSERT INTO faturamento (
  organization_id,
  descricao,
  valor,
  status,
  tipo,
  metodo_pagamento,
  data_pagamento
)
VALUES (
  '8d5c8336-f5dc-4803-8e9f-c6ac6f3c09d0',
  'Plano LANÇAMENTO ELITE (mensal) via InfinitePay — order_nsu: PLNMLV769M8',
  349,
  'paid',
  'subscription',
  'credit_card',
  '2026-02-20'
);
