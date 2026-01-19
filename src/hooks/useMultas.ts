import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Multa, MultaInsert, MultaUpdate, StatusMulta } from '../types/database';

interface UseMultasReturn {
    multas: Multa[];
    loading: boolean;
    error: Error | null;
    stats: MultaStats;
    fetchMultas: (veiculoId?: string) => Promise<void>;
    fetchMultasByStatus: (status: StatusMulta) => Promise<Multa[]>;
    getMulta: (id: string) => Promise<Multa | null>;
    createMulta: (multa: MultaInsert) => Promise<Multa | null>;
    updateMulta: (id: string, updates: MultaUpdate) => Promise<Multa | null>;
    deleteMulta: (id: string) => Promise<boolean>;
    searchMultas: (query: string) => Promise<Multa[]>;
}

interface MultaStats {
    total: number;
    pendentes: number;
    suspensivas: number;
    analise: number;
    concluidas: number;
    pagas: number;
    valorTotal: number;
}

const defaultStats: MultaStats = {
    total: 0,
    pendentes: 0,
    suspensivas: 0,
    analise: 0,
    concluidas: 0,
    pagas: 0,
    valorTotal: 0,
};

export function useMultas(): UseMultasReturn {
    const [multas, setMultas] = useState<Multa[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [stats, setStats] = useState<MultaStats>(defaultStats);

    const calculateStats = (multasList: Multa[]): MultaStats => {
        return multasList.reduce((acc, multa) => {
            acc.total++;
            acc.valorTotal += multa.valor;

            switch (multa.status) {
                case 'pendente':
                    acc.pendentes++;
                    break;
                case 'suspensiva':
                    acc.suspensivas++;
                    break;
                case 'analise':
                    acc.analise++;
                    break;
                case 'concluido':
                    acc.concluidas++;
                    break;
                case 'pago':
                    acc.pagas++;
                    break;
            }

            return acc;
        }, { ...defaultStats });
    };

    const fetchMultas = useCallback(async (veiculoId?: string) => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('multas')
                .select('*')
                .order('data_multa', { ascending: false });

            if (veiculoId) {
                query = query.eq('veiculo_id', veiculoId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            const multasList = data || [];
            setMultas(multasList);
            setStats(calculateStats(multasList));
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar multas'));
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMultasByStatus = useCallback(async (status: StatusMulta): Promise<Multa[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('multas')
                .select('*')
                .eq('status', status)
                .order('data_multa', { ascending: false });

            if (fetchError) throw fetchError;
            return data || [];
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar multas'));
            return [];
        }
    }, []);

    const getMulta = useCallback(async (id: string): Promise<Multa | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('multas')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            return data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar multa'));
            return null;
        }
    }, []);

    const createMulta = useCallback(async (multa: MultaInsert): Promise<Multa | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('multas')
                .insert(multa)
                .select()
                .single();

            if (insertError) throw insertError;

            if (data) {
                const newMultas = [data, ...multas];
                setMultas(newMultas);
                setStats(calculateStats(newMultas));
            }

            return data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao criar multa'));
            return null;
        } finally {
            setLoading(false);
        }
    }, [multas]);

    const updateMulta = useCallback(async (id: string, updates: MultaUpdate): Promise<Multa | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: updateError } = await supabase
                .from('multas')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            if (data) {
                const newMultas = multas.map(m => m.id === id ? data : m);
                setMultas(newMultas);
                setStats(calculateStats(newMultas));
            }

            return data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao atualizar multa'));
            return null;
        } finally {
            setLoading(false);
        }
    }, [multas]);

    const deleteMulta = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const { error: deleteError } = await supabase
                .from('multas')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            const newMultas = multas.filter(m => m.id !== id);
            setMultas(newMultas);
            setStats(calculateStats(newMultas));

            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao deletar multa'));
            return false;
        } finally {
            setLoading(false);
        }
    }, [multas]);

    const searchMultas = useCallback(async (query: string): Promise<Multa[]> => {
        try {
            const { data, error: searchError } = await supabase
                .from('multas')
                .select('*')
                .or(`codigo_infracao.ilike.%${query}%,descricao.ilike.%${query}%,numero_auto.ilike.%${query}%`)
                .order('data_multa', { ascending: false });

            if (searchError) throw searchError;
            return data || [];
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar multas'));
            return [];
        }
    }, []);

    return {
        multas,
        loading,
        error,
        stats,
        fetchMultas,
        fetchMultasByStatus,
        getMulta,
        createMulta,
        updateMulta,
        deleteMulta,
        searchMultas,
    };
}

export default useMultas;
