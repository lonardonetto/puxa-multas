import { useState, useEffect, useMemo } from 'react';
import { useBilling } from '../../hooks/useBilling';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentPlan } from '../../hooks/useCurrentPlan';
import { FinancialSummaryCards } from '../../components/checkout/FinancialSummaryCards';
import { ExtractFilters, type ExtractFiltersState } from '../../components/checkout/ExtractFilters';
import { ExtractTable } from '../../components/checkout/ExtractTable';
import { ExtractExport } from '../../components/checkout/ExtractExport';
import { FinancialChart } from '../../components/checkout/FinancialChart';
import { ModalPixRecarga } from '../../components/checkout/ModalPixRecarga';

export default function Checkout() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { billing, fetchBilling, loading: billingLoading } = useBilling();
  const { plan: planDetails } = useCurrentPlan();
  const [abaSelecionada, setAbaSelecionada] = useState<'extrato' | 'assinatura'>('extrato');
  const [mostrarModalCobranca, setMostrarModalCobranca] = useState(false);
  
  const [filters, setFilters] = useState<ExtractFiltersState>({
    tipo: 'todos',
    status: 'todos',
    categoria: '',
    busca: '',
    dateRange: { from: null, to: null },
    agrupamento: 'nenhum'
  });

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchBilling(currentOrganization.id);
    }
  }, [currentOrganization?.id, fetchBilling]);

  const transacoes = billing || [];
  
  const categorias = useMemo(() => {
    const cats = new Set<string>();
    transacoes.forEach(t => {
      if ((t as any).categoria) cats.add((t as any).categoria);
    });
    return Array.from(cats);
  }, [transacoes]);

  const saldoDisponivel = currentOrganization?.saldo_sacavel || 0;
  const saldoBloqueado = currentOrganization?.saldo_bonus || 0;
  const saldoTotal = saldoDisponivel + saldoBloqueado;

  if (billingLoading && billing.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin"></i>
          <p className="text-gray-600 font-medium">Carregando informações financeiras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Centro Financeiro</h2>
          <p className="text-sm text-gray-600 mt-1">Gerencie seus créditos, acompanhe seu consumo e verifique sua assinatura.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Créditos Disponíveis</p>
            <p className="text-xl font-black text-[#1E3A8A]">R$ {saldoTotal.toFixed(2).replace('.', ',')}</p>
          </div>
          <button
            onClick={() => setMostrarModalCobranca(true)}
            className="px-6 py-3 bg-[#10B981] text-white rounded-xl text-sm font-black hover:bg-green-600 transition-all cursor-pointer shadow-lg shadow-green-100 flex items-center active:scale-95"
          >
            <i className="ri-add-circle-line mr-2 text-lg"></i>
            Adicionar Créditos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <i className="ri-wallet-3-line text-xl"></i>
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Créditos Pagos</p>
          <p className="text-2xl font-black text-gray-900 mt-1">R$ {saldoDisponivel.toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <i className="ri-gift-line text-xl"></i>
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Créditos Bônus</p>
          <p className="text-2xl font-black text-gray-900 mt-1">R$ {saldoBloqueado.toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="bg-gradient-to-br from-[#1E3A8A] to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <i className="ri-vip-diamond-line text-xl"></i>
            </div>
            <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded border border-white/30">Ativo</span>
          </div>
          <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">Plano Atual</p>
          <p className="text-2xl font-black mt-1">{planDetails?.nome || 'Carregando...'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/30">
          <div className="flex p-2">
            <button
              onClick={() => setAbaSelecionada('extrato')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${abaSelecionada === 'extrato'
                ? 'bg-white text-[#1E3A8A] shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
            >
              <i className="ri-history-line mr-2 text-lg"></i>
              Extrato & Consumo
            </button>
            <button
              onClick={() => setAbaSelecionada('assinatura')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${abaSelecionada === 'assinatura'
                ? 'bg-white text-[#1E3A8A] shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
            >
              <i className="ri-user-settings-line mr-2 text-lg"></i>
              Minha Assinatura
            </button>
          </div>
        </div>

        <div className="p-8">
          {abaSelecionada === 'extrato' && (
            <div className="space-y-6">

              {/* Cards de resumo */}
              <FinancialSummaryCards billing={transacoes} dateRange={filters.dateRange} />
              
              {/* Gráfico de evolução */}
              <FinancialChart billing={transacoes} />
              
              {/* Filtros e exportação */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <ExtractFilters 
                    filters={filters} 
                    onFiltersChange={setFilters}
                    categorias={categorias}
                  />
                </div>
                <ExtractExport 
                  transacoes={transacoes} 
                  filters={filters}
                  organizationName={currentOrganization?.nome}
                />
              </div>

              {/* Tabela com agrupamento */}
              <ExtractTable transacoes={transacoes} filters={filters} />
            </div>
          )}

          {abaSelecionada === 'assinatura' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Informações do Plano</h4>
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="w-16 h-16 bg-[#1E3A8A] rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-100">
                        <i className="ri-vip-crown-2-line"></i>
                      </div>
                      <div>
                        <h5 className="text-2xl font-black text-gray-900 leading-tight">{planDetails?.nome}</h5>
                        <p className="text-sm text-[#1E3A8A] font-bold mt-1">Status da Assinatura: Ativa</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center text-sm font-bold text-gray-600">
                        <i className="ri-checkbox-circle-line mr-3 text-[#10B981] text-lg"></i>
                        Usuários: {planDetails?.limite_usuarios} inclusos
                      </div>
                      <div className="flex items-center text-sm font-bold text-gray-600">
                        <i className="ri-checkbox-circle-line mr-3 text-[#10B981] text-lg"></i>
                        Clientes: {planDetails?.limite_clientes || 'Ilimitados'}
                      </div>
                      <div className="flex items-center text-sm font-bold text-gray-600">
                        <i className="ri-checkbox-circle-line mr-3 text-[#10B981] text-lg"></i>
                        Suporte: {planDetails?.suporte}
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-10 py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-black hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all cursor-pointer uppercase tracking-widest text-xs">
                    Alterar meu Plano
                  </button>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Próxima Cobrança</h4>
                    <div className="space-y-8">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-2 tracking-widest">Valor Mensal</p>
                        <p className="text-3xl font-black text-gray-900 font-mono leading-none">R$ {planDetails?.preco_mensal.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {mostrarModalCobranca && (
        <ModalPixRecarga
          onClose={() => setMostrarModalCobranca(false)}
          onSuccess={() => {
            fetchBilling(currentOrganization?.id || '');
          }}
        />
      )}
    </div>
  );
}
