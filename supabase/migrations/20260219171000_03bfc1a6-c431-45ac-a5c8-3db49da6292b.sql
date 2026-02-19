
-- Tabela de registro de notificações (auditoria imutável)
CREATE TABLE public.registro_notificacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id uuid REFERENCES public.contratos(id) ON DELETE SET NULL,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  organization_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  usuario_nome text NOT NULL,
  usuario_email text NOT NULL,
  cliente_nome text NOT NULL,
  cliente_telefone text,
  auto_infracao text,
  status_recurso text,
  mensagem_enviada text,
  confirmacao_usuario boolean NOT NULL DEFAULT true,
  ip_address text,
  user_agent text,
  hash_integridade text NOT NULL,
  horario_brasilia text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.registro_notificacoes ENABLE ROW LEVEL SECURITY;

-- Usuários da org podem VER seus registros (nunca editar/deletar)
CREATE POLICY "Users can view own org registros"
ON public.registro_notificacoes
FOR SELECT
USING (
  organization_id IN (SELECT get_user_organization_ids(auth.uid()))
  OR is_super_admin(auth.uid())
);

-- Apenas insert via service role (edge function) - ninguém insere pelo client
CREATE POLICY "Service role can insert registros"
ON public.registro_notificacoes
FOR INSERT
WITH CHECK (true);

-- Ninguém pode UPDATE ou DELETE - dados imutáveis
-- (sem policy = bloqueado por RLS)

-- Index para consultas rápidas
CREATE INDEX idx_registro_notificacoes_contrato ON public.registro_notificacoes(contrato_id);
CREATE INDEX idx_registro_notificacoes_org ON public.registro_notificacoes(organization_id);
CREATE INDEX idx_registro_notificacoes_created ON public.registro_notificacoes(created_at DESC);
