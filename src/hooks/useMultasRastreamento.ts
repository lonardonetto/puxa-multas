import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';

export interface MultaRastreada {
  id: string;
  placa: string;
  modelo: string;
  codigoInfracao: string;
  descricaoInfracao: string;
  status: 'pendente' | 'suspensiva' | 'analise' | 'concluido' | 'pago';
  dataMulta: string;
  valor: number;
  pontos: number;
  veiculoId: string;
  clienteNome?: string;
}

interface UseMultasRastreamentoReturn {
  multas: MultaRastreada[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  contadores: {
    suspensivas: number;
    emAnalise: number;
    concluidos: number;
    total: number;
  };
}

export function useMultasRastreamento(): UseMultasRastreamentoReturn {
  const { currentOrganization } = useOrganization();
  const [multas, setMultas] = useState<MultaRastreada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMultas = useCallback(async () => {
    if (!currentOrganization?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar multas com dados do veículo e cliente
      const { data, error: fetchError } = await supabase
        .from('multas')
        .select(`
          id,
          codigo_infracao,
          descricao,
          status,
          data_multa,
          valor,
          veiculo_id,
          veiculos!inner (
            id,
            placa,
            modelo,
            clientes!inner (
              id,
              nome_completo,
              organization_id
            )
          )
        `)
        .order('data_multa', { ascending: false });

      if (fetchError) throw fetchError;

      // Filtrar apenas multas da organização atual
      const multasFiltradas = (data || [])
        .filter((m: any) => m.veiculos?.clientes?.organization_id === currentOrganization.id)
        .map((m: any) => ({
          id: m.id,
          placa: m.veiculos?.placa || '',
          modelo: m.veiculos?.modelo || '',
          codigoInfracao: m.codigo_infracao || '',
          descricaoInfracao: m.descricao || '',
          status: m.status || 'pendente',
          dataMulta: m.data_multa || '',
          valor: m.valor || 0,
          pontos: 0, // Buscar da tabela de infrações se necessário
          veiculoId: m.veiculo_id || '',
          clienteNome: m.veiculos?.clientes?.nome_completo || '',
        }));

      // Buscar pontos das infrações
      if (multasFiltradas.length > 0) {
        const codigos = [...new Set(multasFiltradas.map(m => m.codigoInfracao).filter(Boolean))];
        if (codigos.length > 0) {
          const { data: infracoes } = await supabase
            .from('infracoes_transito')
            .select('codigo, pontos')
            .in('codigo', codigos);

          if (infracoes) {
            const pontosMap = new Map(infracoes.map(i => [i.codigo, i.pontos]));
            multasFiltradas.forEach(m => {
              m.pontos = pontosMap.get(m.codigoInfracao) || 0;
            });
          }
        }
      }

      setMultas(multasFiltradas);
    } catch (err) {
      console.error('Erro ao buscar multas:', err);
      setError(err instanceof Error ? err : new Error('Erro ao buscar multas'));
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id]);

  useEffect(() => {
    fetchMultas();
  }, [fetchMultas]);

  const contadores = {
    suspensivas: multas.filter(m => m.status === 'suspensiva').length,
    emAnalise: multas.filter(m => m.status === 'analise').length,
    concluidos: multas.filter(m => m.status === 'concluido' || m.status === 'pago').length,
    total: multas.length,
  };

  return {
    multas,
    loading,
    error,
    refresh: fetchMultas,
    contadores,
  };
}

export default useMultasRastreamento;
