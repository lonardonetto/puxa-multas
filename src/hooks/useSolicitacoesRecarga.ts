import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface SolicitacaoRecarga {
  id: string;
  organization_id: string;
  user_id: string;
  valor: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  metodo_pagamento: string;
  observacao: string | null;
  created_at: string;
  aprovado_em: string | null;
}

export function useSolicitacoesRecarga() {
  const { currentOrganization } = useOrganization();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoRecarga[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSolicitacoes = useCallback(async () => {
    if (!currentOrganization?.id) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('solicitacoes_recarga')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSolicitacoes((data || []) as SolicitacaoRecarga[]);
    } catch (err) {
      console.error('Erro ao buscar solicitações de recarga:', err);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id]);

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  const pendentes = solicitacoes.filter(s => s.status === 'pendente');
  const totalPendente = pendentes.reduce((acc, s) => acc + s.valor, 0);

  return {
    solicitacoes,
    pendentes,
    totalPendente,
    loading,
    fetchSolicitacoes,
  };
}
