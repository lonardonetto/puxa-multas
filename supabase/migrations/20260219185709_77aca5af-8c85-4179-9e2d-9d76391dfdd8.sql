
-- Tabela de notificações de recargas PIX (para sino do header)
CREATE TABLE IF NOT EXISTS public.notificacoes_recarga (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  solicitacao_id uuid NOT NULL,
  tipo text NOT NULL DEFAULT 'pix_pendente', -- 'pix_pendente' | 'pix_aprovado' | 'pix_rejeitado'
  titulo text NOT NULL,
  mensagem text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  lido boolean NOT NULL DEFAULT false,
  para_super_admin boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notificacoes_recarga ENABLE ROW LEVEL SECURITY;

-- Usuários da org veem suas notificações
CREATE POLICY "Users can view own org recarga notifications"
  ON public.notificacoes_recarga FOR SELECT
  USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())) AND para_super_admin = false);

-- Super admins veem todas
CREATE POLICY "Super admins can view all recarga notifications"
  ON public.notificacoes_recarga FOR SELECT
  USING (is_super_admin(auth.uid()));

-- Usuários podem marcar suas próprias como lidas
CREATE POLICY "Users can update own org recarga notifications"
  ON public.notificacoes_recarga FOR UPDATE
  USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())) AND para_super_admin = false);

-- Super admins podem atualizar qualquer uma
CREATE POLICY "Super admins can update any recarga notification"
  ON public.notificacoes_recarga FOR UPDATE
  USING (is_super_admin(auth.uid()));

-- Insert para service role (via edge functions)
CREATE POLICY "Authenticated users can insert recarga notifications"
  ON public.notificacoes_recarga FOR INSERT
  WITH CHECK (true);

-- Delete para limpar
CREATE POLICY "Users can delete own org recarga notifications"
  ON public.notificacoes_recarga FOR DELETE
  USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())) AND para_super_admin = false);

CREATE POLICY "Super admins can delete recarga notifications"
  ON public.notificacoes_recarga FOR DELETE
  USING (is_super_admin(auth.uid()));
