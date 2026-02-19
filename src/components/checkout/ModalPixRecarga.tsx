import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { gerarPayloadPix } from '@/utils/pixUtils';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ModalPixRecargaProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const VALORES_RAPIDOS = [50, 100, 200, 500];

export function ModalPixRecarga({ onClose, onSuccess }: ModalPixRecargaProps) {
  const { getSetting } = useSystemSettings();
  const { currentOrganization, refreshOrganizations } = useOrganization();
  const { user } = useAuth();
  
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null);
  const [valorCustom, setValorCustom] = useState('');
  const [etapa, setEtapa] = useState<'selecao' | 'qrcode' | 'confirmado'>('selecao');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [payloadPix, setPayloadPix] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [carregandoQr, setCarregandoQr] = useState(false);
  const [confirmandoManual, setConfirmandoManual] = useState(false);

  const valorFinal = valorSelecionado ?? (parseFloat(valorCustom.replace(',', '.')) || 0);

  const tiposChave: Record<string, string> = {
    cpf: 'CPF', cnpj: 'CNPJ', email: 'E-mail', telefone: 'Telefone', aleatoria: 'Chave aleatória'
  };

  const pixChave = getSetting('pix_chave');
  const pixNome = getSetting('pix_nome_recebedor') || 'Central da Multa';
  const pixCidade = getSetting('pix_cidade') || 'Sao Paulo';
  const pixBanco = getSetting('pix_banco') || '';
  const pixTipo = getSetting('pix_tipo_chave') || 'aleatoria';

  const gerarQrCode = useCallback(async () => {
    if (!pixChave || valorFinal <= 0) return;

    setCarregandoQr(true);
    try {
      const txid = `CDM${Date.now().toString(36).toUpperCase()}`;
      const payload = gerarPayloadPix({
        chave: pixChave,
        nome: pixNome,
        cidade: pixCidade,
        valor: valorFinal,
        txid,
        descricao: 'Recarga Central da Multa',
      });

      setPayloadPix(payload);
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: { dark: '#1E3A8A', light: '#FFFFFF' },
      });
      setQrCodeDataUrl(dataUrl);
      setEtapa('qrcode');
    } catch (err) {
      console.error('Erro ao gerar QR Code PIX:', err);
    } finally {
      setCarregandoQr(false);
    }
  }, [pixChave, pixNome, pixCidade, valorFinal]);

  const copiarCodigo = async () => {
    await navigator.clipboard.writeText(payloadPix);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  // Confirmar crédito manualmente (simulação — em produção usar webhook)
  const confirmarPagamentoManual = async () => {
    if (!currentOrganization || !user) return;
    setConfirmandoManual(true);
    try {
      // Deduz saldo (crédito pago)
      const novoSaldo = (currentOrganization.saldo_sacavel || 0) + valorFinal;
      await supabase
        .from('organizations')
        .update({ saldo_sacavel: novoSaldo })
        .eq('id', currentOrganization.id);

      // Registra no faturamento
      await supabase.from('faturamento').insert({
        organization_id: currentOrganization.id,
        descricao: `Recarga via PIX — R$ ${valorFinal.toFixed(2).replace('.', ',')}`,
        valor: valorFinal,
        status: 'paid',
        tipo: 'credit_purchase',
        metodo_pagamento: 'pix',
        data_pagamento: new Date().toISOString().split('T')[0],
      });

      await refreshOrganizations();
      setEtapa('confirmado');
      onSuccess?.();
    } catch (err) {
      console.error('Erro ao confirmar pagamento:', err);
    } finally {
      setConfirmandoManual(false);
    }
  };

  const handleValorCustomChange = (v: string) => {
    setValorSelecionado(null);
    setValorCustom(v.replace(/[^0-9,]/g, ''));
  };

  const pixConfigurado = !!pixChave && !!pixNome && !!pixCidade;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-gray-900">
              {etapa === 'selecao' && 'Adicionar Créditos'}
              {etapa === 'qrcode' && 'QR Code PIX'}
              {etapa === 'confirmado' && 'Pagamento Confirmado!'}
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {etapa === 'selecao' && 'Créditos liberados após confirmação do PIX'}
              {etapa === 'qrcode' && `R$ ${valorFinal.toFixed(2).replace('.', ',')} · ${pixBanco || 'PIX'}`}
              {etapa === 'confirmado' && 'Saldo atualizado com sucesso'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors text-gray-400"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Etapa: Seleção de valor */}
        {etapa === 'selecao' && (
          <div className="p-6 space-y-6">
            {!pixConfigurado && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 flex gap-2">
                <i className="ri-alert-line mt-0.5 shrink-0"></i>
                <span>Dados de PIX não configurados. Acesse <strong>Super Admin → Configurações → PIX</strong> para configurar.</span>
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

            <button
              onClick={gerarQrCode}
              disabled={carregandoQr || valorFinal <= 0 || !pixConfigurado}
              className="w-full py-4 bg-[#1E3A8A] text-white rounded-2xl font-black shadow-lg hover:bg-blue-800 hover:-translate-y-0.5 transition-all cursor-pointer uppercase tracking-widest active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {carregandoQr ? (
                <><i className="ri-loader-4-line animate-spin"></i> Gerando QR Code...</>
              ) : (
                <><i className="ri-qr-code-line text-lg"></i> Gerar QR Code PIX</>
              )}
            </button>
          </div>
        )}

        {/* Etapa: QR Code */}
        {etapa === 'qrcode' && (
          <div className="p-6 space-y-5">
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
                <p className="text-2xl font-black text-[#1E3A8A]">R$ {valorFinal.toFixed(2).replace('.', ',')}</p>
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

            <div className="space-y-2">
              {/* Botão de confirmação manual (admin/teste) */}
              <button
                onClick={confirmarPagamentoManual}
                disabled={confirmandoManual}
                className="w-full py-4 bg-[#10B981] text-white rounded-2xl font-black shadow-lg hover:bg-green-600 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {confirmandoManual ? (
                  <><i className="ri-loader-4-line animate-spin"></i> Confirmando...</>
                ) : (
                  <><i className="ri-check-double-line text-lg"></i> Já realizei o pagamento</>
                )}
              </button>
              <button
                onClick={() => setEtapa('selecao')}
                className="w-full py-2 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
              >
                ← Voltar e alterar valor
              </button>
            </div>
          </div>
        )}

        {/* Etapa: Confirmado */}
        {etapa === 'confirmado' && (
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-check-double-line text-4xl text-green-600"></i>
            </div>
            <div>
              <h4 className="text-xl font-black text-gray-900">Créditos Adicionados!</h4>
              <p className="text-gray-500 text-sm mt-1">
                <span className="font-bold text-green-600">R$ {valorFinal.toFixed(2).replace('.', ',')}</span> adicionados ao seu saldo.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 bg-[#1E3A8A] text-white rounded-2xl font-black hover:bg-blue-800 transition-all"
            >
              Concluir
            </button>
          </div>
        )}

        {etapa !== 'confirmado' && (
          <div className="px-6 pb-4 text-center">
            <p className="text-[10px] text-gray-300 font-black tracking-widest uppercase">
              Segurança garantida · PIX Banco Central do Brasil
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
