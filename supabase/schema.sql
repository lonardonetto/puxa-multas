-- Supabase Database Schema for Painel do Parceiro
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE tipo_pessoa AS ENUM ('fisica', 'juridica');
CREATE TYPE status_multa AS ENUM ('pendente', 'suspensiva', 'analise', 'concluido', 'pago');
CREATE TYPE status_recurso AS ENUM ('rascunho', 'protocolado', 'aguardando_julgamento', 'deferido', 'indeferido');
CREATE TYPE instancia_recurso AS ENUM ('defesa_previa', 'jari', 'cetran');
CREATE TYPE tipo_documento AS ENUM ('identidade', 'comprovante_residencia', 'cnh', 'crlv', 'procuracao', 'contrato', 'outro');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    nome TEXT,
    telefone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clientes table
CREATE TABLE public.clientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    tipo_pessoa tipo_pessoa NOT NULL DEFAULT 'fisica',
    nome_completo TEXT NOT NULL,
    razao_social TEXT,
    nome_fantasia TEXT,
    cpf TEXT,
    cnpj TEXT,
    rg TEXT,
    inscricao_estadual TEXT,
    data_nascimento DATE,
    estado_civil TEXT,
    profissao TEXT,
    email TEXT NOT NULL,
    telefone TEXT,
    celular TEXT NOT NULL,
    endereco JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Veiculos table
CREATE TABLE public.veiculos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
    placa TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano TEXT NOT NULL,
    renavam TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multas table
CREATE TABLE public.multas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE CASCADE NOT NULL,
    codigo_infracao TEXT NOT NULL,
    descricao TEXT NOT NULL,
    status status_multa DEFAULT 'pendente',
    valor DECIMAL(10,2) NOT NULL,
    pontos INTEGER NOT NULL DEFAULT 0,
    data_multa DATE NOT NULL,
    data_vencimento DATE,
    local TEXT,
    orgao_autuador TEXT,
    numero_auto TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recursos table
CREATE TABLE public.recursos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    multa_id UUID REFERENCES public.multas(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL,
    status status_recurso DEFAULT 'rascunho',
    instancia instancia_recurso NOT NULL,
    data_protocolo DATE,
    data_ultima_notificacao DATE,
    numero_protocolo TEXT,
    observacoes TEXT,
    conteudo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documentos table
CREATE TABLE public.documentos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
    tipo tipo_documento NOT NULL,
    nome_arquivo TEXT NOT NULL,
    url_storage TEXT NOT NULL,
    tamanho_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX idx_clientes_cpf ON public.clientes(cpf);
CREATE INDEX idx_clientes_cnpj ON public.clientes(cnpj);
CREATE INDEX idx_veiculos_cliente_id ON public.veiculos(cliente_id);
CREATE INDEX idx_veiculos_placa ON public.veiculos(placa);
CREATE INDEX idx_multas_veiculo_id ON public.multas(veiculo_id);
CREATE INDEX idx_multas_status ON public.multas(status);
CREATE INDEX idx_recursos_multa_id ON public.recursos(multa_id);
CREATE INDEX idx_recursos_status ON public.recursos(status);
CREATE INDEX idx_documentos_cliente_id ON public.documentos(cliente_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for clientes
CREATE POLICY "Users can view own clientes" ON public.clientes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clientes" ON public.clientes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clientes" ON public.clientes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clientes" ON public.clientes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for veiculos (through clientes)
CREATE POLICY "Users can view veiculos of own clientes" ON public.veiculos
    FOR SELECT USING (
        cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert veiculos for own clientes" ON public.veiculos
    FOR INSERT WITH CHECK (
        cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update veiculos of own clientes" ON public.veiculos
    FOR UPDATE USING (
        cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete veiculos of own clientes" ON public.veiculos
    FOR DELETE USING (
        cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
    );

-- RLS Policies for multas (through veiculos -> clientes)
CREATE POLICY "Users can view multas of own veiculos" ON public.multas
    FOR SELECT USING (
        veiculo_id IN (
            SELECT v.id FROM public.veiculos v
            JOIN public.clientes c ON v.cliente_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert multas for own veiculos" ON public.multas
    FOR INSERT WITH CHECK (
        veiculo_id IN (
            SELECT v.id FROM public.veiculos v
            JOIN public.clientes c ON v.cliente_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update multas of own veiculos" ON public.multas
    FOR UPDATE USING (
        veiculo_id IN (
            SELECT v.id FROM public.veiculos v
            JOIN public.clientes c ON v.cliente_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete multas of own veiculos" ON public.multas
    FOR DELETE USING (
        veiculo_id IN (
            SELECT v.id FROM public.veiculos v
            JOIN public.clientes c ON v.cliente_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- RLS Policies for recursos (through multas -> veiculos -> clientes)
CREATE POLICY "Users can view recursos of own multas" ON public.recursos
    FOR SELECT USING (
        multa_id IN (
            SELECT m.id FROM public.multas m
            JOIN public.veiculos v ON m.veiculo_id = v.id
            JOIN public.clientes c ON v.cliente_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert recursos for own multas" ON public.recursos
    FOR INSERT WITH CHECK (
        multa_id IN (
            SELECT m.id FROM public.multas m
            JOIN public.veiculos v ON m.veiculo_id = v.id
            JOIN public.clientes c ON v.cliente_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update recursos of own multas" ON public.recursos
    FOR UPDATE USING (
        multa_id IN (
            SELECT m.id FROM public.multas m
            JOIN public.veiculos v ON m.veiculo_id = v.id
            JOIN public.clientes c ON v.cliente_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete recursos of own multas" ON public.recursos
    FOR DELETE USING (
        multa_id IN (
            SELECT m.id FROM public.multas m
            JOIN public.veiculos v ON m.veiculo_id = v.id
            JOIN public.clientes c ON v.cliente_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- RLS Policies for documentos (through clientes)
CREATE POLICY "Users can view documentos of own clientes" ON public.documentos
    FOR SELECT USING (
        cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert documentos for own clientes" ON public.documentos
    FOR INSERT WITH CHECK (
        cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete documentos of own clientes" ON public.documentos
    FOR DELETE USING (
        cliente_id IN (SELECT id FROM public.clientes WHERE user_id = auth.uid())
    );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, nome, telefone)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'nome',
        NEW.raw_user_meta_data->>'telefone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_veiculos_updated_at
    BEFORE UPDATE ON public.veiculos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_multas_updated_at
    BEFORE UPDATE ON public.multas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recursos_updated_at
    BEFORE UPDATE ON public.recursos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
