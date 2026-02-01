-- Inserir infrações no formato RENAINF (códigos numéricos) mais comuns para recursos de trânsito
-- Estas são as infrações que advogados e empresas de recursos mais trabalham

INSERT INTO infracoes_transito (codigo, descricao, artigo, gravidade, pontos, valor, categoria, suspende_cnh, ativo) VALUES
-- EXCESSO DE VELOCIDADE (Art. 218)
('74550', 'Transitar em velocidade superior à máxima permitida em até 20%', 'Art. 218, I', 'media', 4, 130.16, 'Velocidade', false, true),
('74630', 'Transitar em velocidade superior à máxima permitida em mais de 20% até 50%', 'Art. 218, II', 'grave', 5, 195.23, 'Velocidade', false, true),
('74710', 'Transitar em velocidade superior à máxima permitida em mais de 50%', 'Art. 218, III', 'gravissima', 7, 880.41, 'Velocidade', true, true),

-- AVANÇO DE SINAL (Art. 208)
('70390', 'Avançar o sinal vermelho do semáforo ou o de parada obrigatória', 'Art. 208', 'gravissima', 7, 293.47, 'Circulação', false, true),

-- ESTACIONAMENTO (Art. 181 e 182)
('54521', 'Estacionar o veículo em desacordo com as condições regulamentadas', 'Art. 181', 'media', 4, 130.16, 'Estacionamento', false, true),
('54600', 'Estacionar junto ou sobre hidrantes, registro de água, tampas de poços', 'Art. 181, VIII', 'media', 4, 130.16, 'Estacionamento', false, true),
('55250', 'Parar o veículo na pista de rolamento', 'Art. 182, II', 'media', 4, 130.16, 'Estacionamento', false, true),
('55680', 'Estacionar em locais e horários proibidos pela sinalização', 'Art. 181, XVII', 'media', 4, 130.16, 'Estacionamento', false, true),

-- USO DE CELULAR (Art. 252)
('73662', 'Dirigir utilizando fones nos ouvidos conectados a aparelhagem sonora', 'Art. 252, VI', 'media', 4, 130.16, 'Condutor', false, true),

-- CINTO DE SEGURANÇA (Art. 167)
('51851', 'Deixar o condutor de usar o cinto de segurança', 'Art. 167', 'grave', 5, 195.23, 'Equipamento', false, true),
('51852', 'Conduzir passageiro que não esteja usando cinto de segurança', 'Art. 167', 'grave', 5, 195.23, 'Equipamento', false, true),

-- ULTRAPASSAGEM INDEVIDA (Art. 191, 203)
('60090', 'Ultrapassar pela contramão em locais proibidos', 'Art. 203, V', 'gravissima', 7, 293.47, 'Ultrapassagem', false, true),
('59910', 'Transitar pela contramão de direção', 'Art. 186, I', 'gravissima', 7, 293.47, 'Ultrapassagem', false, true),

-- LEI SECA / EMBRIAGUEZ (Art. 165 e 165-A)
('51691', 'Dirigir sob a influência de álcool ou substância psicoativa', 'Art. 165', 'gravissima', 7, 2934.70, 'Lei Seca', true, true),
('51692', 'Recusar-se a ser submetido a teste para constatar álcool', 'Art. 165-A', 'gravissima', 7, 2934.70, 'Lei Seca', true, true),

-- CNH (Art. 162)
('50100', 'Dirigir veículo sem possuir CNH ou Permissão para Dirigir', 'Art. 162, I', 'gravissima', 7, 880.41, 'Documentação', false, true),
('50290', 'Dirigir veículo com CNH ou Permissão cassada', 'Art. 162, II', 'gravissima', 7, 880.41, 'Documentação', false, true),
('50370', 'Dirigir veículo com CNH de categoria diferente da do veículo', 'Art. 162, III', 'gravissima', 7, 586.94, 'Documentação', false, true),
('50451', 'Dirigir com CNH vencida há mais de 30 dias', 'Art. 162, V', 'gravissima', 7, 293.47, 'Documentação', false, true),

-- FAIXA EXCLUSIVA (Art. 184)
('57380', 'Transitar com veículo pelo passeio ou calçada', 'Art. 193', 'grave', 5, 195.23, 'Circulação', false, true),
('57461', 'Transitar em faixa exclusiva de ônibus', 'Art. 184, III', 'media', 4, 130.16, 'Circulação', false, true),

-- RODÍZIO MUNICIPAL
('76331', 'Transitar em vias regulamentadas em desacordo com restrição de rodízio', 'Art. 187, I', 'media', 4, 130.16, 'Circulação', false, true),

-- CONVERSÃO PROIBIDA (Art. 206)
('69030', 'Executar conversão à direita em local proibido pela sinalização', 'Art. 206, I', 'media', 4, 130.16, 'Conversão', false, true),
('69111', 'Executar conversão à esquerda em local proibido pela sinalização', 'Art. 206, II', 'media', 4, 130.16, 'Conversão', false, true),
('69200', 'Executar retorno em local proibido pela sinalização', 'Art. 206, III', 'grave', 5, 195.23, 'Conversão', false, true),

-- DOCUMENTAÇÃO DO VEÍCULO (Art. 230, 232)
('73810', 'Conduzir veículo sem os documentos de porte obrigatório', 'Art. 232', 'leve', 3, 88.38, 'Documentação', false, true),
('72930', 'Conduzir veículo com o licenciamento vencido', 'Art. 230, V', 'gravissima', 7, 293.47, 'Documentação', false, true),

-- FAROL APAGADO (Art. 250)
('73484', 'Deixar de manter acesa a luz baixa durante a noite', 'Art. 250, I, a', 'media', 4, 130.16, 'Iluminação', false, true),
('73492', 'Deixar de manter acesa a luz baixa durante o dia em rodovias', 'Art. 250, I, b', 'media', 4, 130.16, 'Iluminação', false, true),

-- FISCALIZAÇÃO ELETRÔNICA
('55411', 'Parar sobre faixa de pedestres na mudança de sinal', 'Art. 183', 'media', 4, 130.16, 'Circulação', false, true),

-- PESO E DIMENSÕES (Art. 231)
('72343', 'Transitar com veículo cujo peso bruto total exceda o indicado', 'Art. 231, V', 'media', 4, 130.16, 'Peso', false, true),

-- MOTOCICLETA (Art. 244)
('76492', 'Conduzir motocicleta sem usar capacete de segurança', 'Art. 244, I', 'gravissima', 7, 293.47, 'Motocicleta', true, true),
('76573', 'Transportar passageiro sem capacete em motocicleta', 'Art. 244, II', 'gravissima', 7, 293.47, 'Motocicleta', true, true)

ON CONFLICT (codigo) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  artigo = EXCLUDED.artigo,
  gravidade = EXCLUDED.gravidade,
  pontos = EXCLUDED.pontos,
  valor = EXCLUDED.valor,
  categoria = EXCLUDED.categoria,
  suspende_cnh = EXCLUDED.suspende_cnh,
  ativo = EXCLUDED.ativo,
  updated_at = now();