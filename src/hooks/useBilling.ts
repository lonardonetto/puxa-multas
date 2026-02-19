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
                .from('faturamento')
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setBilling((data || []) as any);
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
                .from('faturamento')
                .insert(invoice)
                .select()
                .single();

            if (insertError) throw insertError;
            const result = data as unknown as Faturamento;
            if (result) setBilling(prev => [result, ...prev]);

            // Atualizar saldo na organização
            if (result && invoice.organization_id && invoice.status === 'paid') {
                const balanceField = invoice.is_bonus ? 'saldo_bonus' : 'saldo_sacavel';
                const { data: orgData } = await supabase
                    .from('organizations')
                    .select(balanceField)
                    .eq('id', invoice.organization_id)
                    .single();

                if (orgData) {
                    const currentBalance = (orgData as any)[balanceField] || 0;
                    await supabase
                        .from('organizations')
                        .update({ [balanceField]: currentBalance + invoice.valor })
                        .eq('id', invoice.organization_id);
                }
            }

            return result;
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
                .from('faturamento')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;
            const result = data as unknown as Faturamento;
            if (result) setBilling(prev => prev.map(i => i.id === id ? result : i));
            return result;
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
