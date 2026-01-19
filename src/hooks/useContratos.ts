import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Contrato, ContratoInsert, ContratoUpdate } from '../types/database';

interface UseContratosReturn {
    contratos: Contrato[];
    loading: boolean;
    error: Error | null;
    fetchContratosByCliente: (clienteId: string) => Promise<void>;
    createContrato: (contrato: ContratoInsert) => Promise<Contrato | null>;
    assinarContrato: (id: string, assinaturaData: any) => Promise<Contrato | null>;
    deleteContrato: (id: string) => Promise<boolean>;
    updateContrato: (id: string, updates: ContratoUpdate) => Promise<Contrato | null>;
}

export function useContratos(): UseContratosReturn {
    const [contratos, setContratos] = useState<Contrato[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchContratosByCliente = useCallback(async (clienteId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('contratos' as any)
                .select(`
                    *,
                    servicos (nome)
                `)
                .eq('cliente_id', clienteId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setContratos((data || []) as Contrato[]);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar contratos'));
        } finally {
            setLoading(false);
        }
    }, []);

    const createContrato = useCallback(async (contrato: ContratoInsert): Promise<Contrato | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await (supabase
                .from('contratos') as any)
                .insert(contrato as any)
                .select()
                .single();

            if (insertError) throw insertError;
            const created = data as Contrato;
            setContratos(prev => [created, ...prev]);
            return created;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao gerar contrato'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const assinarContrato = useCallback(async (id: string, assinaturaData: any): Promise<Contrato | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: updateError } = await (supabase
                .from('contratos') as any)
                .update({
                    status: 'assinado',
                    assinatura_data: assinaturaData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;
            const updated = data as Contrato;
            setContratos(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao assinar contrato'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteContrato = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const { error: deleteError } = await (supabase
                .from('contratos') as any)
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
            setContratos(prev => prev.filter(c => c.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao excluir contrato'));
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateContrato = useCallback(async (id: string, updates: ContratoUpdate): Promise<Contrato | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: updateError } = await (supabase
                .from('contratos') as any)
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select(`
                    *,
                    servicos (nome)
                `)
                .single();

            if (updateError) throw updateError;
            const updated = data as Contrato;
            setContratos(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao atualizar contrato'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        contratos,
        loading,
        error,
        fetchContratosByCliente,
        createContrato,
        assinarContrato,
        deleteContrato,
        updateContrato
    };
}
