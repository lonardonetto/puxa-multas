import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';

export interface NotificacaoMulta {
  id: string;
  veiculo_id: string;
  multa_id: string;
  placa: string;
  descricao: string;
  valor: number | null;
  lido: boolean;
  created_at: string;
}

export function useNotificacoesMultas() {
  const { currentOrganization } = useOrganization();
  const [notificacoes, setNotificacoes] = useState<NotificacaoMulta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotificacoes = useCallback(async () => {
    if (!currentOrganization?.id) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('notificacoes_multas')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setNotificacoes((data as any[]) || []);
    } catch (err) {
      console.error('Erro ao buscar notificações de multas:', err);
      setError(err instanceof Error ? err : new Error('Erro ao buscar notificações'));
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id]);

  const marcarComoLido = useCallback(async (notificacaoId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notificacoes_multas')
        .update({ lido: true })
        .eq('id', notificacaoId);

      if (updateError) throw updateError;
      await fetchNotificacoes();
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  }, [fetchNotificacoes]);

  const limparNotificacoes = useCallback(async () => {
    if (!currentOrganization?.id) return;
    try {
      const { error: deleteError } = await supabase
        .from('notificacoes_multas')
        .delete()
        .eq('organization_id', currentOrganization.id);

      if (deleteError) throw deleteError;
      setNotificacoes([]);
    } catch (err) {
      console.error('Erro ao limpar notificações:', err);
    }
  }, [currentOrganization?.id]);

  useEffect(() => {
    fetchNotificacoes();
  }, [fetchNotificacoes]);

  const naoLidas = notificacoes.filter(n => !n.lido);

  return { 
    notificacoes, 
    naoLidas,
    loading, 
    error, 
    fetchNotificacoes, 
    marcarComoLido, 
    limparNotificacoes 
  };
}
