-- Create table for traffic authorities (DETRANs, JARIs, CETRANs)
CREATE TABLE public.orgaos_transito (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    estado text NOT NULL,
    sigla_estado text NOT NULL,
    tipo text NOT NULL, -- 'detran', 'jari', 'cetran'
    nome text NOT NULL,
    endereco text,
    email text,
    telefone text,
    site_url text,
    prazo_defesa_previa integer DEFAULT 15, -- dias
    prazo_jari integer DEFAULT 30, -- dias
    prazo_cetran integer DEFAULT 30, -- dias
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create table for legal foundations by state/type
CREATE TABLE public.fundamentos_legais (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    orgao_id uuid REFERENCES public.orgaos_transito(id) ON DELETE CASCADE,
    tipo_recurso text NOT NULL, -- 'defesa_previa', 'jari', 'cetran'
    codigo_infracao text, -- null = applies to all
    titulo text NOT NULL,
    conteudo text NOT NULL,
    ordem integer DEFAULT 0,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create table for resource templates
CREATE TABLE public.templates_recursos (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    orgao_id uuid REFERENCES public.orgaos_transito(id) ON DELETE CASCADE,
    tipo_recurso text NOT NULL, -- 'defesa_previa', 'jari', 'cetran'
    codigo_infracao text, -- null = generic template
    titulo text NOT NULL,
    cabecalho text, -- header template
    corpo text NOT NULL, -- body template with placeholders
    rodape text, -- footer template
    prompt_ia text, -- prompt to use with AI
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orgaos_transito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundamentos_legais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_recursos ENABLE ROW LEVEL SECURITY;

-- RLS Policies - read access for authenticated users
CREATE POLICY "Authenticated users can read orgaos" 
ON public.orgaos_transito FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can read fundamentos" 
ON public.fundamentos_legais FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Authenticated users can read templates" 
ON public.templates_recursos FOR SELECT 
TO authenticated USING (true);

-- Super admins can manage all
CREATE POLICY "Super admins can manage orgaos" 
ON public.orgaos_transito FOR ALL 
USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

CREATE POLICY "Super admins can manage fundamentos" 
ON public.fundamentos_legais FOR ALL 
USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

CREATE POLICY "Super admins can manage templates" 
ON public.templates_recursos FOR ALL 
USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- Insert all Brazilian states DETRANs
INSERT INTO public.orgaos_transito (estado, sigla_estado, tipo, nome, prazo_defesa_previa, prazo_jari, prazo_cetran) VALUES
('Acre', 'AC', 'detran', 'DETRAN-AC', 15, 30, 30),
('Alagoas', 'AL', 'detran', 'DETRAN-AL', 15, 30, 30),
('Amapá', 'AP', 'detran', 'DETRAN-AP', 15, 30, 30),
('Amazonas', 'AM', 'detran', 'DETRAN-AM', 15, 30, 30),
('Bahia', 'BA', 'detran', 'DETRAN-BA', 15, 30, 30),
('Ceará', 'CE', 'detran', 'DETRAN-CE', 15, 30, 30),
('Distrito Federal', 'DF', 'detran', 'DETRAN-DF', 15, 30, 30),
('Espírito Santo', 'ES', 'detran', 'DETRAN-ES', 15, 30, 30),
('Goiás', 'GO', 'detran', 'DETRAN-GO', 15, 30, 30),
('Maranhão', 'MA', 'detran', 'DETRAN-MA', 15, 30, 30),
('Mato Grosso', 'MT', 'detran', 'DETRAN-MT', 15, 30, 30),
('Mato Grosso do Sul', 'MS', 'detran', 'DETRAN-MS', 15, 30, 30),
('Minas Gerais', 'MG', 'detran', 'DETRAN-MG', 15, 30, 30),
('Pará', 'PA', 'detran', 'DETRAN-PA', 15, 30, 30),
('Paraíba', 'PB', 'detran', 'DETRAN-PB', 15, 30, 30),
('Paraná', 'PR', 'detran', 'DETRAN-PR', 15, 30, 30),
('Pernambuco', 'PE', 'detran', 'DETRAN-PE', 15, 30, 30),
('Piauí', 'PI', 'detran', 'DETRAN-PI', 15, 30, 30),
('Rio de Janeiro', 'RJ', 'detran', 'DETRAN-RJ', 15, 30, 30),
('Rio Grande do Norte', 'RN', 'detran', 'DETRAN-RN', 15, 30, 30),
('Rio Grande do Sul', 'RS', 'detran', 'DETRAN-RS', 15, 30, 30),
('Rondônia', 'RO', 'detran', 'DETRAN-RO', 15, 30, 30),
('Roraima', 'RR', 'detran', 'DETRAN-RR', 15, 30, 30),
('Santa Catarina', 'SC', 'detran', 'DETRAN-SC', 15, 30, 30),
('São Paulo', 'SP', 'detran', 'DETRAN-SP', 15, 30, 30),
('Sergipe', 'SE', 'detran', 'DETRAN-SE', 15, 30, 30),
('Tocantins', 'TO', 'detran', 'DETRAN-TO', 15, 30, 30);

-- Insert generic legal foundations
INSERT INTO public.fundamentos_legais (orgao_id, tipo_recurso, titulo, conteudo, ordem) 
SELECT id, 'defesa_previa', 'Código de Trânsito Brasileiro', 
'Art. 280 do CTB - O auto de infração deve conter obrigatoriamente todos os requisitos legais sob pena de nulidade.
Art. 281 do CTB - A autoridade de trânsito, na esfera administrativa, julgará a consistência do auto de infração.
Art. 282 do CTB - Aplicada a penalidade, será expedida notificação ao proprietário do veículo.', 1
FROM public.orgaos_transito WHERE tipo = 'detran';

INSERT INTO public.fundamentos_legais (orgao_id, tipo_recurso, titulo, conteudo, ordem)
SELECT id, 'defesa_previa', 'Resolução CONTRAN 619/2016',
'Art. 10 - A notificação da autuação deverá conter, no mínimo: dados do veículo, enquadramento da infração, local, data, hora da infração.
Art. 11 - A falta de qualquer requisito essencial invalida a notificação.', 2
FROM public.orgaos_transito WHERE tipo = 'detran';

-- Insert generic templates
INSERT INTO public.templates_recursos (orgao_id, tipo_recurso, titulo, cabecalho, corpo, rodape, prompt_ia)
SELECT id, 'defesa_previa', 'Defesa Prévia Genérica',
'Ilmo(a). Sr(a). Presidente da Junta Administrativa de Recursos de Infrações - JARI
{{ORGAO_NOME}}
{{ORGAO_ENDERECO}}',
'{{NOME_CONDUTOR}}, inscrito(a) no CPF sob o nº {{CPF_CONDUTOR}}, vem, respeitosamente, à presença de Vossa Senhoria, apresentar DEFESA PRÉVIA em face do Auto de Infração nº {{AUTO_INFRACAO}}, pelos fatos e fundamentos a seguir expostos:

I - DOS FATOS
{{DESCRICAO_FATOS}}

II - DO DIREITO
{{FUNDAMENTOS_LEGAIS}}

III - DO PEDIDO
Ante o exposto, requer-se:
a) O conhecimento e provimento da presente defesa;
b) O cancelamento do Auto de Infração nº {{AUTO_INFRACAO}};
c) A não aplicação de qualquer penalidade.

Nestes termos, pede deferimento.',
'{{CIDADE}}, {{DATA_EXTENSO}}

_______________________________
{{NOME_CONDUTOR}}
CPF: {{CPF_CONDUTOR}}',
'Você é um advogado especialista em direito de trânsito brasileiro. Gere uma defesa prévia completa e fundamentada para a infração descrita. Use linguagem formal jurídica, cite artigos do CTB, resoluções do CONTRAN e jurisprudências relevantes. A defesa deve ser persuasiva e tecnicamente correta.'
FROM public.orgaos_transito WHERE tipo = 'detran';