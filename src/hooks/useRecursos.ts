import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Recurso, RecursoInsert, RecursoUpdate, StatusRecurso, InstanciaRecurso } from '../types/database';

interface UseRecursosReturn {
    recursos: any[];
    loading: boolean;
    error: Error | null;
    fetchRecursos: (multaId?: string) => Promise<void>;
    fetchRecursosByStatus: (status: StatusRecurso) => Promise<Recurso[]>;
    fetchRecursosAguardandoNotificacao: (diasLimite?: number) => Promise<Recurso[]>;
    getRecurso: (id: string) => Promise<Recurso | null>;
    createRecurso: (recurso: RecursoInsert) => Promise<Recurso | null>;
    updateRecurso: (id: string, updates: RecursoUpdate) => Promise<Recurso | null>;
    deleteRecurso: (id: string) => Promise<boolean>;
    atualizarNotificacao: (id: string) => Promise<Recurso | null>;
    fetchRecursosDetalhados: () => Promise<any[]>;
}

export function useRecursos(): UseRecursosReturn {
    const [recursos, setRecursos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchRecursos = useCallback(async (multaId?: string) => {
        setLoading(true);
        setError(null);
        try {
            let query = supabase
                .from('recursos')
                .select('*')
                .order('created_at', { ascending: false });

            if (multaId) {
                query = query.eq('multa_id', multaId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setRecursos(data || []);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar recursos'));
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRecursosByStatus = useCallback(async (status: StatusRecurso): Promise<Recurso[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('recursos')
                .select('*')
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            return data || [];
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar recursos'));
            return [];
        }
    }, []);

    const fetchRecursosAguardandoNotificacao = useCallback(async (diasLimite: number = 7): Promise<Recurso[]> => {
        try {
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - diasLimite);

            const { data, error: fetchError } = await supabase
                .from('recursos')
                .select('*')
                .eq('status', 'aguardando_julgamento')
                .lt('data_ultima_notificacao', dataLimite.toISOString())
                .order('data_ultima_notificacao', { ascending: true });

            if (fetchError) throw fetchError;
            return data || [];
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar recursos para notificação'));
            return [];
        }
    }, []);

    const getRecurso = useCallback(async (id: string): Promise<Recurso | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('recursos')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            return data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar recurso'));
            return null;
        }
    }, []);

    const createRecurso = useCallback(async (recurso: RecursoInsert): Promise<Recurso | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await (supabase
                .from('recursos') as any)
                .insert(recurso)
                .select()
                .single();

            if (insertError) throw insertError;

            if (data) {
                setRecursos(prev => [data, ...prev]);
            }

            return data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao criar recurso'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateRecurso = useCallback(async (id: string, updates: RecursoUpdate): Promise<Recurso | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: updateError } = await ((supabase as any)
                .from('contratos')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single());

            if (updateError) throw updateError;

            if (data) {
                const updated = data as any;
                setRecursos(prev => prev.map(r => r.id === id ? { ...r, status: updated.status, updated_at: updated.updated_at } : r));
            }

            return data as any;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao atualizar recurso'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteRecurso = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const { error: deleteError } = await supabase
                .from('recursos')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setRecursos(prev => prev.filter(r => r.id !== id));

            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao deletar recurso'));
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const atualizarNotificacao = useCallback(async (id: string): Promise<Recurso | null> => {
        try {
            const { data, error: updateError } = await ((supabase as any)
                .from('contratos')
                .update({ data_ultima_notificacao: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single());

            if (updateError) throw updateError;

            if (data) {
                const updated = data as any;
                setRecursos(prev => prev.map(r =>
                    r.id === id ? { ...r, data_ultima_notificacao: updated.data_ultima_notificacao } : r
                ));
            }
            return data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao atualizar notificação'));
            console.error('Erro ao atualizar notificação:', err);
            return null;
        }
    }, []);

    const fetchRecursosDetalhados = useCallback(async (): Promise<any[]> => {
        setLoading(true);
        setError(null);
        try {
            // Buscamos de contratos que estão em estados de processamento
            const { data, error: fetchError } = await (supabase
                .from('contratos' as any)
                .select(`
                    *,
                    servicos (nome),
                    clientes!inner (*),
                    organizations (intervalo_notificacao)
                `)
                .eq('clientes.ativo', true)
                .in('status', ['aguardando_julgamento', 'deferido', 'indeferido'])
                .order('created_at', { ascending: false }));

            if (fetchError) throw fetchError;

            // Mapeamos contratos para o formato esperado pelo componente de recursos
            const recursosMapeados = (data || []).map((c: any) => ({
                id: c.id,
                status: c.status,
                data_protocolo: c.data_protocolo || c.created_at,
                data_ultima_notificacao: c.data_ultima_notificacao,
                tipo: c.servicos?.nome || 'Serviço de Trânsito',
                instancia: c.fase_ait || 'N/A',
                multas: {
                    numero_auto: c.auto_infracao,
                    descricao: c.penalidades || '',
                    veiculos: {
                        placa: '---',
                        clientes: c.clientes
                    }
                },
                intervalo_notificacao: c.intervalo_notificacao || c.organizations?.intervalo_notificacao || 7
            }));

            setRecursos(recursosMapeados);
            return recursosMapeados; // Return the mapped data
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar recursos detalhados'));
            return []; // Return empty array on error
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        recursos,
        loading,
        error,
        fetchRecursos,
        fetchRecursosByStatus,
        fetchRecursosAguardandoNotificacao,
        getRecurso,
        createRecurso,
        updateRecurso,
        deleteRecurso,
        atualizarNotificacao,
        fetchRecursosDetalhados,
    };
}

export default useRecursos;
