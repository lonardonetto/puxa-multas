import { useState, useCallback } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ModalAguardandoInfinitePay } from './ModalAguardandoInfinitePay';

interface ModalPixRecargaProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const VALORES_RAPIDOS = [50, 100, 200, 500];

export function ModalPixRecarga({ onClose, onSuccess }: ModalPixRecargaProps) {
  const { getSetting, loading: loadingSettings } = useSystemSettings();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null);
  const [valorCustom, setValorCustom] = useState('');
  const [gerandoLinkCard, setGerandoLinkCard] = useState(false);
  const [infinitePayModal, setInfinitePayModal] = useState<{
    url: string; orderNsu: string; solicitacaoId: string;
  } | null>(null);

  const valorFinal = valorSelecionado ?? (parseFloat(valorCustom.replace(',', '.')) || 0);

  const infiniteTag = getSetting('infinitepay_tag') || '';
  const infinitePayConfigurado = !!infiniteTag;

  const gerarLinkInfinitePay = useCallback(async () => {
    if (!currentOrganization || !user || valorFinal <= 0) return;

    const popupWindow = window.open('about:blank', '_blank');

    setGerandoLinkCard(true);
    try {
      const orderNsu = `CDM${Date.now().toString(36).toUpperCase()}`;

      const { data: solData } = await (supabase as any)
        .from('solicitacoes_recarga')
        .insert({
          organization_id: currentOrganization.id,
          user_id: user.id,
          valor: valorFinal,
          status: 'pendente',
          metodo_pagamento: 'cartao_infinitepay',
          observacao: `order_nsu: ${orderNsu}`,
        })
        .select()
        .limit(1);

      const solId = solData?.[0]?.id;

      if (solId) {
        await (supabase as any).from('notificacoes_recarga').insert({
          organization_id: currentOrganization.id,
          solicitacao_id: solId,
          tipo: 'pix_pendente',
          titulo: `Nova recarga — ${currentOrganization.nome}`,
          mensagem: `Recarga de R$ ${valorFinal.toFixed(2).replace('.', ',')} via cartão/PIX InfinitePay iniciada.`,
          valor: valorFinal,
          para_super_admin: true,
        });
      }

      const { data, error } = await supabase.functions.invoke('infinitepay-checkout', {
        body: {
          action: 'create_link',
          valor: valorFinal,
          descricao: `Recarga Central da Multa — ${currentOrganization.nome}`,
          order_nsu: orderNsu,
          solicitacao_id: solId || '',
          tipo: 'recarga',
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
  }, [currentOrganization, user, valorFinal]);

  const handleValorCustomChange = (v: string) => {
    setValorSelecionado(null);
    setValorCustom(v.replace(/[^0-9,]/g, ''));
  };

  return (
    <>
    {infinitePayModal && (
      <ModalAguardandoInfinitePay
        checkoutUrl={infinitePayModal.url}
        orderNsu={infinitePayModal.orderNsu}
        solicitacaoId={infinitePayModal.solicitacaoId}
        tipo="recarga"
        valor={valorFinal}
        onClose={() => setInfinitePayModal(null)}
        onSuccess={() => { onSuccess?.(); onClose(); }}
      />
    )}
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-900">Adicionar Créditos</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Pagamento via Cartão ou PIX · Confirmação automática
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors text-gray-400"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loadingSettings && (
            <div className="flex items-center justify-center py-2 gap-2 text-gray-400 text-sm">
              <i className="ri-loader-4-line animate-spin"></i>
              <span>Carregando dados de pagamento...</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {VALORES_RAPIDOS.map(v => (
              <button
                key={v}
                onClick={() => { setValorSelecionado(v); setValorCustom(''); }}
                className={`py-4 border-2 rounded-2xl font-black transition-all cursor-pointer active:scale-95 group ${
                  valorSelecionado === v
                    ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                    : 'border-gray-100 text-gray-600 hover:border-[#1E3A8A] hover:text-[#1E3A8A] hover:bg-blue-50/30'
                }`}
              >
                <p className="text-[10px] font-bold text-gray-400 group-hover:text-blue-400 uppercase tracking-widest mb-1">Valor</p>
                <p className="text-xl">R$ {v}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Ou digite outro valor</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-300 text-xl font-mono">R$</span>
              <input
                type="text"
                value={valorCustom}
                onChange={e => handleValorCustomChange(e.target.value)}
                placeholder="0,00"
                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-2xl font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          {infinitePayConfigurado ? (
            <>
              <button
                onClick={gerarLinkInfinitePay}
                disabled={gerandoLinkCard || valorFinal <= 0 || loadingSettings}
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
          ) : (
            <p className="text-center text-xs text-amber-600 font-medium">
              Pagamento temporariamente indisponível. Entre em contato com o suporte.
            </p>
          )}
        </div>

        <div className="px-6 pb-4 text-center">
          <p className="text-[10px] text-gray-300 font-black tracking-widest uppercase">
            Segurança garantida · Pagamento automatizado
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
