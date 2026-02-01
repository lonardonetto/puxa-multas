-- Criar tabela de infrações de trânsito
CREATE TABLE IF NOT EXISTS public.infracoes_transito (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo TEXT NOT NULL UNIQUE,
    artigo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    gravidade TEXT NOT NULL CHECK (gravidade IN ('leve', 'media', 'grave', 'gravissima')),
    pontos INTEGER NOT NULL DEFAULT 0,
    suspende_cnh BOOLEAN DEFAULT false,
    categoria TEXT, -- 'lei_seca', 'velocidade', 'documentacao', 'estacionamento', 'ultrapassagem', 'equipamentos', etc
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.infracoes_transito ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Authenticated users can read infracoes" ON public.infracoes_transito
    FOR SELECT USING (true);

CREATE POLICY "Super admins can manage infracoes" ON public.infracoes_transito
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- Índices para melhor performance
CREATE INDEX idx_infracoes_codigo ON public.infracoes_transito(codigo);
CREATE INDEX idx_infracoes_categoria ON public.infracoes_transito(categoria);
CREATE INDEX idx_infracoes_gravidade ON public.infracoes_transito(gravidade);

-- ============================================
-- INSERIR TODAS AS INFRAÇÕES DO CTB
-- ============================================

-- INFRAÇÕES DE HABILITAÇÃO E DOCUMENTAÇÃO
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria) VALUES
('162-I', 'Art. 162, I', 'Dirigir veículo sem possuir CNH', 880.41, 'gravissima', 7, false, 'documentacao'),
('162-II', 'Art. 162, II', 'Dirigir veículo com CNH cassada ou suspensa', 880.41, 'gravissima', 7, false, 'documentacao'),
('162-III', 'Art. 162, III', 'Dirigir com CNH de categoria errada', 586.94, 'gravissima', 7, false, 'documentacao'),
('162-V', 'Art. 162, V', 'Dirigir com a CNH vencida há mais de 30 dias', 293.47, 'gravissima', 7, false, 'documentacao'),
('162-VI', 'Art. 162, VI', 'Dirigir sem usar lentes corretoras de visão', 293.47, 'gravissima', 7, false, 'documentacao'),
('163', 'Art. 163', 'Entregar a direção a pessoa nas condições do artigo 162', 293.47, 'gravissima', 7, false, 'documentacao'),
('164', 'Art. 164', 'Permitir que pessoa nas condições do art. 162 dirija', 293.47, 'gravissima', 7, false, 'documentacao');

-- INFRAÇÕES DE LEI SECA (ÁLCOOL E DROGAS)
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria, observacoes) VALUES
('165', 'Art. 165', 'Dirigir sob a influência de álcool ou substância psicoativa', 2934.70, 'gravissima', 7, true, 'lei_seca', 'Lei Seca - Suspensão do direito de dirigir por 12 meses'),
('165-A', 'Art. 165-A', 'Recusar-se a ser submetido a teste do etilômetro (bafômetro)', 2934.70, 'gravissima', 7, true, 'lei_seca', 'Lei Seca - Recusa ao bafômetro tem mesma penalidade que dirigir alcoolizado'),
('166', 'Art. 166', 'Entregar a direção a pessoa habilitada sem condições de dirigir', 293.47, 'gravissima', 7, false, 'lei_seca', 'Aplica-se quando entrega a pessoa embriagada ou sob efeito de drogas');

-- INFRAÇÕES DE SEGURANÇA
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria) VALUES
('167', 'Art. 167', 'Deixar o condutor ou passageiro de usar o cinto de segurança', 195.23, 'grave', 5, false, 'seguranca'),
('168', 'Art. 168', 'Transportar crianças em veículo de forma irregular', 293.47, 'gravissima', 7, false, 'seguranca'),
('169', 'Art. 169', 'Dirigir sem atenção ou sem os cuidados indispensáveis à segurança', 88.38, 'leve', 3, false, 'seguranca'),
('170', 'Art. 170', 'Dirigir ameaçando os pedestres ou os demais veículos', 293.47, 'gravissima', 7, true, 'seguranca'),
('171', 'Art. 171', 'Jogar água sobre os pedestres ou veículos', 130.16, 'media', 4, false, 'seguranca'),
('172', 'Art. 172', 'Atirar do veículo ou abandonar na via objetos ou substâncias', 130.16, 'media', 4, false, 'seguranca');

-- INFRAÇÕES GRAVÍSSIMAS COM SUSPENSÃO (RACHA, MANOBRAS PERIGOSAS)
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria, observacoes) VALUES
('173', 'Art. 173', 'Disputar corrida (racha)', 2934.70, 'gravissima', 7, true, 'racha', 'Infração autossuspensiva - suspensão imediata do direito de dirigir'),
('174', 'Art. 174', 'Promover, na via, competição esportiva ou racha', 2934.70, 'gravissima', 7, true, 'racha', 'Organizador de racha - penalidade mais severa'),
('175', 'Art. 175', 'Utilizar-se de veículo para demonstrar ou exibir manobra perigosa', 2934.70, 'gravissima', 7, true, 'manobra_perigosa', 'Empinar moto, cavalos de pau, etc.'),
('191', 'Art. 191', 'Forçar passagem entre veículos transitando em sentidos opostos', 2934.70, 'gravissima', 7, true, 'manobra_perigosa', 'Força passagem - muito perigoso');

-- INFRAÇÕES DE ACIDENTE
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria) VALUES
('176-I', 'Art. 176, I', 'Condutor envolvido em acidente deixar de prestar socorro', 1467.35, 'gravissima', 7, true, 'acidente'),
('176-II', 'Art. 176, II', 'Condutor envolvido em acidente não adotar medidas de segurança no local', 1467.35, 'gravissima', 7, true, 'acidente'),
('176-III', 'Art. 176, III', 'Condutor envolvido em acidente não facilitar o trabalho da perícia', 1467.35, 'gravissima', 7, true, 'acidente'),
('176-IV', 'Art. 176, IV', 'Condutor envolvido em acidente se recusar a mover o veículo do local', 1467.35, 'gravissima', 7, true, 'acidente'),
('176-V', 'Art. 176, V', 'Condutor envolvido em acidente não prestar informações para B.O.', 1467.35, 'gravissima', 7, true, 'acidente'),
('177', 'Art. 177', 'Deixar de prestar socorro à vítima de acidente quando solicitado', 195.23, 'grave', 5, false, 'acidente'),
('178', 'Art. 178', 'Deixar o condutor envolvido em acidente sem vítima de remover o veículo', 130.16, 'media', 4, false, 'acidente');

-- INFRAÇÕES DE ESTACIONAMENTO
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria) VALUES
('181-I', 'Art. 181, I', 'Estacionar o veículo nas esquinas e a menos de cinco metros do bordo do alinhamento da via transversal', 130.16, 'media', 4, false, 'estacionamento'),
('181-II', 'Art. 181, II', 'Estacionar o veículo afastado da guia da calçada de 50cm a 1m', 88.38, 'leve', 3, false, 'estacionamento'),
('181-III', 'Art. 181, III', 'Estacionar o veículo afastado da guia da calçada mais de 1m', 195.23, 'grave', 5, false, 'estacionamento'),
('181-V', 'Art. 181, V', 'Estacionar o veículo na pista de rolamento', 293.47, 'gravissima', 7, false, 'estacionamento'),
('181-VIII', 'Art. 181, VIII', 'Estacionar o veículo no passeio, faixa de pedestre, ciclovia ou ciclofaixa', 195.23, 'grave', 5, false, 'estacionamento'),
('181-XI', 'Art. 181, XI', 'Estacionar o veículo em fila dupla', 195.23, 'grave', 5, false, 'estacionamento'),
('181-XVII', 'Art. 181, XVII', 'Estacionar o veículo em desacordo com a sinalização', 195.23, 'grave', 5, false, 'estacionamento'),
('181-XVIII', 'Art. 181, XVIII', 'Estacionar o veículo em locais proibidos (placa Proibido Estacionar)', 130.16, 'media', 4, false, 'estacionamento'),
('181-XIX', 'Art. 181, XIX', 'Estacionar o veículo em locais proibidos (placa Proibido Parar e Estacionar)', 195.23, 'grave', 5, false, 'estacionamento'),
('181-XX', 'Art. 181, XX', 'Estacionar nas vagas reservadas a pessoas com deficiência ou idosos sem credencial', 293.47, 'gravissima', 7, false, 'estacionamento');

-- INFRAÇÕES DE CIRCULAÇÃO E FAIXA
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria) VALUES
('184-III', 'Art. 184, III', 'Transitar na faixa exclusiva para transporte coletivo', 293.47, 'gravissima', 7, false, 'circulacao'),
('185-I', 'Art. 185, I', 'Deixar de conservar o veículo na faixa correta', 130.16, 'media', 4, false, 'circulacao'),
('186-I', 'Art. 186, I', 'Transitar pela contramão em via de mão dupla', 195.23, 'grave', 5, false, 'circulacao'),
('186-II', 'Art. 186, II', 'Transitar pela contramão em via de sentido único', 293.47, 'gravissima', 7, false, 'circulacao'),
('189', 'Art. 189', 'Deixar de dar passagem a veículo de serviço de urgência', 293.47, 'gravissima', 7, false, 'circulacao'),
('192', 'Art. 192', 'Deixar de guardar distância de segurança lateral e frontal', 195.23, 'grave', 5, false, 'circulacao'),
('193', 'Art. 193', 'Transitar com o veículo em calçadas, ciclovias, passeios', 880.41, 'gravissima', 7, false, 'circulacao'),
('195', 'Art. 195', 'Desobedecer às ordens da autoridade competente de trânsito', 195.23, 'grave', 5, false, 'circulacao');

-- INFRAÇÕES DE ULTRAPASSAGEM
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria) VALUES
('199', 'Art. 199', 'Ultrapassar pela direita', 130.16, 'media', 4, false, 'ultrapassagem'),
('200', 'Art. 200', 'Ultrapassar pela direita veículo de transporte coletivo parado', 293.47, 'gravissima', 7, false, 'ultrapassagem'),
('202-I', 'Art. 202, I', 'Ultrapassar outro veículo pelo acostamento', 1467.35, 'gravissima', 7, false, 'ultrapassagem'),
('202-II', 'Art. 202, II', 'Ultrapassar em interseções e passagens de nível', 1467.35, 'gravissima', 7, false, 'ultrapassagem'),
('203-I', 'Art. 203, I', 'Ultrapassar pela contramão em curvas, aclives e declives', 1467.35, 'gravissima', 7, false, 'ultrapassagem'),
('203-V', 'Art. 203, V', 'Ultrapassar em faixa amarela contínua', 1467.35, 'gravissima', 7, false, 'ultrapassagem');

-- INFRAÇÕES DE RETORNO E CONVERSÃO
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria) VALUES
('206-I', 'Art. 206, I', 'Executar operação de retorno em locais proibidos pela sinalização', 293.47, 'gravissima', 7, false, 'retorno'),
('206-II', 'Art. 206, II', 'Executar retorno nas curvas, aclives, declives, pontes, viadutos e túneis', 293.47, 'gravissima', 7, false, 'retorno'),
('207', 'Art. 207', 'Executar operação de conversão à direita ou à esquerda em locais proibidos', 195.23, 'grave', 5, false, 'retorno');

-- INFRAÇÕES DE SINALIZAÇÃO
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria) VALUES
('208', 'Art. 208', 'Avançar o sinal vermelho do semáforo ou o de parada obrigatória', 293.47, 'gravissima', 7, false, 'sinalizacao'),
('209', 'Art. 209', 'Transpor bloqueio viário sem autorização ou evadir-se do pedágio', 195.23, 'grave', 5, false, 'sinalizacao'),
('210', 'Art. 210', 'Transpor, sem autorização, bloqueio viário policial', 293.47, 'gravissima', 7, true, 'sinalizacao'),
('212', 'Art. 212', 'Deixar de parar o veículo antes de transpor linha férrea', 293.47, 'gravissima', 7, false, 'sinalizacao');

-- INFRAÇÕES DE PEDESTRE
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria) VALUES
('214-I', 'Art. 214, I', 'Deixar de dar preferência a pedestre na faixa', 293.47, 'gravissima', 7, false, 'pedestre'),
('214-II', 'Art. 214, II', 'Não deixar pedestre concluir a travessia mesmo com sinal verde', 293.47, 'gravissima', 7, false, 'pedestre'),
('214-III', 'Art. 214, III', 'Deixar de dar preferência a deficientes, crianças, idosos e gestantes', 293.47, 'gravissima', 7, false, 'pedestre');

-- INFRAÇÕES DE VELOCIDADE
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria, observacoes) VALUES
('218-I', 'Art. 218, I', 'Transitar em velocidade superior à máxima permitida em até 20%', 130.16, 'media', 4, false, 'velocidade', 'Excesso de velocidade até 20%'),
('218-II', 'Art. 218, II', 'Transitar em velocidade superior à máxima permitida de 20% até 50%', 195.23, 'grave', 5, false, 'velocidade', 'Excesso de velocidade entre 20% e 50%'),
('218-III', 'Art. 218, III', 'Transitar em velocidade superior a 50% da máxima permitida', 880.41, 'gravissima', 7, true, 'velocidade', 'Excesso de velocidade acima de 50% - SUSPENSÃO'),
('219', 'Art. 219', 'Transitar em velocidade inferior à metade da velocidade máxima estabelecida', 130.16, 'media', 4, false, 'velocidade', 'Trânsito lento obstruindo via');

-- INFRAÇÕES DE EQUIPAMENTOS E VEÍCULO
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria) VALUES
('230-I', 'Art. 230, I', 'Conduzir veículo com placa de identificação violada ou falsificada', 293.47, 'gravissima', 7, false, 'equipamentos'),
('230-II', 'Art. 230, II', 'Transportar passageiros em compartimento de carga', 293.47, 'gravissima', 7, false, 'equipamentos'),
('230-III', 'Art. 230, III', 'Conduzir veículo com dispositivo anti-radar', 293.47, 'gravissima', 7, false, 'equipamentos'),
('230-IV', 'Art. 230, IV', 'Conduzir veículo sem qualquer uma das placas de identificação', 293.47, 'gravissima', 7, false, 'equipamentos'),
('230-V', 'Art. 230, V', 'Conduzir veículo que não esteja registrado e devidamente licenciado', 293.47, 'gravissima', 7, false, 'equipamentos'),
('230-IX', 'Art. 230, IX', 'Conduzir veículo sem equipamento obrigatório', 195.23, 'grave', 5, false, 'equipamentos'),
('232', 'Art. 232', 'Conduzir veículo sem os documentos de porte obrigatório', 88.38, 'leve', 3, false, 'documentacao');

-- INFRAÇÕES DE MOTOCICLETA
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria, observacoes) VALUES
('244-I', 'Art. 244, I', 'Conduzir motocicleta sem capacete com viseira ou óculos protetores', 293.47, 'gravissima', 7, true, 'motocicleta', 'Falta de capacete - suspensão'),
('244-II', 'Art. 244, II', 'Conduzir motocicleta transportando passageiro sem capacete', 293.47, 'gravissima', 7, true, 'motocicleta', 'Passageiro sem capacete - suspensão'),
('244-III', 'Art. 244, III', 'Conduzir motocicleta fazendo malabarismo ou equilibrando em uma roda', 293.47, 'gravissima', 7, true, 'motocicleta', 'Empinar moto - suspensão'),
('244-IV', 'Art. 244, IV', 'Conduzir motocicleta com os faróis apagados', 293.47, 'gravissima', 7, true, 'motocicleta', 'Farol apagado em moto - suspensão'),
('244-V', 'Art. 244, V', 'Conduzir motocicleta transportando criança menor de 7 anos', 293.47, 'gravissima', 7, true, 'motocicleta', 'Criança em moto - suspensão');

-- INFRAÇÕES DE CELULAR
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria, observacoes) VALUES
('252-V', 'Art. 252, V', 'Dirigir o veículo utilizando-se de telefone celular', 293.47, 'gravissima', 7, false, 'celular', 'Uso de celular ao volante - Parágrafo único do art. 252');

-- INFRAÇÕES DE BLOQUEIO
INSERT INTO public.infracoes_transito (codigo, artigo, descricao, valor, gravidade, pontos, suspende_cnh, categoria, observacoes) VALUES
('253', 'Art. 253', 'Bloquear a via com veículo', 293.47, 'gravissima', 7, false, 'bloqueio', 'Bloquear via'),
('253-A', 'Art. 253-A', 'Usar veículo para interromper a circulação da via sem autorização', 8804.10, 'gravissima', 7, true, 'bloqueio', 'Multa multiplicada por 10 - Suspensão de 12 meses'),
('253-A-1', 'Art. 253-A, §1º', 'Organizar interrupção da circulação da via sem autorização', 17608.20, 'gravissima', 7, true, 'bloqueio', 'Organizador - Multa multiplicada por 20 - Suspensão de 12 meses');

-- ============================================
-- ADICIONAR FUNDAMENTOS LEGAIS ESPECÍFICOS
-- ============================================

-- Fundamentos para LEI SECA
INSERT INTO public.fundamentos_legais (orgao_id, tipo_recurso, codigo_infracao, titulo, conteudo, ordem, ativo)
SELECT 
    o.id,
    'defesa_previa',
    '165',
    'Fundamento Legal - Art. 165 CTB (Lei Seca)',
    E'FUNDAMENTOS JURÍDICOS PARA DEFESA - LEI SECA (Art. 165 CTB)\n\n1. REQUISITOS LEGAIS DO AUTO DE INFRAÇÃO:\n- O art. 280 do CTB exige que o auto contenha a identificação do condutor, local, data, hora e enquadramento preciso\n- A ausência de qualquer requisito essencial acarreta nulidade (art. 280, §4º)\n\n2. TESTE DO ETILÔMETRO:\n- Resolução CONTRAN nº 432/2013 estabelece procedimentos específicos\n- O equipamento deve estar aferido e dentro da validade\n- Margem de erro técnica deve ser considerada\n\n3. SINAIS DE EMBRIAGUEZ:\n- O art. 306, §2º do CTB estabelece sinais que devem ser observados\n- A mera recusa ao teste não configura automaticamente a infração do art. 165\n\n4. DIREITOS DO CONDUTOR:\n- Direito ao contraditório e ampla defesa (art. 5º, LV, CF)\n- Direito de não produzir prova contra si mesmo (nemo tenetur se detegere)\n\n5. JURISPRUDÊNCIAS FAVORÁVEIS:\n- STJ: REsp 1.111.566/DF - necessidade de prova da embriaguez\n- STF: ARE 1.003.785 - garantias processuais\n\n6. VÍCIOS PROCEDIMENTAIS:\n- Falta de assinatura do condutor ou testemunhas\n- Ausência de descrição detalhada dos sinais de embriaguez\n- Equipamento sem aferição válida',
    1,
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- Fundamentos para RECUSA AO BAFÔMETRO
INSERT INTO public.fundamentos_legais (orgao_id, tipo_recurso, codigo_infracao, titulo, conteudo, ordem, ativo)
SELECT 
    o.id,
    'defesa_previa',
    '165-A',
    'Fundamento Legal - Art. 165-A CTB (Recusa ao Bafômetro)',
    E'FUNDAMENTOS JURÍDICOS PARA DEFESA - RECUSA AO BAFÔMETRO (Art. 165-A CTB)\n\n1. PRINCÍPIO CONSTITUCIONAL:\n- Nemo tenetur se detegere: ninguém é obrigado a produzir prova contra si mesmo\n- Art. 5º, LXIII, CF: direito de permanecer calado\n- Convenção Americana de Direitos Humanos (Pacto de San José da Costa Rica)\n\n2. PROCEDIMENTO DE ABORDAGEM:\n- A autoridade deve oferecer corretamente o teste\n- Deve haver registro adequado da recusa\n- O condutor deve ser informado das consequências\n\n3. REQUISITOS DO AUTO:\n- Descrição clara da recusa\n- Identificação de testemunhas\n- Horário e local precisos\n\n4. TESES DE DEFESA:\n- Ausência de oferecimento formal do teste\n- Equipamento indisponível no momento\n- Recusa justificada por motivo de saúde\n- Falta de advertência prévia sobre consequências\n\n5. JURISPRUDÊNCIAS:\n- STF: RHC 165.711 - garantia contra autoincriminação\n- Tribunais de Justiça diversos reconhecem nulidade por vícios procedimentais',
    2,
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- Fundamentos para VELOCIDADE
INSERT INTO public.fundamentos_legais (orgao_id, tipo_recurso, codigo_infracao, titulo, conteudo, ordem, ativo)
SELECT 
    o.id,
    'defesa_previa',
    '218-III',
    'Fundamento Legal - Art. 218 CTB (Excesso de Velocidade)',
    E'FUNDAMENTOS JURÍDICOS PARA DEFESA - EXCESSO DE VELOCIDADE (Art. 218 CTB)\n\n1. EQUIPAMENTO DE MEDIÇÃO:\n- Resolução CONTRAN nº 396/2011 e 458/2013\n- Aferição obrigatória pelo INMETRO\n- Margem de erro técnica tolerada\n\n2. SINALIZAÇÃO DA VIA:\n- Obrigatoriedade de placas indicativas de velocidade\n- Distância mínima entre sinalização e equipamento\n- Visibilidade adequada das placas\n\n3. IRREGULARIDADES COMUNS:\n- Radar sem aferição válida\n- Ausência de sinalização prévia\n- Placa de velocidade oculta ou danificada\n- Erro na identificação do veículo\n\n4. PROVAS A REQUERER:\n- Certificado de aferição do equipamento\n- Fotos da sinalização do local\n- Registro fotográfico da autuação\n\n5. JURISPRUDÊNCIAS:\n- Tribunais anulam multas por radar sem aferição\n- Sinalização inadequada gera nulidade\n\n6. MARGEM DE ERRO:\n- A Resolução CONTRAN admite margem de erro técnica\n- Velocidade registrada menos margem de erro = velocidade real',
    3,
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- Fundamentos para RACHA
INSERT INTO public.fundamentos_legais (orgao_id, tipo_recurso, codigo_infracao, titulo, conteudo, ordem, ativo)
SELECT 
    o.id,
    'defesa_previa',
    '173',
    'Fundamento Legal - Art. 173/174 CTB (Racha/Competição)',
    E'FUNDAMENTOS JURÍDICOS PARA DEFESA - RACHA/COMPETIÇÃO (Arts. 173/174 CTB)\n\n1. CONCEITO LEGAL:\n- Racha é a disputa ou competição automobilística não autorizada\n- Exige participação de pelo menos dois veículos\n- Deve haver efetiva disputa, não mera coincidência de velocidade\n\n2. PROVA DA INFRAÇÃO:\n- Necessidade de comprovação do ânimo de competir\n- Simples excesso de velocidade não configura racha\n- Deve haver prova de combinação prévia ou disputa\n\n3. TESES DE DEFESA:\n- Ausência de outro veículo participante\n- Falta de prova do acordo entre condutores\n- Velocidade elevada por motivo diverso\n- Erro de tipificação da infração\n\n4. DIFERENCIAÇÃO:\n- Art. 173: participar de racha\n- Art. 174: promover racha\n- Art. 175: manobra perigosa (diferente de racha)\n\n5. JURISPRUDÊNCIAS:\n- A infração exige prova robusta da competição\n- Meras suposições não bastam para autuação',
    4,
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- Fundamentos para SUSPENSÃO POR PONTOS
INSERT INTO public.fundamentos_legais (orgao_id, tipo_recurso, titulo, conteudo, ordem, ativo)
SELECT 
    o.id,
    'cetran',
    'Fundamento Legal - Suspensão por Pontuação',
    E'FUNDAMENTOS JURÍDICOS - SUSPENSÃO POR PONTUAÇÃO (Art. 261 CTB)\n\n1. SISTEMA DE PONTUAÇÃO:\n- Lei 14.071/2020 alterou os limites de pontos\n- 20 pontos para motoristas sem infração gravíssima\n- 30 pontos para motoristas profissionais\n- 40 pontos em hipóteses específicas\n\n2. CONTAGEM DOS PONTOS:\n- Apenas multas transitadas em julgado contam pontos\n- Prazo de 12 meses para contabilização\n- Recursos pendentes suspendem a contagem\n\n3. TESES DE DEFESA NO CETRAN:\n- Erro na contagem de pontos\n- Multas ainda passíveis de recurso\n- Prescrição de infrações antigas\n- Vícios processuais nas autuações base\n\n4. DIREITOS DO CONDUTOR:\n- Notificação prévia adequada\n- Direito de defesa em cada multa\n- Possibilidade de participar de curso de reciclagem\n\n5. PROCEDIMENTOS:\n- Art. 263 CTB: cassação por reincidência em 12 meses\n- Curso de reciclagem pode reduzir pontos\n- Suspensão tem prazo determinado',
    5,
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- ============================================
-- ADICIONAR TEMPLATES ESPECÍFICOS
-- ============================================

-- Template para Lei Seca (Art. 165)
INSERT INTO public.templates_recursos (orgao_id, tipo_recurso, codigo_infracao, titulo, cabecalho, corpo, rodape, prompt_ia, ativo)
SELECT 
    o.id,
    'defesa_previa',
    '165',
    'Defesa Prévia - Lei Seca (Art. 165 CTB)',
    E'AO ILUSTRÍSSIMO SENHOR DIRETOR DO {{ORGAO_NOME}}\n\nREF: AUTO DE INFRAÇÃO Nº {{AUTO_INFRACAO}}\nASSUNTO: DEFESA PRÉVIA - ART. 165 CTB (LEI SECA)',
    E'{{CLIENTE_NOME}}, brasileiro(a), portador(a) do CPF nº {{CLIENTE_CPF}}, residente e domiciliado(a) em {{CLIENTE_ENDERECO}}, vem, respeitosamente, à presença de Vossa Senhoria, apresentar DEFESA PRÉVIA contra o Auto de Infração em referência, pelos fatos e fundamentos a seguir expostos.\n\nDOS FATOS\n{{DESCRICAO_FATOS}}\n\nDO DIREITO\n1. Da Nulidade por Vício no Procedimento\n[Argumentação sobre procedimento do teste]\n\n2. Do Princípio Nemo Tenetur Se Detegere\n[Direito de não produzir prova contra si]\n\n3. Da Ausência de Prova Material\n[Questionamento sobre provas]\n\nDOS PEDIDOS\nDiante do exposto, requer:\na) O recebimento e processamento da presente defesa;\nb) A ANULAÇÃO do Auto de Infração por vício de procedimento;\nc) Subsidiariamente, a conversão em advertência.',
    E'\nNestes termos, pede deferimento.\n\n{{CIDADE}}, {{DATA}}\n\n_______________________________\n{{CLIENTE_NOME}}',
    'Você é um advogado especialista em direito de trânsito com foco em Lei Seca. Analise cuidadosamente os fatos apresentados e elabore uma defesa robusta considerando: 1) Procedimento do teste de etilômetro (aferição, validade); 2) Sinais de embriaguez descritos no auto; 3) Direitos constitucionais do condutor; 4) Possíveis vícios processuais. Use jurisprudências atualizadas e fundamente cada argumento com base legal específica.',
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- Template para Recusa ao Bafômetro (Art. 165-A)
INSERT INTO public.templates_recursos (orgao_id, tipo_recurso, codigo_infracao, titulo, cabecalho, corpo, rodape, prompt_ia, ativo)
SELECT 
    o.id,
    'defesa_previa',
    '165-A',
    'Defesa Prévia - Recusa ao Bafômetro (Art. 165-A CTB)',
    E'AO ILUSTRÍSSIMO SENHOR DIRETOR DO {{ORGAO_NOME}}\n\nREF: AUTO DE INFRAÇÃO Nº {{AUTO_INFRACAO}}\nASSUNTO: DEFESA PRÉVIA - ART. 165-A CTB (RECUSA AO BAFÔMETRO)',
    E'{{CLIENTE_NOME}}, brasileiro(a), portador(a) do CPF nº {{CLIENTE_CPF}}, vem apresentar DEFESA PRÉVIA pelos fundamentos abaixo.\n\nDOS FATOS\n{{DESCRICAO_FATOS}}\n\nDO DIREITO\n1. Do Direito Constitucional de Não Autoincriminação\nO art. 5º, LXIII da Constituição Federal assegura ao cidadão o direito de permanecer calado e não produzir prova contra si mesmo.\n\n2. Da Ausência de Oferecimento Formal do Teste\n[Se aplicável]\n\n3. Dos Vícios do Auto de Infração\n[Análise do auto]\n\nDOS PEDIDOS\nRequer a ANULAÇÃO da autuação.',
    E'\nNestes termos, pede deferimento.\n\n{{CIDADE}}, {{DATA}}\n\n_______________________________\n{{CLIENTE_NOME}}',
    'Você é um advogado especialista em direito de trânsito. Elabore defesa para recusa ao bafômetro considerando: 1) Direito constitucional de não autoincriminação; 2) Procedimento de abordagem policial; 3) Requisitos formais do auto de infração; 4) Jurisprudências do STF e STJ sobre o tema. Seja técnico e use fundamentação sólida.',
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- Template para Excesso de Velocidade (Art. 218)
INSERT INTO public.templates_recursos (orgao_id, tipo_recurso, codigo_infracao, titulo, cabecalho, corpo, rodape, prompt_ia, ativo)
SELECT 
    o.id,
    'defesa_previa',
    '218-III',
    'Defesa Prévia - Excesso de Velocidade (Art. 218 CTB)',
    E'AO ILUSTRÍSSIMO SENHOR DIRETOR DO {{ORGAO_NOME}}\n\nREF: AUTO DE INFRAÇÃO Nº {{AUTO_INFRACAO}}\nASSUNTO: DEFESA PRÉVIA - ART. 218 CTB (EXCESSO DE VELOCIDADE)',
    E'{{CLIENTE_NOME}}, brasileiro(a), portador(a) do CPF nº {{CLIENTE_CPF}}, vem apresentar DEFESA PRÉVIA.\n\nDOS FATOS\n{{DESCRICAO_FATOS}}\n\nDO DIREITO\n1. Da Aferição do Equipamento Medidor\nConforme Resolução CONTRAN nº 396/2011, o equipamento deve estar com aferição válida.\n\n2. Da Sinalização da Via\nA via deve conter sinalização adequada indicando a velocidade máxima permitida.\n\n3. Da Margem de Erro\nA margem de erro técnica do equipamento deve ser considerada.\n\nDOS PEDIDOS\nRequer a ANULAÇÃO ou ARQUIVAMENTO da autuação.',
    E'\nNestes termos, pede deferimento.\n\n{{CIDADE}}, {{DATA}}\n\n_______________________________\n{{CLIENTE_NOME}}',
    'Você é um advogado especialista em infrações de velocidade. Elabore defesa considerando: 1) Aferição e validade do equipamento medidor; 2) Sinalização prévia da via; 3) Margem de erro técnica; 4) Resolução CONTRAN aplicável. Solicite provas documentais e questione procedimentos técnicos.',
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- Template para Racha (Arts. 173/174)
INSERT INTO public.templates_recursos (orgao_id, tipo_recurso, codigo_infracao, titulo, cabecalho, corpo, rodape, prompt_ia, ativo)
SELECT 
    o.id,
    'defesa_previa',
    '173',
    'Defesa Prévia - Racha/Competição (Arts. 173/174 CTB)',
    E'AO ILUSTRÍSSIMO SENHOR DIRETOR DO {{ORGAO_NOME}}\n\nREF: AUTO DE INFRAÇÃO Nº {{AUTO_INFRACAO}}\nASSUNTO: DEFESA PRÉVIA - ARTS. 173/174 CTB (RACHA)',
    E'{{CLIENTE_NOME}}, brasileiro(a), portador(a) do CPF nº {{CLIENTE_CPF}}, vem apresentar DEFESA PRÉVIA.\n\nDOS FATOS\n{{DESCRICAO_FATOS}}\n\nDO DIREITO\n1. Da Tipificação Incorreta\nPara configuração de racha, é necessária prova de disputa entre dois ou mais veículos com ânimo de competir.\n\n2. Da Ausência de Prova\nNão há prova de acordo prévio ou disputa entre condutores.\n\n3. Da Distinção com Outras Infrações\nSimples excesso de velocidade não configura racha.\n\nDOS PEDIDOS\nRequer a ANULAÇÃO da autuação.',
    E'\nNestes termos, pede deferimento.\n\n{{CIDADE}}, {{DATA}}\n\n_______________________________\n{{CLIENTE_NOME}}',
    'Você é um advogado especialista em infrações gravíssimas de trânsito. Elabore defesa para acusação de racha considerando: 1) Conceito legal de racha vs. excesso de velocidade; 2) Necessidade de prova do acordo entre condutores; 3) Tipificação correta da infração; 4) Ônus da prova da administração.',
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- Template para Motocicleta (Art. 244)
INSERT INTO public.templates_recursos (orgao_id, tipo_recurso, codigo_infracao, titulo, cabecalho, corpo, rodape, prompt_ia, ativo)
SELECT 
    o.id,
    'defesa_previa',
    '244-I',
    'Defesa Prévia - Infrações de Motocicleta (Art. 244 CTB)',
    E'AO ILUSTRÍSSIMO SENHOR DIRETOR DO {{ORGAO_NOME}}\n\nREF: AUTO DE INFRAÇÃO Nº {{AUTO_INFRACAO}}\nASSUNTO: DEFESA PRÉVIA - ART. 244 CTB (MOTOCICLETA)',
    E'{{CLIENTE_NOME}}, brasileiro(a), portador(a) do CPF nº {{CLIENTE_CPF}}, vem apresentar DEFESA PRÉVIA.\n\nDOS FATOS\n{{DESCRICAO_FATOS}}\n\nDO DIREITO\n1. Da Descrição Insuficiente\nO auto de infração deve descrever com precisão a conduta infracional.\n\n2. Dos Requisitos do Art. 280 CTB\nA ausência de requisitos essenciais gera nulidade.\n\n3. Da Prova da Infração\nNecessidade de comprovação fotográfica ou testemunhal.\n\nDOS PEDIDOS\nRequer a ANULAÇÃO da autuação.',
    E'\nNestes termos, pede deferimento.\n\n{{CIDADE}}, {{DATA}}\n\n_______________________________\n{{CLIENTE_NOME}}',
    'Você é um advogado especialista em infrações de motocicleta. Elabore defesa considerando: 1) Especificidade do inciso do art. 244; 2) Requisitos formais do auto; 3) Prova da infração; 4) Possíveis excludentes.',
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- Template para Celular ao Volante (Art. 252)
INSERT INTO public.templates_recursos (orgao_id, tipo_recurso, codigo_infracao, titulo, cabecalho, corpo, rodape, prompt_ia, ativo)
SELECT 
    o.id,
    'defesa_previa',
    '252-V',
    'Defesa Prévia - Uso de Celular (Art. 252 CTB)',
    E'AO ILUSTRÍSSIMO SENHOR DIRETOR DO {{ORGAO_NOME}}\n\nREF: AUTO DE INFRAÇÃO Nº {{AUTO_INFRACAO}}\nASSUNTO: DEFESA PRÉVIA - ART. 252, V CTB (CELULAR)',
    E'{{CLIENTE_NOME}}, brasileiro(a), portador(a) do CPF nº {{CLIENTE_CPF}}, vem apresentar DEFESA PRÉVIA.\n\nDOS FATOS\n{{DESCRICAO_FATOS}}\n\nDO DIREITO\n1. Da Interpretação Restritiva\nA infração exige que o condutor esteja efetivamente manuseando o aparelho.\n\n2. Da Prova da Infração\nNecessidade de prova fotográfica clara do uso.\n\n3. Das Excludentes\nUso para navegação GPS em suporte pode ser excludente.\n\nDOS PEDIDOS\nRequer a ANULAÇÃO da autuação.',
    E'\nNestes termos, pede deferimento.\n\n{{CIDADE}}, {{DATA}}\n\n_______________________________\n{{CLIENTE_NOME}}',
    'Você é um advogado especialista em trânsito. Elabore defesa para uso de celular considerando: 1) Conceito de manuseio vs. posse; 2) Prova da infração; 3) Excludentes (GPS, viva-voz); 4) Requisitos do auto de infração.',
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- Template genérico para JARI
INSERT INTO public.templates_recursos (orgao_id, tipo_recurso, titulo, cabecalho, corpo, rodape, prompt_ia, ativo)
SELECT 
    o.id,
    'jari',
    'Recurso à JARI - Modelo Genérico',
    E'À JUNTA ADMINISTRATIVA DE RECURSOS DE INFRAÇÕES - JARI\n{{ORGAO_NOME}}\n\nREF: AUTO DE INFRAÇÃO Nº {{AUTO_INFRACAO}}\nASSUNTO: RECURSO ADMINISTRATIVO',
    E'{{CLIENTE_NOME}}, brasileiro(a), portador(a) do CPF nº {{CLIENTE_CPF}}, inconformado com a decisão que manteve o auto de infração em referência, vem interpor RECURSO à JARI.\n\nDOS FATOS\n{{DESCRICAO_FATOS}}\n\nDO DIREITO\n[Fundamentos jurídicos específicos para o caso]\n\nDAS PROVAS\n[Documentos anexados e provas a produzir]\n\nDOS PEDIDOS\nRequer o PROVIMENTO do recurso com ANULAÇÃO da penalidade.',
    E'\nNestes termos, pede deferimento.\n\n{{CIDADE}}, {{DATA}}\n\n_______________________________\n{{CLIENTE_NOME}}',
    'Você é um advogado especialista em recursos de trânsito. Elabore recurso à JARI considerando que a defesa prévia foi indeferida. Apresente novos argumentos ou reforce os anteriores com jurisprudências. Ataque os fundamentos da decisão de indeferimento. Seja técnico e objetivo.',
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;

-- Template genérico para CETRAN
INSERT INTO public.templates_recursos (orgao_id, tipo_recurso, titulo, cabecalho, corpo, rodape, prompt_ia, ativo)
SELECT 
    o.id,
    'cetran',
    'Recurso ao CETRAN - Modelo Genérico',
    E'AO CONSELHO ESTADUAL DE TRÂNSITO - CETRAN\n{{ORGAO_NOME}}\n\nREF: AUTO DE INFRAÇÃO Nº {{AUTO_INFRACAO}}\nASSUNTO: RECURSO DE 2ª INSTÂNCIA',
    E'{{CLIENTE_NOME}}, brasileiro(a), portador(a) do CPF nº {{CLIENTE_CPF}}, inconformado com a decisão da JARI, vem interpor RECURSO ao CETRAN.\n\nDOS FATOS E DO HISTÓRICO PROCESSUAL\n[Resumo do processo e decisões anteriores]\n{{DESCRICAO_FATOS}}\n\nDO DIREITO\n[Fundamentos jurídicos de segunda instância]\n\nDOS PEDIDOS\nRequer o PROVIMENTO do recurso.',
    E'\nNestes termos, pede deferimento.\n\n{{CIDADE}}, {{DATA}}\n\n_______________________________\n{{CLIENTE_NOME}}',
    'Você é um advogado especialista em recursos de segunda instância de trânsito. Elabore recurso ao CETRAN considerando as decisões anteriores desfavoráveis. Apresente argumentos de direito, questões processuais e jurisprudências dos tribunais superiores. O CETRAN analisa questões de legalidade, então foque em vícios processuais e legais.',
    true
FROM public.orgaos_transito o
WHERE o.tipo = 'detran'
LIMIT 1;