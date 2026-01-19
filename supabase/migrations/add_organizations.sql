-- Migration: Add Organizations for Multi-Tenant SaaS
-- This migration adds organization support for multi-tenancy

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user');

-- Create enum for organization plans
CREATE TYPE organization_plan AS ENUM ('free', 'basic', 'premium', 'enterprise');

-- Organizations table
CREATE TABLE public.organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    cnpj TEXT,
    email TEXT,
    telefone TEXT,
    plano organization_plan DEFAULT 'free',
    ativo BOOLEAN DEFAULT TRUE,
    limite_usuarios INTEGER DEFAULT 5,
    limite_clientes INTEGER DEFAULT 100,
    data_expiracao DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role to users table
ALTER TABLE public.users ADD COLUMN role user_role DEFAULT 'user';

-- User-Organization relationship (many-to-many)
CREATE TABLE public.user_organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Add organization_id to clientes table
ALTER TABLE public.clientes ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_organizations_ativo ON public.organizations(ativo);
CREATE INDEX idx_user_organizations_user_id ON public.user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON public.user_organizations(organization_id);
CREATE INDEX idx_clientes_organization_id ON public.clientes(organization_id);

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Super admins can view all organizations" ON public.organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Users can view their organizations" ON public.organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can insert organizations" ON public.organizations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update all organizations" ON public.organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Org admins can update their organization" ON public.organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- RLS Policies for user_organizations
CREATE POLICY "Users can view their organization memberships" ON public.user_organizations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all memberships" ON public.user_organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'super_admin'
        )
    );

CREATE POLICY "Org admins can view org memberships" ON public.user_organizations
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Org admins can manage memberships" ON public.user_organizations
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Update RLS policies for clientes to include organization
DROP POLICY IF EXISTS "Users can view own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can insert own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can update own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete own clientes" ON public.clientes;

CREATE POLICY "Users can view clientes from their organizations" ON public.clientes
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert clientes to their organizations" ON public.clientes
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update clientes from their organizations" ON public.clientes
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete clientes from their organizations" ON public.clientes
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM public.user_organizations 
            WHERE user_id = auth.uid()
        )
    );

-- Function to create organization and add user as admin on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_with_organization()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
BEGIN
    -- Insert into users table
    INSERT INTO public.users (id, email, nome, telefone, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'nome',
        NEW.raw_user_meta_data->>'telefone',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user')
    );

    -- If not a super admin, create organization
    IF COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user') != 'super_admin' THEN
        -- Create organization
        INSERT INTO public.organizations (nome)
        VALUES (COALESCE(NEW.raw_user_meta_data->>'organization_name', 'Minha Organização'))
        RETURNING id INTO new_org_id;

        -- Add user as admin of the organization
        INSERT INTO public.user_organizations (user_id, organization_id, role)
        VALUES (NEW.id, new_org_id, 'admin');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger to use new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_organization();

-- Trigger for organizations updated_at
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
