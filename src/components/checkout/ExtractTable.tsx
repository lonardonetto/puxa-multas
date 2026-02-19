import { useMemo } from 'react';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Faturamento } from '../../types/database';
import type { ExtractFiltersState } from './ExtractFilters';

interface ExtractTableProps {
  transacoes: Faturamento[];
  filters: ExtractFiltersState;
}

interface GroupedTransactions {
  label: string;
  date: Date;
  transactions: Faturamento[];
  subtotal: number;
}

export function ExtractTable({ transacoes, filters }: ExtractTableProps) {
  const filteredTransactions = useMemo(() => {
    return transacoes.filter(t => {
      // Filtro por tipo (system_usage é sempre consumo/saída)
      const isConsumo = t.tipo === 'system_usage' || t.valor < 0;
      if (filters.tipo === 'entrada' && isConsumo) return false;
      if (filters.tipo === 'saida' && !isConsumo) return false;
      
      // Filtro por status
      if (filters.status !== 'todos' && t.status !== filters.status) return false;
      
      // Filtro por categoria
      if (filters.categoria && (t as any).categoria !== filters.categoria) return false;
      
      // Filtro por busca
      if (filters.busca) {
        const search = filters.busca.toLowerCase();
        const descricao = (t.descricao || '').toLowerCase();
        if (!descricao.includes(search)) return false;
      }
      
      // Filtro por data
      if (filters.dateRange.from || filters.dateRange.to) {
        const date = new Date(t.created_at);
        if (filters.dateRange.from && date < filters.dateRange.from) return false;
        if (filters.dateRange.to) {
          const endOfDay = new Date(filters.dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          if (date > endOfDay) return false;
        }
      }
      
      return true;
    });
  }, [transacoes, filters]);

  const groupedData = useMemo((): GroupedTransactions[] => {
    if (filters.agrupamento === 'nenhum') {
      return [];
    }

    const groups = new Map<string, GroupedTransactions>();

    filteredTransactions.forEach(t => {
      const date = new Date(t.created_at);
      let groupDate: Date;
      let label: string;

      switch (filters.agrupamento) {
        case 'dia':
          groupDate = startOfDay(date);
          label = format(groupDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
          break;
        case 'semana':
          groupDate = startOfWeek(date, { locale: ptBR });
          const weekEnd = new Date(groupDate);
          weekEnd.setDate(weekEnd.getDate() + 6);
          label = `${format(groupDate, 'dd/MM', { locale: ptBR })} - ${format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}`;
          break;
        case 'mes':
          groupDate = startOfMonth(date);
          label = format(groupDate, "MMMM 'de' yyyy", { locale: ptBR });
          break;
        default:
          return;
      }

      const key = groupDate.toISOString();
      
      if (!groups.has(key)) {
        groups.set(key, {
          label,
          date: groupDate,
          transactions: [],
          subtotal: 0
        });
      }

      const group = groups.get(key)!;
      group.transactions.push(t);
      group.subtotal += t.valor;
    });

    return Array.from(groups.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredTransactions, filters.agrupamento]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Concluído' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
      overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Atrasado' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Cancelado' },
    };
    const style = styles[status] || styles.pending;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const getDisplayValue = (t: Faturamento) => {
    // system_usage é sempre consumo (negativo), independente do sinal armazenado
    if (t.tipo === 'system_usage' && t.valor > 0) return -t.valor;
    return t.valor;
  };

  const renderTransactionRow = (transacao: Faturamento) => {
    const displayValue = getDisplayValue(transacao);
    return (
      <tr key={transacao.id} className="hover:bg-gray-50/50 transition-colors">
        <td className="py-4 px-2">
          <p className="text-sm font-bold text-gray-700">
            {format(new Date(transacao.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </p>
          <p className="text-[10px] text-gray-400 font-mono">
            {format(new Date(transacao.created_at), 'HH:mm', { locale: ptBR })}
          </p>
        </td>
        <td className="py-4 px-2">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
              displayValue > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              <i className={displayValue > 0 ? 'ri-arrow-left-down-line' : 'ri-arrow-right-up-line'}></i>
            </div>
            <span className="text-sm text-gray-800 font-bold">{transacao.descricao}</span>
          </div>
        </td>
        <td className="py-4 px-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600">
            {transacao.tipo === 'system_usage' ? 'Consumo' : (transacao as any).categoria || 'Recarga'}
          </span>
        </td>
        <td className={`py-4 px-2 text-right text-sm font-black ${
          displayValue > 0 ? 'text-[#10B981]' : 'text-red-500'
        }`}>
          {displayValue > 0 ? '+' : '- '} R$ {Math.abs(displayValue).toFixed(2).replace('.', ',')}
        </td>
        <td className="py-4 px-2 text-center">
          {getStatusBadge(transacao.status)}
        </td>
      </tr>
    );
  };

  const tableHeader = (
    <thead>
      <tr className="border-b border-gray-100">
        <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Data</th>
        <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Descrição</th>
        <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Categoria</th>
        <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor</th>
        <th className="py-4 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
      </tr>
    </thead>
  );

  if (filteredTransactions.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {tableHeader}
          <tbody>
            <tr>
              <td colSpan={5} className="py-12 text-center text-gray-400 italic">
                Nenhuma transação encontrada com os filtros selecionados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Renderização agrupada
  if (filters.agrupamento !== 'nenhum' && groupedData.length > 0) {
    return (
      <div className="space-y-6">
        {groupedData.map((group, idx) => (
          <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ri-calendar-2-line text-gray-400"></i>
                <span className="text-sm font-bold text-gray-700 capitalize">{group.label}</span>
                <span className="text-xs text-gray-400">({group.transactions.length} transações)</span>
              </div>
              <span className={`text-sm font-black ${group.subtotal >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {group.subtotal >= 0 ? '+' : ''} R$ {group.subtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <table className="w-full text-left">
              {tableHeader}
              <tbody className="divide-y divide-gray-50">
                {group.transactions.map(renderTransactionRow)}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  }

  // Renderização sem agrupamento
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        {tableHeader}
        <tbody className="divide-y divide-gray-50">
          {filteredTransactions.map(renderTransactionRow)}
        </tbody>
      </table>
    </div>
  );
}
