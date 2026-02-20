import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type Status = 'verificando' | 'aprovado' | 'pendente' | 'erro';

export default function PagamentoConfirmadoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('verificando');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const orderNsu = searchParams.get('order_nsu');
    const transactionNsu = searchParams.get('transaction_nsu');
    const solicitacaoId = searchParams.get('sol_id');
    const tipo = (searchParams.get('tipo') as 'recarga' | 'plano') || 'recarga';

    if (!orderNsu || !solicitacaoId) {
      setStatus('erro');
      setMensagem('Parâmetros de pagamento inválidos.');
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('infinitepay-checkout', {
          body: {
            action: 'check_and_approve',
            order_nsu: orderNsu,
            transaction_nsu: transactionNsu,
            solicitacao_id: solicitacaoId,
            tipo,
          },
        });

        if (error) throw new Error(error.message);

        if (data?.approved || data?.paid) {
          setStatus('aprovado');
          setMensagem(
            tipo === 'recarga'
              ? 'Seu saldo foi creditado na conta!'
              : 'Seu plano foi ativado com sucesso!'
          );
          // Redireciona para o app após 4 segundos
          setTimeout(() => navigate('/'), 4000);
        } else {
          setStatus('pendente');
          setMensagem('Pagamento ainda sendo processado. Aguarde alguns instantes.');
          setTimeout(() => navigate('/'), 5000);
        }
      } catch (err: any) {
        console.error('Erro ao confirmar pagamento:', err);
        setStatus('pendente');
        setMensagem('Não conseguimos confirmar automaticamente. Nossa equipe verificará em breve.');
        setTimeout(() => navigate('/'), 6000);
      }
    })();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-10 text-center">

        {/* Ícone animado */}
        {status === 'verificando' && (
          <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <i className="ri-loader-4-line text-3xl text-blue-500 animate-spin"></i>
          </div>
        )}
        {status === 'aprovado' && (
          <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-double-line text-3xl text-green-600"></i>
          </div>
        )}
        {status === 'pendente' && (
          <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-200 flex items-center justify-center mx-auto mb-6">
            <i className="ri-time-line text-3xl text-amber-500"></i>
          </div>
        )}
        {status === 'erro' && (
          <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-3xl text-red-500"></i>
          </div>
        )}

        {/* Título */}
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {status === 'verificando' && 'Confirmando pagamento...'}
          {status === 'aprovado' && 'Pagamento confirmado! 🎉'}
          {status === 'pendente' && 'Processando pagamento'}
          {status === 'erro' && 'Ops, algo deu errado'}
        </h1>

        {/* Mensagem */}
        <p className="text-gray-500 text-sm mb-8">
          {status === 'verificando' && 'Aguarde enquanto verificamos seu pagamento com a InfinitePay...'}
          {mensagem}
        </p>

        {/* Progress dots */}
        {(status === 'aprovado' || status === 'pendente') && (
          <p className="text-xs text-gray-400">
            Você será redirecionado automaticamente em alguns segundos...
          </p>
        )}

        {/* Botão manual */}
        {status !== 'verificando' && (
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-3 bg-[#1E3A8A] text-white rounded-2xl font-bold text-sm hover:bg-blue-800 transition-colors"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Voltar ao sistema
          </button>
        )}

        {/* Logo */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-30">
          <i className="ri-shield-check-line text-gray-400"></i>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Pagamento seguro · InfinitePay
          </span>
        </div>
      </div>
    </div>
  );
}
