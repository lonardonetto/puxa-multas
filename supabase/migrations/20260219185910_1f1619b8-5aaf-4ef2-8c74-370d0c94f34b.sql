
-- Corrige política de INSERT para exigir autenticação
DROP POLICY IF EXISTS "Authenticated users can insert recarga notifications" ON public.notificacoes_recarga;

CREATE POLICY "Authenticated users can insert recarga notifications"
  ON public.notificacoes_recarga FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
