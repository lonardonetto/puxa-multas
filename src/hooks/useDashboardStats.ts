import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';

export interface DashboardStats {
  totalClientes: number;
  clientesAtivos: number;
  totalVeiculosRastreados: number;
  totalContratos: number;
  contratosEsteMes: number;
  totalRecursos: number;
  recursosEsteMes: number;
  saldoTotal: number;
  saldoDisponivel: number;
  saldoBonus: number;
  contratosPorStatus: {
    pendente: number;
    aguardando_julgamento: number;
    deferido: number;
    indeferido: number;
  };
  evolucaoMensal: {
    mes: string;
    contratos: number;
    recursos: number;
  }[];
  atividadesRecentes: {
    tipo: string;
    descricao: string;
    data: string;
    icone: string;
    cor: string;
  }[];
}

const initialStats: DashboardStats = {
  totalClientes: 0,
  clientesAtivos: 0,
  totalVeiculosRastreados: 0,
  totalContratos: 0,
  contratosEsteMes: 0,
  totalRecursos: 0,
  recursosEsteMes: 0,
  saldoTotal: 0,
  saldoDisponivel: 0,
  saldoBonus: 0,
  contratosPorStatus: {
    pendente: 0,
    aguardando_julgamento: 0,
    deferido: 0,
    indeferido: 0,
  },
  evolucaoMensal: [],
  atividadesRecentes: [],
};

export function useDashboardStats() {
  const { currentOrganization } = useOrganization();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!currentOrganization?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orgId = currentOrganization.id;
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Buscar todas as estatísticas em paralelo
      const [
        clientesResult,
        clientesAtivosResult,
        veiculosResult,
        contratosResult,
        contratosEsteMesResult,
        recursosResult,
        recursosEsteMesResult,
        contratosPendentesResult,
        contratosAguardandoResult,
        contratosDeferidosResult,
        contratosIndeferidosResult,
        atividadesResult
      ] = await Promise.all([
        // Total de clientes
        supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId),
        
        // Clientes ativos
        supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('ativo', true),
        
        // Veículos com rastreamento ativo (através dos clientes da org)
        supabase
          .from('veiculos')
          .select('*, clientes!inner(organization_id)', { count: 'exact', head: true })
          .eq('rastreamento_ativo', true)
          .eq('clientes.organization_id', orgId),
        
        // Total de contratos
        supabase
          .from('contratos')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId),
        
        // Contratos este mês
        supabase
          .from('contratos')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .gte('created_at', firstDayOfMonth),
        
        // Total de recursos
        supabase
          .from('recursos')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId),
        
        // Recursos este mês
        supabase
          .from('recursos')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .gte('created_at', firstDayOfMonth),
        
        // Contratos por status
        supabase
          .from('contratos')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('status', 'pendente'),
        
        supabase
          .from('contratos')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('status', 'aguardando_julgamento'),
        
        supabase
          .from('contratos')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('status', 'deferido'),
        
        supabase
          .from('contratos')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('status', 'indeferido'),
        
        // Atividades recentes (histórico)
        supabase
          .from('historico_atividades')
          .select('*')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Buscar evolução mensal (últimos 6 meses)
      const evolucaoMensal: DashboardStats['evolucaoMensal'] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const mesNome = date.toLocaleDateString('pt-BR', { month: 'short' });

        const [contratosRes, recursosRes] = await Promise.all([
          supabase
            .from('contratos')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .gte('created_at', date.toISOString())
            .lt('created_at', nextDate.toISOString()),
          supabase
            .from('recursos')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .gte('created_at', date.toISOString())
            .lt('created_at', nextDate.toISOString())
        ]);

        evolucaoMensal.push({
          mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1).replace('.', ''),
          contratos: contratosRes.count || 0,
          recursos: recursosRes.count || 0
        });
      }

      // Mapear atividades
      const atividades = (atividadesResult.data || []).map((a: any) => ({
        tipo: a.tipo || 'info',
        descricao: a.descricao || 'Atividade registrada',
        data: a.created_at,
        icone: getActivityIcon(a.tipo),
        cor: getActivityColor(a.tipo)
      }));

      setStats({
        totalClientes: clientesResult.count || 0,
        clientesAtivos: clientesAtivosResult.count || 0,
        totalVeiculosRastreados: veiculosResult.count || 0,
        totalContratos: contratosResult.count || 0,
        contratosEsteMes: contratosEsteMesResult.count || 0,
        totalRecursos: recursosResult.count || 0,
        recursosEsteMes: recursosEsteMesResult.count || 0,
        saldoTotal: (currentOrganization.saldo_sacavel || 0) + (currentOrganization.saldo_bonus || 0),
        saldoDisponivel: currentOrganization.saldo_sacavel || 0,
        saldoBonus: currentOrganization.saldo_bonus || 0,
        contratosPorStatus: {
          pendente: contratosPendentesResult.count || 0,
          aguardando_julgamento: contratosAguardandoResult.count || 0,
          deferido: contratosDeferidosResult.count || 0,
          indeferido: contratosIndeferidosResult.count || 0,
        },
        evolucaoMensal,
        atividadesRecentes: atividades
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar dashboard'));
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id, currentOrganization?.saldo_sacavel, currentOrganization?.saldo_bonus]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}

function getActivityIcon(tipo: string): string {
  const icons: Record<string, string> = {
    'contrato_criado': 'ri-file-add-line',
    'recurso_criado': 'ri-file-text-line',
    'cliente_cadastrado': 'ri-user-add-line',
    'pagamento': 'ri-money-dollar-circle-line',
    'rastreamento': 'ri-car-line',
    'recurso_deferido': 'ri-checkbox-circle-line',
    'recurso_indeferido': 'ri-close-circle-line',
  };
  return icons[tipo] || 'ri-information-line';
}

function getActivityColor(tipo: string): string {
  const colors: Record<string, string> = {
    'contrato_criado': 'green',
    'recurso_criado': 'blue',
    'cliente_cadastrado': 'green',
    'pagamento': 'green',
    'rastreamento': 'blue',
    'recurso_deferido': 'green',
    'recurso_indeferido': 'red',
  };
  return colors[tipo] || 'blue';
}
