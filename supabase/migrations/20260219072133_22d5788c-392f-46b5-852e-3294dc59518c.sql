
-- Atualizar trigger para também criar organização quando vem do formulário de cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role text;
  v_org_id uuid;
  v_org_name text;
  v_org_doc text;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'admin');
  
  -- Criar usuário na tabela public.users
  INSERT INTO public.users (id, email, nome, telefone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    nome = EXCLUDED.nome;

  -- Se veio organization_id direto (criação pelo Super Admin), vincular
  IF NEW.raw_user_meta_data->>'organization_id' IS NOT NULL AND NEW.raw_user_meta_data->>'organization_id' != '' THEN
    v_org_id := (NEW.raw_user_meta_data->>'organization_id')::uuid;
    INSERT INTO public.user_organizations (user_id, organization_id, role)
    VALUES (NEW.id, v_org_id, v_role)
    ON CONFLICT DO NOTHING;
  
  -- Se veio organization_name (formulário externo), criar a organização
  ELSIF NEW.raw_user_meta_data->>'organization_name' IS NOT NULL AND NEW.raw_user_meta_data->>'organization_name' != '' THEN
    v_org_name := NEW.raw_user_meta_data->>'organization_name';
    v_org_doc := COALESCE(NEW.raw_user_meta_data->>'organization_document', '');
    
    INSERT INTO public.organizations (nome, cnpj, email, plano, plan)
    VALUES (v_org_name, v_org_doc, NEW.email, 'gratuito', 'free')
    RETURNING id INTO v_org_id;
    
    -- Vincular usuário como admin da organização
    INSERT INTO public.user_organizations (user_id, organization_id, role)
    VALUES (NEW.id, v_org_id, 'admin')
    ON CONFLICT DO NOTHING;
    
    -- Atualizar role do usuário para admin
    UPDATE public.users SET role = 'admin' WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;
