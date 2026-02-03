import { useState } from 'react';
import { useCurrentPlan } from '../../hooks/useCurrentPlan';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tipo: 'mensal' | 'anual', preco: number) => void;
  tipoVeiculo: 'individual' | 'frota';
  loading?: boolean;
}

export default function ModalSelecionarPlanoRastreamento({
  isOpen,
  onClose,
  onConfirm,
  tipoVeiculo,
  loading = false,
}: Props) {
  const { plan, prices } = useCurrentPlan();
  const [tipoSelecionado, setTipoSelecionado] = useState<'mensal' | 'anual' | null>(null);

  if (!isOpen) return null;

  // Preços base (fallback) - serão sobrescritos pelos do plano
  const precosDefault = {
    mensal: {
      individual: 15,
      frota: 10,
    },
    anual: {
      individual: 150,
      frota: 100,
    },
  };

  // Buscar preços do plano (quando disponível no banco)
  const precoMensal = tipoVeiculo === 'individual'
    ? (prices?.rastreamento_pf || precosDefault.mensal.individual)
    : (precosDefault.mensal.frota);
  
  const precoAnual = tipoVeiculo === 'individual'
    ? (precosDefault.anual.individual)
    : (precosDefault.anual.frota);

  // Calcular economia do plano anual
  const economiaAnual = (precoMensal * 12) - precoAnual;
  const percentualEconomia = Math.round((economiaAnual / (precoMensal * 12)) * 100);

  const handleConfirm = () => {
    if (!tipoSelecionado) return;
    const preco = tipoSelecionado === 'mensal' ? precoMensal : precoAnual;
    onConfirm(tipoSelecionado, preco);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="ri-radar-line text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Escolha o Plano de Rastreamento</h3>
                <p className="text-blue-100 text-sm">
                  {tipoVeiculo === 'individual' ? 'Pessoa Física' : 'Frota Empresarial'}
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
          {/* Informações */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <i className="ri-information-line text-blue-600 text-xl mt-0.5"></i>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Como funciona o rastreamento?</p>
                <ul className="list-disc ml-4 space-y-1 text-blue-700">
                  <li>Atualizações automáticas semanais</li>
                  <li>Notificação de novas multas por e-mail</li>
                  <li>Notificação de vencimento 3 dias antes</li>
                  <li>Cancelamento automático se não renovar</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Opções de plano */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plano Mensal */}
            <div
              onClick={() => !loading && setTipoSelecionado('mensal')}
              className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                tipoSelecionado === 'mensal'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tipoSelecionado === 'mensal' && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-white text-sm"></i>
                </div>
              )}
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-calendar-line text-blue-600 text-2xl"></i>
                </div>
                <h4 className="font-bold text-gray-800 text-lg">Mensal</h4>
                <p className="text-gray-500 text-sm mb-3">Renovação mensal</p>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(precoMensal)}
                  <span className="text-sm font-normal text-gray-500">/mês</span>
                </div>
              </div>
            </div>

            {/* Plano Anual */}
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
          </div>

          {/* Resumo da seleção */}
          {tipoSelecionado && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Plano selecionado:</span>
                <span className="font-bold text-gray-800">
                  {tipoSelecionado === 'mensal' ? 'Mensal' : 'Anual'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-600">Valor a ser debitado:</span>
                <span className="font-bold text-blue-600 text-lg">
                  {formatCurrency(tipoSelecionado === 'mensal' ? precoMensal : precoAnual)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-600">Vencimento:</span>
                <span className="font-medium text-gray-800">
                  {tipoSelecionado === 'mensal' 
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
                    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
                  }
                </span>
              </div>
            </div>
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
            disabled={!tipoSelecionado || loading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Processando...
              </>
            ) : (
              <>
                <i className="ri-check-line"></i>
                Confirmar e Ativar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
