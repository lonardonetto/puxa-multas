import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';

export interface PlanDetails {
    nome: string;
    slug: string;
    preco_mensal: number;
    limite_clientes: number;
    preco_recurso_ia: number;
    preco_rastreamento: number;
    preco_edital: number;
    recursos_ia_inclusos: number;
    recursos_ia_suspensao_inclusos: number;
    recursos_ia_suspensao_preco_adicional: number;
    rastreamento_pf_preco: number;
    acesso_crm: boolean;
    acesso_disparador: boolean;
    limite_usuarios: number;
    suporte: string;
}

export function useCurrentPlan() {
    const { user } = useAuth();
    const { currentOrganization } = useOrganization();
    const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
    const [usageStats, setUsageStats] = useState({ ia_used_this_month: 0 });
    const [loading, setLoading] = useState(true);

    const fetchPlanAndUsage = async () => {
        if (!currentOrganization) return;

        setLoading(true);
        try {
            // 1. Buscar detalhes do plano base
            const { data: plano } = await supabase
                .from('planos' as any)
                .select('*')
                .eq('slug', currentOrganization.plano)
                .maybeSingle();

            if (plano) {
                const p = plano as any;
                // 2. Mesclar com overrides da organização (se houver)
                const mergedPlan: PlanDetails = {
                    nome: p.nome,
                    slug: p.slug,
                    preco_mensal: p.preco_mensal,
                    limite_clientes: (currentOrganization as any).limite_clientes ?? p.limite_clientes,
                    preco_recurso_ia: (currentOrganization as any).preco_recurso_ia ?? p.preco_recurso_ia,
                    preco_rastreamento: (currentOrganization as any).preco_rastreamento ?? p.preco_rastreamento,
                    preco_edital: (currentOrganization as any).preco_edital ?? p.preco_edital,
                    recursos_ia_inclusos: p.recursos_ia_inclusos || 0,
                    recursos_ia_suspensao_inclusos: p.recursos_ia_suspensao_inclusos || 0,
                    recursos_ia_suspensao_preco_adicional: p.recursos_ia_suspensao_preco_adicional || 0,
                    rastreamento_pf_preco: p.rastreamento_pf_preco || 0,
                    acesso_crm: (currentOrganization as any).acesso_crm ?? p.acesso_crm,
                    acesso_disparador: (currentOrganization as any).acesso_disparador ?? p.acesso_disparador,
                    limite_usuarios: p.limite_usuarios || 0,
                    suporte: p.suporte || 'Padrão',
                };
                setPlanDetails(mergedPlan);

                // 3. Buscar uso mensal (Recursos IA)
                if (p.slug === 'top') {
                    const firstDayOfMonth = new Date();
                    firstDayOfMonth.setDate(1);
                    firstDayOfMonth.setHours(0, 0, 0, 0);

                    const { count } = await supabase
                        .from('recursos')
                        .select('*', { count: 'exact', head: true })
                        .eq('organization_id', currentOrganization.id)
                        .gte('created_at', firstDayOfMonth.toISOString());

                    setUsageStats({ ia_used_this_month: count || 0 });
                }
            }
        } catch (err) {
            console.error('Erro ao carregar plano atual:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentOrganization) {
            fetchPlanAndUsage();
        }
    }, [currentOrganization]);

    const effectivePrices = useMemo(() => {
        if (!planDetails) return null;

        return {
            ia: planDetails.preco_recurso_ia,
            ia_suspensao: planDetails.recursos_ia_suspensao_preco_adicional,
            rastreamento: planDetails.preco_rastreamento,
            rastreamento_pf: planDetails.rastreamento_pf_preco,
            edital: planDetails.preco_edital,
            ia_used_this_month: usageStats.ia_used_this_month,
            ia_remaining_free: Math.max(0, (planDetails.recursos_ia_inclusos || 0) - usageStats.ia_used_this_month)
        };
    }, [planDetails, usageStats]);

    return {
        plan: planDetails,
        prices: effectivePrices,
        usage: usageStats,
        loading,
        refresh: fetchPlanAndUsage
    };
}
