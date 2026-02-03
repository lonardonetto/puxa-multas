import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';

export interface MultaRastreada {
  id: string;
  placa: string;
  modelo: string;
  ano?: string;
  renavam?: string;
  codigoInfracao: string;
  descricaoInfracao: string;
  status: 'pendente' | 'suspensiva' | 'analise' | 'concluido' | 'pago';
  dataMulta: string;
  valor: number;
  pontos: number;
  gravidade: string;
  veiculoId: string;
  clienteId?: string;
  clienteNome?: string;
  clienteCpf?: string;
  clienteCnpj?: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  clienteCelular?: string;
  clienteEndereco?: any;
  // Campos completos da multa
  numeroAuto?: string;
  horaInfracao?: string;
  localInfracao?: string;
  orgaoAutuador?: string;
  agenteAutuador?: string;
  municipio?: string;
  ufInfracao?: string;
  dataVencimento?: string;
  observacoes?: string;
  // Campo para indicar se já tem recurso gerado
  recursoId?: string;
  recursoFinalizado?: boolean;
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
      // Buscar multas com dados completos do veículo e cliente
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
          numero_auto,
          hora_infracao,
          local_infracao,
          orgao_autuador,
          agente_autuador,
          municipio,
          uf_infracao,
          data_vencimento,
          pontos,
          gravidade,
          observacoes,
          veiculos!inner (
            id,
            placa,
            modelo,
            ano,
            renavam,
            clientes!inner (
              id,
              nome_completo,
              cpf,
              cnpj,
              email,
              telefone,
              celular,
              endereco,
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
          ano: m.veiculos?.ano || '',
          renavam: m.veiculos?.renavam || '',
          codigoInfracao: m.codigo_infracao || '',
          descricaoInfracao: m.descricao || '',
          status: m.status || 'pendente',
          dataMulta: m.data_multa || '',
          valor: m.valor || 0,
          pontos: m.pontos || 0,
          gravidade: m.gravidade || '',
          veiculoId: m.veiculo_id || '',
          clienteId: m.veiculos?.clientes?.id || '',
          clienteNome: m.veiculos?.clientes?.nome_completo || '',
          clienteCpf: m.veiculos?.clientes?.cpf || '',
          clienteCnpj: m.veiculos?.clientes?.cnpj || '',
          clienteEmail: m.veiculos?.clientes?.email || '',
          clienteTelefone: m.veiculos?.clientes?.telefone || '',
          clienteCelular: m.veiculos?.clientes?.celular || '',
          clienteEndereco: m.veiculos?.clientes?.endereco || null,
          // Campos completos da multa
          numeroAuto: m.numero_auto || '',
          horaInfracao: m.hora_infracao || '',
          localInfracao: m.local_infracao || '',
          orgaoAutuador: m.orgao_autuador || '',
          agenteAutuador: m.agente_autuador || '',
          municipio: m.municipio || '',
          ufInfracao: m.uf_infracao || '',
          dataVencimento: m.data_vencimento || '',
          observacoes: m.observacoes || '',
          // Recurso - será preenchido posteriormente
          recursoId: undefined as string | undefined,
          recursoFinalizado: undefined as boolean | undefined,
        }));

      // Buscar recursos vinculados às multas
      if (multasFiltradas.length > 0) {
        const multaIds = multasFiltradas.map(m => m.id);
        const { data: recursos } = await supabase
          .from('recursos')
          .select('id, multa_id, finalizado')
          .in('multa_id', multaIds);

        if (recursos && recursos.length > 0) {
          const recursosMap = new Map(recursos.map(r => [r.multa_id, { id: r.id, finalizado: r.finalizado }]));
          multasFiltradas.forEach(m => {
            const recurso = recursosMap.get(m.id);
            if (recurso) {
              m.recursoId = recurso.id;
              m.recursoFinalizado = recurso.finalizado || false;
            }
          });
        }
      }

      // Se pontos não vier da multa, buscar da tabela de infrações
      if (multasFiltradas.length > 0) {
        const multasSemPontos = multasFiltradas.filter(m => !m.pontos && m.codigoInfracao);
        if (multasSemPontos.length > 0) {
          const codigos = [...new Set(multasSemPontos.map(m => m.codigoInfracao))];
          const { data: infracoes } = await supabase
            .from('infracoes_transito')
            .select('codigo, pontos, gravidade')
            .in('codigo', codigos);

          if (infracoes) {
            const pontosMap = new Map(infracoes.map(i => [i.codigo, { pontos: i.pontos, gravidade: i.gravidade }]));
            multasFiltradas.forEach(m => {
              if (!m.pontos) {
                const info = pontosMap.get(m.codigoInfracao);
                if (info) {
                  m.pontos = info.pontos || 0;
                  m.gravidade = m.gravidade || info.gravidade || '';
                }
              }
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
