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
}

interface Props {
  onRefreshMultas: () => void;
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

export default function ListaVeiculosCadastrados({ onRefreshMultas }: Props) {
  const { currentOrganization } = useOrganization();
  const { balance, checkBalance, deductCredits } = useWallet();
  const [veiculos, setVeiculos] = useState<VeiculoCadastrado[]>([]);
  const [loading, setLoading] = useState(true);
  const [rastreando, setRastreando] = useState<string | null>(null);

  // Preço por consulta de rastreamento
  const PRECO_CONSULTA = 5.00;

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchVeiculos();
    }
  }, [currentOrganization?.id]);

  const fetchVeiculos = async () => {
    if (!currentOrganization?.id) return;

    setLoading(true);
    try {
      // Buscar veículos com rastreamento ativo junto com dados do cliente
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome_completo, cpf, cnpj')
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
          const { data: ultimaMulta } = await supabase
            .from('multas')
            .select('created_at')
            .eq('veiculo_id', v.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

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
    // Verificar saldo
    if (!checkBalance(PRECO_CONSULTA)) {
      toast.error(`Saldo insuficiente. Você precisa de ${formatCurrency(PRECO_CONSULTA)} para rastrear multas.`);
      return;
    }

    setRastreando(veiculo.id);

    try {
      // 1. Deduzir créditos primeiro
      await deductCredits(
        PRECO_CONSULTA,
        `Consulta de multas - Placa ${veiculo.placa}`,
        'rastreamento'
      );

      toast.success(`Cobrança de ${formatCurrency(PRECO_CONSULTA)} realizada. Consultando multas...`);

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
        // API pode retornar dados do veículo sem multas
        toast.info('Consulta realizada. Nenhuma multa pendente encontrada.');
      }

      // 4. Atualizar lista de veículos e multas
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
            Consulte multas dos veículos cadastrados. Cada consulta custa {formatCurrency(PRECO_CONSULTA)}
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
                  <button
                    onClick={() => rastrearMultas(veiculo)}
                    disabled={rastreando === veiculo.id}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center whitespace-nowrap"
                  >
                    {rastreando === veiculo.id ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Consultando...
                      </>
                    ) : (
                      <>
                        <i className="ri-search-line mr-2"></i>
                        Rastrear Multas ({formatCurrency(PRECO_CONSULTA)})
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
