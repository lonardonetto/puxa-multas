import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SuperAdminStats {
  // Organizações
  totalOrganizations: number;
  activeOrganizations: number;
  organizationsByPlan: { plan: string; count: number }[];
  
  // Usuários
  totalUsers: number;
  
  // Clientes (dos escritórios)
  totalClientes: number;
  
  // Produtos - Recursos IA
  totalRecursosIA: number;
  recursosIAEsteMes: number;
  receitaRecursosIA: number;
  receitaRecursosIAMes: number;
  
  // Produtos - Rastreamento
  totalVeiculosRastreados: number;
  receitaRastreamentoMes: number;
  
  // Produtos - Editais
  totalEditaisComprados: number;
  receitaEditaisMes: number;
  
  // Financeiro
  receitaTotalMes: number;
  receitaTotalGeral: number;
  saldoTotalCarteiras: number;
  creditosVendidosMes: number;
  
  // Evolução mensal
  evolucaoMensal: {
    mes: string;
    receita: number;
    recursosIA: number;
    rastreamento: number;
    editais: number;
    novosClientes: number;
  }[];
  
  // Lista de organizações com detalhes
  organizationsDetails: OrganizationDetail[];
}

export interface OrganizationDetail {
  id: string;
  nome: string;
  plano: string;
  saldo_sacavel: number;
  saldo_bonus: number;
  total_clientes: number;
  total_recursos: number;
  total_contratos: number;
  veiculos_rastreados: number;
  gasto_total: number;
  created_at: string;
}

const initialStats: SuperAdminStats = {
  totalOrganizations: 0,
  activeOrganizations: 0,
  organizationsByPlan: [],
  totalUsers: 0,
  totalClientes: 0,
  totalRecursosIA: 0,
  recursosIAEsteMes: 0,
  receitaRecursosIA: 0,
  receitaRecursosIAMes: 0,
  totalVeiculosRastreados: 0,
  receitaRastreamentoMes: 0,
  totalEditaisComprados: 0,
  receitaEditaisMes: 0,
  receitaTotalMes: 0,
  receitaTotalGeral: 0,
  saldoTotalCarteiras: 0,
  creditosVendidosMes: 0,
  evolucaoMensal: [],
  organizationsDetails: [],
};

export function useSuperAdminStats() {
  const [stats, setStats] = useState<SuperAdminStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Buscar todas as estatísticas em paralelo
      const [
        orgsResult,
        orgsActiveResult,
        usersResult,
        clientesResult,
        recursosResult,
        recursosMesResult,
        veiculosResult,
        faturamentoTotalResult,
        faturamentoMesResult,
        faturamentoRecursosResult,
        editaisComprasResult,
        orgsDetailsResult
      ] = await Promise.all([
        // Total organizações
        supabase.from('organizations').select('*', { count: 'exact', head: true }),
        
        // Organizações ativas
        supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('ativo', true),
        
        // Total usuários
        supabase.from('users').select('*', { count: 'exact', head: true }),
        
        // Total clientes
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        
        // Total recursos IA
        supabase.from('recursos').select('*', { count: 'exact', head: true }).eq('is_ia', true),
        
        // Recursos IA este mês
        supabase.from('recursos').select('*', { count: 'exact', head: true })
          .eq('is_ia', true)
          .gte('created_at', firstDayOfMonth),
        
        // Veículos rastreados
        supabase.from('veiculos').select('*', { count: 'exact', head: true }).eq('rastreamento_ativo', true),
        
        // Faturamento total (receita = credits vendidos)
        supabase.from('faturamento').select('valor, tipo').eq('status', 'paid'),
        
        // Faturamento este mês
        supabase.from('faturamento').select('valor, tipo, descricao')
          .eq('status', 'paid')
          .gte('created_at', firstDayOfMonth),
        
        // Receita de recursos IA (tipo = system_usage e descrição contém "Recurso IA")
        supabase.from('faturamento').select('valor')
          .eq('status', 'paid')
          .eq('tipo', 'system_usage'),
        
        // Editais comprados
        supabase.from('edital_compras').select('*', { count: 'exact', head: true }),
        
        // Detalhes das organizações
        supabase.from('organizations').select('id, nome, plano, saldo_sacavel, saldo_bonus, ativo, created_at')
          .order('created_at', { ascending: false })
      ]);

      // Calcular saldo total das carteiras
      const orgsDetails = orgsDetailsResult.data || [];
      const saldoTotalCarteiras = orgsDetails.reduce((acc: number, org: any) => 
        acc + (org.saldo_sacavel || 0) + (org.saldo_bonus || 0), 0);

      // Calcular receitas
      const faturamentoData = faturamentoTotalResult.data || [];
      const faturamentoMesData = faturamentoMesResult.data || [];
      const faturamentoRecursosData = faturamentoRecursosResult.data || [];

      // Receita total (créditos vendidos = adjustment, positivos)
      const receitaTotalGeral = faturamentoData
        .filter((f: any) => f.tipo === 'adjustment' || f.tipo === 'credit_purchase')
        .reduce((acc: number, f: any) => acc + (f.valor || 0), 0);

      // Receita de recursos IA (consumos)
      const receitaRecursosIA = faturamentoRecursosData
        .reduce((acc: number, f: any) => acc + (f.valor || 0), 0);

      // Receita de recursos IA este mês
      const receitaRecursosIAMes = faturamentoMesData
        .filter((f: any) => f.tipo === 'system_usage' && f.descricao?.includes('Recurso IA'))
        .reduce((acc: number, f: any) => acc + (f.valor || 0), 0);

      // Créditos vendidos este mês
      const creditosVendidosMes = faturamentoMesData
        .filter((f: any) => f.tipo === 'adjustment' || f.tipo === 'credit_purchase')
        .reduce((acc: number, f: any) => acc + (f.valor || 0), 0);

      // Receita total do mês
      const receitaTotalMes = creditosVendidosMes;

      // Organizações por plano
      const planCounts: Record<string, number> = {};
      orgsDetails.forEach((org: any) => {
        const plan = org.plano || 'Sem plano';
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      });
      const organizationsByPlan = Object.entries(planCounts).map(([plan, count]) => ({ plan, count }));

      // Buscar detalhes completos das organizações
      const orgDetailsWithStats: OrganizationDetail[] = [];
      for (const org of orgsDetails.slice(0, 50)) {
        const [clientesRes, recursosRes, contratosRes, veiculosRes, gastoRes] = await Promise.all([
          supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
          supabase.from('recursos').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
          supabase.from('contratos').select('*', { count: 'exact', head: true }).eq('organization_id', org.id),
          supabase.from('veiculos').select('*, clientes!inner(organization_id)', { count: 'exact', head: true })
            .eq('rastreamento_ativo', true)
            .eq('clientes.organization_id', org.id),
          supabase.from('faturamento').select('valor')
            .eq('organization_id', org.id)
            .eq('tipo', 'system_usage')
            .eq('status', 'paid')
        ]);

        const gastoTotal = (gastoRes.data || []).reduce((acc: number, f: any) => acc + (f.valor || 0), 0);

        orgDetailsWithStats.push({
          id: org.id,
          nome: org.nome,
          plano: org.plano || 'Sem plano',
          saldo_sacavel: org.saldo_sacavel || 0,
          saldo_bonus: org.saldo_bonus || 0,
          total_clientes: clientesRes.count || 0,
          total_recursos: recursosRes.count || 0,
          total_contratos: contratosRes.count || 0,
          veiculos_rastreados: veiculosRes.count || 0,
          gasto_total: gastoTotal,
          created_at: org.created_at,
        });
      }

      // Evolução mensal (últimos 6 meses)
      const evolucaoMensal: SuperAdminStats['evolucaoMensal'] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const mesNome = date.toLocaleDateString('pt-BR', { month: 'short' });

        const [receitaRes, recursosRes, clientesRes] = await Promise.all([
          supabase.from('faturamento').select('valor, tipo')
            .eq('status', 'paid')
            .gte('created_at', date.toISOString())
            .lt('created_at', nextDate.toISOString()),
          supabase.from('recursos').select('*', { count: 'exact', head: true })
            .eq('is_ia', true)
            .gte('created_at', date.toISOString())
            .lt('created_at', nextDate.toISOString()),
          supabase.from('organizations').select('*', { count: 'exact', head: true })
            .gte('created_at', date.toISOString())
            .lt('created_at', nextDate.toISOString())
        ]);

        const receitaData = receitaRes.data || [];
        const receita = receitaData
          .filter((f: any) => f.tipo === 'adjustment' || f.tipo === 'credit_purchase')
          .reduce((acc: number, f: any) => acc + (f.valor || 0), 0);

        const recursosIA = receitaData
          .filter((f: any) => f.tipo === 'system_usage')
          .reduce((acc: number, f: any) => acc + (f.valor || 0), 0);

        evolucaoMensal.push({
          mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1).replace('.', ''),
          receita,
          recursosIA,
          rastreamento: 0, // TODO: Implementar quando tiver registro específico
          editais: 0, // TODO: Implementar quando tiver registro específico
          novosClientes: clientesRes.count || 0
        });
      }

      setStats({
        totalOrganizations: orgsResult.count || 0,
        activeOrganizations: orgsActiveResult.count || 0,
        organizationsByPlan,
        totalUsers: usersResult.count || 0,
        totalClientes: clientesResult.count || 0,
        totalRecursosIA: recursosResult.count || 0,
        recursosIAEsteMes: recursosMesResult.count || 0,
        receitaRecursosIA,
        receitaRecursosIAMes,
        totalVeiculosRastreados: veiculosResult.count || 0,
        receitaRastreamentoMes: 0, // TODO: Implementar
        totalEditaisComprados: editaisComprasResult.count || 0,
        receitaEditaisMes: 0, // TODO: Implementar
        receitaTotalMes,
        receitaTotalGeral,
        saldoTotalCarteiras,
        creditosVendidosMes,
        evolucaoMensal,
        organizationsDetails: orgDetailsWithStats,
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar dados'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
