import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import ModalContratarPlano from './ModalContratarPlano';

export default function Planos() {
  const { currentOrganization, refreshOrganizations } = useOrganization();
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
  const [solicitacaoPendente, setSolicitacaoPendente] = useState<any | null>(null);
  const [modalPlano, setModalPlano] = useState<any | null>(null);

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

    async function fetchSolicitacaoPendente() {
      if (!currentOrganization?.id) return;
      try {
        const { data } = await (supabase as any)
          .from('solicitacoes_plano')
          .select('*, planos(nome)')
          .eq('organization_id', currentOrganization.id)
          .eq('status', 'pendente')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setSolicitacaoPendente(data || null);
      } catch (err) {
        console.error('Erro ao buscar solicitação pendente de plano:', err);
      }
    }

    fetchPlans();
    fetchSolicitacaoPendente();
  }, [currentOrganization?.id]);

  const getPrice = (plan: any) => {
    if (billingCycle === 'anual' && plan.preco_anual > 0) return plan.preco_anual;
    return plan.preco_mensal;
  };

  const getMonthlyEquivalent = (plan: any) => {
    if (billingCycle === 'anual' && plan.preco_anual > 0) return plan.preco_anual / 12;
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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const buildFeatures = (plan: any): { text: string; highlight?: boolean }[] => {
    const features: { text: string; highlight?: boolean }[] = [];

    if (plan.limite_clientes) {
      features.push({ text: `Até ${plan.limite_clientes} clientes` });
    } else {
      features.push({ text: 'Clientes ilimitados' });
    }

    if (plan.limite_usuarios) {
      features.push({ text: `${plan.limite_usuarios} usuário${plan.limite_usuarios > 1 ? 's' : ''}` });
    }

    if (plan.recursos_ia_inclusos > 0) {
      features.push({ text: `${plan.recursos_ia_inclusos} Recursos IA grátis/mês`, highlight: true });
      features.push({ text: `Excedente R$ ${formatCurrency(plan.preco_recurso_ia)}/un` });
    } else {
      features.push({ text: `Geração de Recursos IA: R$ ${formatCurrency(plan.preco_recurso_ia)}/un` });
    }

    features.push({ text: `Rastreamento PF Mensal: R$ ${formatCurrency(plan.rastreamento_mensal_pf_preco || 15)}` });
    features.push({ text: `Rastreamento Frota Mensal: R$ ${formatCurrency(plan.rastreamento_mensal_frota_preco || 10)}` });
    features.push({ text: `Editais: R$ ${formatCurrency(plan.preco_edital)}/contato` });

    if (plan.acesso_crm) features.push({ text: 'CRM + IA incluído', highlight: true });
    if (plan.acesso_disparador) features.push({ text: 'Disparador incluído', highlight: true });

    return features;
  };

  const isCurrentPlan = (plan: any) => currentOrganization?.plano === plan.slug;
  const isPending = (plan: any) => solicitacaoPendente?.plano_slug === plan.slug;

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

        {/* Banner de solicitação pendente */}
        {solicitacaoPendente && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
            <i className="ri-time-line text-amber-600 text-2xl flex-shrink-0"></i>
            <div>
              <p className="font-semibold text-amber-800">Solicitação de plano pendente de aprovação</p>
              <p className="text-sm text-amber-700">
                Você solicitou o plano <strong>{solicitacaoPendente.plano_nome}</strong> ({solicitacaoPendente.ciclo}) por <strong>R$ {Number(solicitacaoPendente.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>. Aguarde a aprovação do administrador.
              </p>
            </div>
          </div>
        )}

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
                ECONOMIA
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const savings = getSavingsPercent(plan);
            const isPopular = plan.slug === 'top' || plan.slug === 'intermediario';
            const isFree = plan.preco_mensal === 0;
            const isCurrent = isCurrentPlan(plan);
            const hasPending = isPending(plan);
            const price = getPrice(plan);

            return (
              <div
                key={plan.id}
                className={`bg-card rounded-xl shadow-lg p-6 border-2 transition-all relative flex flex-col ${
                  isCurrent
                    ? 'border-green-500 ring-2 ring-green-500/20'
                    : isPopular && !isFree
                      ? 'border-primary ring-2 ring-primary/20 scale-105'
                      : 'border-border hover:border-primary/50'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm">
                      ✓ Plano Atual
                    </span>
                  </div>
                )}

                {!isCurrent && isPopular && !isFree && (
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

                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-foreground mb-2">{plan.nome}</h2>

                  <div className="flex items-baseline justify-center mb-1">
                    <span className="text-4xl font-bold text-foreground">
                      R$ {Number(price).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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

                <div className="space-y-2.5 mb-8 flex-grow">
                  {buildFeatures(plan).map((feat, i) => (
                    <div key={i} className="flex items-start text-sm">
                      <i className={`ri-checkbox-circle-line mr-2 flex-shrink-0 mt-0.5 ${feat.highlight ? 'text-primary' : 'text-green-500'}`}></i>
                      <span className={feat.highlight ? 'text-foreground font-medium' : 'text-muted-foreground'}>{feat.text}</span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-lg font-semibold text-center text-sm bg-green-50 text-green-700 border border-green-200">
                    <i className="ri-check-double-line mr-1"></i> Plano Ativo
                  </div>
                ) : hasPending ? (
                  <div className="w-full py-2.5 rounded-lg font-semibold text-center text-sm bg-amber-50 text-amber-700 border border-amber-200">
                    <i className="ri-time-line mr-1"></i> Aguardando Aprovação
                  </div>
                ) : isFree ? (
                  <div className="w-full py-2.5 rounded-lg font-semibold text-center text-sm bg-muted text-muted-foreground cursor-default">
                    Plano Gratuito
                  </div>
                ) : (
                  <button
                    onClick={() => setModalPlano({ plan, billingCycle })}
                    className={`w-full py-2.5 rounded-lg font-semibold transition-all text-sm cursor-pointer ${
                      isPopular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                    }`}
                  >
                    Contratar {plan.nome}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Nota explicativa */}
        <div className="max-w-2xl mx-auto text-center p-4 bg-muted/50 rounded-xl border border-border">
          <i className="ri-information-line text-primary mr-2"></i>
          <span className="text-sm text-muted-foreground">
            Após enviar o comprovante PIX, o plano será ativado pelo administrador em até 24h. O valor do plano <strong>não é convertido em créditos</strong> — ele desbloqueia recursos e preços especiais do plano escolhido.
          </span>
        </div>
      </div>

      {/* Modal de contratação */}
      {modalPlano && (
        <ModalContratarPlano
          plan={modalPlano.plan}
          billingCycle={modalPlano.billingCycle}
          onClose={() => setModalPlano(null)}
          onSuccess={() => {
            setModalPlano(null);
            // Recarrega solicitação pendente
            if (currentOrganization?.id) {
              (supabase as any)
                .from('solicitacoes_plano')
                .select('*, planos(nome)')
                .eq('organization_id', currentOrganization.id)
                .eq('status', 'pendente')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()
                .then(({ data }: any) => setSolicitacaoPendente(data || null));
            }
          }}
        />
      )}
    </div>
  );
}
