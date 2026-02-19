
-- Tabela de solicitações de recarga via PIX (aguarda aprovação do Super Admin)
CREATE TABLE public.solicitacoes_recarga (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  valor NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  metodo_pagamento TEXT NOT NULL DEFAULT 'pix',
  comprovante_url TEXT,
  observacao TEXT,
  payload_pix TEXT,
  aprovado_por UUID,
  aprovado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.solicitacoes_recarga ENABLE ROW LEVEL SECURITY;

-- Users can only see their own org's requests
CREATE POLICY "Users can view own org requests"
  ON public.solicitacoes_recarga FOR SELECT
  USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

-- Users can create requests for their own org
CREATE POLICY "Users can create requests for their org"
  ON public.solicitacoes_recarga FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

-- Super admins can see all requests
CREATE POLICY "Super admins can view all requests"
  ON public.solicitacoes_recarga FOR SELECT
  USING (is_super_admin(auth.uid()));

-- Super admins can update (approve/reject) requests
CREATE POLICY "Super admins can update requests"
  ON public.solicitacoes_recarga FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- Trigger to update updated_at
CREATE TRIGGER update_solicitacoes_recarga_updated_at
  BEFORE UPDATE ON public.solicitacoes_recarga
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
