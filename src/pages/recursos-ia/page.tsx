import { useState, useEffect } from 'react';
import { useCurrentPlan } from '../../hooks/useCurrentPlan';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { supabase } from '../../lib/supabase';
import { useWallet } from '../../hooks/useWallet';
import { useNavigate } from 'react-router-dom';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function RecursosIA() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { plan, prices, usage, loading, refresh } = useCurrentPlan();
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [tipoRecurso, setTipoRecurso] = useState('');
  const [placa, setPlaca] = useState('');
  const [tipoMulta, setTipoMulta] = useState('');
  const [descricao, setDescricao] = useState('');
  const [modalAssinatura, setModalAssinatura] = useState(false);
  const { balance, deductCredits, checkBalance } = useWallet();
  const navigate = useNavigate();
  const [confirmacaoCompra, setConfirmacaoCompra] = useState<{ valor: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGerarRecurso = async (ignorarConfirmacao = false) => {
    if (!currentOrganization) return;

    // Verificar se é pago
    const isFree = (prices?.ia === 0) || (prices && (prices.ia_remaining_free || 0) > 0);
    const custo = prices?.ia || 15.00;

    if (!isFree && !ignorarConfirmacao) {
      setConfirmacaoCompra({ valor: custo });
      return;
    }

    setGerando(true);
    try {
      // Se for pago, deduzir créditos primeiro
      if (!isFree) {
        await deductCredits(
          custo,
          `Geração de Recurso IA: ${placa || 'Sem Placa'}`,
          'ia_generations'
        );
      }

      // Simular delay da IA
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { error } = await supabase
        .from('recursos' as any)
        .insert({
          tipo: tipoRecurso || 'Recurso IA',
          status: 'rascunho',
          instancia: 'defesa_previa',
          conteudo: `Recurso gerado via IA para a placa ${placa}. Situação: ${descricao}`,
          organization_id: currentOrganization.id,
          is_ia: true,
          multa_id: '00000000-0000-0000-0000-000000000000' // Placeholder se não houver multa vinculada
        } as any);

      if (error) throw error;

      setConfirmacaoCompra(null);
      setMostrarResultado(true);
      refresh(); // Atualizar contador de uso
      showToast('Recurso gerado com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao gerar recurso:', err);
      showToast(err.message || 'Erro ao gerar recurso. Verifique seu saldo.', 'error');
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Recursos por IA</h2>
          <p className="text-sm text-gray-600 mt-2">
            Gere defesas especializadas usando inteligência artificial treinada.
            {plan?.slug === 'top' && (
              <span className="ml-1 font-semibold text-blue-600">
                (Seu plano inclui {plan.recursos_ia_inclusos} recursos mensais gratuitos)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-tight">Saldo Global</p>
            <p className="text-xl font-black text-[#1E3A8A] leading-tight font-mono">
              {formatCurrency(balance)}
            </p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="p-3 bg-blue-50 text-[#1E3A8A] rounded-xl hover:bg-blue-100 transition-all cursor-pointer group shadow-sm border border-blue-100"
            title="Adicionar Créditos"
          >
            <i className="ri-add-circle-line text-xl group-hover:scale-110 transition-transform"></i>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-history-line mr-2"></i>
            Histórico
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-file-download-line mr-2"></i>
            Modelos
          </button>
        </div>
      </div>

      {/* Informativo sobre a IA */}
      <div className="bg-gradient-to-br from-blue-600 to-[#1E3A8A] rounded-lg shadow-xl p-6 text-white">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-brain-line text-4xl text-white"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3">Inteligência Artificial de Alta Performance</h3>
            <p className="text-blue-100 text-sm mb-4 leading-relaxed">
              Nossa IA foi treinada com mais de 5 anos de conteúdo especializado em recursos de trânsito,
              garantindo argumentação sólida e atualizada para cada caso.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="ri-file-list-3-line text-2xl text-white"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">+7.000</p>
                    <p className="text-xs text-blue-100">Recursos Deferidos</p>
                  </div>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Base de dados com mais de 7 mil recursos deferidos, proporcionando vasta jurisprudência
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="ri-calendar-check-line text-2xl text-white"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">+5 Anos</p>
                    <p className="text-xs text-blue-100">de Conteúdo</p>
                  </div>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Acumulado de conhecimento especializado em legislação de trânsito
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="ri-refresh-line text-2xl text-white"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Atualizado</p>
                    <p className="text-xs text-blue-100">Constantemente</p>
                  </div>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Acesso às mais recentes resoluções e portarias do CONTRAN
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-start space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <i className="ri-shield-check-line text-xl text-green-300 flex-shrink-0 mt-0.5"></i>
                <p className="text-sm text-blue-100 leading-relaxed">
                  <strong className="text-white">Custo por Geração:</strong> {(prices?.ia === 0) ? 'GRÁTIS (Plano Inclusivo)' : formatCurrency(prices?.ia || 0)}
                </p>
              </div>

              {plan?.slug === 'top' && (
                <div className="flex-1 flex items-start space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <i className="ri-focus-3-line text-xl text-yellow-300 flex-shrink-0 mt-0.5"></i>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    <strong className="text-white">Saldo Mensal:</strong> {usage.ia_used_this_month} de {plan.recursos_ia_inclusos} usados
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center">
              <i className="ri-robot-line text-2xl text-white"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Gerador Automático de Recursos</h3>
              <p className="text-sm text-gray-600">Preencha os dados da multa para gerar o recurso</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Recurso</label>
              <select
                value={tipoRecurso}
                onChange={(e) => setTipoRecurso(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
              >
                <option value="">Selecione o tipo de recurso</option>
                <option value="infracao">Recurso de Infração de Trânsito</option>
                <option value="suspensivo">Recurso de Processo Suspensivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Placa do Veículo</label>
              <input
                type="text"
                placeholder="Ex: ABC-1234"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Multa</label>
              <select
                value={tipoMulta}
                onChange={(e) => setTipoMulta(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
              >
                <option value="">Selecione o tipo</option>
                <option value="5169">5169 - Dirigir sob efeito de substância que cause dependência</option>
                <option value="7579">7579 - Forçar passagem entre veículos em sentidos opostos</option>
                <option value="5797">5797 - Estacionar em desacordo com a regulamentação</option>
                <option value="5274">5274 - Manobras perigosas (arrancada brusca, derrapagem ou frenagem)</option>
                <option value="5240">5240 - Disputar corrida (racha)</option>
                <option value="5266">5266 - Participar em competição ou evento sem permissão</option>
                <option value="5290">5290 - Deixar de adotar providências para evitar perigo no trânsito</option>
                <option value="7617">7617 - Interromper ou perturbar a circulação da via sem autorização</option>
                <option value="7471">7471 - Transitar em velocidade superior à máxima em mais de 50%</option>
                <option value="5029">5029 - Dirigir veículo com CNH ou PPD cassada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição da Situação</label>
              <textarea
                placeholder="Descreva os detalhes da multa, local, horário, circunstâncias e qualquer informação relevante para o recurso..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">Quanto mais detalhes você fornecer, melhor será o recurso gerado</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data da Infração</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor da Multa</label>
                <input
                  type="text"
                  placeholder="R$ 0,00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                onClick={() => handleGerarRecurso()}
                disabled={gerando}
                className="flex-1 px-6 py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gerando ? (
                  <>
                    <i className="ri-loader-4-line mr-2 animate-spin"></i>
                    Gerando Recurso...
                  </>
                ) : (
                  <>
                    <i className="ri-magic-line mr-2"></i>
                    Gerar Recurso Automático
                  </>
                )}
              </button>
              <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Seção de Assinatura - Plano Rastreamento + Recurso Garantido */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#1E3A8A] rounded-full flex items-center justify-center">
              <i className="ri-shield-star-line text-2xl text-white"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Plano Rastreamento + Recurso Garantido</h3>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Contrate o rastreamento mensal do seu veículo e tenha <strong className="text-gray-800">todos os recursos completamente gratuitos</strong> enquanto o rastreamento estiver ativo.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <i className="ri-information-line text-[#1E3A8A] text-lg mt-0.5"></i>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Benefícios Inclusos:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <i className="ri-check-line text-[#10B981] mr-2 mt-0.5"></i>
                    <span>Rastreamento em tempo real de infrações</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-[#10B981] mr-2 mt-0.5"></i>
                    <span><strong>Recursos ilimitados e gratuitos</strong> durante o período ativo</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-[#10B981] mr-2 mt-0.5"></i>
                    <span>Notificações automáticas de novas multas</span>
                  </li>
                  <li className="flex items-start">
                    <i className="ri-check-line text-[#10B981] mr-2 mt-0.5"></i>
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <i className="ri-time-line text-yellow-600 text-lg mt-0.5"></i>
              <p className="text-sm text-gray-700">
                <strong className="text-gray-800">Fidelidade de 12 meses:</strong> Este plano possui contrato de fidelidade de 12 meses
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalAssinatura(true)}
            className="w-full px-6 py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-shield-check-line mr-2"></i>
            Assinar Agora
          </button>
        </div>
      </div>

      {mostrarResultado && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recurso Gerado</h3>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-edit-line mr-2"></i>
                Editar
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-file-copy-line mr-2"></i>
                Copiar
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                {tipoRecurso === 'suspensivo' ? 'RECURSO DE PROCESSO SUSPENSIVO' : 'RECURSO DE MULTA DE TRÂNSITO'}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Excelentíssimo Senhor Presidente da JARI,
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>RECORRENTE:</strong> [Nome do Proprietário]<br />
                <strong>VEÍCULO:</strong> Placa {placa || 'ABC-1234'}<br />
                <strong>AUTO DE INFRAÇÃO:</strong> [Número do Auto]<br />
                <strong>DATA DA INFRAÇÃO:</strong> [Data]
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Vem, respeitosamente, à presença de Vossa Excelência, por meio de seu procurador infra-assinado,
                apresentar RECURSO contra o Auto de Infração supracitado, pelos motivos de fato e de direito a seguir expostos:
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">DOS FATOS</h5>
              <p className="text-sm text-gray-700 leading-relaxed">
                {tipoRecurso === 'suspensivo' ? (
                  <>
                    O recorrente foi notificado de processo de suspensão do direito de dirigir.
                    Contudo, conforme será demonstrado, o processo não observou os requisitos legais necessários
                    para sua validade, havendo vícios que ensejam sua nulidade.
                  </>
                ) : (
                  <>
                    O recorrente foi autuado por suposta infração de trânsito referente a {tipoMulta || 'excesso de velocidade'}.
                    Contudo, conforme será demonstrado, a autuação não observou os requisitos legais necessários para sua validade.
                  </>
                )}
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">DO DIREITO</h5>
              <p className="text-sm text-gray-700 leading-relaxed">
                {tipoRecurso === 'suspensivo' ? (
                  <>
                    Nos termos do artigo 265 do Código de Trânsito Brasileiro, a suspensão do direito de dirigir
                    será aplicada quando o infrator atingir a contagem de 20 pontos no período de 12 meses.
                    Contudo, é necessário que todas as infrações que geraram a pontuação sejam válidas e tenham
                    observado o devido processo legal.
                  </>
                ) : (
                  <>
                    Nos termos do artigo 280 do Código de Trânsito Brasileiro, o auto de infração deverá conter,
                    obrigatoriamente, todos os elementos essenciais para caracterização da infração. A ausência ou
                    incorreção de qualquer desses elementos enseja a nulidade do auto.
                  </>
                )}
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">DO PEDIDO</h5>
              <p className="text-sm text-gray-700 leading-relaxed">
                {tipoRecurso === 'suspensivo' ? (
                  <>
                    Diante do exposto, requer-se o provimento do presente recurso para que seja declarada a nulidade
                    do processo de suspensão ou, subsidiariamente, o cancelamento da penalidade de suspensão do
                    direito de dirigir.
                  </>
                ) : (
                  <>
                    Diante do exposto, requer-se o provimento do presente recurso para que seja declarada a nulidade
                    do Auto de Infração ou, subsidiariamente, o cancelamento da penalidade aplicada.
                  </>
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Termos em que,<br />
                Pede deferimento.
              </p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-700">
                [Cidade], [Data]<br />
                [Nome do Advogado]<br />
                OAB/[UF] [Número]
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                <i className="ri-information-line text-white"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Recurso pronto para envio</p>
                <p className="text-xs text-gray-600">Revise o conteúdo antes de enviar para assinatura</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-send-plane-line mr-2"></i>
              Enviar para Assinatura
            </button>
          </div>
        </div>
      )}

      {/* Estatísticas e Recursos Recentes - Movidos para baixo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-[#10B981] mt-1">87%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="ri-trophy-line text-2xl text-[#10B981]"></i>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recursos Gerados</p>
                  <p className="text-2xl font-bold text-[#1E3A8A] mt-1">456</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-file-text-line text-2xl text-[#1E3A8A]"></i>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Análise</p>
                  <p className="text-2xl font-bold text-[#F59E0B] mt-1">23</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <i className="ri-time-line text-2xl text-[#F59E0B]"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recursos Recentes</h3>
          <div className="space-y-3">
            {[
              { placa: 'ABC-1234', tipo: '5169 - Dirigir sob efeito', status: 'Aprovado', cor: 'green' },
              { placa: 'DEF-5678', tipo: '5797 - Estacionamento', status: 'Em análise', cor: 'yellow' },
              { placa: 'GHI-9012', tipo: '5274 - Manobras perigosas', status: 'Aprovado', cor: 'green' },
              { placa: 'JKL-3456', tipo: '5240 - Disputar corrida', status: 'Negado', cor: 'red' },
            ].map((recurso, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{recurso.placa}</p>
                    <p className="text-xs text-gray-600">{recurso.tipo}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${recurso.cor === 'green' ? 'bg-green-100 text-[#10B981]' :
                    recurso.cor === 'yellow' ? 'bg-yellow-100 text-[#F59E0B]' :
                      'bg-red-100 text-[#EF4444]'
                    }`}>
                    {recurso.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Assinatura */}
      {modalAssinatura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Assinar Rastreamento + Recurso Garantido</h3>
              <button
                onClick={() => setModalAssinatura(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-[#1E3A8A] rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-information-line text-white text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Como Funciona</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <i className="ri-checkbox-circle-fill text-[#10B981] mr-2 mt-0.5"></i>
                        <span>Rastreamos automaticamente as infrações do veículo em tempo real</span>
                      </li>
                      <li className="flex items-start">
                        <i className="ri-checkbox-circle-fill text-[#10B981] mr-2 mt-0.5"></i>
                        <span><strong>Todos os recursos são completamente gratuitos</strong> enquanto o rastreamento estiver ativo</span>
                      </li>
                      <li className="flex items-start">
                        <i className="ri-checkbox-circle-fill text-[#10B981] mr-2 mt-0.5"></i>
                        <span>Sem limite de recursos - gere quantos precisar sem custo adicional</span>
                      </li>
                      <li className="flex items-start">
                        <i className="ri-alert-fill text-yellow-600 mr-2 mt-0.5"></i>
                        <span><strong>Fidelidade de 12 meses:</strong> Este plano possui contrato de fidelidade de 12 meses</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Escolha seu Plano</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-[#1E3A8A] transition-all cursor-pointer">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600 mb-2">Plano Start</p>
                      <div className="flex items-baseline justify-center mb-3">
                        <span className="text-3xl font-bold text-gray-800">R$ 75</span>
                        <span className="text-gray-600 ml-1">/mês</span>
                      </div>
                      <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap">
                        Selecionar
                      </button>
                    </div>
                  </div>

                  <div className="border-2 border-[#1E3A8A] rounded-lg p-4 bg-blue-50 cursor-pointer">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600 mb-2">Plano Basic</p>
                      <div className="flex items-baseline justify-center mb-3">
                        <span className="text-3xl font-bold text-gray-800">R$ 50</span>
                        <span className="text-gray-600 ml-1">/mês</span>
                      </div>
                      <button className="w-full px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                        Selecionar
                      </button>
                    </div>
                  </div>

                  <div className="border-2 border-gray-300 rounded-lg p-4 hover:border-[#1E3A8A] transition-all cursor-pointer">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600 mb-2">Plano Premium</p>
                      <div className="flex items-baseline justify-center mb-3">
                        <span className="text-3xl font-bold text-gray-800">R$ 40</span>
                        <span className="text-gray-600 ml-1">/mês</span>
                      </div>
                      <button className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap">
                        Selecionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Dados do Veículo</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Placa do Veículo *</label>
                    <input
                      type="text"
                      placeholder="ABC-1234"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                      <input
                        type="text"
                        placeholder="Seu nome completo"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
                      <input
                        type="email"
                        placeholder="email@exemplo.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <i className="ri-gift-line text-[#10B981] mr-2"></i>
                  Benefício Exclusivo
                </h4>
                <p className="text-sm text-gray-700">
                  <strong>Recursos Ilimitados e Gratuitos:</strong> Enquanto seu rastreamento estiver ativo,
                  você pode gerar quantos recursos precisar sem nenhum custo adicional!
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setModalAssinatura(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button className="px-6 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-check-line mr-2"></i>
                  Confirmar Assinatura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Confirmação de Compra */}
      {confirmacaoCompra && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="p-8 border-b border-gray-100 bg-gray-50/30">
              <h3 className="text-2xl font-black text-gray-900 leading-tight">Confirmar Geração</h3>
              <p className="text-sm text-gray-500 font-medium">Você atingiu o limite de gerações gratuitas do seu plano.</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Serviço</span>
                  <span className="text-sm font-bold text-blue-900">IA especializada em Trânsito</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black text-gray-900 leading-none">
                  <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Preço</span>
                  <span className="text-[#10B981]">{formatCurrency(confirmacaoCompra.valor)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seu Saldo Atual</p>
                  <p className={`text-lg font-black ${balance >= confirmacaoCompra.valor ? 'text-gray-900' : 'text-red-500'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
                {balance < confirmacaoCompra.valor && (
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg border border-red-100 uppercase tracking-widest">
                    Saldo Insuficiente
                  </span>
                )}
              </div>

              {balance < confirmacaoCompra.valor ? (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                  <i className="ri-error-warning-line text-red-500 text-xl"></i>
                  <p className="text-xs text-red-700 font-medium leading-relaxed">
                    Você não possui saldo suficiente para esta geração. Faça uma recarga rápida para continuar.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                  <i className="ri-checkbox-circle-line text-green-500 text-xl"></i>
                  <p className="text-xs text-green-700 font-medium leading-relaxed">
                    Compra segura com débito direto do seu saldo em conta.
                  </p>
                </div>
              )}
            </div>

            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-3">
              {balance >= confirmacaoCompra.valor ? (
                <button
                  onClick={() => handleGerarRecurso(true)}
                  disabled={gerando}
                  className="w-full py-4 bg-[#10B981] text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-600 transition-all cursor-pointer uppercase tracking-widest active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                  {gerando ? (
                    <i className="ri-loader-4-line animate-spin text-xl"></i>
                  ) : (
                    'Confirmar e Gerar'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-[#1E3A8A] text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-900 transition-all cursor-pointer uppercase tracking-widest active:scale-95"
                >
                  Adicionar Créditos
                </button>
              )}
              <button
                onClick={() => setConfirmacaoCompra(null)}
                disabled={gerando}
                className="w-full py-4 text-gray-400 font-black hover:text-gray-600 transition-all cursor-pointer uppercase tracking-widest text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[110] px-6 py-3 rounded-lg shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
          <i className={`${toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} mr-2`}></i>
          {toast.message}
        </div>
      )}
    </div>
  );
}