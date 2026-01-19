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
                .from('fases_custom')
                .select('*')
                .eq('organization_id', currentOrganization.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setFases((data || []) as FaseCustom[]);
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
                .from('fases_custom')
                .insert({
                    organization_id: currentOrganization.id,
                    nome
                })
                .select()
                .single();

            if (error) throw error;
            const result = data as unknown as FaseCustom;
            if (result) {
                setFases(prev => [...prev, result]);
            }
            return result;
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
