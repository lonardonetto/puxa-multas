import { useState } from 'react';
import { useCurrentPlan } from '../../hooks/useCurrentPlan';

type TipoPlano = 'mensal' | 'anual' | 'placa_protegida';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tipo: TipoPlano, preco: number) => void;
  tipoVeiculo: 'individual' | 'frota';
  loading?: boolean;
  // Para upgrade, passar o plano atual
  planoAtual?: TipoPlano | null;
  veiculoId?: string;
}

export default function ModalSelecionarPlanoRastreamento({
  isOpen,
  onClose,
  onConfirm,
  tipoVeiculo,
  loading = false,
  planoAtual = null,
  veiculoId,
}: Props) {
  const { plan, prices, loading: planLoading } = useCurrentPlan();
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoPlano | null>(null);

  if (!isOpen) return null;

  // Buscar preços do plano contratado
  const precoMensal = tipoVeiculo === 'individual'
    ? (prices?.rastreamento_mensal_pf ?? 25)
    : (prices?.rastreamento_mensal_frota ?? 20);
  
  const precoAnual = tipoVeiculo === 'individual'
    ? (prices?.rastreamento_anual_pf ?? 250)
    : (prices?.rastreamento_anual_frota ?? 200);

  const precoPlacaProtegida = tipoVeiculo === 'individual'
    ? (prices?.rastreamento_placa_protegida_pf ?? 300)
    : (prices?.rastreamento_placa_protegida_frota ?? 250);

  // Calcular economia do plano anual
  const custoMensalEmAnual = precoMensal * 12;
  const economiaAnual = custoMensalEmAnual - precoAnual;
  const percentualEconomia = Math.round((economiaAnual / custoMensalEmAnual) * 100);

  // Data de hoje e vencimento
  const hoje = new Date();
  const dataContratacao = hoje.toLocaleDateString('pt-BR');
  
  const calcularVencimento = (tipo: TipoPlano) => {
    const data = new Date();
    if (tipo === 'mensal') {
      data.setMonth(data.getMonth() + 1);
    } else {
      data.setFullYear(data.getFullYear() + 1);
    }
    return data.toLocaleDateString('pt-BR');
  };

  const getPreco = (tipo: TipoPlano) => {
    switch (tipo) {
      case 'mensal': return precoMensal;
      case 'anual': return precoAnual;
      case 'placa_protegida': return precoPlacaProtegida;
    }
  };

  const handleConfirm = () => {
    if (!tipoSelecionado) return;
    const preco = getPreco(tipoSelecionado);
    onConfirm(tipoSelecionado, preco);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Determinar quais opções mostrar baseado no plano atual (para upgrade)
  const isUpgrade = !!planoAtual;
  const opcoesDisponiveis = isUpgrade
    ? planoAtual === 'mensal'
      ? ['anual', 'placa_protegida'] as TipoPlano[]
      : ['placa_protegida'] as TipoPlano[]
    : ['mensal', 'anual', 'placa_protegida'] as TipoPlano[];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="gradient-gold px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className={isUpgrade ? "ri-arrow-up-circle-line text-white text-xl" : "ri-radar-line text-white text-xl"}></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {isUpgrade ? 'Upgrade de Rastreamento' : 'Escolha o Plano de Rastreamento'}
                </h3>
                <p className="text-amber-100 text-sm">
                  {tipoVeiculo === 'individual' ? 'Pessoa Física' : 'Frota Empresarial'}
                  {plan && <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">Plano {plan.nome}</span>}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-white/80 hover:text-white transition-colors"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {planLoading ? (
            <div className="flex items-center justify-center py-8">
              <i className="ri-loader-4-line animate-spin text-2xl text-amber-600"></i>
              <span className="ml-2 text-gray-600">Carregando preços do plano...</span>
            </div>
          ) : (
            <>
              {/* Informações */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="ri-information-line text-amber-600 text-xl mt-0.5"></i>
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Como funciona o rastreamento?</p>
                    <ul className="list-disc ml-4 space-y-1 text-amber-700">
                      <li>Atualizações automáticas semanais</li>
                      <li>Notificação de novas multas por e-mail</li>
                      <li>Notificação de vencimento 3 dias antes</li>
                      <li>Cancelamento automático se não renovar</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Opções de plano */}
              <div className={`grid grid-cols-1 ${opcoesDisponiveis.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                {/* Plano Mensal */}
                {opcoesDisponiveis.includes('mensal') && (
                  <div
                    onClick={() => !loading && setTipoSelecionado('mensal')}
                    className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                      tipoSelecionado === 'mensal'
                        ? 'border-amber-500 bg-amber-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {tipoSelecionado === 'mensal' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-sm"></i>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-calendar-line text-amber-600 text-2xl"></i>
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg">Mensal</h4>
                      <p className="text-gray-500 text-sm mb-3">Renovação mensal</p>
                      <div className="text-2xl font-bold text-amber-600">
                        {formatCurrency(precoMensal)}
                        <span className="text-sm font-normal text-gray-500">/mês</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plano Anual */}
                {opcoesDisponiveis.includes('anual') && (
                  <div
                    onClick={() => !loading && setTipoSelecionado('anual')}
                    className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                      tipoSelecionado === 'anual'
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* Badge de economia */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Economize {percentualEconomia}%
                    </div>
                    
                    {tipoSelecionado === 'anual' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-sm"></i>
                      </div>
                    )}
                    <div className="text-center mt-2">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-calendar-check-line text-green-600 text-2xl"></i>
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg">Anual</h4>
                      <p className="text-gray-500 text-sm mb-3">Renovação anual</p>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(precoAnual)}
                        <span className="text-sm font-normal text-gray-500">/ano</span>
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        Economia de {formatCurrency(economiaAnual)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Placa Protegida - PREMIUM */}
                {opcoesDisponiveis.includes('placa_protegida') && (
                  <div
                    onClick={() => !loading && setTipoSelecionado('placa_protegida')}
                    className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                      tipoSelecionado === 'placa_protegida'
                        ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200'
                        : 'border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50/50 to-white'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* Badge Premium */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <i className="ri-shield-star-fill text-yellow-300"></i>
                      PREMIUM
                    </div>
                    
                    {tipoSelecionado === 'placa_protegida' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-sm"></i>
                      </div>
                    )}
                    <div className="text-center mt-2">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                        <i className="ri-shield-star-line text-purple-600 text-2xl"></i>
                      </div>
                      <h4 className="font-bold text-purple-800 text-lg">Placa Protegida</h4>
                      <p className="text-purple-600 text-sm mb-3 font-medium">Recursos IA Ilimitados!</p>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(precoPlacaProtegida)}
                        <span className="text-sm font-normal text-gray-500">/ano</span>
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-purple-700 flex items-center justify-center gap-1">
                          <i className="ri-check-fill text-green-500"></i>
                          Gere quantos recursos quiser
                        </p>
                        <p className="text-xs text-purple-700 flex items-center justify-center gap-1">
                          <i className="ri-check-fill text-green-500"></i>
                          Sem cobranças adicionais
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Resumo da seleção */}
              {tipoSelecionado && (
                <div className={`rounded-lg p-4 border space-y-2 ${
                  tipoSelecionado === 'placa_protegida' 
                    ? 'bg-purple-50 border-purple-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Plano selecionado:</span>
                    <span className={`font-bold ${
                      tipoSelecionado === 'placa_protegida' ? 'text-purple-700' : 'text-gray-800'
                    }`}>
                      {tipoSelecionado === 'mensal' ? 'Mensal' : tipoSelecionado === 'anual' ? 'Anual' : 'Placa Protegida'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Valor a ser debitado:</span>
                    <span className={`font-bold text-lg ${
                      tipoSelecionado === 'placa_protegida' ? 'text-purple-600' : 'text-amber-600'
                    }`}>
                      {formatCurrency(getPreco(tipoSelecionado))}
                    </span>
                  </div>
                  {tipoSelecionado === 'placa_protegida' && (
                    <div className="flex items-center justify-between bg-purple-100 -mx-4 px-4 py-2 mt-2">
                      <span className="text-purple-700 flex items-center gap-1 text-sm font-medium">
                        <i className="ri-infinity-line"></i> Recursos IA:
                      </span>
                      <span className="font-bold text-purple-800">ILIMITADOS</span>
                    </div>
                  )}
                  <hr className={tipoSelecionado === 'placa_protegida' ? 'border-purple-200' : 'border-gray-200'} />
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <i className="ri-calendar-event-line"></i> Data de contratação:
                    </span>
                    <span className="font-medium text-gray-800">{dataContratacao}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <i className="ri-time-line"></i> Vencimento:
                    </span>
                    <span className="font-medium text-gray-800">{calcularVencimento(tipoSelecionado)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!tipoSelecionado || loading || planLoading}
            className={`px-5 py-2.5 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              tipoSelecionado === 'placa_protegida' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg' 
                : 'gradient-gold shadow-gold'
            }`}
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Processando...
              </>
            ) : (
              <>
                <i className={tipoSelecionado === 'placa_protegida' ? 'ri-shield-star-line' : 'ri-check-line'}></i>
                {isUpgrade ? 'Fazer Upgrade' : 'Confirmar e Ativar'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}