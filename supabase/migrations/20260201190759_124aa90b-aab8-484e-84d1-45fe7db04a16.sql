-- Criar tabela para histórico de consultas de rastreamento
CREATE TABLE public.consultas_rastreamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  placa TEXT NOT NULL,
  cliente_nome TEXT,
  cliente_documento TEXT,
  modelo_veiculo TEXT,
  ano_veiculo TEXT,
  valor_cobrado NUMERIC NOT NULL DEFAULT 0,
  resposta_api JSONB,
  multas_encontradas INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'sucesso',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.consultas_rastreamento ENABLE ROW LEVEL SECURITY;

-- Política de leitura para usuários autenticados
CREATE POLICY "Authenticated users can read consultas_rastreamento"
  ON public.consultas_rastreamento
  FOR SELECT
  USING (true);

-- Política de gerenciamento para usuários da organização
CREATE POLICY "Users can manage consultas of their organization"
  ON public.consultas_rastreamento
  FOR ALL
  USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

-- Índices para performance
CREATE INDEX idx_consultas_rastreamento_veiculo ON public.consultas_rastreamento(veiculo_id);
CREATE INDEX idx_consultas_rastreamento_organization ON public.consultas_rastreamento(organization_id);
CREATE INDEX idx_consultas_rastreamento_created ON public.consultas_rastreamento(created_at DESC);

-- Comentários
COMMENT ON TABLE public.consultas_rastreamento IS 'Histórico de consultas de rastreamento de multas';
COMMENT ON COLUMN public.consultas_rastreamento.resposta_api IS 'Resposta completa da API CertaDoc em JSON';