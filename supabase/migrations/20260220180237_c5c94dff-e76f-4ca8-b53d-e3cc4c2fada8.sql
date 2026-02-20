
-- Inserir registro faltante no extrato da Atualiza Brasil (recarga R$2 aprovada via InfinitePay)
INSERT INTO faturamento (organization_id, descricao, valor, status, tipo, metodo_pagamento, data_pagamento)
VALUES (
  '8d5c8336-f5dc-4803-8e9f-c6ac6f3c09d0',
  'Recarga InfinitePay aprovada — pix',
  2,
  'paid',
  'credit_purchase',
  'credit_card',
  '2026-02-20'
);
