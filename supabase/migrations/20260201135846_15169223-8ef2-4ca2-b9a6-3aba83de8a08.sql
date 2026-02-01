-- Adicionar campos completos na tabela de multas
ALTER TABLE public.multas 
ADD COLUMN IF NOT EXISTS numero_auto TEXT,
ADD COLUMN IF NOT EXISTS hora_infracao TIME,
ADD COLUMN IF NOT EXISTS local_infracao TEXT,
ADD COLUMN IF NOT EXISTS orgao_autuador TEXT,
ADD COLUMN IF NOT EXISTS agente_autuador TEXT,
ADD COLUMN IF NOT EXISTS placa_autuada TEXT,
ADD COLUMN IF NOT EXISTS municipio TEXT,
ADD COLUMN IF NOT EXISTS uf_infracao TEXT,
ADD COLUMN IF NOT EXISTS data_vencimento DATE,
ADD COLUMN IF NOT EXISTS pontos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gravidade TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Atualizar multas de exemplo com dados completos
UPDATE public.multas SET
  numero_auto = 'AI-2024-001234',
  hora_infracao = '14:35:00',
  local_infracao = 'Av. Paulista, 1000 - Bela Vista',
  orgao_autuador = 'DETRAN-SP',
  agente_autuador = 'AG-12345',
  municipio = 'São Paulo',
  uf_infracao = 'SP',
  data_vencimento = '2025-02-15',
  pontos = 7,
  gravidade = 'Gravíssima'
WHERE id = 'aaaa1111-1111-4111-8111-111111111111';

UPDATE public.multas SET
  numero_auto = 'AI-2024-005678',
  hora_infracao = '08:22:00',
  local_infracao = 'Rod. Anhanguera, km 45',
  orgao_autuador = 'PRF',
  agente_autuador = 'PRF-54321',
  municipio = 'Campinas',
  uf_infracao = 'SP',
  data_vencimento = '2025-02-20',
  pontos = 5,
  gravidade = 'Grave'
WHERE id = 'aaaa2222-2222-4222-8222-222222222222';

UPDATE public.multas SET
  numero_auto = 'AI-2025-000111',
  hora_infracao = '19:45:00',
  local_infracao = 'Rua XV de Novembro, 500 - Centro',
  orgao_autuador = 'DETRAN-PR',
  agente_autuador = 'AG-98765',
  municipio = 'Curitiba',
  uf_infracao = 'PR',
  data_vencimento = '2025-03-05',
  pontos = 4,
  gravidade = 'Média'
WHERE id = 'aaaa3333-3333-4333-8333-333333333333';

UPDATE public.multas SET
  numero_auto = 'AI-2025-000222',
  hora_infracao = '07:10:00',
  local_infracao = 'Av. Brasil, 2500 - Penha',
  orgao_autuador = 'DETRAN-RJ',
  agente_autuador = 'AG-11111',
  municipio = 'Rio de Janeiro',
  uf_infracao = 'RJ',
  data_vencimento = '2025-03-10',
  pontos = 7,
  gravidade = 'Gravíssima'
WHERE id = 'bbbb1111-1111-4111-8111-111111111111';

UPDATE public.multas SET
  numero_auto = 'AI-2025-000333',
  hora_infracao = '16:30:00',
  local_infracao = 'BR-116, km 120',
  orgao_autuador = 'PRF',
  agente_autuador = 'PRF-22222',
  municipio = 'Curitiba',
  uf_infracao = 'PR',
  data_vencimento = '2025-03-12',
  pontos = 4,
  gravidade = 'Média'
WHERE id = 'bbbb2222-2222-4222-8222-222222222222';

UPDATE public.multas SET
  numero_auto = 'AI-2024-009999',
  hora_infracao = '11:00:00',
  local_infracao = 'Rua Augusta, 200 - Jardins',
  orgao_autuador = 'CET-SP',
  agente_autuador = 'CET-33333',
  municipio = 'São Paulo',
  uf_infracao = 'SP',
  data_vencimento = '2024-12-20',
  pontos = 3,
  gravidade = 'Leve'
WHERE id = 'cccc1111-1111-4111-8111-111111111111';

UPDATE public.multas SET
  numero_auto = 'AI-2024-008888',
  hora_infracao = '09:15:00',
  local_infracao = 'Av. Sete de Setembro, 1500',
  orgao_autuador = 'DETRAN-PR',
  agente_autuador = 'AG-44444',
  municipio = 'Curitiba',
  uf_infracao = 'PR',
  data_vencimento = '2024-11-15',
  pontos = 5,
  gravidade = 'Grave'
WHERE id = 'cccc2222-2222-4222-8222-222222222222';

UPDATE public.multas SET
  numero_auto = 'AI-2025-000444',
  hora_infracao = '20:45:00',
  local_infracao = 'Rua das Flores, 100 - Centro',
  orgao_autuador = 'DETRAN-MG',
  agente_autuador = 'AG-55555',
  municipio = 'Belo Horizonte',
  uf_infracao = 'MG',
  data_vencimento = '2025-03-20',
  pontos = 7,
  gravidade = 'Gravíssima'
WHERE id = 'dddd1111-1111-4111-8111-111111111111';

UPDATE public.multas SET
  numero_auto = 'AI-2025-000555',
  hora_infracao = '23:30:00',
  local_infracao = 'Av. Getúlio Vargas, 3000',
  orgao_autuador = 'PRF',
  agente_autuador = 'PRF-66666',
  municipio = 'Porto Alegre',
  uf_infracao = 'RS',
  data_vencimento = '2025-03-22',
  pontos = 7,
  gravidade = 'Gravíssima'
WHERE id = 'dddd2222-2222-4222-8222-222222222222';