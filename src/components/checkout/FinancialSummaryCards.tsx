import { useMemo } from 'react';
import type { Faturamento } from '../../types/database';

interface FinancialSummaryCardsProps {
  billing: Faturamento[];
  dateRange?: { from: Date | null; to: Date | null };
}

export function FinancialSummaryCards({ billing, dateRange }: FinancialSummaryCardsProps) {
  const summary = useMemo(() => {
    let filteredBilling = billing;
    
    if (dateRange?.from || dateRange?.to) {
      filteredBilling = billing.filter(item => {
        const date = new Date(item.created_at);
        if (dateRange.from && date < dateRange.from) return false;
        if (dateRange.to && date > dateRange.to) return false;
        return true;
      });
    }

    const recargas = filteredBilling
      .filter(item => item.valor > 0 && item.status === 'paid' && item.tipo !== 'system_usage')
      .reduce((acc, item) => acc + item.valor, 0);

    const consumo = filteredBilling
      .filter(item => item.status === 'paid' && (item.valor < 0 || item.tipo === 'system_usage'))
      .reduce((acc, item) => acc + Math.abs(item.valor), 0);

    const pendente = filteredBilling
      .filter(item => item.status === 'pending')
      .reduce((acc, item) => acc + Math.abs(item.valor), 0);

    const saldoPeriodo = recargas - consumo;
    const totalTransacoes = filteredBilling.length;

    return {
      recargas,
      consumo,
      pendente,
      saldoPeriodo,
      totalTransacoes,
    };
  }, [billing, dateRange]);

  const cards = [
    {
      title: 'Total Recargas',
      value: summary.recargas,
      icon: 'ri-add-circle-line',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Consumo',
      value: summary.consumo,
      icon: 'ri-shopping-cart-2-line',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Saldo do Período',
      value: summary.saldoPeriodo,
      icon: 'ri-scales-3-line',
      color: summary.saldoPeriodo >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: summary.saldoPeriodo >= 0 ? 'bg-blue-50' : 'bg-red-50',
    },
    {
      title: 'Pendente',
      value: summary.pendente,
      icon: 'ri-time-line',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      subtitle: `${summary.totalTransacoes} transações`
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${card.bgColor} ${card.color} rounded-xl flex items-center justify-center`}>
              <i className={`${card.icon} text-xl`}></i>
            </div>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            {card.title}
          </p>
          <p className={`text-xl font-black ${card.value < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            R$ {Math.abs(card.value).toFixed(2).replace('.', ',')}
          </p>
          {card.subtitle && (
            <p className="text-[10px] text-gray-400 mt-1">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}