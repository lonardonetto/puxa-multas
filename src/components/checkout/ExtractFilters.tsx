import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ExtractFiltersState {
  tipo: 'todos' | 'entrada' | 'saida';
  status: 'todos' | 'paid' | 'pending' | 'overdue' | 'cancelled';
  categoria: string;
  busca: string;
  dateRange: { from: Date | null; to: Date | null };
  agrupamento: 'nenhum' | 'dia' | 'semana' | 'mes';
}

interface ExtractFiltersProps {
  filters: ExtractFiltersState;
  onFiltersChange: (filters: ExtractFiltersState) => void;
  categorias: string[];
}

export function ExtractFilters({ filters, onFiltersChange, categorias }: ExtractFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const tipoOptions = [
    { id: 'todos', label: 'Tudo' },
    { id: 'entrada', label: 'Recargas' },
    { id: 'saida', label: 'Consumo' },
  ];

  const statusOptions = [
    { id: 'todos', label: 'Todos' },
    { id: 'paid', label: 'Concluído' },
    { id: 'pending', label: 'Pendente' },
    { id: 'overdue', label: 'Atrasado' },
    { id: 'cancelled', label: 'Cancelado' },
  ];

  const agrupamentoOptions = [
    { id: 'nenhum', label: 'Sem agrupamento' },
    { id: 'dia', label: 'Por dia' },
    { id: 'semana', label: 'Por semana' },
    { id: 'mes', label: 'Por mês' },
  ];

  const quickDateRanges = [
    { 
      label: 'Hoje', 
      getRange: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return { from: today, to: end };
      }
    },
    { 
      label: 'Esta semana', 
      getRange: () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const from = new Date(today);
        from.setDate(today.getDate() - dayOfWeek);
        from.setHours(0, 0, 0, 0);
        return { from, to: new Date() };
      }
    },
    { 
      label: 'Este mês', 
      getRange: () => {
        const today = new Date();
        const from = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from, to: new Date() };
      }
    },
    { 
      label: 'Últimos 30 dias', 
      getRange: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 30);
        return { from, to };
      }
    },
    { 
      label: 'Últimos 90 dias', 
      getRange: () => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 90);
        return { from, to };
      }
    },
  ];

  const formatDateRange = () => {
    if (!filters.dateRange.from && !filters.dateRange.to) {
      return 'Selecionar período';
    }
    if (filters.dateRange.from && filters.dateRange.to) {
      return `${format(filters.dateRange.from, 'dd/MM/yy', { locale: ptBR })} - ${format(filters.dateRange.to, 'dd/MM/yy', { locale: ptBR })}`;
    }
    if (filters.dateRange.from) {
      return `A partir de ${format(filters.dateRange.from, 'dd/MM/yy', { locale: ptBR })}`;
    }
    return 'Selecionar período';
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Filtros de tipo */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          {tipoOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => onFiltersChange({ ...filters, tipo: opt.id as any })}
              className={`text-xs font-black uppercase tracking-widest py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                filters.tipo === opt.id 
                  ? 'bg-[#1E3A8A] text-white' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Busca */}
        <div className="relative flex-1 min-w-[200px]">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={filters.busca}
            onChange={(e) => onFiltersChange({ ...filters, busca: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Segunda linha de filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Data */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <i className="ri-calendar-line text-gray-400"></i>
            {formatDateRange()}
            <i className="ri-arrow-down-s-line text-gray-400"></i>
          </button>

          {showDatePicker && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 min-w-[280px]">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Período rápido</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {quickDateRanges.map((range, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onFiltersChange({ ...filters, dateRange: range.getRange() });
                      setShowDatePicker(false);
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-gray-100 text-gray-600 rounded-lg hover:bg-[#1E3A8A] hover:text-white transition-all cursor-pointer"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Personalizado</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="date"
                  value={filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : ''}
                  onChange={(e) => onFiltersChange({ 
                    ...filters, 
                    dateRange: { ...filters.dateRange, from: e.target.value ? new Date(e.target.value) : null }
                  })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <input
                  type="date"
                  value={filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : ''}
                  onChange={(e) => onFiltersChange({ 
                    ...filters, 
                    dateRange: { ...filters.dateRange, to: e.target.value ? new Date(e.target.value) : null }
                  })}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    onFiltersChange({ ...filters, dateRange: { from: null, to: null } });
                    setShowDatePicker(false);
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-4 py-1.5 text-xs font-bold bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as any })}
          className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          {statusOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>

        {/* Categoria */}
        <select
          value={filters.categoria}
          onChange={(e) => onFiltersChange({ ...filters, categoria: e.target.value })}
          className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="">Todas categorias</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Agrupamento */}
        <select
          value={filters.agrupamento}
          onChange={(e) => onFiltersChange({ ...filters, agrupamento: e.target.value as any })}
          className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          {agrupamentoOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>

        {/* Reset filters */}
        {(filters.tipo !== 'todos' || filters.status !== 'todos' || filters.categoria || filters.busca || filters.dateRange.from || filters.agrupamento !== 'nenhum') && (
          <button
            onClick={() => onFiltersChange({
              tipo: 'todos',
              status: 'todos',
              categoria: '',
              busca: '',
              dateRange: { from: null, to: null },
              agrupamento: 'nenhum'
            })}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
          >
            <i className="ri-close-line"></i>
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
