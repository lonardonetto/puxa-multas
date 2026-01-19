import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Planos() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from('planos' as any)
          .select('*')
          .eq('ativo', true)
          .order('preco_mensal', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        console.error('Erro ao buscar planos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin"></i>
          <p className="text-gray-600 font-medium">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-base text-gray-600">
            Compare nossos planos e encontre a melhor opção para o seu negócio
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-[#0D1B2A] rounded-lg shadow-lg p-6 border-2 transition-all cursor-pointer relative flex flex-col ${plan.slug === 'top'
                ? 'border-blue-600 ring-2 ring-blue-500 ring-opacity-10 dark:ring-opacity-40 scale-105'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                }`}
            >
              {plan.slug === 'top' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#F59E0B] text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6 flex-grow">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.nome}</h2>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    R$ {Number(plan.preco_mensal).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/mês</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 min-h-[40px]">{plan.descricao}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.recursos && plan.recursos.slice(0, 4).map((rec: string, i: number) => (
                  <div key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <i className="ri-checkbox-circle-line text-green-500 mr-2 flex-shrink-0"></i>
                    <span className="truncate">{rec}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-2.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer text-sm ${plan.slug === 'top'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : plan.preco_mensal == 0 ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/40'
                  }`}
              >
                {plan.preco_mensal == 0 ? 'Plano Atual' : `Assinar ${plan.nome}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
