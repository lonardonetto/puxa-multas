import { useMemo } from 'react';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Faturamento } from '../../types/database';

interface FinancialChartProps {
  billing: Faturamento[];
}

export function FinancialChart({ billing }: FinancialChartProps) {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayTransactions = billing.filter(t => {
        const date = new Date(t.created_at);
        return date >= dayStart && date <= dayEnd && t.status === 'paid';
      });
      
      const receita = dayTransactions
        .filter(t => t.valor > 0)
        .reduce((acc, t) => acc + t.valor, 0);
      
      const despesa = dayTransactions
        .filter(t => t.valor < 0)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
      
      return {
        date: day,
        label: format(day, 'dd', { locale: ptBR }),
        fullLabel: format(day, 'dd/MM', { locale: ptBR }),
        receita,
        despesa,
        saldo: receita - despesa
      };
    });
  }, [billing]);

  const maxValue = useMemo(() => {
    const allValues = chartData.flatMap(d => [d.receita, d.despesa]);
    return Math.max(...allValues, 100);
  }, [chartData]);

  const getBarHeight = (value: number) => {
    return (value / maxValue) * 100;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Evolução Financeira</h3>
          <p className="text-xs text-gray-400">Últimos 30 dias</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-500">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span className="text-xs text-gray-500">Despesas</span>
          </div>
        </div>
      </div>

      <div className="relative h-40">
        <div className="absolute inset-0 flex items-end justify-between gap-1 px-1">
          {chartData.map((day, idx) => (
            <div 
              key={idx} 
              className="flex-1 flex flex-col items-center gap-0.5 group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                <p className="font-bold">{day.fullLabel}</p>
                <p className="text-green-400">+R$ {day.receita.toFixed(2)}</p>
                <p className="text-red-400">-R$ {day.despesa.toFixed(2)}</p>
              </div>
              
              {/* Bars container */}
              <div className="w-full flex gap-0.5 items-end h-32">
                {/* Receita bar */}
                <div 
                  className="flex-1 bg-green-500 rounded-t transition-all hover:bg-green-400"
                  style={{ height: `${getBarHeight(day.receita)}%`, minHeight: day.receita > 0 ? '4px' : '0' }}
                ></div>
                {/* Despesa bar */}
                <div 
                  className="flex-1 bg-red-400 rounded-t transition-all hover:bg-red-300"
                  style={{ height: `${getBarHeight(day.despesa)}%`, minHeight: day.despesa > 0 ? '4px' : '0' }}
                ></div>
              </div>
              
              {/* Label */}
              {idx % 5 === 0 && (
                <span className="text-[9px] text-gray-400 font-mono">{day.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
