import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Faturamento, FaturamentoInsert, FaturamentoUpdate } from '../types/database';

interface UseBillingReturn {
    billing: Faturamento[];
    loading: boolean;
    error: Error | null;
    fetchBilling: (organizationId: string) => Promise<void>;
    createInvoice: (invoice: FaturamentoInsert) => Promise<Faturamento | null>;
    updateInvoice: (id: string, updates: FaturamentoUpdate) => Promise<Faturamento | null>;
}

export function useBilling(): UseBillingReturn {
    const [billing, setBilling] = useState<Faturamento[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchBilling = useCallback(async (organizationId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('faturamento' as any)
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setBilling(data || []);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar faturamento'));
        } finally {
            setLoading(false);
        }
    }, []);

    const createInvoice = useCallback(async (invoice: FaturamentoInsert): Promise<Faturamento | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('faturamento' as any)
                .insert(invoice as any)
                .select()
                .single();

            if (insertError) throw insertError;
            if (data) setBilling(prev => [data as Faturamento, ...prev]);
            return data as Faturamento;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao criar fatura'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateInvoice = useCallback(async (id: string, updates: FaturamentoUpdate): Promise<Faturamento | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: updateError } = await supabase
                .from('faturamento' as any)
                .update(updates as any)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;
            if (data) setBilling(prev => prev.map(i => i.id === id ? (data as Faturamento) : i));
            return data as Faturamento;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao atualizar fatura'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        billing,
        loading,
        error,
        fetchBilling,
        createInvoice,
        updateInvoice
    };
}
