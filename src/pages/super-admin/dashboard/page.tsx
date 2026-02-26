import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import '../../../lib/chartjs-setup';
import { supabase } from '../../../lib/supabase';
import { useSuperAdminStats } from '../../../hooks/useSuperAdminStats';



const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('pt-BR') + ' ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { stats, loading, refresh } = useSuperAdminStats();
  const [ultimasMovs, setUltimasMovs] = useState<any[]>([]);
  const [loadingMovs, setLoadingMovs] = useState(true);

  useEffect(() => {
    const fetchMovs = async () => {
      setLoadingMovs(true);
      try {
        const [fatRes, recRes, plRes] = await Promise.all([
          (supabase as any)
            .from('faturamento')
            .select('id, organization_id, valor, status, tipo, metodo_pagamento, descricao, created_at, organizations(nome)')
            .order('created_at', { ascending: false })
            .limit(10),
          (supabase as any)
            .from('solicitacoes_recarga')
            .select('id, organization_id, valor, status, metodo_pagamento, created_at, organizations(nome)')
            .eq('status', 'pendente')
            .order('created_at', { ascending: false })
            .limit(5),
          (supabase as any)
            .from('solicitacoes_plano')
            .select('id, organization_id, valor, status, plano_nome, ciclo, created_at, organizations(nome)')
            .eq('status', 'pendente')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        const movs: any[] = [
          ...(fatRes.data || []).map((f: any) => ({
            id: `fat-${f.id}`, org_nome: f.organizations?.nome || '—',
            descricao: f.descricao || '—', valor: f.valor, status: f.status,
            tipo: f.tipo, created_at: f.created_at, organization_id: f.organization_id, origem: 'faturamento',
          })),
          ...(recRes.data || []).map((r: any) => ({
            id: `rec-${r.id}`, org_nome: r.organizations?.nome || '—',
            descricao: `Pedido recarga — ${r.metodo_pagamento || 'PIX'}`, valor: r.valor, status: r.status,
            tipo: 'pedido_recarga', created_at: r.created_at, organization_id: r.organization_id, origem: 'recarga',
          })),
          ...(plRes.data || []).map((p: any) => ({
            id: `pla-${p.id}`, org_nome: p.organizations?.nome || '—',
            descricao: `Pedido plano ${p.plano_nome} (${p.ciclo})`, valor: p.valor, status: p.status,
            tipo: 'pedido_plano', created_at: p.created_at, organization_id: p.organization_id, origem: 'plano',
          })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 15);

        setUltimasMovs(movs);
      } finally {
        setLoadingMovs(false);
      }
    };
    fetchMovs();
  }, []);


  const receitaChartData = {
    labels: stats.evolucaoMensal.map(e => e.mes),
    datasets: [
      {
        label: 'Créditos Vendidos',
        data: stats.evolucaoMensal.map(e => e.receita),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Consumo Recursos IA',
        data: stats.evolucaoMensal.map(e => e.recursosIA),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const clientesChartData = {
    labels: stats.evolucaoMensal.map(e => e.mes),
    datasets: [
      {
        label: 'Novas Organizações',
        data: stats.evolucaoMensal.map(e => e.novosClientes),
        borderColor: '#1E3A8A',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const planoChartData = {
    labels: stats.organizationsByPlan.map(p => p.plan || 'Sem plano'),
    datasets: [
      {
        data: stats.organizationsByPlan.map(p => p.count),
        backgroundColor: ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-loader-4-line text-4xl text-primary animate-spin"></i>
          <p className="text-muted-foreground font-medium">Carregando dados do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel Super Admin</h1>
          <p className="text-muted-foreground mt-1">Visão geral do ecossistema Rekorra Multas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refresh()}
            className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <i className="ri-refresh-line mr-2"></i>
            Atualizar
          </button>
        </div>
      </div>

      {/* Cards Principais - Receita */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-2xl"></i>
            </div>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">Este Mês</span>
          </div>
          <p className="text-sm font-medium opacity-90">Créditos Vendidos</p>
          <p className="text-2xl font-black mt-1">{formatCurrency(stats.creditosVendidosMes)}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="ri-robot-line text-2xl"></i>
            </div>
            <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">{stats.recursosIAEsteMes} este mês</span>
          </div>
          <p className="text-sm font-medium opacity-90">Receita Recursos IA</p>
          <p className="text-2xl font-black mt-1">{formatCurrency(stats.receitaRecursosIAMes)}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="ri-wallet-3-line text-2xl"></i>
            </div>
          </div>
          <p className="text-sm font-medium opacity-90">Saldo em Carteiras</p>
          <p className="text-2xl font-black mt-1">{formatCurrency(stats.saldoTotalCarteiras)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="ri-bar-chart-box-line text-2xl"></i>
            </div>
          </div>
          <p className="text-sm font-medium opacity-90">Receita Histórica</p>
          <p className="text-2xl font-black mt-1">{formatCurrency(stats.receitaTotalGeral)}</p>
        </div>
      </div>

      {/* Cards de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="bg-card rounded-xl p-5 shadow-md border border-border cursor-pointer hover:shadow-lg transition-all hover:border-primary/30"
          onClick={() => navigate('/super-admin/dashboard/produtos')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <i className="ri-brain-line text-2xl text-indigo-600"></i>
            </div>
            <i className="ri-arrow-right-line text-muted-foreground"></i>
          </div>
          <h3 className="font-bold text-foreground text-lg">Recursos IA</h3>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total gerados:</span>
              <span className="font-bold text-foreground">{stats.totalRecursosIA}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Este mês:</span>
              <span className="font-bold text-indigo-600">+{stats.recursosIAEsteMes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receita total:</span>
              <span className="font-bold text-green-600">{formatCurrency(stats.receitaRecursosIA)}</span>
            </div>
          </div>
        </div>

        <div 
          className="bg-card rounded-xl p-5 shadow-md border border-border cursor-pointer hover:shadow-lg transition-all hover:border-primary/30"
          onClick={() => navigate('/super-admin/dashboard/produtos')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <i className="ri-file-search-line text-2xl text-purple-600"></i>
            </div>
            <i className="ri-arrow-right-line text-muted-foreground"></i>
          </div>
          <h3 className="font-bold text-foreground text-lg">Leads de Editais</h3>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total comprados:</span>
              <span className="font-bold text-foreground">{stats.totalEditaisComprados}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Este mês:</span>
              <span className="font-bold text-purple-600">-</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receita mês:</span>
              <span className="font-bold text-green-600">{formatCurrency(stats.receitaEditaisMes)}</span>
            </div>
          </div>
        </div>

        <div 
          className="bg-card rounded-xl p-5 shadow-md border border-border cursor-pointer hover:shadow-lg transition-all hover:border-primary/30"
          onClick={() => navigate('/super-admin/dashboard/produtos')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="ri-car-line text-2xl text-blue-600"></i>
            </div>
            <i className="ri-arrow-right-line text-muted-foreground"></i>
          </div>
          <h3 className="font-bold text-foreground text-lg">Rastreamento</h3>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Veículos ativos:</span>
              <span className="font-bold text-foreground">{stats.totalVeiculosRastreados}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Receita mensal:</span>
              <span className="font-bold text-green-600">{formatCurrency(stats.receitaRastreamentoMes)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl p-5 shadow-md border border-border">
          <h3 className="font-bold text-foreground mb-4">Evolução de Receita (6 meses)</h3>
          <div className="h-72">
            <Line data={receitaChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <h3 className="font-bold text-foreground mb-4">Organizações por Plano</h3>
          <div className="h-72 flex items-center justify-center">
            {stats.organizationsByPlan.length > 0 ? (
              <Doughnut 
                data={planoChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } }
                }} 
              />
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          className="bg-card rounded-xl p-5 shadow-md border border-border cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/super-admin/organizations')}
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-building-line text-xl text-blue-600"></i>
          </div>
          <p className="text-sm text-muted-foreground">Organizações</p>
          <p className="text-2xl font-black text-foreground">{stats.totalOrganizations}</p>
          <p className="text-xs text-green-600 mt-1">{stats.activeOrganizations} ativas</p>
        </div>

        <div 
          className="bg-card rounded-xl p-5 shadow-md border border-border cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/super-admin/users')}
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-group-line text-xl text-green-600"></i>
          </div>
          <p className="text-sm text-muted-foreground">Usuários</p>
          <p className="text-2xl font-black text-foreground">{stats.totalUsers}</p>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-user-star-line text-xl text-purple-600"></i>
          </div>
          <p className="text-sm text-muted-foreground">Clientes (total)</p>
          <p className="text-2xl font-black text-foreground">{stats.totalClientes}</p>
        </div>

        <div 
          className="bg-card rounded-xl p-5 shadow-md border border-border cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate('/super-admin/plans')}
        >
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-vip-crown-line text-xl text-amber-600"></i>
          </div>
          <p className="text-sm text-muted-foreground">Planos Ativos</p>
          <p className="text-2xl font-black text-foreground">{stats.organizationsByPlan.length}</p>
        </div>
      </div>

      {/* Últimas Movimentações */}
      <div className="bg-card rounded-xl p-5 shadow-md border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground text-lg">Últimas Movimentações</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Pedidos, aprovações e consumos recentes do sistema</p>
          </div>
          <button
            onClick={() => navigate('/super-admin/movimentacoes')}
            className="text-sm text-primary font-medium hover:underline"
          >
            Ver tudo <i className="ri-arrow-right-line"></i>
          </button>
        </div>

        {loadingMovs ? (
          <div className="flex items-center justify-center py-8">
            <i className="ri-loader-4-line text-2xl text-primary animate-spin"></i>
          </div>
        ) : ultimasMovs.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">Nenhuma movimentação registrada.</p>
        ) : (
          <div className="space-y-2">
            {ultimasMovs.map(m => {
              const isPositivo = m.tipo === 'adjustment' || m.tipo === 'credit_purchase' || m.tipo === 'subscription' || m.tipo === 'pedido_plano' || m.tipo === 'pedido_recarga';
              const isNegativo = m.tipo === 'system_usage' || m.valor < 0;
              const isPendente = m.status === 'pendente';
              const isRejeitado = m.status === 'rejeitado';

              const tipoIcon: Record<string, string> = {
                credit_purchase: 'ri-add-circle-line text-blue-500',
                adjustment: 'ri-gift-line text-purple-500',
                subscription: 'ri-vip-crown-line text-indigo-500',
                system_usage: 'ri-robot-line text-rose-500',
                pedido_recarga: 'ri-time-line text-amber-500',
                pedido_plano: 'ri-time-line text-amber-500',
              };
              const tipoLabel: Record<string, string> = {
                credit_purchase: 'Recarga', adjustment: 'Crédito Manual',
                subscription: 'Assinatura', system_usage: 'Consumo IA',
                pedido_recarga: 'Pedido Recarga', pedido_plano: 'Pedido Plano',
              };

              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer hover:bg-muted/50 ${
                    isPendente ? 'border-amber-200 bg-amber-50/50' :
                    isRejeitado ? 'border-red-200 bg-red-50/50' : 'border-border'
                  }`}
                  onClick={() => {
                    if (m.origem !== 'faturamento') navigate('/super-admin/recargas');
                    else navigate(`/super-admin/organizations/${m.organization_id}`);
                  }}
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <i className={`${tipoIcon[m.tipo] || 'ri-exchange-line text-muted-foreground'} text-xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{m.org_nome}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.descricao}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-black ${isNegativo ? 'text-rose-600' : isPendente ? 'text-amber-600' : 'text-green-600'}`}>
                      {isNegativo ? '−' : isPendente ? '' : '+'}
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(m.valor))}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(m.created_at)}</p>
                  </div>
                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    isPendente ? 'bg-amber-100 text-amber-700' :
                    isRejeitado ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {tipoLabel[m.tipo] || m.tipo}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
