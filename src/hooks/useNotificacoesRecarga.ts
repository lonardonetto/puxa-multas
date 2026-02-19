import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificacaoRecarga {
  id: string;
  organization_id: string;
  solicitacao_id: string;
  tipo: 'pix_pendente' | 'pix_aprovado' | 'pix_rejeitado';
  titulo: string;
  mensagem: string;
  valor: number;
  lido: boolean;
  para_super_admin: boolean;
  created_at: string;
}

export function useNotificacoesRecarga() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const [notificacoes, setNotificacoes] = useState<NotificacaoRecarga[]>([]);
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';

  const fetchNotificacoes = useCallback(async () => {
    if (!currentOrganization?.id && !isSuperAdmin) return;
    setLoading(true);
    try {
      let query = (supabase as any)
        .from('notificacoes_recarga')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!isSuperAdmin && currentOrganization?.id) {
        query = query.eq('organization_id', currentOrganization.id).eq('para_super_admin', false);
      } else if (isSuperAdmin) {
        query = query.eq('para_super_admin', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setNotificacoes((data || []) as NotificacaoRecarga[]);
    } catch (err) {
      console.error('Erro ao buscar notificações de recarga:', err);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id, isSuperAdmin]);

  const marcarComoLido = useCallback(async (id: string) => {
    try {
      await (supabase as any)
        .from('notificacoes_recarga')
        .update({ lido: true })
        .eq('id', id);
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lido: true } : n));
    } catch (err) {
      console.error('Erro ao marcar notificação de recarga como lida:', err);
    }
  }, []);

  const marcarTodasComoLidas = useCallback(async () => {
    try {
      const ids = notificacoes.filter(n => !n.lido).map(n => n.id);
      if (ids.length === 0) return;
      await (supabase as any)
        .from('notificacoes_recarga')
        .update({ lido: true })
        .in('id', ids);
      setNotificacoes(prev => prev.map(n => ({ ...n, lido: true })));
    } catch (err) {
      console.error('Erro ao marcar todas notificações como lidas:', err);
    }
  }, [notificacoes]);

  useEffect(() => {
    fetchNotificacoes();
  }, [fetchNotificacoes]);

  // Realtime subscription
  useEffect(() => {
    if (!currentOrganization?.id && !isSuperAdmin) return;

    const channel = supabase
      .channel('notificacoes_recarga_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes_recarga',
        ...(isSuperAdmin ? {} : { filter: `organization_id=eq.${currentOrganization?.id}` }),
      }, () => {
        fetchNotificacoes();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentOrganization?.id, isSuperAdmin, fetchNotificacoes]);

  const naoLidas = notificacoes.filter(n => !n.lido);

  return {
    notificacoes,
    naoLidas,
    loading,
    fetchNotificacoes,
    marcarComoLido,
    marcarTodasComoLidas,
  };
}
