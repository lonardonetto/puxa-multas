import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemSetting {
    id: string;
    key: string;
    value: string | null;
    description: string | null;
    is_secret: boolean;
}

export function useSystemSettings() {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await (supabase
                .from('system_settings') as any)
                .select('*');

            if (fetchError) throw fetchError;

            setSettings((data || []) as SystemSetting[]);
        } catch (err: any) {
            console.error('Error fetching system settings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSetting = async (key: string, value: string) => {
        try {
            const { error: upsertError } = await (supabase
                .from('system_settings') as any)
                .upsert(
                    { key, value, updated_at: new Date().toISOString() },
                    { onConflict: 'key' }
                );

            if (upsertError) throw upsertError;

            setSettings(prev => {
                const exists = prev.find(s => s.key === key);
                if (exists) {
                    return prev.map(s => s.key === key ? { ...s, value } : s);
                }
                return [...prev, { id: key, key, value, description: null, is_secret: false }];
            });

            return { success: true };
        } catch (err: any) {
            console.error('Error upserting setting:', err);
            return { success: false, error: err.message };
        }
    };

    const getSetting = (key: string): string | null => {
        const setting = settings.find(s => s.key === key);
        return setting?.value || null;
    };

    return {
        settings,
        loading,
        error,
        updateSetting,
        getSetting,
        refetch: fetchSettings
    };
}
