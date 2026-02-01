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

export default function AddCreditsModal({ organization, onClose, onSuccess }: AddCreditsModalProps) {
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'saldo' | 'bonus'>('saldo');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Calcular saldo total (saldo_sacavel = saldo disponível, saldo_bonus = bônus)
  const saldoDisponivel = organization.saldo_sacavel || 0;
  const saldoBonus = organization.saldo_bonus || 0;
  const saldoTotal = saldoDisponivel + saldoBonus;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setError('Digite um valor válido maior que zero');
      return;
    }

    setLoading(true);

    try {
      // Atualizar saldo da organização
      // tipo 'saldo' -> saldo_sacavel (saldo disponível para uso)
      // tipo 'bonus' -> saldo_bonus (créditos bônus)
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
          descricao: descricao || `Crédito ${tipo === 'bonus' ? 'bônus' : ''} adicionado pelo Super Admin`,
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Adicionar Créditos</h2>
            <p className="text-sm text-muted-foreground">{organization.nome}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <i className="ri-close-line text-xl text-muted-foreground"></i>
          </button>
        </div>

        {/* Saldos Atuais */}
        <div className="p-5 bg-muted/30 border-b border-border">
          <p className="text-xs text-muted-foreground mb-2">Saldos Atuais</p>
          <div className="flex gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Saldo Disponível</p>
              <p className="font-bold text-green-600">{formatCurrency(saldoDisponivel)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bônus</p>
              <p className="font-bold text-purple-600">{formatCurrency(saldoBonus)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-bold text-foreground">{formatCurrency(saldoTotal)}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tipo de Crédito
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTipo('saldo')}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  tipo === 'saldo'
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <i className="ri-money-dollar-circle-line mr-2"></i>
                Saldo
              </button>
              <button
                type="button"
                onClick={() => setTipo('bonus')}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  tipo === 'bonus'
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <i className="ri-gift-line mr-2"></i>
                Bônus
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Valor (R$)
            </label>
            <input
              type="text"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="w-full px-4 py-2 bg-muted rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Motivo da adição de créditos..."
              rows={2}
              className="w-full px-4 py-2 bg-muted rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin"></i>
                  Adicionando...
                </span>
              ) : (
                'Adicionar Créditos'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}