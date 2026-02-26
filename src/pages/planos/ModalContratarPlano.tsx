import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { ModalAguardandoInfinitePay } from '@/components/checkout/ModalAguardandoInfinitePay';
import { useWallet } from '@/hooks/useWallet';

interface Props {
  plan: any;
  billingCycle: 'mensal' | 'anual';
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalContratarPlano({ plan, billingCycle, onClose, onSuccess }: Props) {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const { getSetting, loading: loadingSettings } = useSystemSettings();
  const { balance, checkBalance } = useWallet();

  const [gerandoLinkCard, setGerandoLinkCard] = useState(false);
  const [pagandoCreditos, setPagandoCreditos] = useState(false);
  const [infinitePayModal, setInfinitePayModal] = useState<{
    url: string; orderNsu: string; solicitacaoId: string;
  } | null>(null);

  const valor = billingCycle === 'anual' && plan.preco_anual > 0 ? plan.preco_anual : plan.preco_mensal;
  const valorFormatado = Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const infiniteTag = getSetting('infinitepay_tag') || '';
  const infinitePayConfigurado = !!infiniteTag;

  const gerarLinkInfinitePay = useCallback(async () => {
    if (!currentOrganization || !user) return;

    const popupWindow = window.open('about:blank', '_blank');

    setGerandoLinkCard(true);
    try {
      const orderNsu = `PLN${Date.now().toString(36).toUpperCase()}`;

      const { data: solData } = await (supabase as any)
        .from('solicitacoes_plano')
        .insert({
          organization_id: currentOrganization.id,
          user_id: user.id,
          plano_id: plan.id,
          plano_slug: plan.slug,
          plano_nome: plan.nome,
          ciclo: billingCycle,
          valor,
          status: 'pendente',
        })
        .select()
        .limit(1);

      const solId = solData?.[0]?.id;

      if (solId) {
        await (supabase as any).from('notificacoes_recarga').insert({
          organization_id: currentOrganization.id,
          solicitacao_id: solId,
          tipo: 'plano_pendente',
          titulo: `Nova solicitação de plano via cartão: ${plan.nome}`,
          mensagem: `${currentOrganization.nome} iniciou pagamento do plano ${plan.nome} (${billingCycle}) por R$ ${valorFormatado}.`,
          valor,
          para_super_admin: true,
        });
      }

      const { data, error } = await supabase.functions.invoke('infinitepay-checkout', {
        body: {
          action: 'create_link',
          valor: Number(valor),
          descricao: `Plano ${plan.nome} ${billingCycle} — ${currentOrganization.nome}`,
          order_nsu: orderNsu,
          solicitacao_id: solId || '',
          tipo: 'plano',
        },
      });

      if (error || !data?.link) {
        if (popupWindow) popupWindow.close();
        throw new Error(data?.error || 'Erro ao gerar link de pagamento');
      }

      if (popupWindow) {
        popupWindow.location.href = data.link;
      } else {
        window.open(data.link, '_blank');
      }

      setInfinitePayModal({ url: data.link, orderNsu, solicitacaoId: solId || '' });
    } catch (err: any) {
      console.error('InfinitePay error:', err);
      toast.error(err.message || 'Erro ao gerar link InfinitePay. Tente novamente.');
    } finally {
      setGerandoLinkCard(false);
    }
  }, [currentOrganization, user, valor, plan, billingCycle, valorFormatado]);

  const pagarComCreditos = useCallback(async () => {
    if (!currentOrganization || !user) return;
    if (!checkBalance(Number(valor))) {
      toast.error('Saldo insuficiente. Adicione créditos antes de contratar o plano.');
      return;
    }
    setPagandoCreditos(true);
    try {
      const { data, error } = await supabase.functions.invoke('infinitepay-checkout', {
        body: {
          action: 'pagar_plano_creditos',
          organization_id: currentOrganization.id,
          user_id: user.id,
          plano_id: plan.id,
          plano_slug: plan.slug,
          plano_nome: plan.nome,
          ciclo: billingCycle,
          valor: Number(valor),
        },
      });

      if (error || !data?.success) throw new Error(data?.error || 'Erro ao processar pagamento');

      toast.success(`Plano ${plan.nome} ativado com seus créditos! 🎉`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao pagar com créditos.');
    } finally {
      setPagandoCreditos(false);
    }
  }, [currentOrganization, user, plan, billingCycle, valor, checkBalance, onSuccess, onClose]);

  return (
    <>
    {infinitePayModal && (
      <ModalAguardandoInfinitePay
        checkoutUrl={infinitePayModal.url}
        orderNsu={infinitePayModal.orderNsu}
        solicitacaoId={infinitePayModal.solicitacaoId}
        tipo="plano"
        valor={Number(valor)}
        onClose={() => setInfinitePayModal(null)}
        onSuccess={() => { onSuccess(); onClose(); }}
      />
    )}
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Contratar Plano {plan.nome}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Ciclo {billingCycle}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors text-gray-400">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Valor */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-widest">Valor a pagar</p>
            <p className="text-3xl font-black text-primary">R$ {valorFormatado}</p>
            <p className="text-xs text-muted-foreground mt-1">/{billingCycle}</p>
          </div>

          {/* Aviso */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <i className="ri-information-line text-amber-600 flex-shrink-0 mt-0.5"></i>
            <p className="text-xs text-amber-700">
              O pagamento ativa os benefícios do plano escolhido. O valor <strong>não entra como crédito</strong> — ele ativa os benefícios do plano escolhido.
            </p>
          </div>

          {/* InfinitePay: Cartão ou PIX */}
          {infinitePayConfigurado && (
            <>
              <button
                onClick={gerarLinkInfinitePay}
                disabled={gerandoLinkCard || loadingSettings}
                className="w-full py-4 bg-[#00C88C] text-white rounded-2xl font-black shadow-lg hover:bg-emerald-600 hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {gerandoLinkCard ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Gerando link...</>
                ) : (
                  <>
                    <i className="ri-bank-card-line text-lg"></i>
                    <span>Pagar com Cartão ou PIX</span>
                    <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 font-bold">InfinitePay</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">Crédito em até 12x · Confirmação automática</p>
            </>
          )}

          {/* Pagar com créditos internos */}
          {balance >= Number(valor) && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100"></div>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">ou</span>
                <div className="flex-1 h-px bg-gray-100"></div>
              </div>

              <button
                onClick={pagarComCreditos}
                disabled={pagandoCreditos}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg hover:bg-purple-700 hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {pagandoCreditos ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Processando...</>
                ) : (
                  <>
                    <i className="ri-wallet-3-line text-lg"></i>
                    <span>Pagar com Créditos</span>
                    <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 font-bold">
                      R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} disponível
                    </span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">Ativação instantânea · Sem burocracia</p>
            </>
          )}

          {!loadingSettings && !infinitePayConfigurado && balance < Number(valor) && (
            <p className="text-center text-xs text-amber-600 font-medium">
              Pagamento temporariamente indisponível. Entre em contato com o suporte.
            </p>
          )}

          <p className="text-center text-[10px] text-gray-300 font-black tracking-widest uppercase">
            Segurança garantida · Pagamento automatizado
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
