import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { supabase } from '../../../lib/supabase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface ProductStats {
  recursosIA: {
    total: number;
    esteMes: number;
    receitaTotal: number;
    receitaMes: number;
    porOrg: { org: string; count: number; receita: number }[];
    evolucao: { mes: string; count: number; receita: number }[];
  };
  rastreamento: {
    total: number;
    receitaMensal: number;
    porOrg: { org: string; veiculos: number; receita: number }[];
  };
  editais: {
    totalCompras: number;
    totalNomes: number;
    receitaTotal: number;
    porOrg: { org: string; compras: number; receita: number }[];
  };
}

export default function SuperAdminProdutos() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ia' | 'rastreamento' | 'editais'>('ia');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProductStats>({
    recursosIA: { total: 0, esteMes: 0, receitaTotal: 0, receitaMes: 0, porOrg: [], evolucao: [] },
    rastreamento: { total: 0, receitaMensal: 0, porOrg: [] },
    editais: { totalCompras: 0, totalNomes: 0, receitaTotal: 0, porOrg: [] },
  });

  useEffect(() => {
    fetchProductStats();
  }, []);

  const fetchProductStats = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Recursos IA
      const [recursosTotal, recursosMes, faturamentoIA] = await Promise.all([
        supabase.from('recursos').select('*, organizations(nome)', { count: 'exact' }).eq('is_ia', true),
        supabase.from('recursos').select('*', { count: 'exact', head: true }).eq('is_ia', true).gte('created_at', firstDayOfMonth),
        supabase.from('faturamento').select('valor, organization_id, organizations(nome), created_at')
          .eq('tipo', 'system_usage')
          .eq('status', 'paid')
          .ilike('descricao', '%Recurso IA%')
      ]);

      // Agrupar recursos por organização
      const recursosData = recursosTotal.data || [];
      const iaByOrg: Record<string, { count: number; receita: number; nome: string }> = {};
      recursosData.forEach((r: any) => {
        const orgId = r.organization_id;
        const orgNome = r.organizations?.nome || 'Desconhecido';
        if (!iaByOrg[orgId]) iaByOrg[orgId] = { count: 0, receita: 0, nome: orgNome };
        iaByOrg[orgId].count++;
      });

      // Adicionar receita por org
      const faturamentoData = faturamentoIA.data || [];
      faturamentoData.forEach((f: any) => {
        const orgId = f.organization_id;
        if (iaByOrg[orgId]) {
          iaByOrg[orgId].receita += f.valor || 0;
        }
      });

      const iaPorOrg = Object.entries(iaByOrg)
        .map(([id, data]) => ({ org: data.nome, count: data.count, receita: data.receita }))
        .sort((a, b) => b.count - a.count);

      const receitaIATotal = faturamentoData.reduce((acc: number, f: any) => acc + (f.valor || 0), 0);
      const receitaIAMes = faturamentoData
        .filter((f: any) => new Date(f.created_at) >= new Date(firstDayOfMonth))
        .reduce((acc: number, f: any) => acc + (f.valor || 0), 0);

      // Evolução mensal IA
      const evolucaoIA: { mes: string; count: number; receita: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const mesNome = date.toLocaleDateString('pt-BR', { month: 'short' });

        const countMes = recursosData.filter((r: any) => {
          const d = new Date(r.created_at);
          return d >= date && d < nextDate;
        }).length;

        const receitaMes = faturamentoData.filter((f: any) => {
          const d = new Date(f.created_at);
          return d >= date && d < nextDate;
        }).reduce((acc: number, f: any) => acc + (f.valor || 0), 0);

        evolucaoIA.push({
          mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1).replace('.', ''),
          count: countMes,
          receita: receitaMes
        });
      }

      // Rastreamento
      const [veiculosResult, orgsResult] = await Promise.all([
        supabase.from('veiculos').select('*, clientes(organization_id, organizations(nome))').eq('rastreamento_ativo', true),
        supabase.from('organizations').select('id, nome')
      ]);

      const veiculosData = veiculosResult.data || [];
      const rastreamentoByOrg: Record<string, { veiculos: number; nome: string }> = {};
      veiculosData.forEach((v: any) => {
        const orgId = v.clientes?.organization_id;
        const orgNome = v.clientes?.organizations?.nome || 'Desconhecido';
        if (orgId) {
          if (!rastreamentoByOrg[orgId]) rastreamentoByOrg[orgId] = { veiculos: 0, nome: orgNome };
          rastreamentoByOrg[orgId].veiculos++;
        }
      });

      const rastreamentoPorOrg = Object.entries(rastreamentoByOrg)
        .map(([id, data]) => ({ 
          org: data.nome, 
          veiculos: data.veiculos, 
          receita: data.veiculos * 25 // Valor estimado por veículo
        }))
        .sort((a, b) => b.veiculos - a.veiculos);

      // Editais
      const [editaisResult] = await Promise.all([
        supabase.from('edital_compras').select('*, organizations(nome), editais(quantidade_nomes)')
      ]);

      const editaisData = editaisResult.data || [];
      const editaisByOrg: Record<string, { compras: number; receita: number; nome: string }> = {};
      let totalNomes = 0;
      editaisData.forEach((e: any) => {
        const orgId = e.organization_id;
        const orgNome = e.organizations?.nome || 'Desconhecido';
        if (!editaisByOrg[orgId]) editaisByOrg[orgId] = { compras: 0, receita: 0, nome: orgNome };
        editaisByOrg[orgId].compras++;
        editaisByOrg[orgId].receita += e.valor_total || 0;
        totalNomes += e.quantidade || 0;
      });

      const editaisPorOrg = Object.entries(editaisByOrg)
        .map(([id, data]) => ({ org: data.nome, compras: data.compras, receita: data.receita }))
        .sort((a, b) => b.receita - a.receita);

      const receitaEditaisTotal = editaisData.reduce((acc: number, e: any) => acc + (e.valor_total || 0), 0);

      setStats({
        recursosIA: {
          total: recursosTotal.count || 0,
          esteMes: recursosMes.count || 0,
          receitaTotal: receitaIATotal,
          receitaMes: receitaIAMes,
          porOrg: iaPorOrg,
          evolucao: evolucaoIA
        },
        rastreamento: {
          total: veiculosData.length,
          receitaMensal: veiculosData.length * 25, // Estimativa
          porOrg: rastreamentoPorOrg
        },
        editais: {
          totalCompras: editaisData.length,
          totalNomes,
          receitaTotal: receitaEditaisTotal,
          porOrg: editaisPorOrg
        }
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const evolucaoChartData = {
    labels: stats.recursosIA.evolucao.map(e => e.mes),
    datasets: [
      {
        label: 'Recursos Gerados',
        data: stats.recursosIA.evolucao.map(e => e.count),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Receita (R$)',
        data: stats.recursosIA.evolucao.map(e => e.receita),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-loader-4-line text-4xl text-primary animate-spin"></i>
          <p className="text-muted-foreground font-medium">Carregando produtos...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          </div>
          <p className="text-muted-foreground ml-11">Análise de uso e receita por produto</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-xl shadow-md border border-border p-1 inline-flex">
        <button
          onClick={() => setActiveTab('ia')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'ia' 
              ? 'bg-indigo-600 text-white' 
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <i className="ri-brain-line mr-2"></i>
          Recursos IA
        </button>
        <button
          onClick={() => setActiveTab('rastreamento')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'rastreamento' 
              ? 'bg-blue-600 text-white' 
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <i className="ri-car-line mr-2"></i>
          Rastreamento
        </button>
        <button
          onClick={() => setActiveTab('editais')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'editais' 
              ? 'bg-purple-600 text-white' 
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <i className="ri-file-search-line mr-2"></i>
          Leads Editais
        </button>
      </div>

      {/* Conteúdo - Recursos IA */}
      {activeTab === 'ia' && (
        <div className="space-y-6">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
              <p className="text-sm font-medium opacity-90">Total Gerado</p>
              <p className="text-3xl font-black mt-1">{stats.recursosIA.total}</p>
              <p className="text-xs mt-2 opacity-75">recursos</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl p-5 text-white shadow-lg">
              <p className="text-sm font-medium opacity-90">Este Mês</p>
              <p className="text-3xl font-black mt-1">{stats.recursosIA.esteMes}</p>
              <p className="text-xs mt-2 opacity-75">novos recursos</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
              <p className="text-sm font-medium opacity-90">Receita Total</p>
              <p className="text-3xl font-black mt-1">{formatCurrency(stats.recursosIA.receitaTotal)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl p-5 text-white shadow-lg">
              <p className="text-sm font-medium opacity-90">Receita do Mês</p>
              <p className="text-3xl font-black mt-1">{formatCurrency(stats.recursosIA.receitaMes)}</p>
            </div>
          </div>

          {/* Gráfico */}
          <div className="bg-card rounded-xl p-5 shadow-md border border-border">
            <h3 className="font-bold text-foreground mb-4">Evolução Mensal</h3>
            <div className="h-80">
              <Line 
                data={evolucaoChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { type: 'linear', position: 'left', beginAtZero: true },
                    y1: { type: 'linear', position: 'right', beginAtZero: true, grid: { drawOnChartArea: false } },
                  },
                }} 
              />
            </div>
          </div>

          {/* Tabela por Org */}
          <div className="bg-card rounded-xl p-5 shadow-md border border-border">
            <h3 className="font-bold text-foreground mb-4">Uso por Organização</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Organização</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Recursos Gerados</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Receita</th>
                </tr>
              </thead>
              <tbody>
                {stats.recursosIA.porOrg.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium">{item.org}</td>
                    <td className="text-center py-3 px-2">
                      <span className="font-bold text-indigo-600">{item.count}</span>
                    </td>
                    <td className="text-right py-3 px-2">
                      <span className="font-bold text-green-600">{formatCurrency(item.receita)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo - Rastreamento */}
      {activeTab === 'rastreamento' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
              <p className="text-sm font-medium opacity-90">Veículos Ativos</p>
              <p className="text-3xl font-black mt-1">{stats.rastreamento.total}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
              <p className="text-sm font-medium opacity-90">Receita Mensal Estimada</p>
              <p className="text-3xl font-black mt-1">{formatCurrency(stats.rastreamento.receitaMensal)}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
              <p className="text-sm font-medium opacity-90">Organizações Usando</p>
              <p className="text-3xl font-black mt-1">{stats.rastreamento.porOrg.length}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-md border border-border">
            <h3 className="font-bold text-foreground mb-4">Veículos por Organização</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Organização</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Veículos</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Receita Mensal</th>
                </tr>
              </thead>
              <tbody>
                {stats.rastreamento.porOrg.map((item, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium">{item.org}</td>
                    <td className="text-center py-3 px-2">
                      <span className="font-bold text-blue-600">{item.veiculos}</span>
                    </td>
                    <td className="text-right py-3 px-2">
                      <span className="font-bold text-green-600">{formatCurrency(item.receita)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo - Editais */}
      {activeTab === 'editais' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
              <p className="text-sm font-medium opacity-90">Total de Compras</p>
              <p className="text-3xl font-black mt-1">{stats.editais.totalCompras}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-5 text-white shadow-lg">
              <p className="text-sm font-medium opacity-90">Nomes Vendidos</p>
              <p className="text-3xl font-black mt-1">{stats.editais.totalNomes}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
              <p className="text-sm font-medium opacity-90">Receita Total</p>
              <p className="text-3xl font-black mt-1">{formatCurrency(stats.editais.receitaTotal)}</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-md border border-border">
            <h3 className="font-bold text-foreground mb-4">Compras por Organização</h3>
            {stats.editais.porOrg.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Organização</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Compras</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.editais.porOrg.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-2 font-medium">{item.org}</td>
                      <td className="text-center py-3 px-2">
                        <span className="font-bold text-purple-600">{item.compras}</span>
                      </td>
                      <td className="text-right py-3 px-2">
                        <span className="font-bold text-green-600">{formatCurrency(item.receita)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <i className="ri-file-search-line text-4xl opacity-30 mb-3"></i>
                <p>Nenhuma compra de edital registrada</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
