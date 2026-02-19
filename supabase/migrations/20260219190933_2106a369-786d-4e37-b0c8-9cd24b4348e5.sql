
-- Tabela de solicitações de assinatura de plano
CREATE TABLE IF NOT EXISTS public.solicitacoes_plano (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  plano_id uuid NOT NULL REFERENCES public.planos(id),
  plano_slug text NOT NULL,
  plano_nome text NOT NULL,
  ciclo text NOT NULL DEFAULT 'mensal', -- 'mensal' | 'anual'
  valor numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente', -- 'pendente' | 'aprovado' | 'rejeitado'
  observacao text,
  aprovado_por uuid,
  aprovado_em timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.solicitacoes_plano ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create plan requests for their org"
  ON public.solicitacoes_plano FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Users can view own org plan requests"
  ON public.solicitacoes_plano FOR SELECT
  USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Super admins can view all plan requests"
  ON public.solicitacoes_plano FOR SELECT
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update plan requests"
  ON public.solicitacoes_plano FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- Trigger updated_at
CREATE TRIGGER update_solicitacoes_plano_updated_at
  BEFORE UPDATE ON public.solicitacoes_plano
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
