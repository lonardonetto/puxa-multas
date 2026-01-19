import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';

export interface CRMStage {
    id: string;
    nome: string;
    label: string; // O nome sem o prefixo [CRM]
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
}

const DEFAULT_STAGES = [
    { nome: '[CRM] Novos Leads', color: 'text-blue-600', bgColor: 'bg-blue-600', borderColor: 'border-blue-200', icon: 'ri-flashlight-line' },
    { nome: '[CRM] Em Negociação', color: 'text-amber-600', bgColor: 'bg-amber-600', borderColor: 'border-amber-200', icon: 'ri-shake-hands-line' },
    { nome: '[CRM] Follow-up', color: 'text-purple-600', bgColor: 'bg-purple-600', borderColor: 'border-purple-200', icon: 'ri-chat-history-line' },
    { nome: '[CRM] Fechado/Ganho', color: 'text-emerald-600', bgColor: 'bg-emerald-600', borderColor: 'border-emerald-200', icon: 'ri-trophy-line' },
    { nome: '[CRM] Perdido', color: 'text-gray-500', bgColor: 'bg-gray-600', borderColor: 'border-gray-300', icon: 'ri-close-circle-line' }
];

export function useCRMStages() {
    const { currentOrganization } = useOrganization();
    const [stages, setStages] = useState<CRMStage[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStages = useCallback(async () => {
        if (!currentOrganization) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('fases_custom')
                .select('*')
                .eq('organization_id', currentOrganization.id)
                .like('nome', '[CRM]%')
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                // Return defaults but don't persist yet
                setStages(DEFAULT_STAGES.map((s, idx) => ({
                    id: `default-${idx}`,
                    nome: s.nome,
                    label: s.nome.replace('[CRM] ', ''),
                    ...s
                })));
            } else {
                setStages(data.map((item: any, idx: number) => {
                    const baseDefault = DEFAULT_STAGES[idx % DEFAULT_STAGES.length];
                    return {
                        id: item.id,
                        nome: item.nome,
                        label: item.nome.replace('[CRM] ', ''),
                        color: baseDefault.color,
                        bgColor: baseDefault.bgColor,
                        borderColor: baseDefault.borderColor,
                        icon: baseDefault.icon
                    };
                }));
            }
        } catch (err) {
            console.error('Erro ao buscar estágios do CRM:', err);
        } finally {
            setLoading(false);
        }
    }, [currentOrganization]);

    const saveStage = async (nome: string, id?: string) => {
        if (!currentOrganization) return;
        const finalNome = nome.startsWith('[CRM] ') ? nome : `[CRM] ${nome}`;
        try {
            if (id && !id.startsWith('default')) {
                const { error } = await supabase
                    .from('fases_custom')
                    .update({ nome: finalNome })
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('fases_custom')
                    .insert({
                        organization_id: currentOrganization.id,
                        nome: finalNome
                    });
                if (error) throw error;
            }
            await fetchStages();
            return true;
        } catch (err) {
            console.error('Erro ao salvar estágio:', err);
            return false;
        }
    };

    const deleteStage = async (id: string) => {
        if (!currentOrganization || id.startsWith('default')) return;
        try {
            const { error } = await supabase
                .from('fases_custom')
                .delete()
                .eq('id', id);
            if (error) throw error;
            await fetchStages();
            return true;
        } catch (err) {
            console.error('Erro ao deletar estágio:', err);
            return false;
        }
    };

    const initializeDefaults = async () => {
        if (!currentOrganization) return;
        setLoading(true);
        try {
            const insertData = DEFAULT_STAGES.map(s => ({
                organization_id: currentOrganization.id,
                nome: s.nome
            }));
            const { error } = await supabase
                .from('fases_custom')
                .insert(insertData);
            if (error) throw error;
            await fetchStages();
        } catch (err) {
            console.error('Erro ao inicializar padrões:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStages();
    }, [fetchStages]);

    return {
        stages,
        loading,
        saveStage,
        deleteStage,
        initializeDefaults,
        refresh: fetchStages
    };
}
