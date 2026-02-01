-- Inserir clientes de exemplo
INSERT INTO public.clientes (id, organization_id, nome_completo, cpf, celular, email, tipo_pessoa, ativo)
VALUES 
  ('a1b2c3d4-e5f6-4890-abcd-ef1234567890', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'João Silva Santos', '123.456.789-00', '11999998888', 'joao.silva@email.com', 'fisica', true),
  ('b2c3d4e5-f6a7-4901-bcde-f12345678901', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'Maria Oliveira Costa', '987.654.321-00', '11988887777', 'maria.oliveira@email.com', 'fisica', true),
  ('c3d4e5f6-a7b8-4012-cdef-123456789012', '379823ca-c287-4f1b-83cb-ed76a31b7d5e', 'Transportadora Express LTDA', '12.345.678/0001-90', '11977776666', 'contato@express.com', 'juridica', true)
ON CONFLICT (id) DO NOTHING;

-- Inserir veículos de exemplo
INSERT INTO public.veiculos (id, cliente_id, placa, modelo, ano, renavam, ativo, rastreamento_ativo)
VALUES 
  ('11111111-1111-4111-8111-111111111111', 'a1b2c3d4-e5f6-4890-abcd-ef1234567890', 'ABC1D23', 'Honda Civic EXL 2.0', '2023', '12345678901', true, true),
  ('22222222-2222-4222-8222-222222222222', 'a1b2c3d4-e5f6-4890-abcd-ef1234567890', 'XYZ9H87', 'Toyota Corolla GLi', '2022', '23456789012', true, true),
  ('33333333-3333-4333-8333-333333333333', 'b2c3d4e5-f6a7-4901-bcde-f12345678901', 'QWE4R56', 'Volkswagen Polo TSI', '2024', '34567890123', true, true),
  ('44444444-4444-4444-8444-444444444444', 'c3d4e5f6-a7b8-4012-cdef-123456789012', 'FRT7G89', 'Fiat Strada Freedom', '2023', '45678901234', true, true),
  ('55555555-5555-4555-8555-555555555555', 'c3d4e5f6-a7b8-4012-cdef-123456789012', 'PLK2M34', 'Iveco Daily 35S14', '2022', '56789012345', true, true)
ON CONFLICT (id) DO NOTHING;

-- Inserir multas de exemplo com diferentes status
INSERT INTO public.multas (id, veiculo_id, codigo_infracao, descricao, status, valor, data_multa)
VALUES 
  -- Multas suspensivas
  ('aaaa1111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '74550', 'Dirigir veículo utilizando-se de telefone celular', 'suspensiva', 293.47, '2024-12-15'),
  ('aaaa2222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', '74630', 'Deixar o condutor de usar cinto de segurança', 'suspensiva', 195.23, '2024-12-20'),
  ('aaaa3333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', '51851', 'Estacionar em local/horário proibido pela sinalização', 'suspensiva', 195.23, '2025-01-05'),
  
  -- Multas em análise
  ('bbbb1111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '60503', 'Avançar o sinal vermelho do semáforo', 'analise', 293.47, '2025-01-10'),
  ('bbbb2222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444444', '74710', 'Velocidade superior à máxima permitida em até 20%', 'analise', 130.16, '2025-01-12'),
  
  -- Multas concluídas
  ('cccc1111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', '54521', 'Estacionar em desacordo com as posições regulamentadas', 'concluido', 88.38, '2024-11-20'),
  ('cccc2222-2222-4222-8222-222222222222', '55555555-5555-4555-8555-555555555555', '55680', 'Parar sobre a faixa de pedestres na mudança de sinal', 'pago', 130.16, '2024-10-15'),
  
  -- Multas pendentes
  ('dddd1111-1111-4111-8111-111111111111', '33333333-3333-4333-8333-333333333333', '74550', 'Dirigir veículo utilizando-se de telefone celular', 'pendente', 293.47, '2025-01-20'),
  ('dddd2222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444444', '73662', 'Transitar em velocidade superior à máxima em mais de 50%', 'pendente', 880.41, '2025-01-22')
ON CONFLICT (id) DO NOTHING;