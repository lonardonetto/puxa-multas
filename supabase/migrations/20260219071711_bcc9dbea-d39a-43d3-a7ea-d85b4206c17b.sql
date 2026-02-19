
-- Atualizar trigger para pegar role e organization_id do metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role text;
  v_org_id uuid;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  
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

  -- Criar vínculo com organização se informado
  IF NEW.raw_user_meta_data->>'organization_id' IS NOT NULL AND NEW.raw_user_meta_data->>'organization_id' != '' THEN
    v_org_id := (NEW.raw_user_meta_data->>'organization_id')::uuid;
    INSERT INTO public.user_organizations (user_id, organization_id, role)
    VALUES (NEW.id, v_org_id, v_role)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
