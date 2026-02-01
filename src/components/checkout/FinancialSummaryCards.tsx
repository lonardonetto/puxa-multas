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

    const receita = filteredBilling
      .filter(item => item.valor > 0 && item.status === 'paid')
      .reduce((acc, item) => acc + item.valor, 0);

    const despesas = filteredBilling
      .filter(item => item.valor < 0 && item.status === 'paid')
      .reduce((acc, item) => acc + Math.abs(item.valor), 0);

    const pendente = filteredBilling
      .filter(item => item.status === 'pending')
      .reduce((acc, item) => acc + Math.abs(item.valor), 0);

    const lucro = receita - despesas;
    const totalTransacoes = filteredBilling.length;

    // Calcular tendência comparando com período anterior
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthRevenue = billing
      .filter(item => {
        const date = new Date(item.created_at);
        return date >= startOfMonth && item.valor > 0 && item.status === 'paid';
      })
      .reduce((acc, item) => acc + item.valor, 0);

    const lastMonthRevenue = billing
      .filter(item => {
        const date = new Date(item.created_at);
        return date >= startOfLastMonth && date <= endOfLastMonth && item.valor > 0 && item.status === 'paid';
      })
      .reduce((acc, item) => acc + item.valor, 0);

    const tendenciaReceita = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    return {
      receita,
      despesas,
      pendente,
      lucro,
      totalTransacoes,
      tendenciaReceita: Math.round(tendenciaReceita)
    };
  }, [billing, dateRange]);

  const cards = [
    {
      title: 'Receita Total',
      value: summary.receita,
      icon: 'ri-arrow-left-down-line',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: summary.tendenciaReceita,
    },
    {
      title: 'Despesas',
      value: summary.despesas,
      icon: 'ri-arrow-right-up-line',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: null,
    },
    {
      title: 'Lucro Líquido',
      value: summary.lucro,
      icon: 'ri-funds-line',
      color: summary.lucro >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: summary.lucro >= 0 ? 'bg-blue-50' : 'bg-red-50',
      trend: null,
    },
    {
      title: 'Pendente',
      value: summary.pendente,
      icon: 'ri-time-line',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: null,
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
            {card.trend !== null && card.trend !== 0 && (
              <div className={`flex items-center text-xs font-bold ${card.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <i className={`${card.trend > 0 ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} mr-0.5`}></i>
                {Math.abs(card.trend)}%
              </div>
            )}
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
