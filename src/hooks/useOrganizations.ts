import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Organization, OrganizationInsert, OrganizationUpdate } from '../types/database';

interface UseOrganizationsReturn {
    organizations: Organization[];
    loading: boolean;
    error: Error | null;
    fetchOrganizations: () => Promise<void>;
    getOrganization: (id: string) => Promise<Organization | null>;
    createOrganization: (organization: OrganizationInsert) => Promise<Organization | null>;
    updateOrganization: (id: string, updates: OrganizationUpdate) => Promise<Organization | null>;
    deleteOrganization: (id: string) => Promise<boolean>;
}

export function useOrganizations(): UseOrganizationsReturn {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchOrganizations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('organizations')
                .select('*')
                .order('nome');

            if (fetchError) throw fetchError;
            setOrganizations(data || []);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar organizações'));
        } finally {
            setLoading(false);
        }
    }, []);

    const getOrganization = useCallback(async (id: string): Promise<Organization | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            return data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar organização'));
            return null;
        }
    }, []);

    const createOrganization = useCallback(async (organization: OrganizationInsert): Promise<Organization | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: insertError } = await supabase
                .from('organizations')
                .insert(organization as any)
                .select()
                .single();

            if (insertError) throw insertError;

            if (data) {
                setOrganizations(prev => [data, ...prev]);
            }

            return data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao criar organização'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateOrganization = useCallback(async (id: string, updates: OrganizationUpdate): Promise<Organization | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: updateError } = await supabase
                .from('organizations')
                .update({ ...updates, updated_at: new Date().toISOString() } as any)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            if (data) {
                setOrganizations(prev => prev.map(o => o.id === id ? data : o));
            }

            return data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao atualizar organização'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteOrganization = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const { error: deleteError } = await supabase
                .from('organizations')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setOrganizations(prev => prev.filter(o => o.id !== id));

            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao deletar organização'));
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        organizations,
        loading,
        error,
        fetchOrganizations,
        getOrganization,
        createOrganization,
        updateOrganization,
        deleteOrganization,
    };
}

export default useOrganizations;
