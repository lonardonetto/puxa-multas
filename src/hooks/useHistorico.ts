import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';

export interface Activity {
    id: string;
    cliente_id: string;
    organization_id: string;
    tipo: 'cadastro' | 'contrato_criado' | 'contrato_assinado' | 'contrato_excluido' | 'documento_enviado' | 'cliente_editado' | 'status_alterado' | 'manual';
    descricao: string;
    metadata?: any;
    created_at: string;
}

export function useHistorico() {
    const { currentOrganization } = useOrganization();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchActivities = useCallback(async (clienteId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('historico_atividades' as any)
                .select('*')
                .eq('cliente_id', clienteId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setActivities(data || []);
        } catch (err) {
            console.error('Erro ao buscar histórico:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const addActivity = useCallback(async (activity: Omit<Activity, 'id' | 'created_at' | 'organization_id'>) => {
        if (!currentOrganization) return;

        try {
            const { data, error } = await (supabase
                .from('historico_atividades' as any) as any)
                .insert({
                    ...activity,
                    organization_id: currentOrganization.id
                })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setActivities(prev => [data, ...prev]);
            }
            return data;
        } catch (err) {
            console.error('Erro ao adicionar atividade:', err);
            return null;
        }
    }, [currentOrganization]);

    return {
        activities,
        loading,
        fetchActivities,
        addActivity
    };
}
