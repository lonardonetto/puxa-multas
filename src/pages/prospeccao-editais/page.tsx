import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentPlan } from '../../hooks/useCurrentPlan';
import { useWallet } from '../../hooks/useWallet';
import { useNavigate } from 'react-router-dom';

interface Edital {
  id: string;
  detran: string;
  tipo_penalidade: string;
  descricao: string;
  data_publicacao: string;
  prazo_recurso: string;
  quantidade_nomes: number;
  nomes_vendidos: number;
  preco_por_nome: number;
  status: 'disponivel' | 'vendido' | 'expirado';
  arquivo_url?: string | null;
  arquivos?: string[] | null;
  comprado_por?: string | null;
}

export default function ProspeccaoEditais() {
  const { user } = useAuth();
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'disponiveis' | 'vendidos'>('todos');
  const { prices, loading: loadingPlan } = useCurrentPlan();
  const { balance, deductCredits, checkBalance } = useWallet();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editalParaComprar, setEditalParaComprar] = useState<{ id: string, valor: number, detran: string } | null>(null);
  const [processandoCompra, setProcessandoCompra] = useState(false);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Buscar dados (Planos e Editais)
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const { data: editaisData, error: editaisError } = await supabase
          .from('editais')
          .select('*')
          .order('created_at', { ascending: false });

        if (editaisError) throw editaisError;
        setEditais(editaisData || []);

      } catch (err) {
        console.error('Erro ao buscar editais:', err);
        showToast('Erro ao carregar editais', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const precoPorContatoUsuario = prices?.edital || 1.50;

  const editaisFiltrados = editais.filter(edital => {
    if (filtroStatus === 'disponiveis') return edital.status === 'disponivel';
    if (filtroStatus === 'vendidos') return edital.status === 'vendido';
    return true;
  });

  const handleComprarConfirmado = async () => {
    if (!user || !editalParaComprar) return;

    setProcessandoCompra(true);
    try {
      const { id: editalId, valor: valorTotal, detran } = editalParaComprar;

      await deductCredits(
        valorTotal,
        `Compra de Edital: ${detran}`,
      );
      // 2. Atualizar status do edital
      const { error } = await (supabase as any)
        .from('editais')
        .update({
          status: 'vendido',
          comprado_por: user.id
        })
        .eq('id', editalId);

      if (error) throw error;

      showToast('Edital adquirido com sucesso! O download foi liberado.', 'success');
      setEditalParaComprar(null);

      const { data: editalData } = await supabase.from('editais').select('*').eq('id', editalId).single();
      setEditais(prev => prev.map(e => e.id === editalId ? editalData : e));

    } catch (err: any) {
      console.error('Erro ao comprar edital:', err);
      showToast(err.message || 'Erro ao processar compra', 'error');
    } finally {
      setProcessandoCompra(false);
    }
  };

  const handleComprarClick = (editalId: string, valorTotal: number, detran: string) => {
    setEditalParaComprar({ id: editalId, valor: valorTotal, detran });
  };

  const handleDownload = (url: string | null | undefined) => {
    if (!url) {
      showToast('Arquivo não disponível para este edital', 'error');
      return;
    }
    window.open(url, '_blank');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getFileName = (url: string) => {
    try {
      const decoded = decodeURIComponent(url);
      const parts = decoded.split('_---_');
      if (parts.length > 1) return parts[parts.length - 1];
      const urlParts = decoded.split('/');
      return urlParts[urlParts.length - 1];
    } catch (e) {
      return 'Arquivo';
    }
  };

  return (
    <div className="space-y-8 p-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-[110] px-6 py-3 rounded-lg shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
          <i className={`${toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} mr-2`}></i>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Prospecção de Editais</h2>
          <p className="text-sm text-gray-600 mt-2">Leads exclusivos de editais de penalidades de trânsito</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-tight">Saldo Global</p>
            <p className="text-xl font-black text-[#1E3A8A] leading-tight font-mono">
              R$ {balance.toFixed(2).replace('.', ',')}
            </p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="p-3 bg-blue-50 text-[#1E3A8A] rounded-xl hover:bg-blue-100 transition-all cursor-pointer group shadow-sm border border-blue-100"
            title="Adicionar Créditos"
          >
            <i className="ri-add-circle-line text-xl group-hover:scale-110 transition-transform"></i>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as 'todos' | 'disponiveis' | 'vendidos')}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <option value="todos">Todos os Editais</option>
          <option value="disponiveis">Disponíveis</option>
          <option value="vendidos">Vendidos</option>
        </select>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-refresh-line mr-2"></i>
          Atualizar Editais
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#1E3A8A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Editais</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{editais.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-file-list-3-line text-2xl text-[#1E3A8A]"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#10B981]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disponíveis</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {editais.filter(e => e.status === 'disponivel').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-2xl text-[#10B981]"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#EF4444]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendidos</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {editais.filter(e => e.status === 'vendido').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i className="ri-close-circle-line text-2xl text-[#EF4444]"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#F59E0B]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Leads</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {editais.reduce((acc, e) => acc + e.quantidade_nomes, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="ri-group-line text-2xl text-[#F59E0B]"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[#1E3A8A] rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-information-line text-white text-2xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Como funciona a Prospecção de Editais?</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Monitoramos diariamente os editais de penalidades de trânsito publicados pelos Detrans de todo o Brasil.
              Cada edital contém uma lista de pessoas que receberam notificações de suspensão ou cassação de CNH.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-start space-x-2">
                <i className="ri-check-line text-[#10B981] text-lg mt-1"></i>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Leads Qualificados</p>
                  <p className="text-xs text-gray-600">Pessoas que precisam de recursos</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <i className="ri-check-line text-[#10B981] text-lg mt-1"></i>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Dados Completos</p>
                  <p className="text-xs text-gray-600">Nome, CPF e tipo de penalidade</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <i className="ri-check-line text-[#10B981] text-lg mt-1"></i>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Preço Acessível</p>
                  <p className="text-xs text-gray-600">{formatCurrency(precoPorContatoUsuario)} por lead (Seu Plano)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#10B981] p-6">
          <h3 className="text-2xl font-bold text-white">Editais Disponíveis</h3>
          <p className="text-sm text-white/90 mt-1">
            {editaisFiltrados.length} {editaisFiltrados.length === 1 ? 'edital encontrado' : 'editais encontrados'}
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <i className="ri-loader-4-line text-4xl animate-spin text-[#10B981]"></i>
            </div>
          ) : editaisFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <i className="ri-file-list-3-line text-5xl mb-4 block"></i>
              <p className="text-lg font-medium">Nenhum edital disponível no momento</p>
              <p className="text-sm mt-1">Volte mais tarde para conferir novos editais.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {editaisFiltrados.map((edital) => {
                const valorTotalLocal = edital.quantidade_nomes * precoPorContatoUsuario;
                return (
                  <div
                    key={edital.id}
                    className={`border-2 rounded-lg p-6 transition-all ${edital.status === 'vendido'
                      ? 'border-red-200 bg-red-50'
                      : 'border-green-200 bg-white hover:border-green-400 hover:shadow-lg'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${edital.status === 'vendido' ? 'bg-red-100' : 'bg-[#1E3A8A]'
                            }`}>
                            <i className={`ri-file-text-line text-2xl ${edital.status === 'vendido' ? 'text-red-600' : 'text-white'
                              }`}></i>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800">{edital.detran}</h4>
                            <p className="text-sm text-gray-600">{edital.tipo_penalidade}</p>
                          </div>
                          {edital.status === 'vendido' && (
                            <span className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg whitespace-nowrap">
                              VENDIDO
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Data de Publicação</p>
                            <p className="text-sm font-semibold text-gray-800">
                              <i className="ri-calendar-line mr-1 text-[#1E3A8A]"></i>
                              {formatDate(edital.data_publicacao)}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Prazo para Recurso</p>
                            <p className="text-sm font-semibold text-gray-800">
                              <i className="ri-time-line mr-1 text-[#F59E0B]"></i>
                              {formatDate(edital.prazo_recurso)}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Quantidade de Nomes</p>
                            <p className="text-sm font-semibold text-gray-800">
                              <i className="ri-group-line mr-1 text-[#10B981]"></i>
                              {edital.quantidade_nomes} nomes
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
                            <p className="text-xs text-gray-600 mb-1">Valor Total</p>
                            <p className="text-lg font-bold text-[#10B981]">
                              {formatCurrency(valorTotalLocal)}
                            </p>
                            <p className="text-xs text-gray-600">{formatCurrency(precoPorContatoUsuario)} por nome</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <i className="ri-information-line text-[#10B981]"></i>
                            <span>
                              {edital.status === 'vendido' && edital.comprado_por === user?.id
                                ? 'Você já adquiriu este edital. O arquivo está liberado.'
                                : edital.status === 'vendido'
                                  ? 'Este edital já foi vendido para outro cliente.'
                                  : 'Leads exclusivos - Compre agora e baixe o arquivo.'}
                            </span>
                          </div>

                          {edital.status === 'vendido' && edital.comprado_por === user?.id ? (
                            <div className="flex flex-col gap-2">
                              {edital.arquivos && edital.arquivos.length > 0 ? (
                                edital.arquivos.map((url, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleDownload(url)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center cursor-pointer whitespace-nowrap"
                                    title={getFileName(url)}
                                  >
                                    <i className="ri-download-cloud-2-line mr-2"></i>
                                    {getFileName(url)}
                                  </button>
                                ))
                              ) : (
                                <button
                                  onClick={() => handleDownload(edital.arquivo_url)}
                                  className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center cursor-pointer"
                                >
                                  <i className="ri-download-cloud-2-line mr-2"></i>
                                  Baixar Arquivo
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleComprarClick(edital.id, valorTotalLocal, edital.detran)}
                              disabled={edital.status === 'vendido'}
                              className={`px-6 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${edital.status === 'vendido'
                                ? 'bg-red-600 text-white cursor-not-allowed opacity-75'
                                : 'bg-[#10B981] text-white hover:bg-green-600 hover:shadow-lg'
                                }`}
                            >
                              {edital.status === 'vendido' ? (
                                <>
                                  <i className="ri-close-circle-line mr-2"></i>
                                  Vendido
                                </>
                              ) : (
                                <>
                                  <i className="ri-shopping-cart-line mr-2"></i>
                                  Comprar Agora
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Perguntas Frequentes</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-[#1E3A8A] pl-4">
            <h4 className="text-base font-semibold text-gray-800 mb-2">
              O que acontece após comprar um edital?
            </h4>
            <p className="text-sm text-gray-700">
              Após a compra, você receberá imediatamente a lista completa com todos os nomes, CPFs e dados
              das penalidades. Além disso, nossa plataforma pode disparar automaticamente campanhas de WhatsApp
              e e-mail para todos os leads.
            </p>
          </div>

          <div className="border-l-4 border-[#10B981] pl-4">
            <h4 className="text-base font-semibold text-gray-800 mb-2">
              Os leads são exclusivos?
            </h4>
            <p className="text-sm text-gray-700">
              Sim! Cada edital é vendido apenas uma vez. Quando você compra, nenhum outro cliente terá acesso
              aos mesmos leads, garantindo exclusividade total na sua prospecção.
            </p>
          </div>

          <div className="border-l-4 border-[#F59E0B] pl-4">
            <h4 className="text-base font-semibold text-gray-800 mb-2">
              Como funciona o disparo automático?
            </h4>
            <p className="text-sm text-gray-700">
              Nossa plataforma integra com WhatsApp Business e e-mail marketing. Você pode criar templates
              personalizados e disparar mensagens automáticas para todos os leads do edital com apenas um clique.
            </p>
          </div>
        </div>
      </div>

      {editalParaComprar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="p-8 border-b border-gray-100 bg-gray-50/30">
              <h3 className="text-2xl font-black text-gray-900 leading-tight">Confirmar Compra</h3>
              <p className="text-sm text-gray-500 font-medium">Você está adquirindo leads exclusivos.</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Edital</span>
                  <span className="text-sm font-bold text-blue-900">{editalParaComprar.detran}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black text-gray-900 leading-none">
                  <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Preço</span>
                  <span className="text-[#10B981]">{formatCurrency(editalParaComprar.valor)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seu Saldo Atual</p>
                  <p className={`text-lg font-black ${balance >= editalParaComprar.valor ? 'text-gray-900' : 'text-red-500'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
                {balance < editalParaComprar.valor && (
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-100 uppercase tracking-widest">
                    Saldo Insuficiente
                  </span>
                )}
              </div>

              {balance < editalParaComprar.valor ? (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                  <i className="ri-error-warning-line text-red-500 text-xl"></i>
                  <p className="text-xs text-red-700 font-medium leading-relaxed">
                    Você não possui saldo suficiente para esta compra. Faça uma recarga rápida para continuar.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                  <i className="ri-checkbox-circle-line text-green-500 text-xl"></i>
                  <p className="text-xs text-green-700 font-medium leading-relaxed">
                    Compra segura com débito direto do seu saldo em conta.
                  </p>
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-3">
              {balance >= editalParaComprar.valor ? (
                <button
                  onClick={handleComprarConfirmado}
                  disabled={processandoCompra}
                  className="w-full py-4 bg-[#10B981] text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-600 transition-all cursor-pointer uppercase tracking-widest active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                  {processandoCompra ? (
                    <i className="ri-loader-4-line animate-spin text-xl"></i>
                  ) : (
                    'Confirmar e Pagar'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-[#1E3A8A] text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-900 transition-all cursor-pointer uppercase tracking-widest active:scale-95"
                >
                  Adicionar Créditos
                </button>
              )}
              <button
                onClick={() => setEditalParaComprar(null)}
                disabled={processandoCompra}
                className="w-full py-4 text-gray-400 font-black hover:text-gray-600 transition-all cursor-pointer uppercase tracking-widest text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
