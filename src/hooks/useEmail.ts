import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

type TipoEmail =
  | 'confirmacao_email'
  | 'boas_vindas'
  | 'redefinicao_senha'
  | 'cliente_adicionado'
  | 'recurso_gerado'
  | 'notificacao_blindada'
  | 'faturamento'
  | 'rastreamento_vencimento'
  | 'usuario_adicionado';

interface EnviarEmailParams {
  tipo: TipoEmail;
  destinatario_email: string;
  destinatario_nome: string;
  dados?: Record<string, string | number | boolean>;
}

export function useEmail() {
  const enviarEmail = useCallback(async (params: EnviarEmailParams): Promise<boolean> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const { data, error } = await supabase.functions.invoke('enviar-email', {
        body: params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (error) {
        console.error('[useEmail] Erro ao enviar email:', error);
        return false;
      }

      console.log(`[useEmail] Email [${params.tipo}] enviado para ${params.destinatario_email}`);
      return true;
    } catch (err) {
      console.error('[useEmail] Exceção ao enviar email:', err);
      return false;
    }
  }, []);

  return { enviarEmail };
}
