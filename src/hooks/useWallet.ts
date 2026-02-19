import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';

export function useWallet() {
    const { currentOrganization, refreshOrganizations } = useOrganization();
    const { user } = useAuth();

    const checkBalance = useCallback((amount: number) => {
        if (!currentOrganization) return false;
        const totalBalance = (currentOrganization.saldo_sacavel || 0) + (currentOrganization.saldo_bonus || 0);
        return totalBalance >= amount;
    }, [currentOrganization]);

    const deductCredits = useCallback(async (amount: number, description: string, _category: string = 'consumo') => {
        if (!currentOrganization || !user) throw new Error('Organização ou usuário não identificado');

        const saldoSacavel = currentOrganization.saldo_sacavel || 0;
        const saldoBonus = currentOrganization.saldo_bonus || 0;
        const totalBalance = saldoSacavel + saldoBonus;

        if (totalBalance < amount) {
            throw new Error('Saldo insuficiente para realizar esta operação');
        }

        // Lógica de dedução: Primeiro usa o bônus, depois o saldo disponível
        let deductionFromBonus = 0;
        let deductionFromSacavel = 0;

        if (saldoBonus >= amount) {
            deductionFromBonus = amount;
        } else {
            deductionFromBonus = saldoBonus;
            deductionFromSacavel = amount - saldoBonus;
        }

        const { error: updateError } = await supabase
            .from('organizations')
            .update({
                saldo_sacavel: saldoSacavel - deductionFromSacavel,
                saldo_bonus: saldoBonus - deductionFromBonus
            })
            .eq('id', currentOrganization.id);

        if (updateError) throw updateError;

        // Registrar no faturamento (extrato) - usando apenas colunas que existem
        const { error: billingError } = await supabase
            .from('faturamento')
            .insert({
                organization_id: currentOrganization.id,
                descricao: description,
                valor: -amount, // Valor negativo, representa dedução/consumo
                status: 'paid',
                tipo: 'system_usage',
                metodo_pagamento: 'balance',
                data_pagamento: new Date().toISOString().split('T')[0]
            });

        if (billingError) {
            console.error('Erro ao registrar extrato:', billingError);
            // Não lançamos erro aqui para não travar a experiência do usuário
        }

        await refreshOrganizations();
        return true;
    }, [currentOrganization, user, refreshOrganizations]);

    return {
        balance: (currentOrganization?.saldo_sacavel || 0) + (currentOrganization?.saldo_bonus || 0),
        saldoDisponivel: currentOrganization?.saldo_sacavel || 0,
        saldoBonus: currentOrganization?.saldo_bonus || 0,
        checkBalance,
        deductCredits
    };
}
