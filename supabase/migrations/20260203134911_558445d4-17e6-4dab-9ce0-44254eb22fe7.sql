-- Criar tabela para armazenar documentos legais (CTB e Resoluções CONTRAN)
CREATE TABLE public.legislacao_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('ctb', 'contran', 'jurisprudencia', 'outro')),
    titulo TEXT NOT NULL,
    descricao TEXT,
    conteudo TEXT,  -- Conteúdo extraído do documento
    arquivo_url TEXT,  -- URL do arquivo original
    numero_resolucao TEXT,  -- Para resoluções do CONTRAN
    data_publicacao DATE,
    data_vigencia DATE,
    artigos_relacionados TEXT[],  -- Artigos do CTB relacionados
    palavras_chave TEXT[],  -- Para busca
    ativo BOOLEAN DEFAULT true,
    is_global BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_legislacao_base_tipo ON public.legislacao_base(tipo);
CREATE INDEX idx_legislacao_base_ativo ON public.legislacao_base(ativo);
CREATE INDEX idx_legislacao_base_palavras_chave ON public.legislacao_base USING GIN(palavras_chave);
CREATE INDEX idx_legislacao_base_artigos ON public.legislacao_base USING GIN(artigos_relacionados);

-- Habilitar RLS
ALTER TABLE public.legislacao_base ENABLE ROW LEVEL SECURITY;

-- Policy para leitura (todos autenticados podem ler documentos globais ativos)
CREATE POLICY "Legislação global pode ser lida por todos" ON public.legislacao_base
    FOR SELECT USING (is_global = true AND ativo = true);

-- Policy para Super Admin gerenciar (inserir, atualizar, deletar)
-- Assumindo que super_admins são identificados pela role na tabela users
CREATE POLICY "Super admin pode gerenciar legislação" ON public.legislacao_base
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Trigger para updated_at
CREATE TRIGGER update_legislacao_base_updated_at
    BEFORE UPDATE ON public.legislacao_base
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais do CTB (principais artigos usados em recursos)
INSERT INTO public.legislacao_base (tipo, titulo, descricao, conteudo, artigos_relacionados, palavras_chave) VALUES
('ctb', 'Art. 280 CTB - Auto de Infração', 
 'Requisitos obrigatórios do Auto de Infração de Trânsito',
 'Art. 280. Ocorrendo infração prevista na legislação de trânsito, lavrar-se-á auto de infração, do qual constará:
I - tipificação da infração;
II - local, data e hora do cometimento da infração;
III - caracteres da placa de identificação do veículo, sua marca e espécie, e outros elementos julgados necessários à sua identificação;
IV - o prontuário do condutor, sempre que possível;
V - identificação do órgão ou entidade e da autoridade ou agente autuador ou equipamento que comprovar a infração;
VI - assinatura do infrator, sempre que possível, valendo esta como notificação do cometimento da infração.

§ 1º Não sendo possível a autuação em flagrante, o agente de trânsito relatará o fato à autoridade no próprio auto de infração, informando os dados a respeito do veículo, além dos constantes nos incisos I, II e III, para o procedimento previsto no artigo seguinte.
§ 2º A infração deverá ser comprovada por declaração da autoridade ou do agente da autoridade de trânsito, por aparelho eletrônico ou por equipamento audiovisual, reações químicas ou qualquer outro meio tecnologicamente disponível, previamente regulamentado pelo CONTRAN.',
 ARRAY['280'], 
 ARRAY['auto de infração', 'requisitos', 'nulidade', 'formalidade', 'assinatura']),

('ctb', 'Art. 281 CTB - Ampla Defesa',
 'Garantia constitucional de ampla defesa e contraditório',
 'Art. 281. A autoridade de trânsito, na esfera das competências estabelecidas neste Código e dentro de sua circunscrição, deverá aplicar, às infrações nela cometidas, as penalidades nele previstas, com observância dos princípios da ampla defesa e do contraditório.

Parágrafo único. O processo administrativo para apuração das infrações de trânsito deverá respeitar os princípios da ampla defesa e do contraditório, assegurando-se ao infrator o direito de apresentar defesa prévia, recurso e de ser notificado de todas as decisões.',
 ARRAY['281'],
 ARRAY['ampla defesa', 'contraditório', 'devido processo', 'defesa prévia', 'recurso']),

('ctb', 'Art. 282 CTB - Notificação',
 'Requisitos e prazos de notificação da autuação',
 'Art. 282. Aplicada a penalidade, será expedida notificação ao proprietário do veículo ou ao infrator, por remessa postal ou por qualquer outro meio tecnológico hábil, que assegure a ciência da imposição da penalidade.

§ 1º A notificação devolvida por desatualização do endereço do proprietário do veículo será considerada válida para todos os efeitos.
§ 2º A notificação a pessoal de missões diplomáticas, de repartições consulares de carreira e de representações de organismos internacionais e de seus integrantes será remetida ao Ministério das Relações Exteriores para as providências cabíveis e cobrança dos valores, no caso de multa.',
 ARRAY['282'],
 ARRAY['notificação', 'prazo', 'ciência', 'remessa postal', 'endereço']),

('ctb', 'Art. 285 CTB - Defesa Prévia',
 'Prazo e procedimento para Defesa Prévia',
 'Art. 285. O infrator terá o prazo de 30 (trinta) dias, contado da data da notificação da autuação, para apresentar defesa prévia, que será analisada pela autoridade de trânsito.

§ 1º Na defesa prévia, o infrator poderá requerer a produção de provas.
§ 2º Se a defesa prévia for indeferida ou não for apresentada no prazo, a autoridade de trânsito procederá à aplicação da penalidade e expedirá a notificação da imposição.',
 ARRAY['285'],
 ARRAY['defesa prévia', 'prazo', '30 dias', 'notificação', 'autuação']),

('ctb', 'Art. 286 CTB - Recurso à JARI',
 'Recurso em primeira instância à JARI',
 'Art. 286. O recurso contra a imposição de multa de trânsito será interposto perante a autoridade que impôs a penalidade, a qual remetê-lo-á à JARI, que o julgará em primeira instância.

§ 1º O recurso será interposto no prazo de 30 (trinta) dias contados da data da notificação da penalidade.
§ 2º O recurso terá efeito suspensivo no que se refere à multa.',
 ARRAY['286'],
 ARRAY['JARI', 'recurso', 'primeira instância', '30 dias', 'efeito suspensivo']),

('ctb', 'Art. 288 CTB - Recurso ao CETRAN',
 'Recurso em segunda instância ao CETRAN',
 'Art. 288. Das decisões da JARI cabe recurso ao CETRAN, no prazo de 30 (trinta) dias contados da publicação ou da ciência da decisão.

§ 1º O recurso será interposto perante a JARI, que o encaminhará ao CETRAN.
§ 2º O recurso não terá efeito suspensivo.',
 ARRAY['288'],
 ARRAY['CETRAN', 'recurso', 'segunda instância', '30 dias', 'publicação']);
