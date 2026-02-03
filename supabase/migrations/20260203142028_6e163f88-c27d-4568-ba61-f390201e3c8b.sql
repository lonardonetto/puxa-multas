-- INSERIR ARTIGOS DO CTB ESSENCIAIS PARA RECURSOS DE MULTA

-- Artigos sobre Condutores e Veículos
INSERT INTO public.legislacao_base (tipo, titulo, conteudo, artigos_relacionados, palavras_chave, is_global, ativo)
VALUES 
('ctb', 'Art. 161 CTB - Habilitação', 
'Art. 161. Constitui infração de trânsito a inobservância de qualquer preceito deste Código, da legislação complementar ou das resoluções do CONTRAN, sendo o infrator sujeito às penalidades e medidas administrativas indicadas em cada artigo, além das punições previstas no Capítulo XIX.
Parágrafo único. As infrações cometidas em relação às resoluções do CONTRAN terão suas penalidades e medidas administrativas definidas nas próprias resoluções.',
ARRAY['art_161', 'habilitacao'], ARRAY['habilitação', 'condução', 'cnh'], true, true),

('ctb', 'Art. 162 CTB - Dirigir sem habilitação', 
'Art. 162. Dirigir veículo:
I - sem possuir Carteira Nacional de Habilitação, Permissão para Dirigir ou Autorização para Conduzir Ciclomotor: Infração - gravíssima; Penalidade - multa (três vezes); Medida administrativa - retenção do veículo até a apresentação de condutor habilitado;
II - com Carteira Nacional de Habilitação, Permissão para Dirigir ou Autorização para Conduzir Ciclomotor cassada ou com suspensão do direito de dirigir: Infração - gravíssima; Penalidade - multa (três vezes); Medida administrativa - recolhimento do documento de habilitação e retenção do veículo até a apresentação de condutor habilitado;
III - com Carteira Nacional de Habilitação ou Permissão para Dirigir de categoria diferente da do veículo que esteja conduzindo: Infração - gravíssima; Penalidade - multa (duas vezes); Medida administrativa - retenção do veículo até a apresentação de condutor habilitado;
IV - com validade da Carteira Nacional de Habilitação vencida há mais de trinta dias: Infração - gravíssima; Penalidade - multa; Medida administrativa - recolhimento da Carteira Nacional de Habilitação e retenção do veículo até a apresentação de condutor habilitado;
V - sem usar lentes corretoras de visão, aparelho auxiliar de audição, de prótese física ou as adaptações do veículo impostas por ocasião da concessão ou da renovação da licença para conduzir: Infração - gravíssima; Penalidade - multa; Medida administrativa - retenção do veículo até o saneamento da irregularidade ou apresentação de condutor habilitado.',
ARRAY['art_162'], ARRAY['habilitação', 'cnh', 'dirigir', 'categoria'], true, true),

('ctb', 'Art. 163 CTB - Entregar veículo a pessoa não habilitada', 
'Art. 163. Entregar a direção do veículo a pessoa nas condições previstas no artigo anterior:
Infração - gravíssima;
Penalidade - multa (três vezes) se o infrator for o condutor do veículo, sem prejuízo da multa prevista no inciso I do art. 162 e de outras providências legais cabíveis;
Medida administrativa - retenção do veículo até a apresentação de condutor habilitado.',
ARRAY['art_163', 'art_162'], ARRAY['entregar', 'veículo', 'habilitação'], true, true),

('ctb', 'Art. 165 CTB - Dirigir sob influência de álcool', 
'Art. 165. Dirigir sob a influência de álcool ou de qualquer outra substância psicoativa que determine dependência:
Infração - gravíssima;
Penalidade - multa (dez vezes) e suspensão do direito de dirigir por 12 (doze) meses;
Medida administrativa - recolhimento do documento de habilitação e retenção do veículo, observado o disposto no § 4º do art. 270 da Lei nº 9.503, de 23 de setembro de 1997 - Código de Trânsito Brasileiro.
Parágrafo único. A embriaguez também poderá ser apurada na forma do art. 277.',
ARRAY['art_165', 'art_277', 'art_270'], ARRAY['álcool', 'embriaguez', 'etilômetro', 'bafômetro'], true, true),

('ctb', 'Art. 165-A CTB - Recusa ao teste do bafômetro', 
'Art. 165-A. Recusar-se a ser submetido a teste, exame clínico, perícia ou outro procedimento que permita certificar influência de álcool ou outra substância psicoativa, na forma estabelecida pelo art. 277:
Infração - gravíssima;
Penalidade - multa (dez vezes) e suspensão do direito de dirigir por 12 (doze) meses;
Medida administrativa - recolhimento do documento de habilitação e retenção do veículo, observado o disposto no § 4º do art. 270.',
ARRAY['art_165-a', 'art_277', 'art_270'], ARRAY['recusa', 'bafômetro', 'teste', 'etilômetro'], true, true),

('ctb', 'Art. 166 CTB - Entregar veículo a pessoa embriagada', 
'Art. 166. Confiar ou entregar a direção de veículo a pessoa que, mesmo habilitada, por seu estado físico ou psíquico, não estiver em condições de dirigi-lo com segurança:
Infração - gravíssima;
Penalidade - multa.',
ARRAY['art_166'], ARRAY['entregar', 'condições', 'embriaguez'], true, true),

('ctb', 'Art. 167 CTB - Disputar corrida', 
'Art. 167. Deixar o condutor ou passageiro de usar o cinto de segurança, conforme previsto no art. 65:
Infração - grave;
Penalidade - multa;
Medida administrativa - retenção do veículo até colocação do cinto pelo infrator.',
ARRAY['art_167', 'art_65'], ARRAY['cinto', 'segurança'], true, true),

('ctb', 'Art. 168 CTB - Transportar crianças sem dispositivo de retenção', 
'Art. 168. Transportar crianças em veículo automotor sem observância das normas de segurança especiais estabelecidas neste Código:
Infração - gravíssima;
Penalidade - multa;
Medida administrativa - retenção do veículo até que a irregularidade seja sanada.',
ARRAY['art_168'], ARRAY['criança', 'cadeirinha', 'retenção'], true, true),

('ctb', 'Art. 169 CTB - Dirigir sem atenção ou cuidados indispensáveis', 
'Art. 169. Dirigir sem atenção ou sem os cuidados indispensáveis à segurança:
Infração - leve;
Penalidade - multa.',
ARRAY['art_169'], ARRAY['atenção', 'cuidados', 'segurança'], true, true),

('ctb', 'Art. 170 CTB - Dirigir ameaçando pedestres ou outros veículos', 
'Art. 170. Dirigir ameaçando os pedestres que estejam atravessando a via pública, ou os demais veículos:
Infração - gravíssima;
Penalidade - multa e suspensão do direito de dirigir;
Medida administrativa - retenção do veículo e recolhimento do documento de habilitação.',
ARRAY['art_170'], ARRAY['ameaça', 'pedestre', 'veículo'], true, true),

('ctb', 'Art. 171 CTB - Usar veículo para arremessar água ou detritos', 
'Art. 171. Usar o veículo para arremessar, sobre os pedestres ou veículos, água ou detritos:
Infração - média;
Penalidade - multa.',
ARRAY['art_171'], ARRAY['arremessar', 'água', 'detritos'], true, true),

('ctb', 'Art. 172 CTB - Atirar objetos ou substâncias', 
'Art. 172. Atirar do veículo ou abandonar na via objetos ou substâncias:
Infração - média;
Penalidade - multa.',
ARRAY['art_172'], ARRAY['atirar', 'objetos', 'lixo'], true, true),

('ctb', 'Art. 173 CTB - Disputar corrida', 
'Art. 173. Disputar corrida:
Infração - gravíssima;
Penalidade - multa (três vezes), suspensão do direito de dirigir e apreensão do veículo;
Medida administrativa - recolhimento do documento de habilitação e remoção do veículo.',
ARRAY['art_173'], ARRAY['corrida', 'racha', 'disputa'], true, true),

('ctb', 'Art. 174 CTB - Promover competição esportiva sem autorização', 
'Art. 174. Promover, na via, competição esportiva, eventos organizados, exibição e demonstração de perícia em manobra de veículo, ou deles participar, como condutor, sem permissão da autoridade de trânsito com circunscrição sobre a via:
Infração - gravíssima;
Penalidade - multa (cinco vezes), suspensão do direito de dirigir e apreensão do veículo;
Medida administrativa - recolhimento do documento de habilitação e remoção do veículo.',
ARRAY['art_174'], ARRAY['competição', 'evento', 'manobra'], true, true),

('ctb', 'Art. 175 CTB - Utilizar-se de veículo para fins ilícitos', 
'Art. 175. Utilizar-se de veículo para, em via pública, demonstrar ou exibir manobra perigosa, mediante arrancada brusca, derrapagem ou frenagem com deslizamento ou arrastamento de pneus:
Infração - gravíssima;
Penalidade - multa (dez vezes), suspensão do direito de dirigir e apreensão do veículo;
Medida administrativa - recolhimento do documento de habilitação e remoção do veículo.',
ARRAY['art_175'], ARRAY['manobra', 'perigosa', 'arrancada', 'derrapagem'], true, true),

('ctb', 'Art. 176 CTB - Deixar condutor envolvido em acidente de prestar socorro', 
'Art. 176. Deixar o condutor envolvido em acidente com vítima:
I - de prestar ou providenciar socorro à vítima, podendo fazê-lo;
II - de adotar providências, podendo fazê-lo, no sentido de evitar perigo para o trânsito no local;
III - de preservar o local, de forma a facilitar os trabalhos da polícia e da perícia;
IV - de adotar providências para remover o veículo do local, quando determinadas por policial ou agente da autoridade de trânsito;
V - de identificar-se ao policial e de lhe prestar informações necessárias à confecção do boletim de ocorrência:
Infração - gravíssima;
Penalidade - multa (cinco vezes) e suspensão do direito de dirigir;
Medida administrativa - recolhimento do documento de habilitação.',
ARRAY['art_176'], ARRAY['acidente', 'socorro', 'vítima', 'omissão'], true, true),

('ctb', 'Art. 177 CTB - Deixar condutor de prestar socorro em acidente sem vítima', 
'Art. 177. Deixar o condutor de prestar socorro à vítima de acidente de trânsito quando solicitado pela autoridade e seus agentes:
Infração - grave;
Penalidade - multa.',
ARRAY['art_177'], ARRAY['socorro', 'solicitado'], true, true),

('ctb', 'Art. 178 CTB - Deixar de sinalizar obstáculo', 
'Art. 178. Deixar o condutor, envolvido em acidente sem vítima, de adotar providências para remover o veículo do local, quando necessária tal medida para assegurar a segurança e a fluidez do trânsito:
Infração - média;
Penalidade - multa.',
ARRAY['art_178'], ARRAY['acidente', 'remover', 'fluidez'], true, true),

('ctb', 'Art. 179 CTB - Fazer ou deixar que se faça reparo em veículo na via', 
'Art. 179. Fazer ou deixar que se faça reparo em veículo na via pública, salvo nos casos de impedimento absoluto de sua remoção e em que o veículo esteja devidamente sinalizado:
I - em pista de rolamento de rodovias e vias de trânsito rápido: Infração - grave; Penalidade - multa;
II - nas demais vias: Infração - leve; Penalidade - multa.',
ARRAY['art_179'], ARRAY['reparo', 'via', 'manutenção'], true, true),

('ctb', 'Art. 180 CTB - Ter CNH ou PPD cassada', 
'Art. 180. Ter seu veículo imobilizado na via por falta de combustível:
Infração - média;
Penalidade - multa;
Medida administrativa - remoção do veículo.',
ARRAY['art_180'], ARRAY['combustível', 'imobilizado'], true, true),

('ctb', 'Art. 181 CTB - Transitar com veículo sem documentação', 
'Art. 181. Transitar com o veículo:
I - danificando a via, suas instalações e equipamentos: Infração - grave; Penalidade - multa;
II - derramando, lançando ou arrastando sobre a via: carga que esteja transportando; combustível ou lubrificante que esteja utilizando; ou qualquer objeto que possa acarretar risco de acidente: Infração - grave; Penalidade - multa;
III - produzindo fumaça, gases ou partículas em níveis superiores aos fixados pelo CONTRAN: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização;
IV - com suas dimensões ou de sua carga superiores aos limites estabelecidos legalmente ou pela sinalização, sem autorização: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização;
V - com excesso de peso, admitido percentual de tolerância quando aferido por equipamento, na forma a ser estabelecida pelo CONTRAN: Infração - média; Penalidade - multa acrescida a cada duzentos quilogramas ou fração de excesso de peso apurado, constante na seguinte tabela...',
ARRAY['art_181'], ARRAY['carga', 'peso', 'excesso', 'fumaça'], true, true),

('ctb', 'Art. 182 CTB - Parar o veículo', 
'Art. 182. Parar o veículo:
I - nas esquinas e a menos de cinco metros do bordo do alinhamento da via transversal: Infração - média; Penalidade - multa;
II - afastado da guia da calçada (meio-fio) de cinqüenta centímetros a um metro: Infração - leve; Penalidade - multa;
III - afastado da guia da calçada (meio-fio) a mais de um metro: Infração - média; Penalidade - multa;
IV - em desacordo com as posições estabelecidas neste Código: Infração - leve; Penalidade - multa;
V - na pista de rolamento das estradas, das rodovias, das vias de trânsito rápido e das vias dotadas de acostamento: Infração - grave; Penalidade - multa;
VI - no passeio ou sobre faixa destinada a pedestres, nas ilhas, refúgios, ao lado ou sobre canteiros centrais, divisores de pista de rolamento, marcas de canalização, gramados ou jardim público: Infração - leve; Penalidade - multa;
VII - na área de cruzamento de vias, prejudicando a circulação de veículos e pedestres: Infração - média; Penalidade - multa;
VIII - nos viadutos, pontes e túneis: Infração - grave; Penalidade - multa;
IX - na contramão de direção: Infração - média; Penalidade - multa;
X - em aclive ou declive, não estando devidamente freado e sem calço de segurança, quando se tratar de veículo com peso bruto total superior a três mil e quinhentos quilogramas: Infração - grave; Penalidade - multa; Medida administrativa - remoção do veículo.',
ARRAY['art_182'], ARRAY['parar', 'estacionar', 'esquina'], true, true),

('ctb', 'Art. 183 CTB - Parar em local proibido pela sinalização', 
'Art. 183. Parar o veículo sobre a faixa de pedestres na mudança de sinal luminoso:
Infração - média;
Penalidade - multa.',
ARRAY['art_183'], ARRAY['faixa', 'pedestres', 'semáforo'], true, true),

('ctb', 'Art. 184 CTB - Transitar com veículo na faixa de pedestres', 
'Art. 184. Transitar com o veículo:
I - na faixa ou via exclusiva destinadas ao transporte público coletivo de passageiros: Infração - grave; Penalidade - multa e apreensão do veículo;
II - nas calçadas, passeios, passarelas, ciclovias, ciclofaixas, ilhas, refúgios, ajardinamentos, canteiros centrais e divisores de pista de rolamento e acostamentos: Infração - gravíssima; Penalidade - multa (três vezes).',
ARRAY['art_184'], ARRAY['faixa', 'exclusiva', 'calçada', 'ciclovia'], true, true);

-- Continuar com mais artigos essenciais
INSERT INTO public.legislacao_base (tipo, titulo, conteudo, artigos_relacionados, palavras_chave, is_global, ativo)
VALUES 
('ctb', 'Art. 185 CTB - Estacionar veículo em desacordo', 
'Art. 185. Quando o veículo estiver em movimento, deixar de conservá-lo:
I - na faixa a ele destinada pela sinalização de regulamentação, exceto em situações de emergência: Infração - média; Penalidade - multa;
II - nas faixas da direita, os veículos lentos e de maior porte: Infração - média; Penalidade - multa.',
ARRAY['art_185'], ARRAY['faixa', 'direita', 'lento'], true, true),

('ctb', 'Art. 186 CTB - Transitar pela contramão', 
'Art. 186. Transitar pela contramão de direção em:
I - vias com duplo sentido de circulação, exceto para ultrapassar outro veículo e apenas pelo tempo necessário, respeitada a preferência do veículo que transitar em sentido contrário: Infração - grave; Penalidade - multa;
II - vias com sinalização de regulamentação de sentido único de circulação: Infração - gravíssima; Penalidade - multa.',
ARRAY['art_186'], ARRAY['contramão', 'sentido', 'direção'], true, true),

('ctb', 'Art. 187 CTB - Transitar em local não permitido', 
'Art. 187. Transitar em locais e horários não permitidos pela regulamentação estabelecida para o trânsito:
I - de veículos de carga: Infração - média; Penalidade - multa;
II - de veículos de transporte coletivo e de carga quando utilizados no transporte de trabalhadores: Infração - grave; Penalidade - multa e apreensão do veículo.',
ARRAY['art_187'], ARRAY['horário', 'local', 'restrição'], true, true),

('ctb', 'Art. 188 CTB - Transitar ao lado de outro veículo', 
'Art. 188. Transitar ao lado de outro veículo, interrompendo ou perturbando o trânsito:
Infração - média;
Penalidade - multa.',
ARRAY['art_188'], ARRAY['lado', 'paralelo', 'trânsito'], true, true),

('ctb', 'Art. 189 CTB - Deixar de dar passagem a veículos de emergência', 
'Art. 189. Deixar de dar passagem aos veículos precedidos de batedores, de ## socorro de incêndio e salvamento, de polícia, de operação e fiscalização de trânsito e às ambulâncias, quando em serviço de urgência e devidamente identificados por dispositivos regulamentados de alarme sonoro e iluminação vermelha intermitente:
Infração - gravíssima;
Penalidade - multa.',
ARRAY['art_189'], ARRAY['emergência', 'ambulância', 'polícia', 'bombeiro'], true, true),

('ctb', 'Art. 190 CTB - Seguir veículo de emergência em serviço', 
'Art. 190. Seguir veículo em serviço de urgência, estando este com prioridade de passagem devidamente identificada por dispositivos regulamentares de alarme sonoro e iluminação vermelha intermitentes:
Infração - grave;
Penalidade - multa.',
ARRAY['art_190'], ARRAY['seguir', 'emergência', 'urgência'], true, true),

('ctb', 'Art. 191 CTB - Forçar passagem entre veículos', 
'Art. 191. Forçar passagem entre veículos que, transitando em sentidos opostos, estejam na iminência de passar um pelo outro ao realizar operação de ultrapassagem:
Infração - gravíssima;
Penalidade - multa.',
ARRAY['art_191'], ARRAY['forçar', 'passagem', 'ultrapassagem'], true, true),

('ctb', 'Art. 192 CTB - Deixar de guardar distância de segurança', 
'Art. 192. Deixar de guardar distância de segurança lateral e frontal entre o seu veículo e os demais, bem como em relação ao bordo da pista, considerando-se, no momento, a velocidade, as condições climáticas do local da circulação e do veículo:
Infração - grave;
Penalidade - multa.',
ARRAY['art_192'], ARRAY['distância', 'segurança', 'lateral', 'frontal'], true, true),

('ctb', 'Art. 193 CTB - Transitar com o veículo em calçadas', 
'Art. 193. Transitar com o veículo em calçadas, passeios, passarelas, ciclovias, ciclofaixas, ilhas, refúgios, ajardinamentos, canteiros centrais e divisores de pista de rolamento, acostamentos, marcas de canalização, gramados e jardins públicos:
Infração - gravíssima;
Penalidade - multa (três vezes).',
ARRAY['art_193'], ARRAY['calçada', 'ciclovia', 'canteiro'], true, true),

('ctb', 'Art. 194 CTB - Transitar em marcha à ré', 
'Art. 194. Transitar em marcha à ré, salvo na distância necessária a pequenas manobras e de forma a não causar riscos à segurança:
Infração - grave;
Penalidade - multa.',
ARRAY['art_194'], ARRAY['ré', 'marcha', 'manobra'], true, true),

('ctb', 'Art. 195 CTB - Desobedecer às ordens do agente de trânsito', 
'Art. 195. Desobedecer às ordens emanadas da autoridade competente de trânsito ou de seus agentes:
Infração - gravíssima;
Penalidade - multa.',
ARRAY['art_195'], ARRAY['desobedecer', 'agente', 'autoridade', 'ordem'], true, true),

('ctb', 'Art. 196 CTB - Deixar de indicar mudança de direção', 
'Art. 196. Deixar de indicar com antecedência, mediante gesto regulamentar de braço ou luz indicadora de direção do veículo, o início da marcha, a realização da manobra de parar o veículo, a mudança de direção ou de faixa de circulação:
Infração - grave;
Penalidade - multa.',
ARRAY['art_196'], ARRAY['seta', 'indicar', 'direção', 'sinalizar'], true, true),

('ctb', 'Art. 197 CTB - Deixar de deslocar para a faixa mais à esquerda', 
'Art. 197. Deixar de deslocar, com antecedência, o veículo para a faixa mais à esquerda ou mais à direita, dentro da respectiva mão de direção, quando for manobrar para um desses lados:
Infração - média;
Penalidade - multa.',
ARRAY['art_197'], ARRAY['deslocar', 'faixa', 'manobra'], true, true),

('ctb', 'Art. 198 CTB - Deixar de dar passagem pela esquerda', 
'Art. 198. Deixar de dar passagem pela esquerda, quando solicitado:
Infração - média;
Penalidade - multa.',
ARRAY['art_198'], ARRAY['passagem', 'esquerda'], true, true),

('ctb', 'Art. 199 CTB - Ultrapassar pela direita', 
'Art. 199. Ultrapassar pela direita, salvo quando o veículo da frente estiver colocado na faixa apropriada e der sinal de que vai entrar à esquerda:
Infração - média;
Penalidade - multa.',
ARRAY['art_199'], ARRAY['ultrapassar', 'direita'], true, true),

('ctb', 'Art. 200 CTB - Ultrapassar pela contramão', 
'Art. 200. Ultrapassar pela contramão nas curvas, aclives e declives, sem visibilidade, nas faixas de pedestres, nas pontes e viadutos e nas travessias de nível:
Infração - gravíssima;
Penalidade - multa.',
ARRAY['art_200'], ARRAY['ultrapassar', 'contramão', 'curva'], true, true),

('ctb', 'Art. 201 CTB - Deixar de guardar distância lateral', 
'Art. 201. Deixar de guardar a distância lateral de um metro e cinqüenta centímetros ao passar ou ultrapassar bicicleta:
Infração - média;
Penalidade - multa.',
ARRAY['art_201'], ARRAY['bicicleta', 'distância', 'lateral'], true, true),

('ctb', 'Art. 202 CTB - Ultrapassar outro veículo pelo acostamento', 
'Art. 202. Fazer ultrapassagem em intersecções e passagens de nível:
Infração - gravíssima;
Penalidade - multa.',
ARRAY['art_202'], ARRAY['ultrapassar', 'intersecção', 'cruzamento'], true, true),

('ctb', 'Art. 203 CTB - Ultrapassar veículo em movimento que integre cortejo', 
'Art. 203. Ultrapassar veículo em movimento que integre cortejo, préstito, desfile e formações militares, salvo com autorização da autoridade de trânsito ou de seus agentes:
Infração - leve;
Penalidade - multa.',
ARRAY['art_203'], ARRAY['ultrapassar', 'cortejo', 'desfile'], true, true),

('ctb', 'Art. 204 CTB - Deixar de parar o veículo antes de transpor faixa de pedestres', 
'Art. 204. Deixar de parar o veículo no acostamento à direita, para aguardar a oportunidade de cruzar a pista ou entrar à esquerda, onde não houver local apropriado para operação de retorno:
Infração - média;
Penalidade - multa.',
ARRAY['art_204'], ARRAY['acostamento', 'retorno'], true, true),

('ctb', 'Art. 205 CTB - Ultrapassar veículo em frente que ainda não concluiu a manobra de ultrapassagem', 
'Art. 205. Ultrapassar veículo em movimento que esteja efetuando a operação de retorno ou de conversão à esquerda:
Infração - gravíssima;
Penalidade - multa.',
ARRAY['art_205'], ARRAY['ultrapassar', 'retorno', 'conversão'], true, true),

('ctb', 'Art. 206 CTB - Executar operação de retorno em local proibido', 
'Art. 206. Executar operação de retorno:
I - em locais proibidos pela sinalização: Infração - gravíssima; Penalidade - multa;
II - nas curvas, aclives, declives, pontes, viadutos e túneis: Infração - gravíssima; Penalidade - multa;
III - passando por cima de calçada, passeio, ilhas, ajardinamento ou canteiros de divisões de pista de rolamento, refúgios e faixas de pedestres e de ciclistas: Infração - gravíssima; Penalidade - multa;
IV - nas interseções, entrando na contramão de direção da via transversal: Infração - gravíssima; Penalidade - multa.',
ARRAY['art_206'], ARRAY['retorno', 'conversão', 'curva', 'proibido'], true, true),

('ctb', 'Art. 207 CTB - Executar operação de conversão à direita ou à esquerda', 
'Art. 207. Executar operação de conversão à direita ou à esquerda em locais proibidos pela sinalização:
Infração - grave;
Penalidade - multa.',
ARRAY['art_207'], ARRAY['conversão', 'direita', 'esquerda', 'proibido'], true, true),

('ctb', 'Art. 208 CTB - Avançar o sinal vermelho do semáforo', 
'Art. 208. Avançar o sinal vermelho do semáforo ou o de parada obrigatória:
Infração - gravíssima;
Penalidade - multa.',
ARRAY['art_208'], ARRAY['sinal', 'vermelho', 'semáforo', 'parada'], true, true),

('ctb', 'Art. 209 CTB - Transpor bloqueio viário', 
'Art. 209. Transpor, sem autorização, bloqueio viário com ou sem sinalização ou dispositivos auxiliares, deixar de adentrar às áreas destinadas à pesagem de veículos ou evadir-se para não efetuar o pagamento do pedágio:
Infração - grave;
Penalidade - multa.',
ARRAY['art_209'], ARRAY['bloqueio', 'pedágio', 'pesagem'], true, true),

('ctb', 'Art. 210 CTB - Transpor sinal de parada obrigatória', 
'Art. 210. Transpor, sem autorização, bloqueio viário policial:
Infração - gravíssima;
Penalidade - multa, apreensão do veículo e suspensão do direito de dirigir;
Medida administrativa - remoção do veículo e recolhimento do documento de habilitação.',
ARRAY['art_210'], ARRAY['bloqueio', 'policial', 'barreira'], true, true),

('ctb', 'Art. 211 CTB - Ultrapassar veículos em fila', 
'Art. 211. Ultrapassar veículos em fila, parados em razão de sinal luminoso, cancela, bloqueio viário parcial ou qualquer outro obstáculo, com exceção dos veículos não motorizados:
Infração - grave;
Penalidade - multa.',
ARRAY['art_211'], ARRAY['ultrapassar', 'fila', 'sinal'], true, true),

('ctb', 'Art. 212 CTB - Deixar de parar antes de entrar na via', 
'Art. 212. Deixar de parar o veículo antes de transpor linha férrea:
Infração - gravíssima;
Penalidade - multa.',
ARRAY['art_212'], ARRAY['ferrovia', 'trem', 'linha'], true, true),

('ctb', 'Art. 213 CTB - Deixar de parar quando entrar em via pública', 
'Art. 213. Deixar de parar o veículo sempre que a respectiva marcha for interceptada:
I - por agrupamento de pessoas, como préstitos, passeatas, desfiles e outros: Infração - gravíssima; Penalidade - multa;
II - quando solicitado, em razão de regulamentação específica: Infração - grave; Penalidade - multa.',
ARRAY['art_213'], ARRAY['parar', 'préstito', 'desfile'], true, true),

('ctb', 'Art. 214 CTB - Deixar de dar preferência a pedestre', 
'Art. 214. Deixar de dar preferência de passagem a pedestre e a veículo não motorizado:
I - que se encontre na faixa a ele destinada: Infração - gravíssima; Penalidade - multa;
II - que não haja concluído a travessia mesmo após a mudança do sinal: Infração - gravíssima; Penalidade - multa;
III - portadores de deficiência física, crianças, idosos e gestantes: Infração - gravíssima; Penalidade - multa;
IV - quando houver iniciado a travessia mesmo que não haja sinalização a ele destinada: Infração - grave; Penalidade - multa;
V - que esteja atravessando a via transversal para onde se dirija o veículo: Infração - grave; Penalidade - multa.',
ARRAY['art_214'], ARRAY['pedestre', 'faixa', 'preferência', 'travessia'], true, true),

('ctb', 'Art. 215 CTB - Deixar de dar preferência a outros veículos', 
'Art. 215. Deixar de dar preferência de passagem:
I - em interseção não sinalizada: a) a veículo que estiver circulando por rodovia ou rotatória: Infração - grave; Penalidade - multa; b) a veículo que vier da direita: Infração - grave; Penalidade - multa;
II - nas interseções com sinalização de regulamentação de Dê a Preferência: Infração - grave; Penalidade - multa.',
ARRAY['art_215'], ARRAY['preferência', 'interseção', 'rotatória'], true, true),

('ctb', 'Art. 218 CTB - Transitar em velocidade superior à máxima permitida', 
'Art. 218. Transitar em velocidade superior à máxima permitida para o local, medida por instrumento ou equipamento hábil, em rodovias, vias de trânsito rápido, vias arteriais e demais vias:
I - quando a velocidade for superior à máxima em até 20% (vinte por cento): Infração - média; Penalidade - multa;
II - quando a velocidade for superior à máxima em mais de 20% (vinte por cento) até 50% (cinquenta por cento): Infração - grave; Penalidade - multa;
III - quando a velocidade for superior à máxima em mais de 50% (cinquenta por cento): Infração - gravíssima; Penalidade - multa (três vezes), suspensão imediata do direito de dirigir e apreensão do documento de habilitação.',
ARRAY['art_218'], ARRAY['velocidade', 'radar', 'excesso'], true, true),

('ctb', 'Art. 219 CTB - Transitar com veículo em velocidade inferior à mínima', 
'Art. 219. Transitar com o veículo em velocidade inferior à metade da velocidade máxima estabelecida para a via, retardando ou obstruindo o trânsito, a menos que as condições de tráfego e meteorológicas não o permitam, salvo se estiver na faixa da direita:
Infração - média;
Penalidade - multa.',
ARRAY['art_219'], ARRAY['velocidade', 'mínima', 'lento'], true, true),

('ctb', 'Art. 220 CTB - Deixar de reduzir a velocidade do veículo', 
'Art. 220. Deixar de reduzir a velocidade do veículo de forma compatível com a segurança do trânsito:
I - quando se aproximar de passeatas, aglomerações, cortejo, préstitos e desfiles: Infração - gravíssima; Penalidade - multa;
II - nos locais onde o trânsito esteja sendo controlado pelo agente da autoridade de trânsito, mediante sinais sonoros ou gestos: Infração - gravíssima; Penalidade - multa;
III - ao aproximar-se da guia da calçada (meio-fio) ou acostamento: Infração - grave; Penalidade - multa;
IV - ao aproximar-se de ou passar por interseção não sinalizada: Infração - grave; Penalidade - multa;
V - nas vias rurais cuja faixa de domínio não esteja cercada: Infração - média; Penalidade - multa;
VI - nos trechos em curva de pequeno raio: Infração - média; Penalidade - multa;
VII - ao aproximar-se de locais sinalizados com advertência de obras ou trabalhadores na pista: Infração - média; Penalidade - multa;
VIII - sob chuva, neblina, cerração ou ventos fortes: Infração - média; Penalidade - multa;
IX - quando houver má visibilidade: Infração - média; Penalidade - multa;
X - quando o pavimento se apresentar escorregadio, defeituoso ou avariado: Infração - média; Penalidade - multa;
XI - à aproximação de animais na pista: Infração - média; Penalidade - multa;
XII - em declive: Infração - média; Penalidade - multa;
XIII - ao ultrapassar ciclista: Infração - média; Penalidade - multa;
XIV - nas proximidades de escolas, hospitais, estações de embarque e desembarque de passageiros ou onde haja intensa movimentação de pedestres: Infração - gravíssima; Penalidade - multa.',
ARRAY['art_220'], ARRAY['velocidade', 'reduzir', 'escola', 'hospital'], true, true),

('ctb', 'Art. 221 CTB - Portar licença do veículo ou CNH falsificados', 
'Art. 221. Portar no veículo placas de identificação em desacordo com as especificações e modelos estabelecidos pelo CONTRAN:
Infração - gravíssima;
Penalidade - multa e apreensão do veículo;
Medida administrativa - remoção do veículo.',
ARRAY['art_221'], ARRAY['placa', 'identificação', 'falsificada'], true, true),

('ctb', 'Art. 222 CTB - Deixar de manter acesas as luzes de posição', 
'Art. 222. Deixar de manter ligado, nas situações de atendimento de emergência, o sistema de iluminação vermelha intermitente dos veículos de polícia, de socorro de incêndio e salvamento, de fiscalização de trânsito e das ambulâncias, ainda que parados:
Infração - média;
Penalidade - multa.',
ARRAY['art_222'], ARRAY['luz', 'emergência', 'ambulância'], true, true),

('ctb', 'Art. 223 CTB - Transitar com o farol desregulado', 
'Art. 223. Transitar com o farol desregulado ou com o facho de luz alta de forma a perturbar a visão de outro condutor:
Infração - grave;
Penalidade - multa.',
ARRAY['art_223'], ARRAY['farol', 'luz', 'alta'], true, true),

('ctb', 'Art. 224 CTB - Fazer uso de facho de luz alta', 
'Art. 224. Fazer uso de luz alta, estando o veículo parado:
Infração - média;
Penalidade - multa.',
ARRAY['art_224'], ARRAY['luz', 'alta', 'parado'], true, true),

('ctb', 'Art. 225 CTB - Deixar de sinalizar a via', 
'Art. 225. Deixar de sinalizar a via, de forma a prevenir os demais condutores quando, em situação de emergência, o veículo estiver parado no leito da via:
I - em caso de acidente: Infração - grave; Penalidade - multa;
II - em caso de não funcionamento do veículo: Infração - média; Penalidade - multa;
III - por motivo de força maior: Infração - média; Penalidade - multa.',
ARRAY['art_225'], ARRAY['sinalizar', 'emergência', 'triângulo'], true, true),

('ctb', 'Art. 226 CTB - Deixar de retirar todo e qualquer objeto que tenha sido utilizado para sinalização temporária', 
'Art. 226. Deixar de retirar todo e qualquer objeto que tenha sido utilizado para sinalização temporária da via:
Infração - média;
Penalidade - multa.',
ARRAY['art_226'], ARRAY['sinalização', 'temporária', 'retirar'], true, true),

('ctb', 'Art. 227 CTB - Usar buzina em desacordo com normas', 
'Art. 227. Usar buzina:
I - em situação que não a de simples toque breve como advertência ao pedestre ou a condutores de outros veículos: Infração - leve; Penalidade - multa;
II - prolongada e sucessivamente a qualquer pretexto: Infração - leve; Penalidade - multa;
III - entre as vinte e duas e as seis horas: Infração - leve; Penalidade - multa;
IV - em locais e horários proibidos pela sinalização: Infração - leve; Penalidade - multa;
V - em desacordo com os padrões e freqüências estabelecidas pelo CONTRAN: Infração - grave; Penalidade - multa.',
ARRAY['art_227'], ARRAY['buzina', 'som', 'ruído'], true, true),

('ctb', 'Art. 228 CTB - Usar no veículo equipamento de som em volume alto', 
'Art. 228. Usar no veículo equipamento com som em volume ou freqüência que não sejam autorizados pelo CONTRAN:
Infração - grave;
Penalidade - multa;
Medida administrativa - retenção do veículo para regularização.',
ARRAY['art_228'], ARRAY['som', 'alto', 'volume'], true, true),

('ctb', 'Art. 229 CTB - Usar indevidamente o veículo em exibições', 
'Art. 229. Usar indevidamente o veículo para produzir ruído excessivo, mediante aceleração do motor, fora de situação de urgência:
Infração - média;
Penalidade - multa.',
ARRAY['art_229'], ARRAY['ruído', 'motor', 'aceleração'], true, true),

('ctb', 'Art. 230 CTB - Conduzir veículo com equipamento obrigatório inoperante', 
'Art. 230. Conduzir o veículo:
I - com o lacre, a inscrição do chassi, o selo, a placa ou qualquer outro elemento de identificação do veículo violado ou falsificado: Infração - gravíssima; Penalidade - multa e apreensão do veículo; Medida administrativa - remoção do veículo;
II - transportando passageiros em compartimento de carga, salvo por motivo de força maior, com permissão da autoridade competente e na forma estabelecida pelo CONTRAN: Infração - grave; Penalidade - multa;
III - com dispositivo anti-radar: Infração - grave; Penalidade - multa;
IV - sem qualquer uma das placas de identificação: Infração - gravíssima; Penalidade - multa e apreensão do veículo; Medida administrativa - remoção do veículo;
V - que não esteja registrado e devidamente licenciado: Infração - gravíssima; Penalidade - multa e apreensão do veículo; Medida administrativa - remoção do veículo;
VI - com qualquer uma das placas de identificação sem condições de legibilidade e visibilidade: Infração - média; Penalidade - multa;
VII - com a cor ou característica alterada: Infração - grave; Penalidade - multa;
VIII - sem ter sido submetido à inspeção de segurança veicular, quando obrigatória: Infração - grave; Penalidade - multa;
IX - sem equipamento obrigatório ou estando este ineficiente ou inoperante: Infração - grave; Penalidade - multa;
X - com equipamento obrigatório em desacordo com o estabelecido pelo CONTRAN: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização;
XI - com descarga livre ou silenciador de motor de trânsito defeituoso, deficiente ou inoperante: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização;
XII - com equipamento ou acessório proibido: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização e apreensão do equipamento ou acessório;
XIII - com o equipamento do sistema de iluminação e de sinalização alterados: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização;
XIV - com registrador instantâneo inalterável de velocidade e tempo viciado ou defeituoso, quando houver exigência desse aparelho: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização;
XV - com inscrições, adesivos, legendas e símbolos de caráter publicitário afixados ou pintados no para-brisa e em toda a extensão da parte traseira do veículo, excetuadas as hipóteses previstas neste Código: Infração - leve; Penalidade - multa;
XVI - com vidros total ou parcialmente cobertos por películas refletivas ou não, painéis decorativos ou pinturas: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização;
XVII - com cortinas ou persianas fechadas, não autorizadas pela legislação: Infração - média; Penalidade - multa;
XVIII - em mau estado de conservação, comprometendo a segurança, ou reprovado na avaliação de inspeção de segurança e de emissão de poluentes e ruído, prevista no art. 104: Infração - grave; Penalidade - multa;
XIX - sem acionar o limpador de para-brisa sob chuva: Infração - leve; Penalidade - multa;
XX - sem portar a autorização para condução de escolares, na forma estabelecida no art. 136: Infração - grave; Penalidade - multa e apreensão do veículo; Medida administrativa - remoção do veículo;
XXI - de carga, com falta de indicação de seu peso bruto total, de sua tara e de sua capacidade máxima de tração, inscritas na parte externa do veículo: Infração - média; Penalidade - multa;
XXII - com defeito no sistema de iluminação, de sinalização ou com lâmpadas queimadas: Infração - média; Penalidade - multa.',
ARRAY['art_230'], ARRAY['equipamento', 'película', 'placa', 'identificação'], true, true),

('ctb', 'Art. 231 CTB - Transitar com veículo com excesso de lotação', 
'Art. 231. Transitar com o veículo:
I - danificando a via, suas instalações e equipamentos: Infração - grave; Penalidade - multa;
II - derramando, lançando ou arrastando sobre a via: a) carga que esteja transportando; b) combustível ou lubrificante que esteja utilizando; c) qualquer objeto que possa acarretar risco de acidente: Infração - grave; Penalidade - multa;
III - produzindo fumaça, gases ou partículas em níveis superiores aos fixados pelo CONTRAN: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização;
IV - com suas dimensões ou de sua carga superiores aos limites estabelecidos legalmente ou pela sinalização, sem autorização: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização;
V - com excesso de peso: Infração - conforme a tabela; Penalidade - multa conforme tabela;
VI - em desacordo com a autorização especial, expedida pela autoridade competente para transitar com dimensões excedentes, ou quando a mesma estiver vencida: Infração - grave; Penalidade - multa; Medida administrativa - retenção do veículo para regularização;
VII - com lotação excedente: Infração - média; Penalidade - multa;
VIII - efetuando transporte remunerado de pessoas ou bens, quando não for licenciado para esse fim, salvo casos de força maior ou com permissão da autoridade competente: Infração - média; Penalidade - multa.',
ARRAY['art_231'], ARRAY['lotação', 'peso', 'carga', 'excesso'], true, true),

('ctb', 'Art. 232 CTB - Conduzir veículo sem documentos de porte obrigatório', 
'Art. 232. Conduzir veículo sem os documentos de porte obrigatório referidos neste Código:
Infração - leve;
Penalidade - multa;
Medida administrativa - retenção do veículo até a apresentação do documento.',
ARRAY['art_232'], ARRAY['documento', 'cnh', 'crlv'], true, true),

('ctb', 'Art. 233 CTB - Deixar de efetuar o registro do veículo', 
'Art. 233. Deixar de efetuar o registro de veículo no prazo de trinta dias, junto ao órgão executivo de trânsito, ocorridas as hipóteses previstas no art. 123:
Infração - grave;
Penalidade - multa;
Medida administrativa - retenção do veículo para regularização.',
ARRAY['art_233'], ARRAY['registro', 'prazo', 'transferência'], true, true),

('ctb', 'Art. 234 CTB - Falsificar ou adulterar documento de habilitação', 
'Art. 234. Falsificar ou adulterar documento de habilitação e de identificação do veículo:
Infração - gravíssima;
Penalidade - multa e apreensão do veículo;
Medida administrativa - recolhimento do documento de habilitação e dos documentos do veículo.',
ARRAY['art_234'], ARRAY['falsificar', 'adulterar', 'documento'], true, true),

('ctb', 'Art. 235 CTB - Conduzir pessoas, animais ou carga de forma perigosa', 
'Art. 235. Conduzir pessoas, animais ou carga nas partes externas do veículo, salvo nos casos devidamente autorizados:
Infração - grave;
Penalidade - multa;
Medida administrativa - retenção do veículo para transbordo.',
ARRAY['art_235'], ARRAY['carga', 'pessoas', 'externo'], true, true),

('ctb', 'Art. 236 CTB - Rebocar outro veículo com cabo flexível', 
'Art. 236. Rebocar outro veículo com cabo flexível ou corda, salvo em casos de emergência:
Infração - média;
Penalidade - multa.',
ARRAY['art_236'], ARRAY['reboque', 'cabo', 'corda'], true, true),

('ctb', 'Art. 237 CTB - Transitar com veículo em desacordo com condições de segurança', 
'Art. 237. Transitar com o veículo em desacordo com as especificações, e target com falta de inscrição e simbologia necessárias à sua identificação, quando exigidas pela legislação:
Infração - grave;
Penalidade - multa;
Medida administrativa - retenção do veículo para regularização.',
ARRAY['art_237'], ARRAY['especificação', 'identificação'], true, true),

('ctb', 'Art. 238 CTB - Recusar-se a entregar documentos à fiscalização', 
'Art. 238. Recusar-se a entregar à autoridade de trânsito ou a seus agentes, mediante recibo, os documentos de habilitação, de registro, de licenciamento de veículo e outros exigidos por lei, para averiguação de sua autenticidade:
Infração - gravíssima;
Penalidade - multa e apreensão do veículo;
Medida administrativa - remoção do veículo.',
ARRAY['art_238'], ARRAY['recusar', 'documentos', 'fiscalização'], true, true),

('ctb', 'Art. 239 CTB - Retirar do local o veículo legalmente retido', 
'Art. 239. Retirar do local veículo legalmente retido para regularização, sem permissão da autoridade competente ou de seus agentes:
Infração - gravíssima;
Penalidade - multa e apreensão do veículo;
Medida administrativa - remoção do veículo.',
ARRAY['art_239'], ARRAY['retirar', 'retido', 'apreendido'], true, true),

('ctb', 'Art. 240 CTB - Deixar o servidor de prestar assistência', 
'Art. 240. Deixar o embarcador de fixar a carga ou fixá-la de forma inadequada sobre o veículo, causando risco de acidentes a terceiros:
Infração - gravíssima;
Penalidade - multa.',
ARRAY['art_240'], ARRAY['carga', 'fixação', 'embarcador'], true, true),

('ctb', 'Art. 241 CTB - Deixar de atualizar cadastro de registro do veículo', 
'Art. 241. Deixar de atualizar o cadastro de registro do veículo ou de habilitação do condutor:
Infração - leve;
Penalidade - multa.',
ARRAY['art_241'], ARRAY['cadastro', 'atualizar', 'endereço'], true, true),

('ctb', 'Art. 243 CTB - Deixar de utilizar o equipamento de proteção', 
'Art. 243. Deixar a empresa seguradora de comunicar ao órgão executivo de trânsito competente a ocorrência de perda total do veículo e de lhe devolver as respectivas placas e documentos:
Infração - grave;
Penalidade - multa;
Medida administrativa - recolhimento das placas e dos documentos.',
ARRAY['art_243'], ARRAY['seguradora', 'perda total', 'placas'], true, true),

('ctb', 'Art. 244 CTB - Conduzir motocicleta sem capacete', 
'Art. 244. Conduzir motocicleta, motoneta e ciclomotor:
I - sem usar capacete de segurança com viseira ou óculos de proteção e target vestuário de acordo com as normas e especificações aprovadas pelo CONTRAN: Infração - gravíssima; Penalidade - multa e suspensão do direito de dirigir; Medida administrativa - recolhimento do documento de habilitação;
II - transportando passageiro sem o capacete de segurança, na forma estabelecida no inciso anterior, ou fora do assento suplementar colocado atrás do condutor ou em carro lateral: Infração - grave; Penalidade - multa;
III - fazendo malabarismo ou equilibrando-se apenas em uma roda: Infração - gravíssima; Penalidade - multa e suspensão do direito de dirigir; Medida administrativa - recolhimento do documento de habilitação;
IV - com os faróis apagados: Infração - média; Penalidade - multa;
V - transportando criança menor de dez anos ou que não tenha, nas circunstâncias, condições de cuidar de sua própria segurança: Infração - gravíssima; Penalidade - multa e suspensão do direito de dirigir; Medida administrativa - recolhimento do documento de habilitação;
VI - rebocando outro veículo: Infração - média; Penalidade - multa;
VII - sem segurar o guidom com ambas as mãos, salvo eventualmente para indicação de manobras: Infração - média; Penalidade - multa.',
ARRAY['art_244'], ARRAY['motocicleta', 'capacete', 'moto'], true, true),

('ctb', 'Art. 245 CTB - Utilizar a faixa seletiva', 
'Art. 245. Utilizar a faixa seletiva regulamentada para o transporte público coletivo de passageiros com veículo que não seja destinado a este serviço:
Infração - grave;
Penalidade - multa.',
ARRAY['art_245'], ARRAY['faixa', 'seletiva', 'ônibus'], true, true),

('ctb', 'Art. 246 CTB - Deixar de sinalizar qualquer obstáculo', 
'Art. 246. Deixar de sinalizar qualquer obstáculo à livre circulação, à segurança de veículo e pedestres, tanto no leito da via terrestre como na calçada, ou de deixar de retirá-lo, se possível:
Infração - grave;
Penalidade - multa.',
ARRAY['art_246'], ARRAY['obstáculo', 'sinalizar', 'via'], true, true),

('ctb', 'Art. 247 CTB - Deixar de conduzir pelo acostamento', 
'Art. 247. Deixar de conduzir pelo acostamento da direita animal de tração, montado ou não, em via onde não haja faixa de trânsito que permita sua circulação:
Infração - média;
Penalidade - multa.',
ARRAY['art_247'], ARRAY['animal', 'acostamento'], true, true),

('ctb', 'Art. 248 CTB - Transportar carga viva em compartimento de passageiros', 
'Art. 248. Transportar em veículo destinado ao transporte de passageiros carga excedente em desacordo com o estabelecido no art. 109 ou, em veículo destinado ao transporte de carga, passageiros, salvo em caso de força maior, com permissão da autoridade competente e na forma estabelecida pelo CONTRAN:
Infração - média;
Penalidade - multa.',
ARRAY['art_248'], ARRAY['passageiros', 'carga', 'veículo'], true, true),

('ctb', 'Art. 249 CTB - Deixar de manter acesa a luz baixa do veículo', 
'Art. 249. Deixar de manter acesas, à noite, as luzes de posição, quando o veículo estiver parado para fins de embarque ou desembarque de passageiros e carga ou descarga de mercadorias:
Infração - média;
Penalidade - multa.',
ARRAY['art_249'], ARRAY['luz', 'posição', 'noite'], true, true),

('ctb', 'Art. 250 CTB - Deixar de manter acesa a luz de placa', 
'Art. 250. Quando o veículo estiver em movimento:
I - deixar de manter acesa a luz baixa: a) durante a noite: Infração - média; Penalidade - multa; b) de dia, nos túneis providos de iluminação pública e sempre que condições de luminosidade assim o exigirem: Infração - média; Penalidade - multa;
II - deixar de manter acesas pelo menos as luzes de posição sob chuva forte, neblina ou cerração: Infração - média; Penalidade - multa;
III - deixar de manter a luz de placa acesa à noite: Infração - leve; Penalidade - multa.',
ARRAY['art_250'], ARRAY['luz', 'baixa', 'túnel', 'placa'], true, true),

('ctb', 'Art. 251 CTB - Utilizar as luzes do veículo de forma inadequada', 
'Art. 251. Utilizar as luzes do veículo:
I - o pisca-alerta, exceto em imobilizações ou situações de emergência: Infração - média; Penalidade - multa;
II - baixa e alta de forma intermitente, exceto nas situações previstas neste Código: Infração - média; Penalidade - multa.',
ARRAY['art_251'], ARRAY['pisca', 'alerta', 'luz'], true, true),

('ctb', 'Art. 252 CTB - Dirigir veículo utilizando-se de fones de ouvido ou celular', 
'Art. 252. Dirigir o veículo:
I - com o braço do lado de fora: Infração - média; Penalidade - multa;
II - transportando pessoas, animais ou volume à sua esquerda ou entre os braços e pernas: Infração - média; Penalidade - multa;
III - com incapacidade física ou mental temporária que comprometa a segurança do trânsito: Infração - gravíssima; Penalidade - multa;
IV - usando calçado que não se firme nos pés ou que comprometa a utilização dos pedais: Infração - leve; Penalidade - multa;
V - com apenas uma das mãos, exceto quando deva fazer sinais regulamentares de braço, mudar a marcha do veículo, ou acionar equipamentos e acessórios do veículo: Infração - média; Penalidade - multa;
VI - utilizando-se de fones nos ouvidos conectados a aparelhagem sonora ou de telefone celular: Infração - média; Penalidade - multa.',
ARRAY['art_252'], ARRAY['celular', 'fone', 'direção'], true, true),

('ctb', 'Art. 253 CTB - Bloquear via sem autorização', 
'Art. 253. Bloquear a via com veículo:
Infração - gravíssima;
Penalidade - multa e apreensão do veículo;
Medida administrativa - remoção do veículo.',
ARRAY['art_253'], ARRAY['bloquear', 'via'], true, true),

('ctb', 'Art. 253-A CTB - Conduzir veículo de tração humana ou animal', 
'Art. 253-A. Usar qualquer veículo para, deliberadamente, interromper, restringir ou perturbar a circulação na via sem autorização do órgão ou entidade de trânsito com circunscrição sobre ela:
Infração - gravíssima;
Penalidade - multa (dez vezes) e suspensão do direito de dirigir por doze meses;
Medida administrativa - remoção do veículo.',
ARRAY['art_253-a'], ARRAY['interromper', 'perturbar', 'circulação'], true, true),

('ctb', 'Art. 254 CTB - Proibições ao pedestre', 
'Art. 254. É proibido ao pedestre:
I - permanecer ou andar nas pistas de rolamento, exceto para cruzá-las onde for permitido;
II - cruzar pistas de rolamento nos viadutos, pontes, ou túneis, salvo onde exista permissão;
III - atravessar a via dentro das áreas de cruzamento, salvo quando houver sinalização para esse fim;
IV - utilizar-se da via em agrupamentos capazes de perturbar o trânsito, ou para a prática de qualquer folguedo, esporte, desfiles e similares, salvo em casos especiais e com a devida licença da autoridade competente;
V - andar fora da faixa própria, passarela, passagem aérea ou subterrânea;
VI - desobedecer à sinalização de trânsito específica.
Infração - leve;
Penalidade - multa, em 50% (cinqüenta por cento) do valor da infração de natureza leve.',
ARRAY['art_254'], ARRAY['pedestre', 'atravessar', 'faixa'], true, true),

('ctb', 'Art. 255 CTB - Conduzir bicicleta em passeios', 
'Art. 255. Conduzir bicicleta em passeios onde não seja permitida a circulação desta, ou de forma agressiva, em desacordo com o disposto no parágrafo único do art. 59:
Infração - média;
Penalidade - multa;
Medida administrativa - remoção da bicicleta, mediante recibo para o pagamento da multa.',
ARRAY['art_255'], ARRAY['bicicleta', 'passeio', 'calçada'], true, true),

('ctb', 'Art. 256 CTB - Deixar de desmontar para empurrar bicicleta', 
'Art. 256. Executar operação de conversão à direita ou à esquerda em locais proibidos pela sinalização:
Infração - grave;
Penalidade - multa.',
ARRAY['art_256'], ARRAY['bicicleta', 'desmontar'], true, true),

('ctb', 'Art. 257 CTB - Deixar de ajustar a carga no veículo', 
'Art. 257. As penalidades previstas neste Código são aplicáveis independentemente de outras sanções civis e penais.
§ 1º A aplicação das penalidades será feita pela ordem crescente de gravidade.
§ 2º A cada infração corresponderá número de pontos na Carteira Nacional de Habilitação, conforme a gravidade da infração.
§ 3º Os pontos terão validade de 12 (doze) meses, contados da data da infração.',
ARRAY['art_257'], ARRAY['penalidade', 'pontos', 'gravidade'], true, true),

('ctb', 'Art. 258 CTB - Gradação das penalidades', 
'Art. 258. As infrações punidas com multa classificam-se, quanto à gravidade, em quatro categorias:
I - infração de natureza gravíssima, punida com multa no valor de R$ 293,47 (duzentos e noventa e três reais e quarenta e sete centavos);
II - infração de natureza grave, punida com multa no valor de R$ 195,23 (cento e noventa e cinco reais e vinte e três centavos);
III - infração de natureza média, punida com multa no valor de R$ 130,16 (cento e trinta reais e dezesseis centavos);
IV - infração de natureza leve, punida com multa no valor de R$ 88,38 (oitenta e oito reais e trinta e oito centavos).',
ARRAY['art_258'], ARRAY['multa', 'valor', 'gravidade', 'categoria'], true, true),

('ctb', 'Art. 259 CTB - Pontuação das infrações', 
'Art. 259. A cada infração cometida são computados os seguintes números de pontos:
I - gravíssima - 7 (sete) pontos;
II - grave - 5 (cinco) pontos;
III - média - 4 (quatro) pontos;
IV - leve - 3 (três) pontos.',
ARRAY['art_259'], ARRAY['pontos', 'pontuação', 'infração'], true, true),

('ctb', 'Art. 261 CTB - Suspensão do direito de dirigir', 
'Art. 261. A penalidade de suspensão do direito de dirigir será imposta nos seguintes casos:
I - sempre que o infrator atingir a contagem de 40 (quarenta) pontos, no período de 12 (doze) meses, ressalvados os casos especiais previstos em lei;
II - quando o condutor for reincidente em infração de natureza gravíssima;
III - quando o infrator cometer a infração de natureza gravíssima prevista no art. 165, que tiver como resultado lesão corporal ou morte de terceiros;
IV - por transgressão às normas relativas à condução de escolares.
§ 1º Os prazos de suspensão serão de 6 (seis) meses a 1 (um) ano e, no caso de reincidência, de 8 (oito) meses a 2 (dois) anos.',
ARRAY['art_261'], ARRAY['suspensão', 'cnh', 'pontos', '40 pontos'], true, true),

('ctb', 'Art. 263 CTB - Cassação do documento de habilitação', 
'Art. 263. A cassação do documento de habilitação dar-se-á:
I - quando, suspenso o direito de dirigir, o infrator conduzir qualquer veículo;
II - no caso de reincidência, no prazo de 12 (doze) meses, das infrações previstas no inciso III do art. 162 e nos arts. 163, 164, 165, 173, 174 e 175;
III - quando condenado judicialmente por delito de trânsito, observado o disposto no art. 160.
§ 1º Após o prazo de 2 (dois) anos, contado da data em que foi entregue à autoridade de trânsito o documento cassado, o infrator poderá requerer sua reabilitação, submetendo-se a todos os exames necessários à obtenção de nova habilitação.',
ARRAY['art_263'], ARRAY['cassação', 'cnh', 'habilitação'], true, true),

('ctb', 'Art. 269 CTB - Medidas administrativas', 
'Art. 269. A autoridade de trânsito ou seus agentes, na esfera das competências estabelecidas neste Código e dentro de sua circunscrição, deverá adotar as seguintes medidas administrativas:
I - retenção do veículo;
II - remoção do veículo;
III - recolhimento da Carteira Nacional de Habilitação;
IV - recolhimento da Permissão para Dirigir;
V - recolhimento do Certificado de Registro;
VI - recolhimento do Certificado de Licenciamento Anual;
VII - transbordo do excesso de carga;
VIII - realização de teste de dosagem de alcoolemia ou perícia de substância entorpecente ou que determine dependência física ou psíquica;
IX - recolhimento de animais que estejam soltos nas vias e na faixa de domínio das vias de trânsito;
X - realização de exames de aptidão física, mental, de legislação, de prática de primeiros socorros e de direção veicular.',
ARRAY['art_269'], ARRAY['medida', 'administrativa', 'retenção', 'remoção'], true, true),

('ctb', 'Art. 270 CTB - Liberação do veículo retido', 
'Art. 270. O veículo poderá ser retido nos casos expressos neste Código.
§ 1º Quando a irregularidade puder ser sanada no local da infração, o veículo será liberado tão logo seja regularizada a situação.
§ 2º Não sendo possível sanar a irregularidade no local da infração, o veículo poderá ser retirado por condutor regularmente habilitado, mediante recolhimento do Certificado de Licenciamento Anual, contra recibo.
§ 3º Não se apresentando condutor habilitado no local da infração, o veículo será removido ao depósito, podendo ser retirado após regularizada a situação.',
ARRAY['art_270'], ARRAY['retenção', 'liberação', 'veículo'], true, true),

('ctb', 'Art. 271 CTB - Remoção do veículo', 
'Art. 271. O veículo será removido, nos casos previstos neste Código, para o depósito fixado pelo órgão ou entidade competente, com circunscrição sobre a via.
§ 1º A restituição dos veículos removidos só ocorrerá mediante o pagamento das multas, taxas e despesas com remoção e estada, além de outros encargos previstos na legislação específica.
§ 2º A liberação do veículo removido é condicionada ao reparo de qualquer componente ou equipamento obrigatório que não esteja em perfeito estado de funcionamento.',
ARRAY['art_271'], ARRAY['remoção', 'depósito', 'restituição'], true, true),

('ctb', 'Art. 275 CTB - Processo administrativo', 
'Art. 275. O transbordo da carga com excesso de peso é obrigatório, podendo ser complementado com o descarte, quando necessário, sendo esta providência de responsabilidade do proprietário ou transportador do veículo, que também responderá pela sua guarda.',
ARRAY['art_275'], ARRAY['transbordo', 'carga', 'excesso'], true, true),

('ctb', 'Art. 277 CTB - Verificação de embriaguez', 
'Art. 277. O condutor de veículo automotor envolvido em acidente de trânsito ou que for alvo de fiscalização de trânsito poderá ser submetido a teste, exame clínico, perícia ou outro procedimento que, por meios técnicos ou científicos, na forma disciplinada pelo Contran, permita certificar influência de álcool ou outra substância psicoativa que determine dependência.
§ 1º A infração prevista no art. 165 também poderá ser caracterizada mediante imagem, vídeo, constatação de sinais que indiquem, na forma disciplinada pelo Contran, alteração da capacidade psicomotora ou declaração do condutor.
§ 2º A verificação do consumo de álcool ou de outra substância psicoativa que determine dependência será feita nos termos do parágrafo anterior, de acordo com a regulamentação do Contran.
§ 3º Serão aplicadas as penalidades e medidas administrativas estabelecidas no art. 165-A deste Código ao condutor que se recusar a se submeter a qualquer dos procedimentos previstos no caput deste artigo.',
ARRAY['art_277', 'art_165', 'art_165-a'], ARRAY['álcool', 'teste', 'bafômetro', 'etilômetro'], true, true),

('ctb', 'Art. 279 CTB - Notificação da autuação', 
'Art. 279. Em caso de acidente com vítima, envolvendo veículo equipado com registrador instantâneo de velocidade e tempo, somente o perito oficial encarregado do levantamento pericial poderá retirar o disco ou unidade armazenadora do registro.',
ARRAY['art_279'], ARRAY['acidente', 'tacógrafo', 'perito'], true, true),

('ctb', 'Art. 283 CTB - Notificação de imposição de penalidade', 
'Art. 283. A notificação da penalidade será expedida ao proprietário do veículo, no prazo máximo de 180 (cento e oitenta) dias, contado da data do cometimento da infração, por remessa postal ou por qualquer outro meio tecnológico hábil, que assegure a ciência da imposição da penalidade.',
ARRAY['art_283'], ARRAY['notificação', 'penalidade', 'prazo'], true, true),

('ctb', 'Art. 284 CTB - Recursos', 
'Art. 284. O pagamento da multa poderá ser efetuado até a data de vencimento expressa na notificação, por oitenta por cento do seu valor.
Parágrafo único. Não incidirá cobrança moratória se o pagamento da multa for efetuado ainda que intempestivamente.',
ARRAY['art_284'], ARRAY['multa', 'desconto', 'pagamento', 'vencimento'], true, true),

('ctb', 'Art. 287 CTB - Restituição de valor indevido', 
'Art. 287. Se a infração for cometida em localidade diversa daquela do licenciamento do veículo, o recurso poderá ser apresentado junto ao órgão ou entidade de trânsito da residência ou domicílio do infrator.',
ARRAY['art_287'], ARRAY['recurso', 'localidade', 'residência'], true, true),

('ctb', 'Art. 289 CTB - Efeito suspensivo', 
'Art. 289. Ao órgão ou entidade executivo de trânsito compete, no âmbito de sua circunscrição, arrecadar o valor das multas.',
ARRAY['art_289'], ARRAY['arrecadação', 'multa', 'competência'], true, true),

('ctb', 'Art. 290 CTB - Destinação dos valores arrecadados', 
'Art. 290. A receita arrecadada com a cobrança das multas de trânsito será aplicada, exclusivamente, em sinalização, engenharia de tráfego, de campo, policiamento, fiscalização e educação de trânsito.
Parágrafo único. O percentual de 5% (cinco por cento) do valor das multas de trânsito arrecadadas será depositado, mensalmente, na conta de fundo de âmbito nacional destinado à segurança e educação de trânsito.',
ARRAY['art_290'], ARRAY['receita', 'multa', 'destinação'], true, true);

-- INSERIR RESOLUÇÕES DO CONTRAN MAIS IMPORTANTES
INSERT INTO public.legislacao_base (tipo, titulo, numero_resolucao, conteudo, artigos_relacionados, palavras_chave, is_global, ativo)
VALUES 
('contran', 'Resolução 619/2016 CONTRAN - Sinalização Viária', '619/2016',
'Estabelece e normatiza os critérios e procedimentos para a sinalização de trânsito das vias abertas à circulação pública, definindo os elementos, dimensões, cores e tipologias de sinalização horizontal, vertical e semafórica. 
Principais pontos:
- Art. 1º - A sinalização de trânsito visa organizar a circulação e garantir a segurança.
- Art. 2º - A sinalização é classificada em horizontal, vertical, semafórica, de obras e de dispositivos auxiliares.
- Art. 5º - A sinalização vertical de regulamentação tem caráter impositivo.
- Art. 10º - A sinalização deve ser legível, visível e compreensível.
- Art. 15º - A sinalização de regulamentação estabelece obrigações, proibições, restrições ou limitações.
Argumento para recursos: A sinalização que não atenda aos requisitos desta Resolução pode ser considerada ineficaz para fins de autuação.',
ARRAY['sinalização', 'resolução_619'], ARRAY['sinalização', 'placa', 'horizontal', 'vertical'], true, true),

('contran', 'Resolução 798/2020 CONTRAN - Placas e Identificação', '798/2020',
'Estabelece os requisitos técnicos e os procedimentos para a identificação veicular com placas nas cores padrão Mercosul.
Principais pontos:
- Art. 1º - As placas de identificação veicular são elementos de segurança obrigatórios.
- Art. 3º - As placas devem seguir o padrão de cores e dimensões estabelecidos.
- Art. 5º - A legibilidade das placas é requisito essencial.
- Art. 8º - Placas danificadas ou ilegíveis devem ser substituídas.
Argumento para recursos: Placas em desacordo com esta resolução podem comprometer a identificação do veículo para fins de autuação.',
ARRAY['placas', 'identificação', 'resolução_798'], ARRAY['placa', 'Mercosul', 'identificação'], true, true),

('contran', 'Resolução 432/2013 CONTRAN - Equipamentos Medidores de Velocidade', '432/2013',
'Dispõe sobre os requisitos técnicos dos equipamentos medidores de velocidade utilizados na fiscalização de trânsito.
Principais pontos:
- Art. 2º - Os equipamentos devem ser aferidos e certificados pelo INMETRO.
- Art. 4º - A aferição deve ser realizada anualmente ou sempre que houver reparo.
- Art. 6º - O erro máximo admissido é de +/- 7% para velocidades até 100km/h.
- Art. 8º - Deve haver sinalização indicando a fiscalização eletrônica.
- Art. 10º - O equipamento deve registrar data, hora, local e velocidade.
Argumento para recursos: Equipamentos sem aferição válida ou sem sinalização prévia adequada invalidam a autuação.',
ARRAY['velocidade', 'radar', 'resolução_432'], ARRAY['radar', 'velocidade', 'aferição', 'INMETRO'], true, true),

('contran', 'Resolução 471/2013 CONTRAN - Etilômetros', '471/2013',
'Regulamenta o uso de etilômetros na fiscalização do consumo de álcool por condutores de veículos.
Principais pontos:
- Art. 1º - Os etilômetros devem ser aprovados pelo INMETRO.
- Art. 3º - O teste deve ser realizado por agente de trânsito capacitado.
- Art. 5º - O condutor tem direito a novo teste em caso de dúvida.
- Art. 7º - O resultado deve ser impresso e entregue ao condutor.
- Art. 9º - A margem de tolerância é de 0,04mg/L para leitura até 0,40mg/L.
Argumento para recursos: Teste realizado sem observância dos procedimentos ou com equipamento sem aferição válida pode ser contestado.',
ARRAY['etilômetro', 'álcool', 'resolução_471'], ARRAY['etilômetro', 'bafômetro', 'álcool', 'embriaguez'], true, true),

('contran', 'Resolução 561/2015 CONTRAN - Indicação do Condutor Infrator', '561/2015',
'Estabelece os procedimentos para indicação do real condutor infrator pelo proprietário do veículo.
Principais pontos:
- Art. 1º - O proprietário pode indicar o condutor infrator para transferência de pontuação.
- Art. 2º - A indicação deve ser feita no prazo da defesa prévia ou recurso.
- Art. 3º - O condutor indicado deve possuir CNH compatível com o veículo.
- Art. 5º - A indicação é irretratável após o processamento.
- Art. 7º - A não indicação imputa a responsabilidade ao proprietário.
Argumento para recursos: A indicação do condutor deve seguir rigorosamente os prazos e procedimentos.',
ARRAY['condutor', 'indicação', 'resolução_561'], ARRAY['condutor', 'indicação', 'proprietário', 'infrator'], true, true),

('contran', 'Resolução 396/2011 CONTRAN - Equipamentos Obrigatórios', '396/2011',
'Dispõe sobre os equipamentos obrigatórios dos veículos automotores, conforme o tipo e categoria.
Principais pontos:
- Art. 1º - Todo veículo automotor deve possuir os equipamentos obrigatórios.
- Art. 2º - Os equipamentos devem estar em perfeito funcionamento.
- Art. 4º - A lista de equipamentos varia conforme categoria do veículo.
- Art. 6º - Os extintores devem estar dentro da validade.
- Art. 8º - O triângulo de sinalização é obrigatório.
Argumento para recursos: A autuação por equipamento deve especificar qual item estava ausente ou defeituoso.',
ARRAY['equipamentos', 'obrigatório', 'resolução_396'], ARRAY['equipamento', 'extintor', 'triângulo', 'obrigatório'], true, true),

('contran', 'Resolução 723/2018 CONTRAN - Sistema de Identificação Automática de Veículos', '723/2018',
'Regulamenta o Sistema de Identificação Automática de Veículos (SINIAV) e procedimentos de fiscalização.
Principais pontos:
- Art. 2º - O sistema utiliza tecnologia de radiofrequência (RFID).
- Art. 4º - A identificação deve ser vinculada ao registro do veículo.
- Art. 7º - A fiscalização deve observar os protocolos de comunicação.
Argumento para recursos: Falhas no sistema de identificação podem gerar autuações equivocadas.',
ARRAY['identificação', 'SINIAV', 'resolução_723'], ARRAY['SINIAV', 'identificação', 'RFID'], true, true),

('contran', 'Resolução 667/2017 CONTRAN - Sinalização Semafórica', '667/2017',
'Estabelece critérios para instalação, operação e manutenção de sinalização semafórica.
Principais pontos:
- Art. 3º - Os tempos de amarelo devem ser calculados conforme velocidade da via.
- Art. 5º - O tempo de vermelho geral (todos vermelho) é obrigatório.
- Art. 8º - A sincronização deve garantir fluidez e segurança.
- Art. 12º - Semáforos defeituosos devem ter fiscalização suspensa.
Argumento para recursos: Semáforos com temporização inadequada ou defeituosos invalidam autuações.',
ARRAY['semáforo', 'sinalização', 'resolução_667'], ARRAY['semáforo', 'sinal', 'vermelho', 'amarelo'], true, true),

('contran', 'Resolução 371/2010 CONTRAN - Penalidades e Recursos', '371/2010',
'Dispõe sobre o procedimento administrativo para imposição e julgamento de penalidades por infrações de trânsito.
Principais pontos:
- Art. 2º - O auto de infração deve conter todos os requisitos legais.
- Art. 5º - A notificação de autuação é requisito de validade do processo.
- Art. 8º - O prazo para defesa prévia é contado da data de notificação.
- Art. 12º - O recurso à JARI tem prazo de 30 dias após indeferimento da defesa prévia.
- Art. 15º - O recurso ao CETRAN tem prazo de 30 dias após decisão da JARI.
Argumento para recursos: Vícios no procedimento administrativo podem anular a penalidade.',
ARRAY['penalidade', 'recurso', 'resolução_371'], ARRAY['penalidade', 'recurso', 'defesa', 'JARI', 'CETRAN'], true, true),

('contran', 'Resolução 762/2018 CONTRAN - Habilitação de Condutores', '762/2018',
'Dispõe sobre os requisitos e procedimentos para a habilitação de condutores de veículos automotores.
Principais pontos:
- Art. 3º - A habilitação é condicionada a exames de aptidão física e mental.
- Art. 8º - Os exames teóricos e práticos são obrigatórios.
- Art. 15º - A renovação segue prazos conforme idade do condutor.
- Art. 20º - A mudança de categoria exige novos exames.
Argumento para recursos: Irregularidades no processo de habilitação devem ser provadas pela autoridade.',
ARRAY['habilitação', 'CNH', 'resolução_762'], ARRAY['habilitação', 'CNH', 'exame', 'renovação'], true, true),

('contran', 'Resolução 299/2008 CONTRAN - Filmagem e Fotografia', '299/2008',
'Regulamenta o uso de equipamentos audiovisuais na fiscalização de trânsito.
Principais pontos:
- Art. 2º - As imagens devem identificar claramente o veículo e a infração.
- Art. 4º - A placa deve estar legível na imagem.
- Art. 6º - O equipamento deve estar calibrado e aferido.
- Art. 8º - A data e hora devem ser registradas automaticamente.
Argumento para recursos: Imagens ilegíveis ou sem os requisitos técnicos não sustentam a autuação.',
ARRAY['filmagem', 'fotografia', 'resolução_299'], ARRAY['filmagem', 'fotografia', 'imagem', 'vídeo'], true, true),

('contran', 'Resolução 706/2017 CONTRAN - Transporte de Carga', '706/2017',
'Dispõe sobre os requisitos de segurança para o transporte de carga nos veículos.
Principais pontos:
- Art. 2º - A carga deve estar devidamente fixada e acondicionada.
- Art. 5º - O peso não pode exceder os limites do veículo.
- Art. 8º - Cargas especiais exigem autorização prévia.
- Art. 12º - O excesso de peso é verificado em balanças aferidas.
Argumento para recursos: A pesagem deve seguir os procedimentos e tolerâncias estabelecidas.',
ARRAY['carga', 'transporte', 'resolução_706'], ARRAY['carga', 'peso', 'transporte', 'balança'], true, true),

('contran', 'Resolução 277/2008 CONTRAN - Transporte de Crianças', '277/2008',
'Dispõe sobre o transporte de crianças com idade inferior a dez anos em veículos.
Principais pontos:
- Art. 2º - Crianças até 7 anos e meio devem utilizar dispositivo de retenção.
- Art. 3º - O tipo de dispositivo varia conforme idade e peso.
- Art. 5º - Crianças de 7,5 a 10 anos devem usar o banco traseiro.
- Art. 7º - Exceções para táxis e veículos de transporte coletivo.
Argumento para recursos: A fiscalização deve verificar idade, peso e tipo de dispositivo.',
ARRAY['criança', 'transporte', 'resolução_277'], ARRAY['criança', 'cadeirinha', 'assento', 'elevação'], true, true),

('contran', 'Resolução 453/2013 CONTRAN - Motocicletas', '453/2013',
'Regulamenta os equipamentos obrigatórios para condutores e passageiros de motocicletas.
Principais pontos:
- Art. 2º - O capacete é obrigatório para condutor e passageiro.
- Art. 4º - O capacete deve ter selo do INMETRO.
- Art. 6º - Óculos de proteção ou viseira são obrigatórios.
- Art. 8º - Vestuário de proteção é recomendado.
Argumento para recursos: Capacetes devem estar certificados e em bom estado de conservação.',
ARRAY['motocicleta', 'capacete', 'resolução_453'], ARRAY['motocicleta', 'capacete', 'moto', 'INMETRO'], true, true),

('contran', 'Resolução 819/2021 CONTRAN - Registro e Licenciamento', '819/2021',
'Dispõe sobre o registro e licenciamento de veículos no território nacional.
Principais pontos:
- Art. 3º - Todo veículo deve ser registrado no órgão de trânsito.
- Art. 8º - O licenciamento anual é obrigatório.
- Art. 12º - A transferência deve ser comunicada em 30 dias.
- Art. 15º - O CRLV digital tem a mesma validade do documento físico.
Argumento para recursos: Verificar se o veículo estava regularmente licenciado na data da infração.',
ARRAY['registro', 'licenciamento', 'resolução_819'], ARRAY['registro', 'licenciamento', 'CRLV', 'transferência'], true, true),

('contran', 'Resolução 168/2004 CONTRAN - Auto de Infração', '168/2004',
'Estabelece os requisitos e procedimentos para lavratura do auto de infração de trânsito.
Principais pontos:
- Art. 2º - O auto de infração deve conter: identificação do veículo, condutor (se identificado), local, data, hora.
- Art. 3º - A descrição da infração deve ser clara e precisa.
- Art. 5º - O código da infração deve corresponder à conduta descrita.
- Art. 7º - Erros formais podem invalidar a autuação.
- Art. 9º - O agente deve estar devidamente credenciado.
Argumentos para recursos: 
1) Ausência de requisitos essenciais no auto;
2) Descrição genérica ou incompatível com o código;
3) Agente não credenciado;
4) Local inexato ou incorreto.',
ARRAY['auto_infração', 'autuação', 'resolução_168'], ARRAY['auto', 'infração', 'autuação', 'requisitos'], true, true),

('contran', 'Resolução 985/2022 CONTRAN - Tolerância de Velocidade', '985/2022',
'Atualiza as tolerâncias para medição de velocidade por equipamentos de fiscalização.
Principais pontos:
- Art. 2º - A velocidade considerada é a aferida menos a tolerância.
- Art. 3º - Tolerância de 7km/h para velocidades até 100km/h.
- Art. 4º - Tolerância de 7% para velocidades acima de 100km/h.
- Art. 6º - Equipamentos devem ter certificação INMETRO válida.
Argumento para recursos: Verificar se a tolerância foi corretamente aplicada.',
ARRAY['velocidade', 'tolerância', 'resolução_985'], ARRAY['velocidade', 'tolerância', 'radar', 'excesso'], true, true),

('contran', 'Resolução 812/2021 CONTRAN - Notificações Eletrônicas', '812/2021',
'Regulamenta o envio de notificações de autuação e penalidade por meios eletrônicos.
Principais pontos:
- Art. 2º - A notificação eletrônica tem a mesma validade da postal.
- Art. 4º - O proprietário deve cadastrar e-mail no sistema.
- Art. 6º - A ciência é presumida após 5 dias do envio.
- Art. 8º - Os prazos para defesa e recurso são contados da ciência.
Argumento para recursos: Notificação não recebida ou para e-mail não cadastrado pode ser contestada.',
ARRAY['notificação', 'eletrônica', 'resolução_812'], ARRAY['notificação', 'eletrônica', 'e-mail', 'digital'], true, true),

('contran', 'Resolução 900/2022 CONTRAN - Sistema de Pontuação', '900/2022',
'Atualiza as regras do sistema de pontuação na CNH e suspensão do direito de dirigir.
Principais pontos:
- Art. 2º - A pontuação é computada na data da infração.
- Art. 4º - Os pontos têm validade de 12 meses.
- Art. 6º - Limite de 40 pontos para motoristas profissionais exercendo atividade.
- Art. 8º - Limite de 30 pontos para motoristas não profissionais.
- Art. 10º - A frequência em curso de reciclagem elimina pontos.
Argumento para recursos: Verificar se a pontuação está sendo computada corretamente.',
ARRAY['pontuação', 'CNH', 'resolução_900'], ARRAY['pontuação', 'pontos', 'CNH', 'suspensão'], true, true),

('contran', 'Resolução 789/2020 CONTRAN - Conversão de Multa em Advertência', '789/2020',
'Regulamenta os critérios para conversão de multa em advertência por escrito.
Principais pontos:
- Art. 2º - Infrações leves e médias podem ser convertidas se o infrator não for reincidente.
- Art. 4º - A solicitação deve ser feita na defesa prévia ou recurso.
- Art. 6º - O órgão de trânsito deve analisar as circunstâncias.
- Art. 8º - A conversão não gera pontuação na CNH.
Argumento para recursos: Solicitar conversão fundamentando inexistência de reincidência e circunstâncias atenuantes.',
ARRAY['conversão', 'advertência', 'resolução_789'], ARRAY['conversão', 'advertência', 'multa', 'leve', 'média'], true, true),

('contran', 'Resolução 782/2020 CONTRAN - Fiscalização em Rodovias', '782/2020',
'Estabelece procedimentos para fiscalização de trânsito em rodovias federais e estaduais.
Principais pontos:
- Art. 3º - A fiscalização pode ser fixa, móvel ou embarcada.
- Art. 5º - Os equipamentos devem estar devidamente sinalizados.
- Art. 8º - A abordagem deve seguir protocolos de segurança.
- Art. 12º - O local de fiscalização deve ter condições de segurança.
Argumento para recursos: Local de fiscalização inadequado ou sem sinalização pode invalidar autuação.',
ARRAY['fiscalização', 'rodovia', 'resolução_782'], ARRAY['fiscalização', 'rodovia', 'radar', 'abordagem'], true, true);