import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';

export interface NotificationAlert {
    id: string;
    contrato_id: string;
    cliente_id: string;
    cliente_nome: string;
    cliente_celular: string;
    servico_nome: string;
    status: string;
    dias_desde_ultimo_checkin: number;
    intervalo_configurado: number;
    data_proximo_lembrete?: string;
    lido: boolean;
    tipo: 'urgente' | 'atencao' | 'normal';
}

export function useNotificationAlerts() {
    const { currentOrganization } = useOrganization();
    const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchAlerts = useCallback(async () => {
        if (!currentOrganization?.id) return;
        setLoading(true);
        setError(null);

        try {
            // 1. Identify and activate new alerts based on scheduled dates
            const now = new Date().toISOString();
            await supabase
                .from('contratos')
                .update({ alerta_ativo: true, lido: false })
                .eq('organization_id', currentOrganization.id)
                .eq('lembrete_ativado', true)
                .eq('alerta_ativo', false)
                .lte('data_proximo_lembrete', now)
                .filter('cliente_id', 'in',
                    supabase
                        .from('clientes')
                        .select('id')
                        .eq('ativo', true)
                );

            // 2. Fetch all currently active alerts for ACTIVE clients
            const { data, error: fetchError } = await supabase
                .from('contratos')
                .select(`
                  id,
                  status,
                  intervalo_notificacao,
                  lembrete_ativado,
                  data_proximo_lembrete,
                  alerta_ativo,
                  lido,
                  last_checkin_notified_at,
                  data_ultima_notificacao,
                  created_at,
                  clientes!inner (id, nome_completo, celular, telefone, ativo),
                  servicos (nome)
                `)
                .eq('organization_id', currentOrganization.id)
                .eq('alerta_ativo', true)
                .eq('clientes.ativo', true)
                .in('status', ['aguardando_julgamento', 'indeferido', 'deferido', 'assinado', 'pendente']);

            if (fetchError) throw fetchError;

            const defaultInterval = currentOrganization.intervalo_notificacao || 7;
            const nowTime = new Date().getTime();

            const calculatedAlerts: NotificationAlert[] = (data || [])
                .map((c: any) => {
                    const nextReminder = c.data_proximo_lembrete ? new Date(c.data_proximo_lembrete) : new Date(c.created_at);
                    const diffTime = nowTime - nextReminder.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const interval = c.intervalo_notificacao || defaultInterval;

                    return {
                        id: c.id,
                        contrato_id: c.id,
                        cliente_id: c.clientes?.id,
                        cliente_nome: c.clientes?.nome_completo,
                        cliente_celular: c.clientes?.celular || c.clientes?.telefone,
                        servico_nome: c.servicos?.nome,
                        status: c.status,
                        dias_desde_ultimo_checkin: Math.max(0, diffDays),
                        intervalo_configurado: interval,
                        data_proximo_lembrete: c.data_proximo_lembrete,
                        lido: !!c.lido,
                        tipo: diffDays >= 3 ? 'urgente' : 'atencao'
                    } as NotificationAlert;
                });

            setAlerts(calculatedAlerts);
        } catch (err) {
            console.error('Error fetching alerts:', err);
            setError(err instanceof Error ? err : new Error('Erro ao buscar alertas'));
        } finally {
            setLoading(false);
        }
    }, [currentOrganization?.id, currentOrganization?.intervalo_notificacao]);

    const markAsCheckedIn = useCallback(async (contratoId: string) => {
        try {
            const { data: contrato, error: getError } = await supabase
                .from('contratos')
                .select('intervalo_notificacao')
                .eq('id', contratoId)
                .single();

            if (getError) throw getError;

            const interval = (contrato as { intervalo_notificacao?: number } | null)?.intervalo_notificacao || currentOrganization?.intervalo_notificacao || 7;
            const nextReminder = new Date(new Date().getTime() + interval * 24 * 60 * 60 * 1000);

            const { error: updateError } = await supabase
                .from('contratos')
                .update({
                    last_checkin_notified_at: new Date().toISOString(),
                    data_ultima_notificacao: new Date().toISOString(),
                    data_proximo_lembrete: nextReminder.toISOString(),
                    lido: true
                })
                .eq('id', contratoId);

            if (updateError) throw updateError;
            await fetchAlerts();
        } catch (err) {
            console.error('Error marking as checked in:', err);
        }
    }, [fetchAlerts, currentOrganization?.intervalo_notificacao]);

    const clearNotifications = useCallback(async () => {
        if (!currentOrganization?.id) return;
        try {
            const { error: clearError } = await supabase
                .from('contratos')
                .update({ alerta_ativo: false, lido: false })
                .eq('organization_id', currentOrganization.id)
                .eq('alerta_ativo', true);

            if (clearError) throw clearError;
            setAlerts([]);
        } catch (err) {
            console.error('Error clearing notifications:', err);
        }
    }, [currentOrganization?.id]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    return { alerts, loading, error, fetchAlerts, markAsCheckedIn, clearNotifications };
}
