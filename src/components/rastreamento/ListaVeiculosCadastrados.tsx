import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useWallet } from '../../hooks/useWallet';
import { toast } from 'sonner';

interface VeiculoCadastrado {
  id: string;
  placa: string;
  modelo: string;
  ano: string | null;
  renavam: string | null;
  rastreamento_ativo: boolean;
  rastreamento_inicio: string | null;
  rastreamento_valor: number;
  cliente_id: string;
  cliente_nome: string;
  cliente_cpf: string | null;
  cliente_cnpj: string | null;
  multas_count: number;
  ultima_consulta: string | null;
  tipo_pessoa: 'fisica' | 'juridica';
}

interface PlanoPrecos {
  preco_rastreamento: number;
  rastreamento_pf_preco: number;
  rastreamento_frota_preco: number;
}

interface Props {
  onRefreshMultas: () => void;
  onEditVeiculo?: (veiculo: VeiculoCadastrado) => void;
  onViewHistorico?: (veiculo: VeiculoCadastrado) => void;
  onDadosVeiculoRecebidos?: (dados: unknown, veiculoId: string, clienteId: string | null) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Nunca';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ListaVeiculosCadastrados({ onRefreshMultas, onEditVeiculo, onViewHistorico, onDadosVeiculoRecebidos }: Props) {
  const { currentOrganization } = useOrganization();
  const { balance, checkBalance, deductCredits } = useWallet();
  const [veiculos, setVeiculos] = useState<VeiculoCadastrado[]>([]);
  const [loading, setLoading] = useState(true);
  const [rastreando, setRastreando] = useState<string | null>(null);
  const [deletando, setDeletando] = useState<string | null>(null);
  const [precos, setPrecos] = useState<PlanoPrecos>({
    preco_rastreamento: 50,
    rastreamento_pf_preco: 50,
    rastreamento_frota_preco: 50,
  });

  // Buscar preços do plano da organização
  useEffect(() => {
    const fetchPrecos = async () => {
      if (!currentOrganization?.plano) return;
      
      const { data: plano } = await supabase
        .from('planos')
        .select('preco_rastreamento, rastreamento_pf_preco, rastreamento_frota_preco')
        .eq('slug', currentOrganization.plano)
        .eq('ativo', true)
        .single();

      if (plano) {
        setPrecos({
          preco_rastreamento: plano.preco_rastreamento || 50,
          rastreamento_pf_preco: plano.rastreamento_pf_preco || 50,
          rastreamento_frota_preco: plano.rastreamento_frota_preco || 50,
        });
      }
    };

    fetchPrecos();
  }, [currentOrganization?.plano]);

  // Calcular preço baseado no tipo (PF ou Frota/PJ)
  const getPrecoConsulta = (tipoPessoa: 'fisica' | 'juridica') => {
    return tipoPessoa === 'juridica' 
      ? precos.rastreamento_frota_preco 
      : precos.rastreamento_pf_preco;
  };

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchVeiculos();
    }
  }, [currentOrganization?.id]);

  const handleDeleteVeiculo = async (veiculoId: string, placa: string) => {
    if (!confirm(`Tem certeza que deseja excluir o veículo ${placa}? Esta ação também excluirá todas as multas associadas.`)) {
      return;
    }

    setDeletando(veiculoId);
    try {
      // Primeiro excluir multas do veículo
      await supabase.from('multas').delete().eq('veiculo_id', veiculoId);
      
      // Depois excluir o veículo
      const { error } = await supabase.from('veiculos').delete().eq('id', veiculoId);
      
      if (error) throw error;

      toast.success(`Veículo ${placa} excluído com sucesso`);
      await fetchVeiculos();
      onRefreshMultas();
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      toast.error('Erro ao excluir veículo');
    } finally {
      setDeletando(null);
    }
  };

  const fetchVeiculos = async () => {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      // Buscar veículos com rastreamento ativo junto com dados do cliente
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome_completo, cpf, cnpj, tipo_pessoa')
        .eq('organization_id', currentOrganization.id);

      if (clientesError) throw clientesError;
      if (!clientes || clientes.length === 0) {
        setVeiculos([]);
        setLoading(false);
        return;
      }

      const clienteIds = clientes.map(c => c.id);

      const { data: veiculosData, error: veiculosError } = await supabase
        .from('veiculos')
        .select('*')
        .in('cliente_id', clienteIds)
        .eq('rastreamento_ativo', true)
        .order('created_at', { ascending: false });

      if (veiculosError) throw veiculosError;

      // Buscar contagem de multas por veículo
      const veiculosComDados: VeiculoCadastrado[] = await Promise.all(
        (veiculosData || []).map(async (v) => {
          const cliente = clientes.find(c => c.id === v.cliente_id);
          
          // Contar multas do veículo
          const { count } = await supabase
            .from('multas')
            .select('*', { count: 'exact', head: true })
            .eq('veiculo_id', v.id);

          // Buscar última multa para saber última consulta
          const { data: ultimaMultaData } = await supabase
            .from('multas')
            .select('created_at')
            .eq('veiculo_id', v.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          const ultimaMulta = ultimaMultaData?.[0] || null;

          return {
            id: v.id,
            placa: v.placa,
            modelo: v.modelo,
            ano: v.ano,
            renavam: v.renavam,
            rastreamento_ativo: v.rastreamento_ativo,
            rastreamento_inicio: v.rastreamento_inicio,
            rastreamento_valor: v.rastreamento_valor || 0,
            cliente_id: v.cliente_id,
            cliente_nome: cliente?.nome_completo || '',
            cliente_cpf: cliente?.cpf || null,
            cliente_cnpj: cliente?.cnpj || null,
            multas_count: count || 0,
            ultima_consulta: ultimaMulta?.created_at || null,
            tipo_pessoa: (cliente?.tipo_pessoa as 'fisica' | 'juridica') || 'fisica',
          };
        })
      );

      setVeiculos(veiculosComDados);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast.error('Erro ao carregar veículos cadastrados');
    } finally {
      setLoading(false);
    }
  };

  const rastrearMultas = async (veiculo: VeiculoCadastrado) => {
    const precoConsulta = getPrecoConsulta(veiculo.tipo_pessoa);
    
    // Verificar saldo
    if (!checkBalance(precoConsulta)) {
      toast.error(`Saldo insuficiente. Você precisa de ${formatCurrency(precoConsulta)} para rastrear multas.`);
      return;
    }

    setRastreando(veiculo.id);

    try {
      // 1. Deduzir créditos primeiro
      await deductCredits(
        precoConsulta,
        `Consulta de multas - Placa ${veiculo.placa}`,
        'rastreamento'
      );

      toast.success(`Cobrança de ${formatCurrency(precoConsulta)} realizada. Consultando multas...`);

      // 2. Consultar API CertaDoc
      const { data: response, error: funcError } = await supabase.functions.invoke('certadoc', {
        body: {
          action: 'consultar-placa',
          placa: veiculo.placa,
        },
      });

      if (funcError) {
        throw new Error(funcError.message || 'Erro ao consultar API');
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Falha na consulta');
      }

      const dados = response.data;
      console.log('Dados recebidos da CertaDoc:', dados);

      let multasEncontradas = 0;

      // 3. Processar e salvar multas no banco
      if (dados && dados.multas && Array.isArray(dados.multas)) {
        const multasParaSalvar = dados.multas.map((multa: any) => ({
          veiculo_id: veiculo.id,
          placa_autuada: veiculo.placa,
          codigo_infracao: multa.codigoInfracao || multa.codigo || '',
          descricao: multa.descricao || multa.descricaoInfracao || '',
          valor: parseFloat(multa.valor) || 0,
          pontos: parseInt(multa.pontos) || 0,
          gravidade: multa.gravidade || '',
          data_multa: multa.dataInfracao || multa.dataMulta || null,
          hora_infracao: multa.horaInfracao || null,
          numero_auto: multa.numeroAuto || multa.auto || '',
          local_infracao: multa.local || multa.localInfracao || '',
          orgao_autuador: multa.orgao || multa.orgaoAutuador || '',
          municipio: multa.municipio || '',
          uf_infracao: multa.uf || multa.estado || '',
          data_vencimento: multa.dataVencimento || null,
          status: 'pendente',
        }));

        multasEncontradas = multasParaSalvar.length;

        if (multasParaSalvar.length > 0) {
          const { error: insertError } = await supabase
            .from('multas')
            .insert(multasParaSalvar);

          if (insertError) {
            console.error('Erro ao inserir multas:', insertError);
            throw new Error('Erro ao salvar multas no banco');
          }

          toast.success(`${multasParaSalvar.length} multa(s) encontrada(s) e salva(s)!`);
        } else {
          toast.info('Nenhuma multa encontrada para este veículo');
        }
      } else if (dados && typeof dados === 'object') {
        // API retornou dados do veículo (consulta veicular completa)
        // A estrutura pode vir como { result: { dados_do_veiculo: {...} } } ou diretamente
        const dadosVeiculo = dados.result || dados;
        
        if (dadosVeiculo && 'dados_do_veiculo' in dadosVeiculo && dadosVeiculo.dados_do_veiculo) {
          toast.success('Dados do veículo obtidos com sucesso!');
          console.log('Abrindo modal com dados:', dadosVeiculo);
          // Notificar o componente pai para exibir modal de preview
          onDadosVeiculoRecebidos?.(dadosVeiculo, veiculo.id, veiculo.cliente_id);
        } else {
          toast.info('Consulta realizada. Nenhuma multa pendente encontrada.');
        }
      }

      // 4. Salvar histórico da consulta
      if (currentOrganization?.id) {
        const historicoData = {
          veiculo_id: veiculo.id,
          organization_id: currentOrganization.id,
          placa: veiculo.placa,
          cliente_nome: veiculo.cliente_nome,
          cliente_documento: veiculo.cliente_cpf || veiculo.cliente_cnpj,
          modelo_veiculo: veiculo.modelo,
          ano_veiculo: veiculo.ano,
          valor_cobrado: precoConsulta,
          resposta_api: dados,
          multas_encontradas: multasEncontradas,
          status: 'sucesso',
        };

        const { error: historicoError } = await supabase
          .from('consultas_rastreamento')
          .insert(historicoData);

        if (historicoError) {
          console.error('Erro ao salvar histórico:', historicoError);
          // Não bloquear o fluxo por erro no histórico
        }
      }

      // 5. Atualizar lista de veículos e multas
      await fetchVeiculos();
      onRefreshMultas();

    } catch (error) {
      console.error('Erro ao rastrear multas:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao rastrear multas');
    } finally {
      setRastreando(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando veículos...</span>
        </div>
      </div>
    );
  }

  if (veiculos.length === 0) {
    return null; // Não mostrar nada se não tiver veículos
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Veículos Cadastrados para Rastreamento</h3>
          <p className="text-sm text-gray-500 mt-1">
            Consulte multas dos veículos cadastrados. Preço por consulta varia conforme seu plano.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
          <i className="ri-wallet-3-line text-blue-600"></i>
          <span className="text-sm font-medium text-blue-800">Saldo: {formatCurrency(balance)}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Veículo</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Multas</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Última Consulta</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {veiculos.map((veiculo) => (
              <tr key={veiculo.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <i className="ri-car-line text-white text-lg"></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{veiculo.placa}</p>
                      <p className="text-xs text-gray-500">{veiculo.modelo} {veiculo.ano && `• ${veiculo.ano}`}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-gray-700">{veiculo.cliente_nome}</p>
                  <p className="text-xs text-gray-500">
                    {veiculo.cliente_cpf || veiculo.cliente_cnpj || '-'}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    veiculo.multas_count > 0 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {veiculo.multas_count} multa{veiculo.multas_count !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-gray-600">{formatDate(veiculo.ultima_consulta)}</p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => rastrearMultas(veiculo)}
                      disabled={rastreando === veiculo.id}
                      className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center whitespace-nowrap"
                    >
                      {rastreando === veiculo.id ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-1"></i>
                          Consultando...
                        </>
                      ) : (
                        <>
                          <i className="ri-search-line mr-1"></i>
                          Rastrear ({formatCurrency(getPrecoConsulta(veiculo.tipo_pessoa))})
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onViewHistorico?.(veiculo)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Ver histórico de consultas"
                    >
                      <i className="ri-history-line text-lg"></i>
                    </button>
                    <button
                      onClick={() => onEditVeiculo?.(veiculo)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar veículo"
                    >
                      <i className="ri-pencil-line text-lg"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteVeiculo(veiculo.id, veiculo.placa)}
                      disabled={deletando === veiculo.id}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Excluir veículo"
                    >
                      {deletando === veiculo.id ? (
                        <i className="ri-loader-4-line animate-spin text-lg"></i>
                      ) : (
                        <i className="ri-delete-bin-line text-lg"></i>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { ListaVeiculosCadastrados };
