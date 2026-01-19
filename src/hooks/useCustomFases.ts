import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';

export interface FaseCustom {
    id: string;
    organization_id: string;
    nome: string;
}

export function useCustomFases() {
    const { currentOrganization } = useOrganization();
    const [fases, setFases] = useState<FaseCustom[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFases = useCallback(async () => {
        if (!currentOrganization) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('fases_custom' as any)
                .select('*')
                .eq('organization_id', currentOrganization.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setFases(data || []);
        } catch (err) {
            console.error('Erro ao buscar fases:', err);
        } finally {
            setLoading(false);
        }
    }, [currentOrganization]);

    const addFase = useCallback(async (nome: string) => {
        if (!currentOrganization) return;
        try {
            const { data, error } = await supabase
                .from('fases_custom' as any)
                .insert({
                    organization_id: currentOrganization.id,
                    nome
                })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setFases(prev => [...prev, data]);
            }
            return data;
        } catch (err) {
            console.error('Erro ao adicionar fase:', err);
            return null;
        }
    }, [currentOrganization]);

    useEffect(() => {
        fetchFases();
    }, [fetchFases]);

    return {
        fases,
        loading,
        addFase,
        refresh: fetchFases
    };
}
