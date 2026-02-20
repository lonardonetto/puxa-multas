import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModalAguardandoInfinitePayProps {
  checkoutUrl: string;
  orderNsu: string;
  solicitacaoId: string;
  tipo: 'recarga' | 'plano';
  valor: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalAguardandoInfinitePay({
  checkoutUrl,
  orderNsu,
  solicitacaoId,
  tipo,
  valor,
  onClose,
  onSuccess,
}: ModalAguardandoInfinitePayProps) {
  const [status, setStatus] = useState<'aguardando' | 'pago' | 'verificando'>('aguardando');
  const [verificando, setVerificando] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tentativasRef = useRef(0);
  const MAX_TENTATIVAS = 36; // ~6 minutos

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

      if (data?.paid || data?.approved) {
        clearInterval(intervalRef.current!);
        setStatus('pago');
        toast.success('Pagamento confirmado automaticamente! ✅');
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
    // Abre o link em nova aba automaticamente
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');

    // Começa a verificar após 20s
    const startDelay = setTimeout(() => {
      intervalRef.current = setInterval(verificarPagamento, 10000);
    }, 20000);

    return () => {
      clearTimeout(startDelay);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkoutUrl, verificarPagamento]);

  const handleVerificarManual = () => {
    tentativasRef.current = 0;
    setStatus('verificando');
    verificarPagamento().finally(() => {
      if (status !== 'pago') setStatus('aguardando');
    });
  };

  const handleReabrirLink = () => {
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 text-white text-center">
          {status === 'pago' ? (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <i className="ri-check-double-line text-3xl"></i>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 relative">
              <i className="ri-bank-card-line text-2xl"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-ping absolute"></span>
                <span className="w-2 h-2 rounded-full bg-white"></span>
              </span>
            </div>
          )}
          <h2 className="text-xl font-black">
            {status === 'pago' ? 'Pagamento Confirmado! 🎉' : 'Aguardando pagamento'}
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {status !== 'pago' ? (
            <>
              {/* Instrução */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <i className="ri-information-line text-amber-600 flex-shrink-0 mt-0.5 text-lg"></i>
                <div>
                  <p className="text-sm font-bold text-amber-800 mb-1">Checkout aberto em nova aba</p>
                  <p className="text-xs text-amber-700">
                    Complete o pagamento na aba que abriu. Após pagar, o sistema confirma automaticamente.
                  </p>
                </div>
              </div>

              {/* Progresso automático */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {verificando ? 'Verificando pagamento...' : 'Verificando automaticamente a cada 10 segundos'}
                </p>
              </div>

              {/* Botões */}
              <button
                onClick={handleVerificarManual}
                disabled={verificando}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {verificando ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Verificando...</>
                ) : (
                  <><i className="ri-refresh-line"></i> Já paguei — confirmar agora</>
                )}
              </button>

              <button
                onClick={handleReabrirLink}
                className="w-full py-3 border-2 border-gray-200 rounded-2xl font-bold text-sm text-gray-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <i className="ri-external-link-line"></i>
                Reabrir checkout
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-gray-400 text-xs font-medium hover:text-gray-600 transition-colors"
              >
                Cancelar e fechar
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 text-sm">
                {tipo === 'recarga'
                  ? 'Seus créditos já estão disponíveis na conta!'
                  : 'Seu plano foi ativado com sucesso!'}
              </p>
              <p className="text-xs text-gray-400 mt-2">Fechando automaticamente...</p>
            </div>
          )}

          <p className="text-center text-[10px] text-gray-300 font-black tracking-widest uppercase">
            Pagamento seguro · InfinitePay · Cloudwalk
          </p>
        </div>
      </div>
    </div>
  );
}
