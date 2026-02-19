
-- Trigger para criar registro em public.users automaticamente quando um novo usuário é criado no auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, telefone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Inserir os 2 usuários que já foram criados mas não estão na tabela users
INSERT INTO public.users (id, email, nome, role)
VALUES 
  ('04b385de-fe3c-4e58-b344-d8828ba72fb6', 'leonardonettp34@gmail.com', 'leonardonettp34', 'user'),
  ('3ffe0c92-18ea-4018-864d-d6a4aaa35c51', 'leonanetperei@gmail.com', 'leonanetperei', 'user')
ON CONFLICT (id) DO NOTHING;
