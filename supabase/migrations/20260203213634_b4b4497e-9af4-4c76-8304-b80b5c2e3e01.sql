-- Tabela para notificações de novas multas encontradas pelo rastreamento
CREATE TABLE IF NOT EXISTS public.notificacoes_multas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE CASCADE NOT NULL,
  multa_id UUID REFERENCES public.multas(id) ON DELETE CASCADE NOT NULL,
  placa TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2),
  lido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notificacoes_multas_org ON public.notificacoes_multas(organization_id);
CREATE INDEX idx_notificacoes_multas_lido ON public.notificacoes_multas(organization_id, lido);

-- RLS
ALTER TABLE public.notificacoes_multas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org notifications" ON public.notificacoes_multas
  FOR SELECT USING (
    organization_id IN (SELECT get_user_organization_ids(auth.uid()))
  );

CREATE POLICY "Users can update own org notifications" ON public.notificacoes_multas
  FOR UPDATE USING (
    organization_id IN (SELECT get_user_organization_ids(auth.uid()))
  );

CREATE POLICY "Users can delete own org notifications" ON public.notificacoes_multas
  FOR DELETE USING (
    organization_id IN (SELECT get_user_organization_ids(auth.uid()))
  );

-- Insert via service role (edge function)
CREATE POLICY "Service role can insert notifications" ON public.notificacoes_multas
  FOR INSERT WITH CHECK (true);

-- Inserir multa de teste
INSERT INTO multas (
  veiculo_id,
  placa_autuada,
  codigo_infracao,
  descricao,
  valor,
  pontos,
  gravidade,
  data_multa,
  data_vencimento,
  local_infracao,
  orgao_autuador,
  numero_auto,
  municipio,
  uf_infracao,
  status
) VALUES (
  '4f72d051-a002-42d8-aa8c-c2988b0fdb82',
  'KQT4616',
  '74550',
  'Conduzir veículo sem CNH ou PPD',
  293.47,
  7,
  'gravissima',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  'AV. BRASIL, 1500',
  'DETRAN-RJ',
  'RJ-TEST-001',
  'RIO DE JANEIRO',
  'RJ',
  'pendente'
);

-- Inserir notificação de teste para a multa
INSERT INTO notificacoes_multas (
  organization_id,
  veiculo_id,
  multa_id,
  placa,
  descricao,
  valor,
  lido
) 
SELECT 
  '379823ca-c287-4f1b-83cb-ed76a31b7d5e',
  '4f72d051-a002-42d8-aa8c-c2988b0fdb82',
  m.id,
  'KQT4616',
  'Conduzir veículo sem CNH ou PPD',
  293.47,
  false
FROM multas m 
WHERE m.numero_auto = 'RJ-TEST-001'
LIMIT 1;