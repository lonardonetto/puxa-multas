import { useMemo } from 'react';
import type { Faturamento } from '../types/database';

export function useFinancialSummary(billing: Faturamento[]) {
    return useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const currentMonthBilling = billing.filter(item => {
            const date = new Date(item.created_at);
            return date >= startOfMonth;
        });

        const receitaMes = currentMonthBilling
            .filter(item => item.valor > 0 && item.status === 'paid')
            .reduce((acc, item) => acc + item.valor, 0);

        const despesasMes = currentMonthBilling
            .filter(item => item.valor < 0 && item.status === 'paid')
            .reduce((acc, item) => acc + Math.abs(item.valor), 0);

        const lucroLiquido = receitaMes - despesasMes;

        // Simplified comparison logic (can be expanded if previous month data is available)
        const tendenciaReceita = 12; // Placeholder
        const tendenciaDespesa = -5; // Placeholder
        const tendenciaLucro = 18;   // Placeholder

        return {
            receitaMes,
            despesasMes,
            lucroLiquido,
            tendenciaReceita,
            tendenciaDespesa,
            tendenciaLucro
        };
    }, [billing]);
}
