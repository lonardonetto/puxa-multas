import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { useSuperAdminStats } from '../../../hooks/useSuperAdminStats';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { stats, loading, refresh } = useSuperAdminStats();

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

      {/* Tabela de Organizações */}
      <div className="bg-card rounded-xl p-5 shadow-md border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground text-lg">Clientes (Organizações)</h3>
          <button
            onClick={() => navigate('/super-admin/dashboard/clientes')}
            className="text-sm text-primary font-medium hover:underline"
          >
            Ver todos <i className="ri-arrow-right-line"></i>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Organização</th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground">Plano</th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground">Clientes</th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground">Recursos IA</th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground">Veículos</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Saldo</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Gasto Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.organizationsDetails.slice(0, 10).map((org) => (
                <tr 
                  key={org.id} 
                  className="border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/super-admin/organizations/${org.id}`)}
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <i className="ri-building-2-line text-primary"></i>
                      </div>
                      <span className="font-medium text-foreground">{org.nome}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      org.plano === 'top' ? 'bg-amber-100 text-amber-700' :
                      org.plano === 'intermediario' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {org.plano || 'Free'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-2 font-medium">{org.total_clientes}</td>
                  <td className="text-center py-3 px-2 font-medium">{org.total_recursos}</td>
                  <td className="text-center py-3 px-2 font-medium">{org.veiculos_rastreados}</td>
                  <td className="text-right py-3 px-2">
                    <span className="font-bold text-green-600">{formatCurrency(org.saldo_sacavel + org.saldo_bonus)}</span>
                  </td>
                  <td className="text-right py-3 px-2">
                    <span className="font-medium text-foreground">{formatCurrency(org.gasto_total)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
