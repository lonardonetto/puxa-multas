-- Adicionar campo de status de aprovação na tabela recursos_conhecimento
ALTER TABLE public.recursos_conhecimento 
ADD COLUMN IF NOT EXISTS status_aprovacao text DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'aprovado', 'rejeitado'));

-- Adicionar campo para vincular ao recurso original
ALTER TABLE public.recursos_conhecimento 
ADD COLUMN IF NOT EXISTS recurso_origem_id uuid REFERENCES public.recursos(id) ON DELETE SET NULL;

-- Criar função para auto-enviar recursos deferidos para análise
CREATE OR REPLACE FUNCTION public.auto_enviar_recurso_deferido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_codigo_infracao text;
  v_uf_infracao text;
  v_organization_id uuid;
BEGIN
  -- Só executar quando status mudar para 'deferido'
  IF NEW.status = 'deferido' AND (OLD.status IS NULL OR OLD.status != 'deferido') THEN
    -- Verificar se já existe entrada para este recurso
    IF EXISTS (SELECT 1 FROM recursos_conhecimento WHERE recurso_origem_id = NEW.id) THEN
      RETURN NEW;
    END IF;

    -- Buscar dados da multa vinculada
    SELECT m.codigo_infracao, m.uf_infracao INTO v_codigo_infracao, v_uf_infracao
    FROM multas m
    WHERE m.id = NEW.multa_id;

    -- Inserir na base de conhecimento como pendente de aprovação
    INSERT INTO recursos_conhecimento (
      organization_id,
      codigo_infracao,
      tipo_recurso,
      conteudo,
      resultado,
      detran_estado,
      data_deferimento,
      is_global,
      status_aprovacao,
      recurso_origem_id
    ) VALUES (
      NEW.organization_id,
      COALESCE(v_codigo_infracao, 'N/A'),
      NEW.instancia::text,
      COALESCE(NEW.conteudo, ''),
      'deferido',
      v_uf_infracao,
      CURRENT_DATE,
      false,
      'pendente',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Criar trigger para executar automaticamente
DROP TRIGGER IF EXISTS trigger_auto_enviar_recurso_deferido ON recursos;
CREATE TRIGGER trigger_auto_enviar_recurso_deferido
  AFTER UPDATE ON recursos
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_enviar_recurso_deferido();