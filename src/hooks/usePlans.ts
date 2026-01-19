import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Plano, PlanoInsert, PlanoUpdate } from '../types/database';

export function usePlans() {
    const [plans, setPlans] = useState<Plano[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchPlans = useCallback(async (onlyActive = false) => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase.from('planos' as any).select('*').order('preco_mensal');

            if (onlyActive) {
                query = (query as any).eq('ativo', true);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setPlans(data || []);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar planos'));
        } finally {
            setLoading(false);
        }
    }, []);

    const createPlan = useCallback(async (plan: PlanoInsert) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('planos' as any)
                .insert(plan as any)
                .select()
                .single();

            if (insertError) throw insertError;
            if (data) setPlans(prev => [...prev, data as Plano]);
            return data as Plano;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao criar plano'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePlan = useCallback(async (id: string, updates: PlanoUpdate) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: updateError } = await supabase
                .from('planos' as any)
                .update(updates as any)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;
            if (data) setPlans(prev => prev.map(p => p.id === id ? (data as Plano) : p));
            return data as Plano;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao atualizar plano'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deletePlan = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const { error: deleteError } = await supabase
                .from('planos' as any)
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            setPlans(prev => prev.filter(p => p.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao deletar plano'));
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        plans,
        loading,
        error,
        fetchPlans,
        createPlan,
        updatePlan,
        deletePlan
    };
}
