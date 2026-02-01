import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminStats } from '../../../hooks/useSuperAdminStats';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function SuperAdminClientes() {
  const navigate = useNavigate();
  const { stats, loading } = useSuperAdminStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('todos');
  const [sortBy, setSortBy] = useState<'nome' | 'gasto' | 'saldo' | 'recursos'>('nome');

  const filteredOrgs = stats.organizationsDetails
    .filter(org => {
      const matchesSearch = org.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = filterPlan === 'todos' || org.plano === filterPlan;
      return matchesSearch && matchesPlan;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'gasto':
          return b.gasto_total - a.gasto_total;
        case 'saldo':
          return (b.saldo_sacavel + b.saldo_bonus) - (a.saldo_sacavel + a.saldo_bonus);
        case 'recursos':
          return b.total_recursos - a.total_recursos;
        default:
          return a.nome.localeCompare(b.nome);
      }
    });

  const uniquePlans = [...new Set(stats.organizationsDetails.map(o => o.plano))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-loader-4-line text-4xl text-primary animate-spin"></i>
          <p className="text-muted-foreground font-medium">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/super-admin/dashboard')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <i className="ri-arrow-left-line text-xl text-muted-foreground"></i>
            </button>
            <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          </div>
          <p className="text-muted-foreground ml-11">Detalhes de uso e faturamento por organização</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-building-line text-xl text-blue-600"></i>
          </div>
          <p className="text-sm text-muted-foreground">Total de Organizações</p>
          <p className="text-2xl font-black text-foreground">{stats.totalOrganizations}</p>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-wallet-3-line text-xl text-green-600"></i>
          </div>
          <p className="text-sm text-muted-foreground">Saldo Total em Carteiras</p>
          <p className="text-2xl font-black text-foreground">{formatCurrency(stats.saldoTotalCarteiras)}</p>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-bar-chart-line text-xl text-indigo-600"></i>
          </div>
          <p className="text-sm text-muted-foreground">Total Consumido</p>
          <p className="text-2xl font-black text-foreground">{formatCurrency(stats.receitaRecursosIA)}</p>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <i className="ri-user-star-line text-xl text-purple-600"></i>
          </div>
          <p className="text-sm text-muted-foreground">Total Clientes Cadastrados</p>
          <p className="text-2xl font-black text-foreground">{stats.totalClientes}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-xl p-4 shadow-md border border-border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
              <input
                type="text"
                placeholder="Buscar organização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2 bg-muted rounded-lg text-sm focus:outline-none"
          >
            <option value="todos">Todos os Planos</option>
            {uniquePlans.map(plan => (
              <option key={plan} value={plan}>{plan || 'Sem plano'}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-muted rounded-lg text-sm focus:outline-none"
          >
            <option value="nome">Ordenar por Nome</option>
            <option value="gasto">Ordenar por Gasto</option>
            <option value="saldo">Ordenar por Saldo</option>
            <option value="recursos">Ordenar por Recursos IA</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">Organização</th>
                <th className="text-center py-4 px-4 font-medium text-muted-foreground">Plano</th>
                <th className="text-center py-4 px-4 font-medium text-muted-foreground">Clientes</th>
                <th className="text-center py-4 px-4 font-medium text-muted-foreground">Recursos IA</th>
                <th className="text-center py-4 px-4 font-medium text-muted-foreground">Contratos</th>
                <th className="text-center py-4 px-4 font-medium text-muted-foreground">Veículos</th>
                <th className="text-right py-4 px-4 font-medium text-muted-foreground">Saldo Sacável</th>
                <th className="text-right py-4 px-4 font-medium text-muted-foreground">Saldo Bônus</th>
                <th className="text-right py-4 px-4 font-medium text-muted-foreground">Gasto Total</th>
                <th className="text-center py-4 px-4 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.map((org, index) => (
                <tr 
                  key={org.id} 
                  className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <i className="ri-building-2-line text-primary"></i>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{org.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          Desde {new Date(org.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      org.plano === 'top' ? 'bg-amber-100 text-amber-700' :
                      org.plano === 'intermediario' ? 'bg-blue-100 text-blue-700' :
                      org.plano === 'gratuito' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {org.plano || 'Free'}
                    </span>
                  </td>
                  <td className="text-center py-4 px-4 font-medium">{org.total_clientes}</td>
                  <td className="text-center py-4 px-4">
                    <span className="font-bold text-indigo-600">{org.total_recursos}</span>
                  </td>
                  <td className="text-center py-4 px-4 font-medium">{org.total_contratos}</td>
                  <td className="text-center py-4 px-4">
                    <span className="font-bold text-blue-600">{org.veiculos_rastreados}</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="font-bold text-green-600">{formatCurrency(org.saldo_sacavel)}</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="font-medium text-purple-600">{formatCurrency(org.saldo_bonus)}</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <span className="font-bold text-foreground">{formatCurrency(org.gasto_total)}</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/super-admin/organizations/${org.id}`)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <i className="ri-eye-line text-primary"></i>
                      </button>
                      <button
                        onClick={() => {/* TODO: Adicionar créditos */}}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                        title="Adicionar créditos"
                      >
                        <i className="ri-add-circle-line text-green-600"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrgs.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-search-line text-4xl text-muted-foreground/30 mb-3"></i>
            <p className="text-muted-foreground">Nenhuma organização encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
