-- Drop existing problematic policies on user_organizations
DROP POLICY IF EXISTS "Users can read their own organization memberships" ON public.user_organizations;
DROP POLICY IF EXISTS "Users can manage organization memberships" ON public.user_organizations;

-- Create a security definer function to get user's organization IDs without recursion
CREATE OR REPLACE FUNCTION public.get_user_organization_ids(p_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id 
  FROM public.user_organizations 
  WHERE user_id = p_user_id;
$$;

-- Create a security definer function to check if user belongs to organization
CREATE OR REPLACE FUNCTION public.user_belongs_to_organization(p_user_id uuid, p_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_organizations 
    WHERE user_id = p_user_id AND organization_id = p_org_id
  );
$$;

-- Create simple, non-recursive policies for user_organizations
CREATE POLICY "Users can read own memberships"
ON public.user_organizations
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own memberships"
ON public.user_organizations
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own memberships"
ON public.user_organizations
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own memberships"
ON public.user_organizations
FOR DELETE
USING (user_id = auth.uid());

-- Now update other policies that were using subqueries to user_organizations
-- These need to use the security definer function instead

-- clientes
DROP POLICY IF EXISTS "Users can manage clientes of their organization" ON public.clientes;
CREATE POLICY "Users can manage clientes of their organization"
ON public.clientes
FOR ALL
USING (organization_id IN (SELECT public.get_user_organization_ids(auth.uid())));

-- contratos
DROP POLICY IF EXISTS "Users can manage contratos of their organization" ON public.contratos;
CREATE POLICY "Users can manage contratos of their organization"
ON public.contratos
FOR ALL
USING (organization_id IN (SELECT public.get_user_organization_ids(auth.uid())));

-- fases_custom
DROP POLICY IF EXISTS "Users can manage fases of their organization" ON public.fases_custom;
CREATE POLICY "Users can manage fases of their organization"
ON public.fases_custom
FOR ALL
USING (organization_id IN (SELECT public.get_user_organization_ids(auth.uid())));

-- faturamento
DROP POLICY IF EXISTS "Users can manage faturamento of their organization" ON public.faturamento;
CREATE POLICY "Users can manage faturamento of their organization"
ON public.faturamento
FOR ALL
USING (organization_id IN (SELECT public.get_user_organization_ids(auth.uid())));

-- historico_atividades
DROP POLICY IF EXISTS "Users can manage historico of their organization" ON public.historico_atividades;
CREATE POLICY "Users can manage historico of their organization"
ON public.historico_atividades
FOR ALL
USING (organization_id IN (SELECT public.get_user_organization_ids(auth.uid())));

-- edital_compras
DROP POLICY IF EXISTS "Users can manage edital_compras of their organization" ON public.edital_compras;
CREATE POLICY "Users can manage edital_compras of their organization"
ON public.edital_compras
FOR ALL
USING (organization_id IN (SELECT public.get_user_organization_ids(auth.uid())));

-- rastreamento_cobrancas
DROP POLICY IF EXISTS "Users can manage rastreamento_cobrancas of their organization" ON public.rastreamento_cobrancas;
CREATE POLICY "Users can manage rastreamento_cobrancas of their organization"
ON public.rastreamento_cobrancas
FOR ALL
USING (organization_id IN (SELECT public.get_user_organization_ids(auth.uid())));

-- recursos
DROP POLICY IF EXISTS "Users can manage recursos of their organization" ON public.recursos;
CREATE POLICY "Users can manage recursos of their organization"
ON public.recursos
FOR ALL
USING (organization_id IN (SELECT public.get_user_organization_ids(auth.uid())));

-- servicos
DROP POLICY IF EXISTS "Users can manage servicos of their organization" ON public.servicos;
CREATE POLICY "Users can manage servicos of their organization"
ON public.servicos
FOR ALL
USING (organization_id IN (SELECT public.get_user_organization_ids(auth.uid())));

-- organizations
DROP POLICY IF EXISTS "Users can manage their organizations" ON public.organizations;
CREATE POLICY "Users can manage their organizations"
ON public.organizations
FOR ALL
USING (id IN (SELECT public.get_user_organization_ids(auth.uid())));

-- veiculos (uses nested subquery through clientes)
DROP POLICY IF EXISTS "Users can manage veiculos of their organization" ON public.veiculos;
CREATE POLICY "Users can manage veiculos of their organization"
ON public.veiculos
FOR ALL
USING (
  cliente_id IN (
    SELECT id FROM public.clientes 
    WHERE organization_id IN (SELECT public.get_user_organization_ids(auth.uid()))
  )
);