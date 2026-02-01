-- Habilitar RLS nas tabelas que estão causando erro 406

-- Tabela veiculos
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read veiculos"
ON public.veiculos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage veiculos of their organization"
ON public.veiculos FOR ALL
TO authenticated
USING (
  cliente_id IN (
    SELECT id FROM public.clientes 
    WHERE organization_id IN (
      SELECT organization_id FROM public.user_organizations 
      WHERE user_id = auth.uid()
    )
  )
);

-- Tabela clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read clientes"
ON public.clientes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage clientes of their organization"
ON public.clientes FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Tabela multas
ALTER TABLE public.multas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read multas"
ON public.multas FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage multas"
ON public.multas FOR ALL
TO authenticated
USING (true);

-- Tabela recursos
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read recursos"
ON public.recursos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage recursos of their organization"
ON public.recursos FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Tabela organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read organizations"
ON public.organizations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage their organizations"
ON public.organizations FOR ALL
TO authenticated
USING (
  id IN (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Tabela user_organizations
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own organization memberships"
ON public.user_organizations FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR organization_id IN (
  SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()
));

CREATE POLICY "Users can manage organization memberships"
ON public.user_organizations FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- Tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all users"
ON public.users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Tabela contratos
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read contratos"
ON public.contratos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage contratos of their organization"
ON public.contratos FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Tabela servicos
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read servicos"
ON public.servicos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage servicos of their organization"
ON public.servicos FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Tabela faturamento
ALTER TABLE public.faturamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read faturamento"
ON public.faturamento FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage faturamento of their organization"
ON public.faturamento FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Tabela documentos
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read documentos"
ON public.documentos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage documentos"
ON public.documentos FOR ALL
TO authenticated
USING (true);

-- Tabela historico_atividades
ALTER TABLE public.historico_atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read historico"
ON public.historico_atividades FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage historico of their organization"
ON public.historico_atividades FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Tabela planos
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read planos"
ON public.planos FOR SELECT
USING (true);

-- Tabela fases_custom
ALTER TABLE public.fases_custom ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read fases"
ON public.fases_custom FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage fases of their organization"
ON public.fases_custom FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Tabela editais
ALTER TABLE public.editais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read editais"
ON public.editais FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins can manage editais"
ON public.editais FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- Tabela editais_backup
ALTER TABLE public.editais_backup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read editais_backup"
ON public.editais_backup FOR SELECT
TO authenticated
USING (true);

-- Tabela edital_compras
ALTER TABLE public.edital_compras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read edital_compras"
ON public.edital_compras FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage edital_compras of their organization"
ON public.edital_compras FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = auth.uid()
  )
);

-- Tabela rastreamento_cobrancas
ALTER TABLE public.rastreamento_cobrancas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read rastreamento_cobrancas"
ON public.rastreamento_cobrancas FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage rastreamento_cobrancas of their organization"
ON public.rastreamento_cobrancas FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.user_organizations 
    WHERE user_id = auth.uid()
  )
);