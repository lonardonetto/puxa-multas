import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModalInfinitePayCheckoutProps {
  checkoutUrl: string;
  orderNsu: string;
  solicitacaoId: string;
  tipo: 'recarga' | 'plano';
  valor: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalInfinitePayCheckout({
  checkoutUrl,
  orderNsu,
  solicitacaoId,
  tipo,
  valor,
  onClose,
  onSuccess,
}: ModalInfinitePayCheckoutProps) {
  const [status, setStatus] = useState<'aguardando' | 'pago' | 'erro'>('aguardando');
  const [verificando, setVerificando] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tentativasRef = useRef(0);
  const MAX_TENTATIVAS = 30; // ~5 minutos (10s cada)

  const verificarPagamento = useCallback(async () => {
    if (tentativasRef.current >= MAX_TENTATIVAS) {
      clearInterval(intervalRef.current!);
      return;
    }
    tentativasRef.current++;
    setVerificando(true);

    try {
      const { data } = await supabase.functions.invoke('infinitepay-checkout', {
        body: {
          action: 'check_and_approve',
          order_nsu: orderNsu,
          solicitacao_id: solicitacaoId,
          tipo,
        },
      });

      if (data?.paid) {
        clearInterval(intervalRef.current!);
        setStatus('pago');
        toast.success('Pagamento confirmado! ✅');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2500);
      }
    } catch (err) {
      console.warn('Erro ao verificar pagamento:', err);
    } finally {
      setVerificando(false);
    }
  }, [orderNsu, solicitacaoId, tipo, onSuccess, onClose]);

  useEffect(() => {
    // Aguarda 15s antes de começar a verificar (tempo do usuário preencher)
    const startDelay = setTimeout(() => {
      intervalRef.current = setInterval(verificarPagamento, 10000);
    }, 15000);

    return () => {
      clearTimeout(startDelay);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [verificarPagamento]);

  const handleVerificarManual = () => {
    tentativasRef.current = 0; // reset tentativas
    verificarPagamento();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col" style={{ height: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <i className="ri-bank-card-line text-emerald-600"></i>
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">Pagamento Seguro — InfinitePay</h2>
              <p className="text-xs text-gray-500">
                R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} · Cartão de crédito ou PIX
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status badge */}
            {status === 'aguardando' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Aguardando pagamento
              </div>
            )}
            {status === 'pago' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-bold text-green-700">
                <i className="ri-check-double-line"></i>
                Pagamento confirmado!
              </div>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors text-gray-400"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* Sucesso overlay */}
        {status === 'pago' && (
          <div className="flex-1 flex items-center justify-center bg-green-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-double-line text-4xl text-green-600"></i>
              </div>
              <h3 className="text-2xl font-black text-green-700 mb-2">Pagamento Confirmado!</h3>
              <p className="text-gray-500 text-sm">
                {tipo === 'recarga'
                  ? 'Seus créditos estão sendo liberados...'
                  : 'Seu plano está sendo ativado...'}
              </p>
            </div>
          </div>
        )}

        {/* Iframe */}
        {status !== 'pago' && (
          <div className="flex-1 relative">
            <iframe
              src={checkoutUrl}
              className="w-full h-full border-0"
              title="Checkout InfinitePay"
              allow="payment"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        )}

        {/* Footer */}
        {status === 'aguardando' && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex-shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <i className="ri-shield-check-line text-green-500"></i>
              Pagamento criptografado e seguro · InfinitePay
            </div>
            <button
              onClick={handleVerificarManual}
              disabled={verificando}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {verificando
                ? <><i className="ri-loader-4-line animate-spin"></i> Verificando...</>
                : <><i className="ri-refresh-line"></i> Já paguei — verificar</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
