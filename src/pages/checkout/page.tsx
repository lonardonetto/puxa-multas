import { useState, useEffect, useMemo } from 'react';
import { useBilling } from '../../hooks/useBilling';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentPlan } from '../../hooks/useCurrentPlan';

export default function Checkout() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { billing, fetchBilling, loading: billingLoading } = useBilling();
  const { plan: planDetails } = useCurrentPlan();
  const [abaSelecionada, setAbaSelecionada] = useState<'extrato' | 'assinatura'>('extrato');
  const [mostrarModalCobranca, setMostrarModalCobranca] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchBilling(currentOrganization.id);
    }
  }, [currentOrganization?.id, fetchBilling]);

  const transacoes = billing || [];

  const transacoesFiltradas = useMemo(() => {
    let filtradas = transacoes;
    if (filtroTipo === 'entrada') filtradas = transacoes.filter(t => t.valor > 0);
    if (filtroTipo === 'saida') filtradas = transacoes.filter(t => t.valor < 0);
    return filtradas;
  }, [transacoes, filtroTipo]);

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
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Saldo Total</p>
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Saldo Principal</p>
          <p className="text-2xl font-black text-gray-900 mt-1">R$ {saldoDisponivel.toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <i className="ri-gift-line text-xl"></i>
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Saldo de Bônus</p>
          <p className="text-2xl font-black text-gray-900 mt-1 font-mono">R$ {saldoBloqueado.toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="bg-gradient-to-br from-[#1E3A8A] to-blue-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
              <i className="ri-vip-diamond-line text-xl"></i>
            </div>
            <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded border border-white/30">Ativo</span>
          </div>
          <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">Plano Atual</p>
          <p className="text-2xl font-black mt-1">{planDetails?.nome || 'Cargando...'}</p>
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  {[
                    { id: 'todos', label: 'Tudo' },
                    { id: 'entrada', label: 'Recargas' },
                    { id: 'saida', label: 'Consumo' }
                  ].map(filtro => (
                    <button
                      key={filtro.id}
                      onClick={() => setFiltroTipo(filtro.id as any)}
                      className={`text-xs font-black uppercase tracking-widest py-1 border-b-2 transition-all cursor-pointer ${filtroTipo === filtro.id ? 'border-[#1E3A8A] text-[#1E3A8A]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                      {filtro.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center text-xs font-bold text-gray-500 hover:text-[#1E3A8A] transition-colors cursor-pointer"
                >
                  <i className="ri-printer-line mr-1 text-base"></i>
                  Imprimir Extrato
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
                      <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição</th>
                      <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</th>
                      <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor</th>
                      <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transacoesFiltradas.length > 0 ? (
                      transacoesFiltradas.map((transacao) => (
                        <tr key={transacao.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-2">
                            <p className="text-sm font-bold text-gray-700">
                              {new Date(transacao.created_at).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {new Date(transacao.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${transacao.valor > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                <i className={transacao.valor > 0 ? 'ri-arrow-left-down-line' : 'ri-arrow-right-up-line'}></i>
                              </div>
                              <span className="text-sm text-gray-800 font-bold">{transacao.descricao}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600">
                              {transacao.categoria || 'Outros'}
                            </span>
                          </td>
                          <td className={`py-4 px-2 text-right text-sm font-black ${transacao.valor > 0 ? 'text-[#10B981]' : 'text-red-500'}`}>
                            {transacao.valor > 0 ? '+' : ''} R$ {transacao.valor.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span className={`inline-block w-2 h-2 rounded-full ${transacao.status === 'paid' ? 'bg-[#10B981]' : 'bg-yellow-400'} mr-2`}></span>
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${transacao.status === 'paid' ? 'text-[#10B981]' : 'text-yellow-700'}`}>
                              {transacao.status === 'paid' ? 'concluído' : 'pendente'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400 italic">
                          Nenhuma transação encontrada no período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-2 tracking-widest">Vencimento em</p>
                        <div className="flex items-center text-xl font-black text-gray-800">
                          <i className="ri-calendar-event-line mr-2 text-[#1E3A8A]"></i>
                          10 de Fevereiro, 2025
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-2 tracking-widest">Cartão de Crédito</p>
                        <div className="flex items-center gap-3">
                          <i className="ri-visa-line text-3xl font-black text-blue-800"></i>
                          <span className="text-sm font-bold text-gray-700">**** **** **** 4242</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center justify-center gap-2 text-[#1E3A8A] font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-all cursor-pointer mt-10">
                    Histórico de Invoices
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {mostrarModalCobranca && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">Recarregar Wallet</h3>
                <p className="text-sm text-gray-500 font-medium">Os créditos são liberados na mesma hora após o PIX.</p>
              </div>
              <button
                onClick={() => setMostrarModalCobranca(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {[50, 100, 200, 500].map((valor) => (
                  <button key={valor} className="py-5 border-2 border-gray-100 rounded-2xl font-black text-gray-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A] hover:bg-blue-50/30 transition-all cursor-pointer active:scale-95 group">
                    <p className="text-xs font-bold text-gray-400 group-hover:text-blue-400 uppercase tracking-widest mb-1">Valor</p>
                    <p className="text-xl">R$ {valor}</p>
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Ou digite outro valor</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300 text-xl font-mono">R$</span>
                  <input
                    type="text"
                    placeholder="0,00"
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-2xl font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50/50 border-t border-gray-100">
              <button className="w-full py-5 bg-[#10B981] text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-600 hover:-translate-y-1 transition-all cursor-pointer uppercase tracking-widest active:scale-95">
                Gerar PIX de Recarga
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-6 uppercase font-black tracking-widest">
                Segurança garantida via SSL & API Bancária
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
