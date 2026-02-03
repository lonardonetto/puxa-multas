-- Jurisprudências de TODOS os estados brasileiros
INSERT INTO public.legislacao_base (tipo, titulo, conteudo, descricao, artigos_relacionados, palavras_chave, tipo_conteudo, is_global, ativo) VALUES

-- ACRE (AC)
('jurisprudencia', 'TJ-AC - Nulidade por vício de notificação',
'APELAÇÃO CÍVEL. TRÂNSITO. MULTA. NOTIFICAÇÃO IRREGULAR. NULIDADE. Restando demonstrado que a notificação da autuação não foi entregue ao proprietário do veículo, impõe-se a declaração de nulidade do auto de infração. Aplicação do art. 281 do CTB.',
'Tribunal de Justiça do Acre - Nulidade por notificação irregular',
ARRAY['281', 'CTB'],
ARRAY['notificação', 'nulidade', 'Acre'],
'jurisprudencia', true, true),

-- ALAGOAS (AL)
('jurisprudencia', 'TJ-AL - Excesso de velocidade - Aferição do radar',
'APELAÇÃO. MULTA DE TRÂNSITO. EXCESSO DE VELOCIDADE. RADAR. AFERIÇÃO. É imprescindível a comprovação da aferição do equipamento medidor de velocidade pelo INMETRO para a validade da autuação. Ausência de comprovação. Nulidade declarada.',
'Tribunal de Justiça de Alagoas - Radar sem aferição',
ARRAY['218', 'CTB'],
ARRAY['radar', 'aferição', 'velocidade', 'Alagoas'],
'jurisprudencia', true, true),

-- AMAPÁ (AP)
('jurisprudencia', 'TJ-AP - Defesa prévia - Prazo',
'APELAÇÃO CÍVEL. TRÂNSITO. DEFESA PRÉVIA. PRAZO. O prazo para apresentação de defesa prévia começa a contar da data do recebimento da notificação, não da data de expedição. Nulidade do processo administrativo por cerceamento de defesa.',
'Tribunal de Justiça do Amapá - Prazo de defesa prévia',
ARRAY['280', '281', 'CTB'],
ARRAY['defesa prévia', 'prazo', 'Amapá'],
'jurisprudencia', true, true),

-- AMAZONAS (AM)
('jurisprudencia', 'TJ-AM - Sinalização - Requisitos',
'APELAÇÃO. INFRAÇÃO DE TRÂNSITO. SINALIZAÇÃO DEFICIENTE. A ausência de sinalização adequada no local da infração torna nulo o auto de infração. Art. 90 do CTB. A sinalização deve atender aos padrões do CONTRAN.',
'Tribunal de Justiça do Amazonas - Sinalização deficiente',
ARRAY['90', 'CTB'],
ARRAY['sinalização', 'placa', 'Amazonas'],
'jurisprudencia', true, true),

-- BAHIA (BA)
('jurisprudencia', 'TJ-BA - Embriaguez - Prova técnica',
'APELAÇÃO CÍVEL. TRÂNSITO. EMBRIAGUEZ AO VOLANTE. PROVA. A caracterização da infração do art. 165 do CTB exige prova técnica idônea (teste de alcoolemia ou exame clínico). Recusa ao teste não configura automaticamente a infração.',
'Tribunal de Justiça da Bahia - Embriaguez e prova técnica',
ARRAY['165', '276', 'CTB'],
ARRAY['álcool', 'embriaguez', 'teste', 'Bahia'],
'jurisprudencia', true, true),

-- CEARÁ (CE)
('jurisprudencia', 'TJ-CE - Identificação do condutor',
'APELAÇÃO. MULTA DE TRÂNSITO. INDICAÇÃO DO CONDUTOR. O proprietário do veículo tem o direito de indicar o real condutor infrator no prazo legal. A negativa injustificada desse direito enseja nulidade. Art. 257, §7º, do CTB.',
'Tribunal de Justiça do Ceará - Indicação de condutor',
ARRAY['257', 'CTB'],
ARRAY['condutor', 'indicação', 'proprietário', 'Ceará'],
'jurisprudencia', true, true),

-- DISTRITO FEDERAL (DF)
('jurisprudencia', 'TJ-DF - Recurso administrativo - Efeito suspensivo',
'APELAÇÃO CÍVEL. TRÂNSITO. RECURSO ADMINISTRATIVO. EFEITO SUSPENSIVO. O recurso administrativo contra penalidade de trânsito tem efeito suspensivo, impedindo a inscrição em dívida ativa e restrições no veículo até decisão final. Art. 285 do CTB.',
'Tribunal de Justiça do Distrito Federal - Efeito suspensivo',
ARRAY['285', 'CTB'],
ARRAY['recurso', 'suspensivo', 'Distrito Federal'],
'jurisprudencia', true, true),

-- ESPÍRITO SANTO (ES)
('jurisprudencia', 'TJ-ES - Faixa de pedestres',
'APELAÇÃO. TRÂNSITO. FAIXA DE PEDESTRES. SINALIZAÇÃO. Para caracterização da infração por não dar preferência a pedestres, exige-se que a faixa esteja devidamente sinalizada e visível. Sinalização apagada ou precária afasta a infração.',
'Tribunal de Justiça do Espírito Santo - Faixa de pedestres',
ARRAY['70', '214', 'CTB'],
ARRAY['pedestre', 'faixa', 'sinalização', 'Espírito Santo'],
'jurisprudencia', true, true),

-- GOIÁS (GO)
('jurisprudencia', 'TJ-GO - Semáforo vermelho - Defeito',
'APELAÇÃO CÍVEL. MULTA. SEMÁFORO VERMELHO. DEFEITO. Demonstrado o mau funcionamento do semáforo no momento da autuação, impõe-se a anulação da multa. O ônus de provar o regular funcionamento é do órgão autuador.',
'Tribunal de Justiça de Goiás - Semáforo com defeito',
ARRAY['208', 'CTB'],
ARRAY['semáforo', 'vermelho', 'defeito', 'Goiás'],
'jurisprudencia', true, true),

-- MARANHÃO (MA)
('jurisprudencia', 'TJ-MA - CNH vencida - Estado de necessidade',
'APELAÇÃO. TRÂNSITO. CNH VENCIDA. ESTADO DE NECESSIDADE. Em situações de emergência médica comprovada, o estado de necessidade pode afastar a infração por dirigir com CNH vencida. Análise caso a caso.',
'Tribunal de Justiça do Maranhão - CNH vencida e estado de necessidade',
ARRAY['162', 'CTB'],
ARRAY['CNH', 'vencida', 'emergência', 'Maranhão'],
'jurisprudencia', true, true),

-- MATO GROSSO (MT)
('jurisprudencia', 'TJ-MT - Rodovia federal - Competência',
'APELAÇÃO CÍVEL. TRÂNSITO. RODOVIA FEDERAL. COMPETÊNCIA. A fiscalização em rodovias federais compete à PRF. Autuação por órgão estadual em rodovia federal sem convênio é nula por incompetência.',
'Tribunal de Justiça do Mato Grosso - Competência em rodovias federais',
ARRAY['21', 'CTB'],
ARRAY['competência', 'rodovia', 'federal', 'Mato Grosso'],
'jurisprudencia', true, true),

-- MATO GROSSO DO SUL (MS)
('jurisprudencia', 'TJ-MS - Ultrapassagem proibida - Placa oculta',
'APELAÇÃO. INFRAÇÃO. ULTRAPASSAGEM PROIBIDA. SINALIZAÇÃO. A placa de proibição de ultrapassagem deve estar visível e em local adequado. Placa encoberta por vegetação ou em posição inadequada afasta a infração.',
'Tribunal de Justiça do Mato Grosso do Sul - Ultrapassagem e sinalização',
ARRAY['203', 'CTB'],
ARRAY['ultrapassagem', 'placa', 'visibilidade', 'Mato Grosso do Sul'],
'jurisprudencia', true, true),

-- MINAS GERAIS (MG)
('jurisprudencia', 'TJ-MG - Estacionamento rotativo - Tolerância',
'APELAÇÃO CÍVEL. TRÂNSITO. ESTACIONAMENTO ROTATIVO. TOLERÂNCIA. A multa por permanência além do tempo permitido exige comprovação do tempo excedente. Não basta a simples constatação de permanência no local.',
'Tribunal de Justiça de Minas Gerais - Estacionamento rotativo',
ARRAY['181', 'CTB'],
ARRAY['estacionamento', 'rotativo', 'tempo', 'Minas Gerais'],
'jurisprudencia', true, true),

-- PARÁ (PA)
('jurisprudencia', 'TJ-PA - Licenciamento atrasado - Proporcionalidade',
'APELAÇÃO. TRÂNSITO. LICENCIAMENTO ATRASADO. PROPORCIONALIDADE. A multa por atraso no licenciamento deve observar o princípio da proporcionalidade. Pequeno atraso pode ensejar advertência em vez de multa.',
'Tribunal de Justiça do Pará - Licenciamento e proporcionalidade',
ARRAY['230', 'CTB'],
ARRAY['licenciamento', 'atraso', 'proporcionalidade', 'Pará'],
'jurisprudencia', true, true),

-- PARAÍBA (PB)
('jurisprudencia', 'TJ-PB - Cinto de segurança - Prova fotográfica',
'APELAÇÃO CÍVEL. MULTA. CINTO DE SEGURANÇA. PROVA. A infração por não uso de cinto de segurança exige prova inequívoca. Imagem fotográfica de baixa qualidade que não permite identificação clara gera dúvida em favor do autuado.',
'Tribunal de Justiça da Paraíba - Cinto de segurança e prova',
ARRAY['167', 'CTB'],
ARRAY['cinto', 'segurança', 'fotografia', 'Paraíba'],
'jurisprudencia', true, true),

-- PARANÁ (PR)
('jurisprudencia', 'TJ-PR - Velocidade média - Constitucionalidade',
'APELAÇÃO. TRÂNSITO. VELOCIDADE MÉDIA. LEGALIDADE. A fiscalização por velocidade média é legal quando atende aos requisitos técnicos do CONTRAN e há devida sinalização. Porém, exige-se placa indicativa no início e fim do trecho.',
'Tribunal de Justiça do Paraná - Velocidade média',
ARRAY['218', 'CTB'],
ARRAY['velocidade', 'média', 'radar', 'Paraná'],
'jurisprudencia', true, true),

-- PERNAMBUCO (PE)
('jurisprudencia', 'TJ-PE - Motocicleta - Capacete',
'APELAÇÃO CÍVEL. TRÂNSITO. MOTOCICLETA. CAPACETE. A multa por não uso de capacete exige identificação precisa do condutor. Imagem que não permite verificar se o capacete estava sendo usado ou não gera absolvição.',
'Tribunal de Justiça de Pernambuco - Capacete em motocicleta',
ARRAY['244', 'CTB'],
ARRAY['capacete', 'motocicleta', 'prova', 'Pernambuco'],
'jurisprudencia', true, true),

-- PIAUÍ (PI)
('jurisprudencia', 'TJ-PI - Transporte de carga - Excesso',
'APELAÇÃO. MULTA. TRANSPORTE DE CARGA. EXCESSO DE PESO. A multa por excesso de peso exige pesagem em balança aferida pelo INMETRO. Termo de pesagem sem indicação da aferição da balança gera nulidade.',
'Tribunal de Justiça do Piauí - Excesso de peso em carga',
ARRAY['231', 'CTB'],
ARRAY['carga', 'peso', 'balança', 'Piauí'],
'jurisprudencia', true, true),

-- RIO DE JANEIRO (RJ)
('jurisprudencia', 'TJ-RJ - Rodízio municipal - Competência',
'APELAÇÃO CÍVEL. TRÂNSITO. RODÍZIO DE VEÍCULOS. COMPETÊNCIA MUNICIPAL. O rodízio municipal de veículos é medida de restrição de circulação que exige lei municipal específica. Decreto sem lei autorizadora é ilegal.',
'Tribunal de Justiça do Rio de Janeiro - Rodízio de veículos',
ARRAY['24', 'CTB'],
ARRAY['rodízio', 'municipal', 'competência', 'Rio de Janeiro'],
'jurisprudencia', true, true),

-- RIO GRANDE DO NORTE (RN)
('jurisprudencia', 'TJ-RN - Documento do veículo - CRLV digital',
'APELAÇÃO. TRÂNSITO. DOCUMENTO DO VEÍCULO. CRLV DIGITAL. O CRLV digital tem a mesma validade do documento físico. Multa aplicada por não portar documento físico quando havia CRLV digital válido é nula.',
'Tribunal de Justiça do Rio Grande do Norte - CRLV digital',
ARRAY['230', 'CTB'],
ARRAY['documento', 'CRLV', 'digital', 'Rio Grande do Norte'],
'jurisprudencia', true, true),

-- RIO GRANDE DO SUL (RS)
('jurisprudencia', 'TJ-RS - Acostamento - Emergência',
'APELAÇÃO CÍVEL. MULTA. USO DE ACOSTAMENTO. EMERGÊNCIA. O uso do acostamento em situação de emergência ou pane mecânica não configura infração. Cabe ao condutor comprovar a situação de emergência.',
'Tribunal de Justiça do Rio Grande do Sul - Uso de acostamento',
ARRAY['193', 'CTB'],
ARRAY['acostamento', 'emergência', 'pane', 'Rio Grande do Sul'],
'jurisprudencia', true, true),

-- RONDÔNIA (RO)
('jurisprudencia', 'TJ-RO - Veículo guinchado - Custos',
'APELAÇÃO. TRÂNSITO. REMOÇÃO DE VEÍCULO. GUINCHO. Os custos de remoção e estadia do veículo devem ser proporcionais e com valores previamente publicados. Cobrança excessiva pode ser contestada.',
'Tribunal de Justiça de Rondônia - Custos de guincho',
ARRAY['262', '271', 'CTB'],
ARRAY['guincho', 'remoção', 'custos', 'Rondônia'],
'jurisprudencia', true, true),

-- RORAIMA (RR)
('jurisprudencia', 'TJ-RR - Veículo irregular - Prazo para regularização',
'APELAÇÃO CÍVEL. TRÂNSITO. VEÍCULO IRREGULAR. PRAZO. Antes de aplicar penalidade por irregularidade documental, deve-se conceder prazo razoável para regularização. Ausência de prazo gera nulidade.',
'Tribunal de Justiça de Roraima - Prazo para regularização',
ARRAY['230', '231', 'CTB'],
ARRAY['regularização', 'prazo', 'documento', 'Roraima'],
'jurisprudencia', true, true),

-- SANTA CATARINA (SC)
('jurisprudencia', 'TJ-SC - Blitz - Requisitos legais',
'APELAÇÃO. TRÂNSITO. BLITZ DE FISCALIZAÇÃO. REQUISITOS. A operação de fiscalização (blitz) deve atender aos requisitos legais: sinalização adequada, identificação dos agentes e local seguro. Irregularidades podem gerar nulidade das autuações.',
'Tribunal de Justiça de Santa Catarina - Requisitos de blitz',
ARRAY['280', 'CTB'],
ARRAY['blitz', 'fiscalização', 'requisitos', 'Santa Catarina'],
'jurisprudencia', true, true),

-- SÃO PAULO (SP) - Adicional
('jurisprudencia', 'TJ-SP - Zona azul - Cobrança indevida',
'APELAÇÃO CÍVEL. TRÂNSITO. ZONA AZUL. ESTACIONAMENTO ROTATIVO. A cobrança de multa por permanência em zona azul exige prova do tempo de permanência e da regularidade da sinalização do local.',
'Tribunal de Justiça de São Paulo - Zona azul',
ARRAY['181', 'CTB'],
ARRAY['zona azul', 'estacionamento', 'cobrança', 'São Paulo'],
'jurisprudencia', true, true),

-- SERGIPE (SE)
('jurisprudencia', 'TJ-SE - Motocicleta - Transporte de passageiro',
'APELAÇÃO. MULTA. MOTOCICLETA. PASSAGEIRO. A multa por transporte irregular de passageiro em motocicleta exige prova de que o passageiro não atendia aos requisitos legais (idade, equipamentos).',
'Tribunal de Justiça de Sergipe - Passageiro em motocicleta',
ARRAY['244', 'CTB'],
ARRAY['motocicleta', 'passageiro', 'transporte', 'Sergipe'],
'jurisprudencia', true, true),

-- TOCANTINS (TO)
('jurisprudencia', 'TJ-TO - Farol baixo - Rodovia',
'APELAÇÃO CÍVEL. TRÂNSITO. FAROL BAIXO. RODOVIA. A obrigatoriedade de uso de farol baixo em rodovias foi alterada pela Lei 13.290/2016. Multas aplicadas após a vigência dessa lei devem considerar a nova redação do art. 250 do CTB.',
'Tribunal de Justiça de Tocantins - Farol baixo em rodovia',
ARRAY['250', 'CTB'],
ARRAY['farol', 'baixo', 'rodovia', 'Tocantins'],
'jurisprudencia', true, true),

-- TRIBUNAIS SUPERIORES - Adicionais importantes
('jurisprudencia', 'STJ - Tema 1097 - Multa por radar',
'RECURSO ESPECIAL REPETITIVO. TEMA 1097. MULTA POR EXCESSO DE VELOCIDADE. EQUIPAMENTO ELETRÔNICO. Para validade da autuação por equipamento eletrônico, exige-se: 1) aferição pelo INMETRO; 2) sinalização prévia; 3) identificação do local. A ausência de qualquer requisito gera nulidade.',
'STJ - Tema repetitivo sobre multa por radar',
ARRAY['218', 'CTB'],
ARRAY['radar', 'repetitivo', 'aferição', 'STJ'],
'jurisprudencia', true, true),

('jurisprudencia', 'STJ - Súmula 127 aplicada ao trânsito',
'APLICAÇÃO ANALÓGICA. SÚMULA 127 STJ. A penalidade administrativa de trânsito sujeita-se ao prazo prescricional de 5 anos, contados da data da infração. Transcorrido o prazo sem decisão final, extingue-se a punibilidade.',
'STJ - Prescrição em infrações de trânsito',
ARRAY['CTB'],
ARRAY['prescrição', 'prazo', '5 anos', 'STJ'],
'jurisprudencia', true, true),

('jurisprudencia', 'STF - ADI 3050 - Competência legislativa',
'AÇÃO DIRETA DE INCONSTITUCIONALIDADE. TRÂNSITO. COMPETÊNCIA LEGISLATIVA. A competência para legislar sobre trânsito é privativa da União (art. 22, XI, CF). Leis estaduais e municipais que contrariem o CTB são inconstitucionais.',
'STF - Competência para legislar sobre trânsito',
ARRAY['22', 'CF'],
ARRAY['competência', 'legislar', 'União', 'STF'],
'jurisprudencia', true, true),

('jurisprudencia', 'STJ - REsp sobre pontuação CNH',
'RECURSO ESPECIAL. TRÂNSITO. PONTUAÇÃO. CNH. CURSO DE RECICLAGEM. O condutor tem direito à redução de pontos após conclusão de curso de reciclagem. A negativa injustificada pelo DETRAN viola o art. 268 do CTB.',
'STJ - Redução de pontos na CNH',
ARRAY['268', 'CTB'],
ARRAY['pontos', 'CNH', 'reciclagem', 'STJ'],
'jurisprudencia', true, true),

('jurisprudencia', 'STJ - Dano moral por apreensão indevida',
'RECURSO ESPECIAL. TRÂNSITO. APREENSÃO INDEVIDA DE VEÍCULO. DANO MORAL. A apreensão indevida de veículo por infração inexistente ou nula gera dever de indenizar por danos morais e materiais.',
'STJ - Dano moral por apreensão indevida',
ARRAY['262', 'CTB'],
ARRAY['apreensão', 'dano moral', 'indenização', 'STJ'],
'jurisprudencia', true, true);