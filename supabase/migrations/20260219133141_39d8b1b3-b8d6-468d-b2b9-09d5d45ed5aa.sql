
-- Fix overly permissive SELECT policies on key tables
-- Replace "true" SELECT with organization-scoped + super_admin access

-- Helper function to check if user is super_admin (avoid recursion)
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = p_user_id AND role = 'super_admin'
  );
$$;

-- ============ RECURSOS ============
DROP POLICY IF EXISTS "Authenticated users can read recursos" ON public.recursos;
CREATE POLICY "Users can read own org recursos" ON public.recursos
  FOR SELECT USING (
    organization_id IN (SELECT get_user_organization_ids(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- ============ CONTRATOS ============
DROP POLICY IF EXISTS "Authenticated users can read contratos" ON public.contratos;
CREATE POLICY "Users can read own org contratos" ON public.contratos
  FOR SELECT USING (
    organization_id IN (SELECT get_user_organization_ids(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- ============ CLIENTES ============
DROP POLICY IF EXISTS "Authenticated users can read clientes" ON public.clientes;
CREATE POLICY "Users can read own org clientes" ON public.clientes
  FOR SELECT USING (
    organization_id IN (SELECT get_user_organization_ids(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- ============ MULTAS ============
DROP POLICY IF EXISTS "Authenticated users can read multas" ON public.multas;
DROP POLICY IF EXISTS "Users can manage multas" ON public.multas;
CREATE POLICY "Users can read own org multas" ON public.multas
  FOR SELECT USING (
    veiculo_id IN (
      SELECT v.id FROM veiculos v
      JOIN clientes c ON v.cliente_id = c.id
      WHERE c.organization_id IN (SELECT get_user_organization_ids(auth.uid()))
    )
    OR public.is_super_admin(auth.uid())
  );
CREATE POLICY "Users can manage own org multas" ON public.multas
  FOR ALL USING (
    veiculo_id IN (
      SELECT v.id FROM veiculos v
      JOIN clientes c ON v.cliente_id = c.id
      WHERE c.organization_id IN (SELECT get_user_organization_ids(auth.uid()))
    )
    OR public.is_super_admin(auth.uid())
  );

-- ============ DOCUMENTOS ============
DROP POLICY IF EXISTS "Authenticated users can read documentos" ON public.documentos;
DROP POLICY IF EXISTS "Users can manage documentos" ON public.documentos;
CREATE POLICY "Users can read own org documentos" ON public.documentos
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clientes
      WHERE organization_id IN (SELECT get_user_organization_ids(auth.uid()))
    )
    OR public.is_super_admin(auth.uid())
  );
CREATE POLICY "Users can manage own org documentos" ON public.documentos
  FOR ALL USING (
    cliente_id IN (
      SELECT id FROM clientes
      WHERE organization_id IN (SELECT get_user_organization_ids(auth.uid()))
    )
    OR public.is_super_admin(auth.uid())
  );

-- ============ CONSULTAS_RASTREAMENTO ============
DROP POLICY IF EXISTS "Authenticated users can read consultas_rastreamento" ON public.consultas_rastreamento;
CREATE POLICY "Users can read own org consultas_rastreamento" ON public.consultas_rastreamento
  FOR SELECT USING (
    organization_id IN (SELECT get_user_organization_ids(auth.uid()))
    OR public.is_super_admin(auth.uid())
  );

-- ============ VEICULOS ============
DROP POLICY IF EXISTS "Authenticated users can read veiculos" ON public.veiculos;
CREATE POLICY "Users can read own org veiculos" ON public.veiculos
  FOR SELECT USING (
    cliente_id IN (
      SELECT id FROM clientes
      WHERE organization_id IN (SELECT get_user_organization_ids(auth.uid()))
    )
    OR public.is_super_admin(auth.uid())
  );
