import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../contexts/OrganizationContext';
import type { Cliente, ClienteInsert, ClienteUpdate } from '../types/database';

interface DeleteResult {
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
}

interface UseClientesReturn {
    clientes: Cliente[];
    loading: boolean;
    error: Error | null;
    fetchClientes: () => Promise<void>;
    fetchClientesByOrganization: (organizationId: string) => Promise<void>;
    getCliente: (id: string) => Promise<Cliente | null>;
    createCliente: (cliente: ClienteInsert) => Promise<Cliente | null>;
    updateCliente: (id: string, updates: ClienteUpdate) => Promise<Cliente | null>;
    deleteCliente: (id: string) => Promise<DeleteResult>;
    searchClientes: (query: string) => Promise<Cliente[]>;
}

export function useClientes(): UseClientesReturn {
    const { currentOrganization } = useOrganization();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchClientes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('clientes')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setClientes((data || []) as any);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar clientes'));
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchClientesByOrganization = useCallback(async (organizationId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('clientes')
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setClientes((data || []) as any);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar clientes da organização'));
        } finally {
            setLoading(false);
        }
    }, []);

    const getCliente = useCallback(async (id: string): Promise<Cliente | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('clientes')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            return data as any;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar cliente'));
            return null;
        }
    }, []);

    const createCliente = useCallback(async (cliente: ClienteInsert): Promise<Cliente | null> => {
        setLoading(true);
        setError(null);
        try {
            // Verificar limite de clientes
            if (currentOrganization) {
                const { count } = await supabase
                    .from('clientes')
                    .select('*', { count: 'exact', head: true })
                    .eq('organization_id', currentOrganization.id);

                const { data: plano } = await supabase
                    .from('planos' as any)
                    .select('limite_clientes')
                    .eq('slug', currentOrganization.plano)
                    .maybeSingle();

                const limite = currentOrganization.limite_clientes ?? (plano as any)?.limite_clientes ?? 100;

                if (count !== null && count >= limite) {
                    throw new Error(`Limite de ${limite} clientes atingido para o seu plano.`);
                }
            }

            const { data, error: insertError } = await supabase
                .from('clientes')
                .insert(cliente as any)
                .select()
                .single();

            if (insertError) throw insertError;

            // Update local state
            const result = data as unknown as Cliente;
            if (result) {
                setClientes(prev => [result, ...prev]);
            }

            return result;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao criar cliente'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateCliente = useCallback(async (id: string, updates: ClienteUpdate): Promise<Cliente | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: updateError } = await supabase
                .from('clientes')
                .update({ ...updates, updated_at: new Date().toISOString() } as any)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Update local state
            const result = data as unknown as Cliente;
            if (result) {
                setClientes(prev => prev.map(c => c.id === id ? result : c));
            }

            return data as any;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao atualizar cliente'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCliente = useCallback(async (id: string): Promise<{ success: boolean; errorCode?: string; errorMessage?: string }> => {
        setLoading(true);
        setError(null);
        try {
            // 1. Buscar veículos do cliente para deletar registros dependentes
            const { data: veiculosCliente } = await supabase
                .from('veiculos')
                .select('id')
                .eq('cliente_id', id);
            
            const veiculoIds = veiculosCliente?.map(v => v.id) || [];
            
            if (veiculoIds.length > 0) {
                // 2. Deletar multas dos veículos
                await supabase
                    .from('multas')
                    .delete()
                    .in('veiculo_id', veiculoIds);
                
                // 3. Deletar notificações de multas dos veículos
                await supabase
                    .from('notificacoes_multas')
                    .delete()
                    .in('veiculo_id', veiculoIds);
                
                // 4. Deletar consultas de rastreamento dos veículos
                await supabase
                    .from('consultas_rastreamento')
                    .delete()
                    .in('veiculo_id', veiculoIds);
                
                // 5. Deletar cobranças de rastreamento dos veículos
                await supabase
                    .from('rastreamento_cobrancas')
                    .delete()
                    .in('veiculo_id', veiculoIds);
                
                // 6. Deletar veículos do cliente
                await supabase
                    .from('veiculos')
                    .delete()
                    .eq('cliente_id', id);
            }
            
            // 7. Deletar recursos do cliente
            await supabase
                .from('recursos')
                .delete()
                .eq('cliente_id', id);
            
            // 8. Deletar contratos do cliente
            await supabase
                .from('contratos')
                .delete()
                .eq('cliente_id', id);
            
            // 9. Deletar documentos do cliente
            await supabase
                .from('documentos')
                .delete()
                .eq('cliente_id', id);
            
            // 10. Deletar histórico de atividades do cliente
            await supabase
                .from('historico_atividades')
                .delete()
                .eq('cliente_id', id);
            
            // 11. Finalmente, deletar o cliente
            const { error: deleteError } = await supabase
                .from('clientes')
                .delete()
                .eq('id', id);

            if (deleteError) {
                throw deleteError;
            }

            // Update local state
            setClientes(prev => prev.filter(c => c.id !== id));

            return { success: true };
        } catch (err: any) {
            const errorMessage = err?.message || 'Erro ao deletar cliente';
            setError(err instanceof Error ? err : new Error(errorMessage));
            return { success: false, errorCode: 'UNKNOWN', errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const searchClientes = useCallback(async (query: string): Promise<Cliente[]> => {
        try {
            const { data, error: searchError } = await supabase
                .from('clientes')
                .select('*')
                .or(`nome_completo.ilike.%${query}%,cpf.ilike.%${query}%,cnpj.ilike.%${query}%,email.ilike.%${query}%`)
                .order('nome_completo');

            if (searchError) throw searchError;
            return (data || []) as any;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar clientes'));
            return [];
        }
    }, []);

    return {
        clientes,
        loading,
        error,
        fetchClientes,
        fetchClientesByOrganization,
        getCliente,
        createCliente,
        updateCliente,
        deleteCliente,
        searchClientes,
    };
}

export default useClientes;
