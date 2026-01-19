import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Servico, ServicoInsert, ServicoUpdate } from '../types/database';

interface UseServicosReturn {
    servicos: Servico[];
    loading: boolean;
    error: Error | null;
    fetchServicos: (organizationId: string) => Promise<void>;
    createServico: (servico: ServicoInsert) => Promise<Servico | null>;
    updateServico: (id: string, updates: ServicoUpdate) => Promise<Servico | null>;
    deleteServico: (id: string) => Promise<boolean>;
}

export function useServicos(): UseServicosReturn {
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchServicos = useCallback(async (organizationId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('servicos')
                .select('*')
                .eq('organization_id', organizationId)
                .order('nome');

            if (fetchError) throw fetchError;
            setServicos((data || []) as Servico[]);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar serviços'));
        } finally {
            setLoading(false);
        }
    }, []);

    const createServico = useCallback(async (servico: ServicoInsert): Promise<Servico | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('servicos')
                .insert(servico)
                .select()
                .single();

            if (insertError) throw insertError;
            const created = data as Servico;
            setServicos(prev => [...prev, created]);
            return created;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao criar serviço'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateServico = useCallback(async (id: string, updates: ServicoUpdate): Promise<Servico | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: updateError } = await supabase
                .from('servicos')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;
            const updated = data as Servico;
            setServicos(prev => prev.map(s => s.id === id ? updated : s));
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao atualizar serviço'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteServico = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const { error: deleteError } = await supabase
                .from('servicos')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            setServicos(prev => prev.filter(s => s.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao deletar serviço'));
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        servicos,
        loading,
        error,
        fetchServicos,
        createServico,
        updateServico,
        deleteServico
    };
}
