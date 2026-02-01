import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Faturamento } from '../../types/database';
import type { ExtractFiltersState } from './ExtractFilters';

interface ExtractExportProps {
  transacoes: Faturamento[];
  filters: ExtractFiltersState;
  organizationName?: string;
}

export function ExtractExport({ transacoes, filters, organizationName }: ExtractExportProps) {
  const [exporting, setExporting] = useState(false);

  const getFilteredTransactions = () => {
    return transacoes.filter(t => {
      if (filters.tipo === 'entrada' && t.valor <= 0) return false;
      if (filters.tipo === 'saida' && t.valor >= 0) return false;
      if (filters.status !== 'todos' && t.status !== filters.status) return false;
      if (filters.categoria && (t as any).categoria !== filters.categoria) return false;
      if (filters.busca) {
        const search = filters.busca.toLowerCase();
        const descricao = (t.descricao || '').toLowerCase();
        if (!descricao.includes(search)) return false;
      }
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
  };

  const exportToCSV = () => {
    setExporting(true);
    try {
      const data = getFilteredTransactions();
      
      const headers = ['Data', 'Hora', 'Descrição', 'Categoria', 'Valor', 'Status'];
      const rows = data.map(t => [
        format(new Date(t.created_at), 'dd/MM/yyyy', { locale: ptBR }),
        format(new Date(t.created_at), 'HH:mm', { locale: ptBR }),
        t.descricao || '',
        (t as any).categoria || 'Outros',
        t.valor.toFixed(2).replace('.', ','),
        t.status === 'paid' ? 'Concluído' : t.status === 'pending' ? 'Pendente' : t.status === 'overdue' ? 'Atrasado' : 'Cancelado'
      ]);

      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `extrato_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    setExporting(true);
    try {
      const data = getFilteredTransactions();
      
      const totalReceita = data.filter(t => t.valor > 0 && t.status === 'paid').reduce((acc, t) => acc + t.valor, 0);
      const totalDespesa = data.filter(t => t.valor < 0 && t.status === 'paid').reduce((acc, t) => acc + Math.abs(t.valor), 0);
      const saldo = totalReceita - totalDespesa;

      const dateRangeText = filters.dateRange.from && filters.dateRange.to
        ? `Período: ${format(filters.dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} a ${format(filters.dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`
        : 'Período: Todos os registros';

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Extrato Financeiro</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1E3A8A; padding-bottom: 20px; }
            .header h1 { font-size: 24px; color: #1E3A8A; margin-bottom: 5px; }
            .header p { font-size: 12px; color: #666; }
            .summary { display: flex; gap: 20px; margin-bottom: 30px; }
            .summary-card { flex: 1; background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
            .summary-card label { font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
            .summary-card .value { font-size: 18px; font-weight: bold; margin-top: 5px; }
            .summary-card .value.positive { color: #10B981; }
            .summary-card .value.negative { color: #EF4444; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #1E3A8A; color: white; padding: 10px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 10px 8px; border-bottom: 1px solid #eee; }
            tr:nth-child(even) { background: #f9fafb; }
            .positive { color: #10B981; font-weight: bold; }
            .negative { color: #EF4444; font-weight: bold; }
            .status { padding: 3px 8px; border-radius: 20px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .status.paid { background: #D1FAE5; color: #065F46; }
            .status.pending { background: #FEF3C7; color: #92400E; }
            .status.overdue { background: #FEE2E2; color: #991B1B; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #888; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Extrato Financeiro</h1>
            <p>${organizationName || 'Organização'} • ${dateRangeText}</p>
            <p>Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
          </div>

          <div class="summary">
            <div class="summary-card">
              <label>Receitas</label>
              <div class="value positive">R$ ${totalReceita.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="summary-card">
              <label>Despesas</label>
              <div class="value negative">R$ ${totalDespesa.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="summary-card">
              <label>Saldo</label>
              <div class="value ${saldo >= 0 ? 'positive' : 'negative'}">R$ ${saldo.toFixed(2).replace('.', ',')}</div>
            </div>
            <div class="summary-card">
              <label>Transações</label>
              <div class="value">${data.length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th style="text-align: right">Valor</th>
                <th style="text-align: center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(t => `
                <tr>
                  <td>
                    <strong>${format(new Date(t.created_at), 'dd/MM/yyyy', { locale: ptBR })}</strong><br>
                    <span style="color: #888; font-size: 10px">${format(new Date(t.created_at), 'HH:mm', { locale: ptBR })}</span>
                  </td>
                  <td>${t.descricao || '-'}</td>
                  <td>${(t as any).categoria || 'Outros'}</td>
                  <td style="text-align: right" class="${t.valor > 0 ? 'positive' : 'negative'}">
                    ${t.valor > 0 ? '+' : ''} R$ ${t.valor.toFixed(2).replace('.', ',')}
                  </td>
                  <td style="text-align: center">
                    <span class="status ${t.status}">
                      ${t.status === 'paid' ? 'Concluído' : t.status === 'pending' ? 'Pendente' : t.status === 'overdue' ? 'Atrasado' : 'Cancelado'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Documento gerado automaticamente • Sistema Financeiro</p>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportToCSV}
        disabled={exporting}
        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-50"
      >
        <i className="ri-file-excel-2-line text-green-600"></i>
        Excel
      </button>
      <button
        onClick={exportToPDF}
        disabled={exporting}
        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all cursor-pointer disabled:opacity-50"
      >
        <i className="ri-file-pdf-2-line text-red-600"></i>
        PDF
      </button>
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all cursor-pointer"
      >
        <i className="ri-printer-line"></i>
        Imprimir
      </button>
    </div>
  );
}
