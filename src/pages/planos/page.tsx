import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Planos() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');

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

  const getPrice = (plan: any) => {
    if (billingCycle === 'anual' && plan.preco_anual > 0) {
      return plan.preco_anual;
    }
    return plan.preco_mensal;
  };

  const getMonthlyEquivalent = (plan: any) => {
    if (billingCycle === 'anual' && plan.preco_anual > 0) {
      return plan.preco_anual / 12;
    }
    return plan.preco_mensal;
  };

  const getSavingsPercent = (plan: any) => {
    if (plan.preco_mensal > 0 && plan.preco_anual > 0) {
      const yearlyIfMonthly = plan.preco_mensal * 12;
      const savings = ((yearlyIfMonthly - plan.preco_anual) / yearlyIfMonthly) * 100;
      return Math.round(savings);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <i className="ri-loader-4-line text-4xl text-primary animate-spin"></i>
          <p className="text-muted-foreground font-medium">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-base text-muted-foreground mb-6">
            Compare nossos planos e encontre a melhor opção para o seu negócio
          </p>

          {/* Toggle Mensal/Anual */}
          <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full p-1.5">
            <button
              onClick={() => setBillingCycle('mensal')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'mensal'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('anual')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'anual'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Anual
              <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const savings = getSavingsPercent(plan);
            const isPopular = plan.slug === 'top';
            const isFree = plan.preco_mensal === 0;

            return (
              <div
                key={plan.id}
                className={`bg-card rounded-xl shadow-lg p-6 border-2 transition-all cursor-pointer relative flex flex-col ${
                  isPopular
                    ? 'border-primary ring-2 ring-primary/20 scale-105'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm">
                      Mais Popular
                    </span>
                  </div>
                )}

                {billingCycle === 'anual' && savings > 0 && !isFree && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      -{savings}%
                    </span>
                  </div>
                )}

                <div className="text-center mb-6 flex-grow">
                  <h2 className="text-xl font-bold text-foreground mb-2">{plan.nome}</h2>
                  
                  <div className="flex items-baseline justify-center mb-1">
                    <span className="text-4xl font-bold text-foreground">
                      R$ {Number(getPrice(plan)).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      /{billingCycle === 'anual' ? 'ano' : 'mês'}
                    </span>
                  </div>

                  {billingCycle === 'anual' && !isFree && (
                    <p className="text-sm text-muted-foreground">
                      equivale a <span className="font-semibold text-primary">R$ {getMonthlyEquivalent(plan).toFixed(0)}</span>/mês
                    </p>
                  )}

                  <p className="text-sm text-muted-foreground mt-3 min-h-[40px]">{plan.descricao}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.recursos && plan.recursos.slice(0, 4).map((rec: string, i: number) => (
                    <div key={i} className="flex items-center text-sm text-muted-foreground">
                      <i className="ri-checkbox-circle-line text-green-500 mr-2 flex-shrink-0"></i>
                      <span className="truncate">{rec}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-2.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer text-sm ${
                    isPopular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : isFree
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                  }`}
                >
                  {isFree ? 'Plano Atual' : `Assinar ${plan.nome}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
