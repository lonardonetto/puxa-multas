
-- Add ON DELETE CASCADE to all tables referencing organizations
ALTER TABLE public.user_organizations DROP CONSTRAINT IF EXISTS user_organizations_organization_id_fkey;
ALTER TABLE public.user_organizations ADD CONSTRAINT user_organizations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS clientes_organization_id_fkey;
ALTER TABLE public.clientes ADD CONSTRAINT clientes_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.contratos DROP CONSTRAINT IF EXISTS contratos_organization_id_fkey;
ALTER TABLE public.contratos ADD CONSTRAINT contratos_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.servicos DROP CONSTRAINT IF EXISTS servicos_organization_id_fkey;
ALTER TABLE public.servicos ADD CONSTRAINT servicos_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.historico_atividades DROP CONSTRAINT IF EXISTS historico_atividades_organization_id_fkey;
ALTER TABLE public.historico_atividades ADD CONSTRAINT historico_atividades_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.fases_custom DROP CONSTRAINT IF EXISTS fases_custom_organization_id_fkey;
ALTER TABLE public.fases_custom ADD CONSTRAINT fases_custom_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.recursos DROP CONSTRAINT IF EXISTS recursos_organization_id_fkey;
ALTER TABLE public.recursos ADD CONSTRAINT recursos_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.recursos_conhecimento DROP CONSTRAINT IF EXISTS recursos_conhecimento_organization_id_fkey;
ALTER TABLE public.recursos_conhecimento ADD CONSTRAINT recursos_conhecimento_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.faturamento DROP CONSTRAINT IF EXISTS faturamento_organization_id_fkey;
ALTER TABLE public.faturamento ADD CONSTRAINT faturamento_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.consultas_rastreamento DROP CONSTRAINT IF EXISTS consultas_rastreamento_organization_id_fkey;
ALTER TABLE public.consultas_rastreamento ADD CONSTRAINT consultas_rastreamento_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.rastreamento_cobrancas DROP CONSTRAINT IF EXISTS rastreamento_cobrancas_organization_id_fkey;
ALTER TABLE public.rastreamento_cobrancas ADD CONSTRAINT rastreamento_cobrancas_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.notificacoes_multas DROP CONSTRAINT IF EXISTS notificacoes_multas_organization_id_fkey;
ALTER TABLE public.notificacoes_multas ADD CONSTRAINT notificacoes_multas_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.edital_compras DROP CONSTRAINT IF EXISTS edital_compras_organization_id_fkey;
ALTER TABLE public.edital_compras ADD CONSTRAINT edital_compras_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.planos DROP CONSTRAINT IF EXISTS planos_organization_id_fkey;
ALTER TABLE public.planos ADD CONSTRAINT planos_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Allow super_admins to DELETE organizations
CREATE POLICY "Super admins can delete organizations"
ON public.organizations
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'
));
