import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Veiculo, VeiculoInsert, VeiculoUpdate } from '../types/database';

interface UseVeiculosReturn {
    veiculos: Veiculo[];
    loading: boolean;
    error: Error | null;
    fetchVeiculos: (clienteId?: string) => Promise<void>;
    fetchVeiculosByCliente: (clienteId: string) => Promise<Veiculo[]>;
    fetchVeiculosByOrganization: (organizationId: string) => Promise<Veiculo[]>;
    getVeiculo: (id: string) => Promise<Veiculo | null>;
    createVeiculo: (veiculo: VeiculoInsert) => Promise<Veiculo | null>;
    createVeiculosBatch: (veiculos: VeiculoInsert[]) => Promise<Veiculo[]>;
    updateVeiculo: (id: string, updates: VeiculoUpdate) => Promise<Veiculo | null>;
    deleteVeiculo: (id: string) => Promise<boolean>;
    searchByPlaca: (placa: string) => Promise<Veiculo[]>;
    toggleRastreamento: (id: string, ativar: boolean) => Promise<Veiculo | null>;
}

export function useVeiculos(): UseVeiculosReturn {
    const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchVeiculos = useCallback(async (clienteId?: string) => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('veiculos')
                .select('*')
                .order('created_at', { ascending: false });

            if (clienteId) {
                query = query.eq('cliente_id', clienteId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setVeiculos(data || []);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar veículos'));
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchVeiculosByCliente = useCallback(async (clienteId: string): Promise<Veiculo[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('veiculos')
                .select('*')
                .eq('cliente_id', clienteId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            return data || [];
        } catch (err) {
            console.error('Erro ao buscar veículos do cliente:', err);
            return [];
        }
    }, []);

    const getVeiculo = useCallback(async (id: string): Promise<Veiculo | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('veiculos')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            return data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar veículo'));
            return null;
        }
    }, []);

    const createVeiculo = useCallback(async (veiculo: VeiculoInsert): Promise<Veiculo | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('veiculos')
                .insert(veiculo as any)
                .select()
                .single();

            if (insertError) throw insertError;

            const createdVeiculo = data as Veiculo;
            if (createdVeiculo) {
                setVeiculos(prev => [createdVeiculo, ...prev]);
            }

            return createdVeiculo;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao criar veículo'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createVeiculosBatch = useCallback(async (veiculosToCreate: VeiculoInsert[]): Promise<Veiculo[]> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('veiculos')
                .insert(veiculosToCreate as any)
                .select();

            const veiculosList = (data || []) as Veiculo[];
            if (veiculosList.length) {
                setVeiculos(prev => [...veiculosList, ...prev]);
            }

            return veiculosList;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao criar veículos'));
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const updateVeiculo = useCallback(async (id: string, updates: VeiculoUpdate): Promise<Veiculo | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: updateError } = await supabase
                .from('veiculos')
                .update({ ...updates, updated_at: new Date().toISOString() } as any)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            const updatedVeiculo = data as Veiculo;
            if (updatedVeiculo) {
                setVeiculos(prev => prev.map(v => v.id === id ? updatedVeiculo : v));
            }

            return updatedVeiculo;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao atualizar veículo'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteVeiculo = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const { error: deleteError } = await supabase
                .from('veiculos')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setVeiculos(prev => prev.filter(v => v.id !== id));

            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao deletar veículo'));
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const searchByPlaca = useCallback(async (placa: string): Promise<Veiculo[]> => {
        try {
            const { data, error: searchError } = await supabase
                .from('veiculos')
                .select('*')
                .ilike('placa', `%${placa}%`)
                .order('placa');

            if (searchError) throw searchError;
            return (data || []) as Veiculo[];
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar veículos'));
            return [];
        }
    }, []);

    const fetchVeiculosByOrganization = useCallback(async (organizationId: string): Promise<Veiculo[]> => {
        try {
            // First get all clients from the organization
            const { data: clientes, error: clientesError } = await supabase
                .from('clientes')
                .select('id')
                .eq('organization_id', organizationId);

            if (clientesError) throw clientesError;

            if (!clientes || clientes.length === 0) return [];

            const clienteIds = (clientes as { id: string }[]).map(c => c.id);

            // Then get all vehicles from those clients
            const { data, error: veiculosError } = await supabase
                .from('veiculos')
                .select('*')
                .in('cliente_id', clienteIds)
                .order('created_at', { ascending: false });

            if (veiculosError) throw veiculosError;

            const veiculosList = (data || []) as Veiculo[];
            setVeiculos(veiculosList);
            return veiculosList;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar veículos da organização'));
            return [];
        }
    }, []);

    const toggleRastreamento = useCallback(async (id: string, ativar: boolean): Promise<Veiculo | null> => {
        setLoading(true);
        setError(null);
        try {
            const updates: VeiculoUpdate = {
                rastreamento_ativo: ativar,
                rastreamento_inicio: ativar ? new Date().toISOString() : null,
            };

            const { data, error: updateError } = await supabase
                .from('veiculos')
                .update({ ...updates, updated_at: new Date().toISOString() } as any)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            const veiculo = data as Veiculo;
            if (veiculo) {
                setVeiculos(prev => prev.map(v => v.id === id ? veiculo : v));
            }

            return veiculo;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao alterar rastreamento'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        veiculos,
        loading,
        error,
        fetchVeiculos,
        fetchVeiculosByCliente,
        fetchVeiculosByOrganization,
        getVeiculo,
        createVeiculo,
        createVeiculosBatch,
        updateVeiculo,
        deleteVeiculo,
        searchByPlaca,
        toggleRastreamento,
    };
}

export default useVeiculos;
