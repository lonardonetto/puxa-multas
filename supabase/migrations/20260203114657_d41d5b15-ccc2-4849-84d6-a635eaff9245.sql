-- ========================================
-- MIGRAÇÃO: Sistema de Rastreamento + Base de Conhecimento IA
-- ========================================

-- 1. Tabela para armazenar recursos deferidos (Base de Conhecimento IA)
CREATE TABLE IF NOT EXISTS public.recursos_conhecimento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id),
    codigo_infracao TEXT NOT NULL,
    tipo_recurso TEXT NOT NULL, -- defesa_previa, jari, cetran
    conteudo TEXT NOT NULL, -- Texto completo do recurso deferido
    argumentos_chave TEXT[], -- Argumentos que foram efetivos
    resultado TEXT DEFAULT 'deferido', -- deferido, parcialmente_deferido
    detran_estado TEXT, -- Estado do DETRAN que deferiu
    data_deferimento DATE,
    observacoes TEXT,
    is_global BOOLEAN DEFAULT false, -- Se é global (visível para todos) ou apenas da organização
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Adicionar colunas para upload de AIT no recurso
ALTER TABLE public.recursos ADD COLUMN IF NOT EXISTS ait_url TEXT;
ALTER TABLE public.recursos ADD COLUMN IF NOT EXISTS ait_dados_extraidos JSONB;

-- 3. Adicionar coluna de rastreamento nos veículos do cadastro
-- (já existe rastreamento_ativo, rastreamento_inicio, etc.)

-- 4. Adicionar referência ao contrato quando recurso é criado
ALTER TABLE public.recursos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id);
ALTER TABLE public.recursos ADD COLUMN IF NOT EXISTS veiculo_id UUID REFERENCES public.veiculos(id);

-- 5. Habilitar RLS na nova tabela
ALTER TABLE public.recursos_conhecimento ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para recursos_conhecimento
-- Super Admins podem ver/editar tudo
CREATE POLICY "Super admins full access conhecimento"
ON public.recursos_conhecimento
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'super_admin'
    )
);

-- Usuários podem ver recursos globais e da sua organização
CREATE POLICY "Users can view global and org conhecimento"
ON public.recursos_conhecimento
FOR SELECT
USING (
    is_global = true
    OR organization_id IN (
        SELECT organization_id FROM public.user_organizations
        WHERE user_id = auth.uid()
    )
);

-- Usuários podem inserir na sua organização
CREATE POLICY "Users can insert org conhecimento"
ON public.recursos_conhecimento
FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_organizations
        WHERE user_id = auth.uid()
    )
);

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_recursos_conhecimento_codigo ON public.recursos_conhecimento(codigo_infracao);
CREATE INDEX IF NOT EXISTS idx_recursos_conhecimento_tipo ON public.recursos_conhecimento(tipo_recurso);
CREATE INDEX IF NOT EXISTS idx_recursos_conhecimento_global ON public.recursos_conhecimento(is_global);
CREATE INDEX IF NOT EXISTS idx_recursos_cliente ON public.recursos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_recursos_veiculo ON public.recursos(veiculo_id);

-- 8. Trigger para updated_at
CREATE OR REPLACE TRIGGER update_recursos_conhecimento_updated_at
BEFORE UPDATE ON public.recursos_conhecimento
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();