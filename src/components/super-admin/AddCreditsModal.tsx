import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AddCreditsModalProps {
  organization: {
    id: string;
    nome: string;
    saldo_sacavel: number;
    saldo_bonus: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_VALUES = [50, 100, 200, 500];

export default function AddCreditsModal({ organization, onClose, onSuccess }: AddCreditsModalProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState('');
  const [tipo, setTipo] = useState<'saldo' | 'bonus'>('saldo');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Calcular saldo total
  const saldoDisponivel = organization.saldo_sacavel || 0;
  const saldoBonus = organization.saldo_bonus || 0;
  const saldoTotal = saldoDisponivel + saldoBonus;

  const getValorFinal = (): number => {
    if (selectedValue) return selectedValue;
    const parsed = parseFloat(customValue.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  };

  const handlePresetClick = (value: number) => {
    setSelectedValue(value);
    setCustomValue('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(e.target.value);
    setSelectedValue(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const valorNumerico = getValorFinal();
    if (valorNumerico <= 0) {
      setError('Selecione ou digite um valor válido maior que zero');
      return;
    }

    setLoading(true);

    try {
      // Atualizar saldo da organização
      const campoSaldo = tipo === 'saldo' ? 'saldo_sacavel' : 'saldo_bonus';
      const saldoAtual = tipo === 'saldo' ? saldoDisponivel : saldoBonus;
      const novoSaldo = saldoAtual + valorNumerico;

      const { error: updateError } = await supabase
        .from('organizations')
        .update({ [campoSaldo]: novoSaldo })
        .eq('id', organization.id);

      if (updateError) throw updateError;

      // Registrar no faturamento
      const { error: faturamentoError } = await supabase
        .from('faturamento')
        .insert({
          organization_id: organization.id,
          valor: valorNumerico,
          tipo: 'adjustment',
          status: 'paid',
          descricao: descricao || `Crédito ${tipo === 'bonus' ? 'bônus ' : ''}adicionado pelo Super Admin`,
          is_bonus: tipo === 'bonus',
          data_pagamento: new Date().toISOString().split('T')[0]
        });

      if (faturamentoError) throw faturamentoError;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao adicionar créditos:', err);
      setError('Erro ao adicionar créditos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-border my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Adicionar Créditos</h2>
            <p className="text-sm text-muted-foreground mt-1">{organization.nome}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <i className="ri-close-line text-xl text-muted-foreground"></i>
          </button>
        </div>

        {/* Saldo Atual */}
        <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Saldo Atual</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(saldoTotal)}</p>
            </div>
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-xs text-muted-foreground">Disponível</p>
                <p className="font-semibold text-foreground">{formatCurrency(saldoDisponivel)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bônus</p>
                <p className="font-semibold text-purple-600">{formatCurrency(saldoBonus)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <i className="ri-error-warning-line"></i>
              {error}
            </div>
          )}

          {/* Tipo de Crédito */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tipo de Crédito
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTipo('saldo')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  tipo === 'saldo'
                    ? 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-500'
                    : 'bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                <i className="ri-wallet-3-line mr-2"></i>
                Saldo
              </button>
              <button
                type="button"
                onClick={() => setTipo('bonus')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                  tipo === 'bonus'
                    ? 'bg-purple-50 border-purple-400 text-purple-700 dark:bg-purple-900/30 dark:border-purple-500'
                    : 'bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                <i className="ri-gift-line mr-2"></i>
                Bônus
              </button>
            </div>
          </div>

          {/* Valores Pré-definidos */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Selecione o Valor
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePresetClick(value)}
                  className={`py-4 px-4 rounded-xl border-2 transition-all ${
                    selectedValue === value
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                      : 'border-border hover:border-green-300 bg-white dark:bg-gray-700'
                  }`}
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Valor</p>
                  <p className={`text-xl font-bold ${
                    selectedValue === value ? 'text-green-600' : 'text-foreground'
                  }`}>
                    R$ {value}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Valor Personalizado */}
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Ou digite outro valor
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                R$
              </span>
              <input
                type="text"
                value={customValue}
                onChange={handleCustomChange}
                placeholder="0,00"
                className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl text-foreground text-lg font-medium focus:outline-none transition-all ${
                  customValue && !selectedValue
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-border focus:border-green-400'
                }`}
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Motivo da adição de créditos..."
              rows={2}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border-2 border-border rounded-xl text-foreground focus:outline-none focus:border-green-400 resize-none transition-all"
            />
          </div>

          {/* Valor Final Preview */}
          {getValorFinal() > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor a adicionar:</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(getValorFinal())}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Novo saldo {tipo === 'bonus' ? 'bônus' : 'disponível'}:</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency((tipo === 'saldo' ? saldoDisponivel : saldoBonus) + getValorFinal())}
                </span>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || getValorFinal() <= 0}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  Adicionando...
                </span>
              ) : (
                <>
                  <i className="ri-add-circle-line mr-2"></i>
                  Adicionar Créditos
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground pt-2">
            <i className="ri-shield-check-line mr-1"></i>
            Operação registrada no histórico de transações
          </p>
        </form>
      </div>
    </div>
  );
}
