-- Inserir planos do sistema
INSERT INTO planos (id, nome, slug, descricao, preco_mensal, preco, limite_usuarios, limite_clientes, recursos, ativo, preco_recurso_ia, preco_rastreamento, preco_edital, recursos_ia_inclusos, acesso_crm, acesso_disparador, modulo_educacional, recursos_ia_suspensao_inclusos, recursos_ia_suspensao_preco_adicional, suporte, acesso_institucional, rastreamento_pf_preco, rastreamento_frota_preco, rastreamento_garantido_preco)
VALUES 
-- Plano Gratuito
('955b013c-ac6d-4476-90c7-b95478d6b90e', 'Gratuito', 'gratuito', 'Plano gratuito para começar. Ideal para quem quer testar o sistema.', 0.0, 0.0, 1, 50, '["Cadastro de até 100 clientes", "Geração de Recursos (R$ 150/un)", "Rastreamento de Multas (R$ 50/un)", "Editais (R$ 1,50/contato)"]'::jsonb, true, 150.0, 50.0, 1.5, 0, false, false, 'Nenhum', 0, 300, 'Padrão', false, 50, 50, 65),

-- Plano Intermediário
('c618503f-bb82-4413-b2ab-ccb43399d956', 'Intermediário', 'intermediario', 'Para profissionais que querem crescer. Até 100 clientes e preços reduzidos.', 399.0, 399.0, 2, 100, '["Clientes ilimitados", "Geração de Recursos (R$ 50/un)", "Rastreamento de Multas (R$ 40/un)", "Editais (R$ 1,20/contato)"]'::jsonb, true, 50.0, 40.0, 1.2, 0, false, false, 'Parcial', 0, 100, 'Prioritário', false, 40, 35, 55),

-- Plano Top
('bbe33943-01df-41f9-a9f8-a9c57871bbd9', 'Top', 'top', 'A solução completa para escritórios de advocacia. Inclui CRM + Disparador.', 999.0, 999.0, 3, null, '["Clientes ilimitados", "30 Recursos IA grátis/mês (excedente R$ 20)", "Rastreamento de Multas (R$ 25/un)", "Editais (R$ 0,80/contato)", "Acesso ao CRM + IA", "Acesso ao Disparador"]'::jsonb, true, 40.0, 25.0, 0.8, 0, true, true, 'Completo', 0, 40, 'VIP', true, 25, 20, 40)

ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  slug = EXCLUDED.slug,
  descricao = EXCLUDED.descricao,
  preco_mensal = EXCLUDED.preco_mensal,
  preco = EXCLUDED.preco,
  limite_usuarios = EXCLUDED.limite_usuarios,
  limite_clientes = EXCLUDED.limite_clientes,
  recursos = EXCLUDED.recursos,
  ativo = EXCLUDED.ativo,
  preco_recurso_ia = EXCLUDED.preco_recurso_ia,
  preco_rastreamento = EXCLUDED.preco_rastreamento,
  preco_edital = EXCLUDED.preco_edital,
  recursos_ia_inclusos = EXCLUDED.recursos_ia_inclusos,
  acesso_crm = EXCLUDED.acesso_crm,
  acesso_disparador = EXCLUDED.acesso_disparador,
  modulo_educacional = EXCLUDED.modulo_educacional,
  recursos_ia_suspensao_inclusos = EXCLUDED.recursos_ia_suspensao_inclusos,
  recursos_ia_suspensao_preco_adicional = EXCLUDED.recursos_ia_suspensao_preco_adicional,
  suporte = EXCLUDED.suporte,
  acesso_institucional = EXCLUDED.acesso_institucional,
  rastreamento_pf_preco = EXCLUDED.rastreamento_pf_preco,
  rastreamento_frota_preco = EXCLUDED.rastreamento_frota_preco,
  rastreamento_garantido_preco = EXCLUDED.rastreamento_garantido_preco,
  updated_at = now();