import { useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { gerarPayloadPix } from '@/utils/pixUtils';
import { supabase } from '../../lib/supabase';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { ModalAguardandoInfinitePay } from '@/components/checkout/ModalAguardandoInfinitePay';


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

  const [etapa, setEtapa] = useState<'info' | 'qrcode'>('info');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [payloadPix, setPayloadPix] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [gerandoLinkCard, setGerandoLinkCard] = useState(false);
  const [infinitePayModal, setInfinitePayModal] = useState<{
    url: string; orderNsu: string; solicitacaoId: string;
  } | null>(null);

  const valor = billingCycle === 'anual' && plan.preco_anual > 0 ? plan.preco_anual : plan.preco_mensal;
  const valorFormatado = Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const pixChave = getSetting('pix_chave');
  const pixNome = getSetting('pix_nome_recebedor') || 'Central da Multa';
  const pixCidade = getSetting('pix_cidade') || 'Sao Paulo';
  const pixBanco = getSetting('pix_banco') || '';
  const pixTipo = getSetting('pix_tipo_chave') || 'aleatoria';
  const infiniteTag = getSetting('infinitepay_tag') || '';

  const tiposChave: Record<string, string> = {
    cpf: 'CPF', cnpj: 'CNPJ', email: 'E-mail', telefone: 'Telefone', aleatoria: 'Chave aleatória'
  };

  const pixConfigurado = !!pixChave && !!pixNome && !!pixCidade;
  const infinitePayConfigurado = !!infiniteTag;

  const gerarQrCode = useCallback(async () => {
    if (!pixChave || !currentOrganization || !user) return;
    setGerando(true);
    try {
      const txid = `PLN${Date.now().toString(36).toUpperCase()}`;
      const payload = gerarPayloadPix({
        chave: pixChave,
        nome: pixNome,
        cidade: pixCidade,
        valor: Number(valor),
        txid,
        descricao: `Plano ${plan.nome} ${billingCycle}`,
      });

      setPayloadPix(payload);
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: { dark: '#1E3A8A', light: '#FFFFFF' },
      });
      setQrCodeDataUrl(dataUrl);

      // Criar solicitação no banco
      const { data: solData, error: solError } = await (supabase as any)
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

      if (!solError && solData?.[0]?.id) {
        const solId = solData[0].id;

        // Notificação para o Super Admin
        await (supabase as any).from('notificacoes_recarga').insert({
          organization_id: currentOrganization.id,
          solicitacao_id: solId,
          tipo: 'plano_pendente',
          titulo: `Nova solicitação de plano: ${plan.nome}`,
          mensagem: `${currentOrganization.nome} solicitou o plano ${plan.nome} (${billingCycle}) por R$ ${valorFormatado}.`,
          valor,
          para_super_admin: true,
        });

        // Notificação para o usuário
        await (supabase as any).from('notificacoes_recarga').insert({
          organization_id: currentOrganization.id,
          solicitacao_id: solId,
          tipo: 'plano_pendente',
          titulo: `Solicitação do plano ${plan.nome} recebida`,
          mensagem: `Sua solicitação está aguardando aprovação. O plano será ativado em até 24h.`,
          valor,
          para_super_admin: false,
        });
      }

      setEtapa('qrcode');
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
      toast.error('Erro ao gerar QR Code. Tente novamente.');
    } finally {
      setGerando(false);
    }
  }, [pixChave, pixNome, pixCidade, valor, plan, billingCycle, currentOrganization, user, valorFormatado]);

  const copiarCodigo = async () => {
    await navigator.clipboard.writeText(payloadPix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const gerarLinkInfinitePay = useCallback(async () => {
    if (!currentOrganization || !user) return;
    setGerandoLinkCard(true);
    try {
      const orderNsu = `PLN${Date.now().toString(36).toUpperCase()}`;

      // Criar solicitação no banco
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
        throw new Error(data?.error || 'Erro ao gerar link de pagamento');
      }

      // Abre o checkout embutido em modal (iframe)
      setInfinitePayModal({ url: data.link, orderNsu, solicitacaoId: solId || '' });
    } catch (err: any) {
      console.error('InfinitePay error:', err);
      toast.error(err.message || 'Erro ao gerar link InfinitePay. Tente novamente.');
    } finally {
      setGerandoLinkCard(false);
    }
  }, [currentOrganization, user, valor, plan, billingCycle, valorFormatado]);

  const confirmarPagamento = async () => {
    if (!currentOrganization || !user) return;
    setConfirmando(true);
    try {
      // Enviar email de confirmação
      try {
        await supabase.functions.invoke('enviar-email', {
          body: {
            tipo: 'plano_solicitado',
            destinatario_email: user.email,
            destinatario_nome: (user as any).nome || user.email,
            dados: {
              plano_nome: plan.nome,
              ciclo: billingCycle,
              valor,
              organizacao: currentOrganization.nome,
              chave_pix: pixChave,
            },
          },
        });
      } catch (_) {}

      toast.success('Solicitação enviada! Aguarde a aprovação do administrador.');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao confirmar. Tente novamente.');
    } finally {
      setConfirmando(false);
    }
  };

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
              {etapa === 'info' ? `Contratar Plano ${plan.nome}` : 'QR Code PIX'}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {etapa === 'info'
                ? `Ciclo ${billingCycle}`
                : `R$ ${valorFormatado} · Plano ${plan.nome} ${billingCycle}`}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors text-gray-400">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* ETAPA 1: Info + botão gerar QR */}
          {etapa === 'info' && (
            <>
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

              {!loadingSettings && !pixConfigurado && !infinitePayConfigurado && (
                <p className="text-center text-xs text-amber-600 font-medium">
                  Pagamento via PIX temporariamente indisponível. Entre em contato com o suporte.
                </p>
              )}

              <button
                onClick={gerarQrCode}
                disabled={gerando || loadingSettings || !pixConfigurado}
                className="w-full py-4 bg-[#1E3A8A] text-white rounded-2xl font-black shadow-lg hover:bg-blue-800 hover:-translate-y-0.5 transition-all cursor-pointer uppercase tracking-widest active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {gerando ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Gerando QR Code...</>
                ) : (
                  <><i className="ri-qr-code-line text-lg"></i> Gerar QR Code PIX</>
                )}
              </button>

              {/* InfinitePay: Cartão ou PIX */}
              {infinitePayConfigurado && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-100"></div>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">ou</span>
                    <div className="flex-1 h-px bg-gray-100"></div>
                  </div>

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
            </>
          )}

          {/* ETAPA 2: QR Code */}
          {etapa === 'qrcode' && (
            <>
              {/* Dados do recebedor */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-bank-line text-green-600"></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recebedor</p>
                  <p className="text-sm font-bold text-gray-800">{pixNome}</p>
                  <p className="text-xs text-gray-500">{tiposChave[pixTipo] || 'PIX'}: {pixChave}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                {qrCodeDataUrl ? (
                  <div className="p-4 border-2 border-blue-100 rounded-2xl bg-white shadow-sm">
                    <img src={qrCodeDataUrl} alt="QR Code PIX" className="w-52 h-52" />
                  </div>
                ) : (
                  <div className="w-52 h-52 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <i className="ri-loader-4-line text-3xl text-gray-400 animate-spin"></i>
                  </div>
                )}
                <div className="mt-3 text-center">
                  <p className="text-2xl font-black text-[#1E3A8A]">R$ {valorFormatado}</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">Escaneie com o app do seu banco</p>
                </div>
              </div>

              {/* Copiar código */}
              <button
                onClick={copiarCodigo}
                className={`w-full py-3 border-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  copiado
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {copiado ? (
                  <><i className="ri-check-line"></i> Código copiado!</>
                ) : (
                  <><i className="ri-file-copy-line"></i> Copiar código Pix Copia e Cola</>
                )}
              </button>

              {/* Aviso */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <i className="ri-information-line text-amber-600 flex-shrink-0 mt-0.5"></i>
                <p className="text-xs text-amber-700">
                  Após pagar, clique em <strong>"Já paguei"</strong>. O administrador irá verificar e ativar seu plano em até 24h. O valor <strong>não entra como crédito</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={confirmarPagamento}
                  disabled={confirmando}
                  className="w-full py-4 bg-[#10B981] text-white rounded-2xl font-black shadow-lg hover:bg-green-600 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {confirmando ? (
                    <><i className="ri-loader-4-line animate-spin"></i> Enviando...</>
                  ) : (
                    <><i className="ri-check-double-line text-lg"></i> Já paguei — confirmar solicitação</>
                  )}
                </button>
                <button
                  onClick={() => setEtapa('info')}
                  className="w-full py-2 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  ← Voltar
                </button>
              </div>
            </>
          )}

          <p className="text-center text-[10px] text-gray-300 font-black tracking-widest uppercase">
            Segurança garantida · PIX Banco Central do Brasil
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

