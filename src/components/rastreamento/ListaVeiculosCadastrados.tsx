import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '../../lib/supabase';
import { useOrganization } from '../../contexts/OrganizationContext';
import { toast } from 'sonner';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface VeiculoCadastrado {
  id: string;
  placa: string;
  modelo: string;
  ano: string | null;
  renavam: string | null;
  rastreamento_ativo: boolean;
  rastreamento_inicio: string | null;
  rastreamento_valor: number;
  rastreamento_tipo: 'mensal' | 'anual' | null;
  rastreamento_vencimento: string | null;
  cliente_id: string;
  cliente_nome: string;
  cliente_cpf: string | null;
  cliente_cnpj: string | null;
  multas_count: number;
  ultima_consulta: string | null;
  tipo_pessoa: 'fisica' | 'juridica';
}

interface Props {
  onRefreshMultas: () => void;
  onEditVeiculo?: (veiculo: VeiculoCadastrado) => void;
  onViewHistorico?: (veiculo: VeiculoCadastrado) => void;
}

export interface ListaVeiculosRef {
  refresh: () => Promise<void>;
}

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

const ListaVeiculosCadastrados = forwardRef<ListaVeiculosRef, Props>(({ onRefreshMultas, onEditVeiculo, onViewHistorico }, ref) => {
  const { currentOrganization } = useOrganization();
  const [veiculos, setVeiculos] = useState<VeiculoCadastrado[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletando, setDeletando] = useState<string | null>(null);
  
  // Estado para o modal de confirmação
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [veiculoParaExcluir, setVeiculoParaExcluir] = useState<{ id: string; placa: string } | null>(null);

  // Expor a função refresh para o componente pai
  useImperativeHandle(ref, () => ({
    refresh: fetchVeiculos
  }));

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchVeiculos();
    }
  }, [currentOrganization?.id]);

  const abrirConfirmacaoDelete = (veiculoId: string, placa: string) => {
    setVeiculoParaExcluir({ id: veiculoId, placa });
    setConfirmDeleteOpen(true);
  };

  const confirmarDeleteVeiculo = async () => {
    if (!veiculoParaExcluir) return;

    const { id: veiculoId, placa } = veiculoParaExcluir;
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
      setVeiculoParaExcluir(null);
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
            rastreamento_tipo: v.rastreamento_tipo as 'mensal' | 'anual' | null,
            rastreamento_vencimento: v.rastreamento_vencimento,
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
            Rastreamento automático ativo. Consultas semanais programadas.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
          <i className="ri-radar-line text-green-600"></i>
          <span className="text-sm font-medium text-green-800">Monitoramento Automático</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Veículo</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plano</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Multas</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Última Consulta</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {veiculos.map((veiculo) => {
              // Verificar se vencimento está próximo (3 dias) ou vencido
              const vencimentoDate = veiculo.rastreamento_vencimento ? new Date(veiculo.rastreamento_vencimento) : null;
              const hoje = new Date();
              const diasParaVencer = vencimentoDate ? Math.ceil((vencimentoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null;
              const isVencido = diasParaVencer !== null && diasParaVencer < 0;
              const isProximoVencer = diasParaVencer !== null && diasParaVencer >= 0 && diasParaVencer <= 3;

              return (
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
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        veiculo.rastreamento_tipo === 'anual' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        <i className={`mr-1 ${veiculo.rastreamento_tipo === 'anual' ? 'ri-calendar-check-line' : 'ri-calendar-line'}`}></i>
                        {veiculo.rastreamento_tipo === 'anual' ? 'Anual' : 'Mensal'}
                      </span>
                      {vencimentoDate && (
                        <span className={`text-xs flex items-center gap-1 ${
                          isVencido 
                            ? 'text-red-600 font-medium' 
                            : isProximoVencer 
                              ? 'text-orange-600' 
                              : 'text-gray-500'
                        }`}>
                          {isVencido ? (
                            <><i className="ri-error-warning-line"></i> Vencido</>
                          ) : (
                            <>Vence: {vencimentoDate.toLocaleDateString('pt-BR')}</>
                          )}
                        </span>
                      )}
                    </div>
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
                        onClick={() => abrirConfirmacaoDelete(veiculo.id, veiculo.placa)}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmação de exclusão */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir Veículo"
        description={`Tem certeza que deseja excluir o veículo ${veiculoParaExcluir?.placa || ''}? Esta ação também excluirá todas as multas associadas e não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmarDeleteVeiculo}
        loading={deletando !== null}
      />
    </div>
  );
});

ListaVeiculosCadastrados.displayName = 'ListaVeiculosCadastrados';

export default ListaVeiculosCadastrados;
export { ListaVeiculosCadastrados };
