import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Movimentacao {
  id: string;
  tipo_evento: string;
  organization_id: string;
  org_nome: string;
  descricao: string;
  valor: number;
  status: string;
  metodo: string;
  categoria: string;
  created_at: string;
  origem: 'faturamento' | 'recarga' | 'plano';
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(v));

const formatDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  paid:      { label: 'Aprovado',  color: 'bg-green-100 text-green-700 border-green-200',   icon: 'ri-check-double-line' },
  pendente:  { label: 'Pendente',  color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: 'ri-time-line' },
  aprovado:  { label: 'Aprovado',  color: 'bg-green-100 text-green-700 border-green-200',   icon: 'ri-check-double-line' },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-100 text-red-700 border-red-200',         icon: 'ri-close-circle-line' },
  pending:   { label: 'Pendente',  color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: 'ri-time-line' },
};

const TIPO_CONFIG: Record<string, { label: string; color: string; icon: string; sinal: 1 | -1 }> = {
  credit_purchase: { label: 'Recarga',         color: 'bg-blue-100 text-blue-700',    icon: 'ri-add-circle-line',     sinal: 1  },
  adjustment:      { label: 'Crédito Manual',  color: 'bg-purple-100 text-purple-700', icon: 'ri-gift-line',           sinal: 1  },
  subscription:    { label: 'Assinatura Plano',color: 'bg-indigo-100 text-indigo-700', icon: 'ri-vip-crown-line',      sinal: 1  },
  system_usage:    { label: 'Consumo IA',      color: 'bg-rose-100 text-rose-700',    icon: 'ri-robot-line',          sinal: -1 },
  recarga_pix:     { label: 'Recarga PIX',     color: 'bg-cyan-100 text-cyan-700',    icon: 'ri-qr-code-line',        sinal: 1  },
  pedido_plano:    { label: 'Pedido Plano',    color: 'bg-violet-100 text-violet-700', icon: 'ri-file-list-3-line',    sinal: 1 as const  },
  pedido_recarga:  { label: 'Pedido Recarga',  color: 'bg-sky-100 text-sky-700',       icon: 'ri-currency-line',       sinal: 1 as const  },
};

const FILTRO_TABS = [
  { key: 'todos',    label: 'Tudo' },
  { key: 'receita',  label: 'Entradas' },
  { key: 'consumo',  label: 'Saídas' },
  { key: 'pedidos',  label: 'Pedidos' },
];

export default function MovimentacoesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTab, setFiltroTab] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const POR_PAGINA = 50;

  // Totalizadores
  const [totais, setTotais] = useState({ entradas: 0, saidas: 0, pedidosPendentes: 0 });

  const fetchMovimentacoes = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar faturamento + solicitações em paralelo
      const [fatRes, recargaRes, planoRes] = await Promise.all([
        (supabase as any)
          .from('faturamento')
          .select('id, organization_id, valor, status, tipo, metodo_pagamento, descricao, created_at, organizations(nome)')
          .order('created_at', { ascending: false })
          .limit(500),
        (supabase as any)
          .from('solicitacoes_recarga')
          .select('id, organization_id, valor, status, metodo_pagamento, observacao, created_at, organizations(nome)')
          .order('created_at', { ascending: false })
          .limit(200),
        (supabase as any)
          .from('solicitacoes_plano')
          .select('id, organization_id, valor, status, plano_nome, ciclo, observacao, created_at, organizations(nome)')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      const movs: Movimentacao[] = [];

      // Faturamento
      for (const f of (fatRes.data || [])) {
        movs.push({
          id: `fat-${f.id}`,
          tipo_evento: f.tipo || 'adjustment',
          organization_id: f.organization_id,
          org_nome: f.organizations?.nome || '—',
          descricao: f.descricao || '—',
          valor: f.valor || 0,
          status: f.status || 'paid',
          metodo: f.metodo_pagamento || '—',
          categoria: 'faturamento',
          created_at: f.created_at,
          origem: 'faturamento',
        });
      }

      // Solicitações de recarga pendentes/rejeitadas (que ainda não viraram faturamento)
      for (const r of (recargaRes.data || [])) {
        if (r.status === 'pendente' || r.status === 'rejeitado') {
          movs.push({
            id: `rec-${r.id}`,
            tipo_evento: 'pedido_recarga',
            organization_id: r.organization_id,
            org_nome: r.organizations?.nome || '—',
            descricao: `Pedido de recarga — ${r.metodo_pagamento || 'PIX'}`,
            valor: r.valor || 0,
            status: r.status,
            metodo: r.metodo_pagamento || 'pix',
            categoria: 'solicitacao',
            created_at: r.created_at,
            origem: 'recarga',
          });
        }
      }

      // Solicitações de plano pendentes/rejeitadas
      for (const p of (planoRes.data || [])) {
        if (p.status === 'pendente' || p.status === 'rejeitado') {
          movs.push({
            id: `pla-${p.id}`,
            tipo_evento: 'pedido_plano',
            organization_id: p.organization_id,
            org_nome: p.organizations?.nome || '—',
            descricao: `Pedido plano ${p.plano_nome} (${p.ciclo})`,
            valor: p.valor || 0,
            status: p.status,
            metodo: '—',
            categoria: 'solicitacao',
            created_at: p.created_at,
            origem: 'plano',
          });
        }
      }

      // Ordenar por data desc
      movs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Calcular totais
      let entradas = 0, saidas = 0, pedidosPendentes = 0;
      for (const m of movs) {
        if (m.status === 'paid' || m.status === 'aprovado') {
          const cfg = TIPO_CONFIG[m.tipo_evento];
          if (cfg?.sinal === 1) entradas += m.valor;
          else if (cfg?.sinal === -1) saidas += Math.abs(m.valor);
        }
        if (m.status === 'pendente') pedidosPendentes++;
      }
      setTotais({ entradas, saidas, pedidosPendentes });
      setItems(movs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMovimentacoes(); }, [fetchMovimentacoes]);

  // Filtrar
  const filtrados = items.filter(m => {
    if (filtroTab === 'receita' && (TIPO_CONFIG[m.tipo_evento]?.sinal !== 1 || m.categoria === 'solicitacao')) return false;
    if (filtroTab === 'consumo' && TIPO_CONFIG[m.tipo_evento]?.sinal !== -1) return false;
    if (filtroTab === 'pedidos' && m.categoria !== 'solicitacao') return false;
    if (filtroStatus !== 'todos' && m.status !== filtroStatus) return false;
    if (busca) {
      const b = busca.toLowerCase();
      if (!m.org_nome.toLowerCase().includes(b) && !m.descricao.toLowerCase().includes(b)) return false;
    }
    return true;
  });

  const paginados = filtrados.slice(0, pagina * POR_PAGINA);
  const temMais = filtrados.length > paginados.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground">Movimentações Financeiras</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Todas as transações do sistema em tempo real</p>
        </div>
        <button
          onClick={fetchMovimentacoes}
          className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
        >
          <i className={`ri-refresh-line ${loading ? 'animate-spin' : ''}`}></i>
          Atualizar
        </button>
      </div>

      {/* Cards de totais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-down-circle-line text-xl"></i>
            </div>
            <span className="text-sm font-semibold opacity-90">Total Entradas</span>
          </div>
          <p className="text-2xl font-black">{formatCurrency(totais.entradas)}</p>
          <p className="text-xs opacity-75 mt-1">Recargas + planos aprovados</p>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-up-circle-line text-xl"></i>
            </div>
            <span className="text-sm font-semibold opacity-90">Total Consumos</span>
          </div>
          <p className="text-2xl font-black">{formatCurrency(totais.saidas)}</p>
          <p className="text-xs opacity-75 mt-1">Uso de IA e serviços</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-xl"></i>
            </div>
            <span className="text-sm font-semibold opacity-90">Pedidos Pendentes</span>
          </div>
          <p className="text-2xl font-black">{totais.pedidosPendentes}</p>
          <p className="text-xs opacity-75 mt-1">Aguardando aprovação manual</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Tabs */}
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            {FILTRO_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => { setFiltroTab(t.key); setPagina(1); }}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  filtroTab === t.key
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status */}
          <select
            value={filtroStatus}
            onChange={e => { setFiltroStatus(e.target.value); setPagina(1); }}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="todos">Todos os status</option>
            <option value="paid">Aprovado</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado (soliciatção)</option>
            <option value="rejeitado">Rejeitado</option>
          </select>

          {/* Busca */}
          <div className="relative flex-1 min-w-[200px]">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"></i>
            <input
              type="text"
              placeholder="Buscar organização ou descrição..."
              value={busca}
              onChange={e => { setBusca(e.target.value); setPagina(1); }}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <span className="text-xs text-muted-foreground ml-auto font-medium">
            {filtrados.length} registros
          </span>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <i className="ri-loader-4-line text-3xl text-primary animate-spin"></i>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-inbox-line text-4xl text-muted-foreground/40 mb-3 block"></i>
            <p className="text-muted-foreground font-medium">Nenhuma movimentação encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Data/Hora</th>
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Organização</th>
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Evento</th>
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Descrição</th>
                  <th className="text-center py-3 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginados.map(m => {
                  const tipoCfg = TIPO_CONFIG[m.tipo_evento] || { label: m.tipo_evento, color: 'bg-gray-100 text-gray-700', icon: 'ri-exchange-line', sinal: 0 as const };
                  const statusCfg = STATUS_CONFIG[m.status] || { label: m.status, color: 'bg-gray-100 text-gray-700', icon: 'ri-question-line' };
                  const isNegativo = tipoCfg.sinal === -1 || m.valor < 0;
                  const isSolicitacao = m.categoria === 'solicitacao';

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => {
                        if (m.origem === 'recarga' || m.origem === 'plano') navigate('/super-admin/recargas');
                        else navigate(`/super-admin/organizations/${m.organization_id}`);
                      }}
                    >
                      {/* Data */}
                      <td className="py-3 px-2 whitespace-nowrap">
                        <div className="text-xs text-foreground font-medium">{formatDate(m.created_at).split(' ')[0]}</div>
                        <div className="text-[11px] text-muted-foreground">{formatDate(m.created_at).split(' ')[1]}</div>
                      </td>

                      {/* Org */}
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="ri-building-2-line text-primary text-xs"></i>
                          </div>
                          <span className="font-semibold text-foreground text-xs max-w-[140px] truncate">{m.org_nome}</span>
                        </div>
                      </td>

                      {/* Evento */}
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${tipoCfg.color} border-transparent`}>
                          <i className={`${tipoCfg.icon} text-xs`}></i>
                          {tipoCfg.label}
                          {isSolicitacao && <span className="opacity-60 ml-0.5">· pedido</span>}
                        </span>
                      </td>

                      {/* Descrição */}
                      <td className="py-3 px-2 max-w-[260px]">
                        <p className="text-xs text-foreground truncate" title={m.descricao}>{m.descricao}</p>
                        {m.metodo && m.metodo !== '—' && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                            <i className="ri-bank-card-line mr-1"></i>
                            {m.metodo === 'credit_card' ? 'Cartão / InfinitePay' : m.metodo === 'pix' ? 'PIX' : m.metodo === 'balance' ? 'Saldo Interno' : m.metodo}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-2 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.color}`}>
                          <i className={`${statusCfg.icon} text-xs`}></i>
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Valor */}
                      <td className="py-3 px-2 text-right whitespace-nowrap">
                        <span className={`text-sm font-black ${
                          isSolicitacao ? 'text-muted-foreground' :
                          isNegativo ? 'text-rose-600' : 'text-green-600'
                        }`}>
                          {isSolicitacao ? '' : isNegativo ? '−' : '+'}
                          {formatCurrency(m.valor)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {temMais && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setPagina(p => p + 1)}
                  className="px-6 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-semibold hover:bg-muted/80 transition-colors"
                >
                  Carregar mais ({filtrados.length - paginados.length} restantes)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
