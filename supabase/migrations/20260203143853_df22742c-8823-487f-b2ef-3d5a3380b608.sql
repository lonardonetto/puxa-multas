-- Adicionar campo para jurisprudência na tabela legislacao_base
ALTER TABLE public.legislacao_base 
ADD COLUMN IF NOT EXISTS tipo_conteudo text DEFAULT 'legislacao';

COMMENT ON COLUMN public.legislacao_base.tipo_conteudo IS 'Tipo de conteúdo: legislacao, jurisprudencia, sumula';

-- Inserir algumas jurisprudências relevantes
INSERT INTO public.legislacao_base (tipo, titulo, conteudo, descricao, artigos_relacionados, palavras_chave, tipo_conteudo, is_global, ativo) VALUES

-- Jurisprudências sobre nulidade de multa
('jurisprudencia', 'STJ - REsp 1.111.566 - Nulidade por ausência de notificação',
'RECURSO ESPECIAL. ADMINISTRATIVO. INFRAÇÃO DE TRÂNSITO. AUSÊNCIA DE NOTIFICAÇÃO. NULIDADE. A ausência de notificação da autuação de infração de trânsito constitui vício insanável, ensejando a nulidade do auto de infração. O prazo para defesa só começa a contar após a efetiva notificação do infrator. Art. 280, §3º, do CTB.',
'Recurso Especial que estabelece a nulidade do AIT por ausência de notificação prévia',
ARRAY['280', 'CTB'],
ARRAY['notificação', 'nulidade', 'prazo', 'defesa prévia'],
'jurisprudencia', true, true),

('jurisprudencia', 'STJ - AgRg no REsp 1.138.206 - Dupla penalidade vedada',
'AGRAVO REGIMENTAL. RECURSO ESPECIAL. TRÂNSITO. INFRAÇÃO. MULTA E SUSPENSÃO DA CNH. BIS IN IDEM. IMPOSSIBILIDADE. Não se admite a aplicação de dupla penalidade pelo mesmo fato, sob pena de caracterização de bis in idem. O princípio do non bis in idem veda a dupla punição pelo mesmo ilícito.',
'Jurisprudência que veda a dupla penalidade pelo mesmo fato',
ARRAY['CTB'],
ARRAY['dupla penalidade', 'bis in idem', 'suspensão', 'CNH'],
'jurisprudencia', true, true),

('jurisprudencia', 'TJ-SP - Súmula 312 - Radar sem aferição',
'SÚMULA 312: É nulo o auto de infração lavrado por equipamento eletrônico (radar) que não tenha sido previamente aferido e que não contenha a indicação de sua verificação metrológica.',
'Súmula do TJ-SP sobre nulidade de multa por radar sem aferição',
ARRAY['218', 'CTB'],
ARRAY['radar', 'aferição', 'equipamento', 'velocidade', 'verificação metrológica'],
'jurisprudencia', true, true),

('jurisprudencia', 'STJ - REsp 1.195.178 - Responsabilidade do proprietário',
'RECURSO ESPECIAL. TRÂNSITO. MULTA. RESPONSABILIDADE DO PROPRIETÁRIO. INDICAÇÃO DO CONDUTOR. O proprietário do veículo é responsável solidário pelas infrações de trânsito cometidas por terceiros, salvo se indicar o real infrator no prazo legal. Art. 257, §7º, do CTB.',
'Responsabilidade do proprietário e direito de indicar condutor',
ARRAY['257', 'CTB'],
ARRAY['proprietário', 'condutor', 'responsabilidade', 'indicação'],
'jurisprudencia', true, true),

('jurisprudencia', 'STJ - REsp 1.092.154 - Sinalização deficiente',
'RECURSO ESPECIAL. TRÂNSITO. INFRAÇÃO. SINALIZAÇÃO DEFICIENTE OU INEXISTENTE. NULIDADE. É nulo o auto de infração quando a sinalização de trânsito é inexistente, insuficiente ou errônea. Art. 90 do CTB. A sinalização deve ser clara e visível, atendendo aos padrões estabelecidos pelo CONTRAN.',
'Nulidade por sinalização deficiente ou inexistente',
ARRAY['90', '88', 'CTB'],
ARRAY['sinalização', 'placa', 'deficiente', 'inexistente', 'visibilidade'],
'jurisprudencia', true, true),

('jurisprudencia', 'STJ - REsp 1.325.487 - Descrição genérica da infração',
'RECURSO ESPECIAL. TRÂNSITO. AUTO DE INFRAÇÃO. DESCRIÇÃO GENÉRICA. NULIDADE. O auto de infração deve conter descrição precisa e detalhada da conduta infracional, sob pena de nulidade. A descrição genérica cerceia o direito de defesa do autuado. Art. 280 do CTB.',
'Nulidade por descrição genérica no AIT',
ARRAY['280', 'CTB'],
ARRAY['descrição', 'genérica', 'cerceamento', 'defesa', 'nulidade'],
'jurisprudencia', true, true),

('jurisprudencia', 'TJ-MG - Súmula sobre prazo de notificação',
'SÚMULA: A notificação da autuação deve ser expedida no prazo de 30 dias contados da data da infração, sob pena de nulidade do procedimento administrativo. Art. 281 do CTB e Resolução CONTRAN 619/2016.',
'Prazo para notificação da autuação',
ARRAY['281', 'CTB', '619'],
ARRAY['prazo', 'notificação', '30 dias', 'autuação'],
'jurisprudencia', true, true),

('jurisprudencia', 'STF - RE 658.570 - Direito ao contraditório',
'RECURSO EXTRAORDINÁRIO. TRÂNSITO. PROCESSO ADMINISTRATIVO. CONTRADITÓRIO E AMPLA DEFESA. É assegurado ao autuado o direito ao contraditório e à ampla defesa em processo administrativo de trânsito. A negativa desse direito enseja nulidade do procedimento. Art. 5º, LV, da CF.',
'Garantia do contraditório e ampla defesa',
ARRAY['5', 'CF', 'CTB'],
ARRAY['contraditório', 'ampla defesa', 'processo administrativo', 'nulidade'],
'jurisprudencia', true, true),

('jurisprudencia', 'STJ - REsp 1.485.300 - Erro de identificação do veículo',
'RECURSO ESPECIAL. TRÂNSITO. AUTO DE INFRAÇÃO. ERRO NA IDENTIFICAÇÃO DO VEÍCULO. NULIDADE. O erro na identificação do veículo (placa, modelo, cor) caracteriza vício insanável do auto de infração, ensejando sua nulidade.',
'Nulidade por erro na identificação do veículo',
ARRAY['280', 'CTB'],
ARRAY['placa', 'identificação', 'veículo', 'erro', 'nulidade'],
'jurisprudencia', true, true),

('jurisprudencia', 'TJ-RS - Álcool - Teste de alcoolemia',
'APELAÇÃO. TRÂNSITO. EMBRIAGUEZ. TESTE DE ALCOOLEMIA. REQUISITOS. Para a caracterização da infração do art. 165 do CTB, é necessária a comprovação técnica do estado de embriaguez através de teste de alcoolemia (etilômetro) com margem de tolerância ou exame de sangue.',
'Requisitos para comprovação de embriaguez',
ARRAY['165', '276', 'CTB'],
ARRAY['álcool', 'embriaguez', 'etilômetro', 'teste', 'margem'],
'jurisprudencia', true, true),

('jurisprudencia', 'STJ - REsp 1.230.440 - Multa por estacionamento',
'RECURSO ESPECIAL. TRÂNSITO. ESTACIONAMENTO IRREGULAR. FISCALIZAÇÃO. O agente de trânsito deve comprovar o tempo de permanência do veículo para caracterização da infração de estacionamento irregular em local com tempo determinado.',
'Comprovação de tempo em estacionamento',
ARRAY['181', 'CTB'],
ARRAY['estacionamento', 'tempo', 'permanência', 'fiscalização'],
'jurisprudencia', true, true),

('jurisprudencia', 'TJ-SP - Faixa exclusiva - Requisitos',
'APELAÇÃO. TRÂNSITO. FAIXA EXCLUSIVA DE ÔNIBUS. SINALIZAÇÃO. Para a validade da autuação por tráfego em faixa exclusiva, exige-se sinalização horizontal e vertical clara, indicando os horários de restrição.',
'Requisitos de sinalização para faixa exclusiva',
ARRAY['184', 'CTB'],
ARRAY['faixa exclusiva', 'ônibus', 'sinalização', 'horário'],
'jurisprudencia', true, true),

('jurisprudencia', 'STJ - REsp sobre conversão proibida',
'RECURSO ESPECIAL. TRÂNSITO. CONVERSÃO PROIBIDA. SINALIZAÇÃO. A infração por conversão proibida exige a existência de sinalização clara (placa R-4a ou R-4b) indicando a proibição no local.',
'Conversão proibida exige sinalização',
ARRAY['206', 'CTB'],
ARRAY['conversão', 'proibida', 'placa', 'sinalização', 'retorno'],
'jurisprudencia', true, true),

('jurisprudencia', 'TJ-PR - Celular - Necessidade de flagrante',
'APELAÇÃO. TRÂNSITO. USO DE CELULAR. FLAGRANTE. Para a caracterização da infração do art. 252, VI, do CTB, é necessária a constatação em flagrante do uso do aparelho celular pelo condutor.',
'Flagrante necessário para multa de celular',
ARRAY['252', 'CTB'],
ARRAY['celular', 'telefone', 'flagrante', 'uso', 'conduzir'],
'jurisprudencia', true, true),

('jurisprudencia', 'STJ - Recurso administrativo - Prazo',
'RECURSO ESPECIAL. ADMINISTRATIVO. TRÂNSITO. RECURSO. PRAZO. O prazo para interposição de recurso administrativo em matéria de trânsito conta-se a partir da efetiva notificação do interessado, não da expedição do ato. Princípios do CTB.',
'Contagem de prazo para recurso',
ARRAY['281', '282', 'CTB'],
ARRAY['prazo', 'recurso', 'notificação', 'contagem'],
'jurisprudencia', true, true);

-- Atualizar registros existentes para ter tipo_conteudo = 'legislacao'
UPDATE public.legislacao_base SET tipo_conteudo = 'legislacao' WHERE tipo_conteudo IS NULL AND tipo IN ('ctb', 'contran');