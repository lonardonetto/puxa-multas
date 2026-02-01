-- SCHEMA FOR MISSING TABLES
-- Project: acyqrpkdsxddkqfaakty (Receiver)

-- 1. editais
CREATE TABLE IF NOT EXISTS public.editais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    detran TEXT NOT NULL,
    tipo_penalidade TEXT NOT NULL,
    descricao TEXT,
    data_publicacao DATE NOT NULL,
    prazo_recurso DATE NOT NULL,
    quantidade_nomes INTEGER DEFAULT 0 NOT NULL,
    nomes_vendidos INTEGER DEFAULT 0 NOT NULL,
    preco_por_nome NUMERIC DEFAULT 0.80 NOT NULL,
    status TEXT DEFAULT 'disponivel' NOT NULL,
    arquivo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    data_leitura DATE,
    total_multas INTEGER DEFAULT 0,
    cidade TEXT,
    estado TEXT
);

-- 2. editais_backup
CREATE TABLE IF NOT EXISTS public.editais_backup (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    detran TEXT NOT NULL,
    tipo_penalidade TEXT NOT NULL,
    data_publicacao DATE,
    prazo_recurso DATE,
    arquivo_url TEXT NOT NULL,
    status TEXT DEFAULT 'processando',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_log TEXT,
    nome_arquivo TEXT,
    tamanho_bytes BIGINT
);

-- 3. edital_compras
CREATE TABLE IF NOT EXISTS public.edital_compras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id),
    edital_id UUID REFERENCES public.editais(id),
    quantidade INTEGER NOT NULL,
    valor_total NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. fases_custom
CREATE TABLE IF NOT EXISTS public.fases_custom (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id),
    nome TEXT NOT NULL,
    cor TEXT DEFAULT '#000000',
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. faturamento
CREATE TABLE IF NOT EXISTS public.faturamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id),
    plano_id UUID REFERENCES public.planos(id),
    valor NUMERIC NOT NULL,
    status billing_status DEFAULT 'pending',
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    metodo_pagamento payment_method,
    url_boleto TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tipo billing_type DEFAULT 'subscription'
);

-- 6. rastreamento_cobrancas
CREATE TABLE IF NOT EXISTS public.rastreamento_cobrancas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    veiculo_id UUID REFERENCES public.veiculos(id),
    organization_id UUID REFERENCES public.organizations(id),
    valor NUMERIC NOT NULL,
    referencia_mes DATE NOT NULL,
    status billing_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. recursos
CREATE TABLE IF NOT EXISTS public.recursos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    multa_id UUID REFERENCES public.multas(id),
    contrato_id UUID REFERENCES public.contratos(id),
    status status_recurso DEFAULT 'rascunho',
    instancia instancia_recurso NOT NULL,
    data_protocolo DATE,
    data_ultima_notificacao DATE,
    numero_protocolo TEXT,
    observacoes TEXT,
    conteudo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    organization_id UUID REFERENCES public.organizations(id),
    is_ia BOOLEAN DEFAULT false
);

-- Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
