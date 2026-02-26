import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer, Area, AreaChart } from 'recharts';

import { useNotificationAlerts } from '../../hooks/useNotificationAlerts';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useCurrentPlan } from '../../hooks/useCurrentPlan';
import { useOrganization } from '../../contexts/OrganizationContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { plan, prices } = useCurrentPlan();
  const { alerts, markAsCheckedIn } = useNotificationAlerts();

  const rechartData = stats.evolucaoMensal.map(e => ({
    mes: e.mes,
    Contratos: e.contratos,
    Recursos: e.recursos,
  }));

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'aguardando_julgamento': 'Aguardando Julgamento',
      'deferido': 'Deferido',
      'indeferido': 'Indeferido',
      'assinado': 'Assinado',
      'pendente': 'Pendente'
    };
    return labels[status] || status;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-loader-4-line text-4xl text-primary animate-spin"></i>
          <p className="text-muted-foreground font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Bem-vindo, {currentOrganization?.nome}
            {plan && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Plano {plan.nome}</span>}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate('/checkout')}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-wallet-3-line mr-1.5"></i>
            {formatCurrency(stats.saldoTotal)}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="bg-card rounded-lg shadow-md p-4 border-l-4 border-primary cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/cadastro/lista-clientes')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Clientes Cadastrados</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.clientesAtivos}</p>
              <p className="text-xs text-muted-foreground mt-1">
                de {stats.totalClientes} total
                {plan?.limite_clientes && <span className="text-primary"> (limite: {plan.limite_clientes})</span>}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="ri-user-star-line text-xl text-primary"></i>
            </div>
          </div>
        </div>

        <div 
          className="bg-card rounded-lg shadow-md p-4 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/rastreamento')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Veículos Rastreados</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.totalVeiculosRastreados}</p>
              <p className="text-xs text-green-600 mt-1">
                {prices && <span>Custo: {formatCurrency(prices.rastreamento)}/un</span>}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-car-line text-xl text-green-600"></i>
            </div>
          </div>
        </div>

        <div 
          className="bg-card rounded-lg shadow-md p-4 border-l-4 border-amber-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/recursos-ia')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Recursos Gerados</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.totalRecursos}</p>
              <p className="text-xs text-amber-600 mt-1">
                +{stats.recursosEsteMes} este mês
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <i className="ri-file-text-line text-xl text-amber-600"></i>
            </div>
          </div>
        </div>

        <div 
          className="bg-card rounded-lg shadow-md p-4 border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/servicos/contratos')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Contratos</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.totalContratos}</p>
              <p className="text-xs text-purple-600 mt-1">
                +{stats.contratosEsteMes} este mês
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="ri-file-list-3-line text-xl text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Features Banner (se tiver plano) */}
      {plan && (
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-primary-foreground">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="ri-vip-crown-2-line text-2xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg">Plano {plan.nome}</h3>
                <p className="text-sm opacity-90">
                  {plan.limite_usuarios} usuário(s) • Suporte {plan.suporte}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {prices && (
                <>
                  <div className="text-center px-4 border-r border-white/20">
                    <p className="text-xs opacity-75">Recurso IA</p>
                    <p className="font-bold">{formatCurrency(prices.ia)}</p>
                  </div>
                  <div className="text-center px-4 border-r border-white/20">
                    <p className="text-xs opacity-75">Rastreamento</p>
                    <p className="font-bold">{formatCurrency(prices.rastreamento)}</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-xs opacity-75">Edital</p>
                    <p className="font-bold">{formatCurrency(prices.edital)}</p>
                  </div>
                </>
              )}
              <button 
                onClick={() => navigate('/checkout')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
              >
                Gerenciar Plano
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charts and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-lg shadow-md p-4">
          <h3 className="text-base font-semibold text-foreground mb-3">Evolução Mensal</h3>
          <div className="h-64">
            {rechartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rechartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip />
                  <RechartsLegend />
                  <Area type="monotone" dataKey="Contratos" stroke="#10B981" fill="rgba(16,185,129,0.1)" />
                  <Area type="monotone" dataKey="Recursos" stroke="#1E3A8A" fill="rgba(30,58,138,0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <i className="ri-line-chart-line text-4xl opacity-20 mb-2"></i>
                  <p>Nenhum dado para exibir</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-md p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">Acompanhamento</h3>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {alerts.filter(a => !a.lido).length} pendentes
            </span>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1" style={{ maxHeight: '260px' }}>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground italic text-sm">
                <i className="ri-notification-off-line text-2xl mb-2 opacity-20"></i>
                Nenhum alerta pendente
              </div>
            ) : (
              alerts.filter(a => !a.lido).slice(0, 5).map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${alert.tipo === 'urgente' ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'} hover:shadow-md transition-all`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5 flex-1">
                      <i className="ri-user-line text-primary text-xs"></i>
                      <p className="text-xs font-semibold text-foreground truncate">{alert.cliente_nome}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      alert.status === 'indeferido' ? 'bg-red-100 text-red-600' :
                      alert.status === 'aguardando_julgamento' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {getStatusLabel(alert.status)}
                    </span>
                  </div>

                  <p className="text-[10px] text-muted-foreground font-medium mb-2">
                    {alert.servico_nome}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const text = `Olá ${alert.cliente_nome}! Estamos acompanhando seu processo de ${alert.servico_nome}. Assim que tivermos novidades, te avisaremos!`;
                        window.open(`https://wa.me/${alert.cliente_celular?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                        markAsCheckedIn(alert.contrato_id);
                      }}
                      className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 transition-colors"
                    >
                      <i className="ri-whatsapp-line mr-1"></i>
                      WhatsApp
                    </button>
                    <button
                      onClick={() => navigate(`/cadastro/lista-clientes?clienteId=${alert.cliente_id}`)}
                      className="px-2 py-1.5 bg-muted text-muted-foreground rounded-lg text-[10px] font-bold hover:bg-muted/80"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-md p-4 text-center">
          <div className="w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-2">
            <i className="ri-time-line text-xl text-yellow-600"></i>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.contratosPorStatus.pendente}</p>
          <p className="text-xs text-muted-foreground">Pendentes</p>
        </div>
        <div className="bg-card rounded-lg shadow-md p-4 text-center">
          <div className="w-10 h-10 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-2">
            <i className="ri-hourglass-line text-xl text-amber-600"></i>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.contratosPorStatus.aguardando_julgamento}</p>
          <p className="text-xs text-muted-foreground">Aguardando</p>
        </div>
        <div className="bg-card rounded-lg shadow-md p-4 text-center">
          <div className="w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
            <i className="ri-checkbox-circle-line text-xl text-green-600"></i>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.contratosPorStatus.deferido}</p>
          <p className="text-xs text-muted-foreground">Deferidos</p>
        </div>
        <div className="bg-card rounded-lg shadow-md p-4 text-center">
          <div className="w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
            <i className="ri-close-circle-line text-xl text-red-600"></i>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.contratosPorStatus.indeferido}</p>
          <p className="text-xs text-muted-foreground">Indeferidos</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Atividades Recentes</h3>
        </div>
        <div className="space-y-3">
          {stats.atividadesRecentes.length > 0 ? (
            stats.atividadesRecentes.map((atividade, index) => (
              <div key={index} className="flex items-start space-x-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  atividade.cor === 'green' ? 'bg-green-100' :
                  atividade.cor === 'red' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  <i className={`${atividade.icone} text-sm ${
                    atividade.cor === 'green' ? 'text-green-600' :
                    atividade.cor === 'red' ? 'text-red-600' :
                    'text-blue-600'
                  }`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-foreground">{atividade.descricao}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(atividade.data), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <i className="ri-history-line text-3xl opacity-20 mb-2"></i>
              <p className="text-sm">Nenhuma atividade recente</p>
              <p className="text-xs mt-1">As atividades aparecerão aqui conforme você usar o sistema</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/cadastro/novo-cliente')}
          className="bg-card rounded-lg shadow-md p-4 hover:shadow-lg transition-all hover:scale-[1.02] flex flex-col items-center gap-2 cursor-pointer border border-transparent hover:border-primary/20"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <i className="ri-user-add-line text-2xl text-primary"></i>
          </div>
          <p className="text-sm font-medium text-foreground">Novo Cliente</p>
        </button>

        <button
          onClick={() => navigate('/recursos-ia')}
          className="bg-card rounded-lg shadow-md p-4 hover:shadow-lg transition-all hover:scale-[1.02] flex flex-col items-center gap-2 cursor-pointer border border-transparent hover:border-primary/20"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <i className="ri-robot-2-line text-2xl text-amber-600"></i>
          </div>
          <p className="text-sm font-medium text-foreground">Gerar Recurso IA</p>
        </button>

        <button
          onClick={() => navigate('/prospeccao-editais')}
          className="bg-card rounded-lg shadow-md p-4 hover:shadow-lg transition-all hover:scale-[1.02] flex flex-col items-center gap-2 cursor-pointer border border-transparent hover:border-primary/20"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <i className="ri-search-eye-line text-2xl text-purple-600"></i>
          </div>
          <p className="text-sm font-medium text-foreground">Buscar Editais</p>
        </button>

        <button
          onClick={() => navigate('/checkout')}
          className="bg-card rounded-lg shadow-md p-4 hover:shadow-lg transition-all hover:scale-[1.02] flex flex-col items-center gap-2 cursor-pointer border border-transparent hover:border-primary/20"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <i className="ri-wallet-3-line text-2xl text-green-600"></i>
          </div>
          <p className="text-sm font-medium text-foreground">Adicionar Créditos</p>
        </button>
      </div>
    </div>
  );
}
