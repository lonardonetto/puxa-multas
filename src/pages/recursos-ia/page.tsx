import { useState, useMemo, useEffect } from 'react';
import { useCurrentPlan } from '../../hooks/useCurrentPlan';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { supabase } from '../../lib/supabase';
import { useWallet } from '../../hooks/useWallet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormularioRecurso, { DadosRecurso } from '../../components/recursos/FormularioRecurso';
import VisualizadorRecurso from '../../components/recursos/VisualizadorRecurso';
import AnimacaoGeracaoRecurso from '../../components/recursos/AnimacaoGeracaoRecurso';

// Chave para persistir recurso em edição
const RECURSO_SESSAO_KEY = 'recurso_em_edicao';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function RecursosIA() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { plan, prices, usage, refresh } = useCurrentPlan();
  const { balance, deductCredits } = useWallet();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extrair IDs para vinculação (vindos da página de rastreamento)
  const idsVinculacao = useMemo(() => ({
    multaId: searchParams.get('multaId') || null,
    veiculoId: searchParams.get('veiculoId') || null,
    clienteId: searchParams.get('clienteId') || null,
  }), [searchParams]);
  
  // Extrair dados pré-preenchidos da URL (vindos da página de rastreamento)
  const dadosIniciais = useMemo(() => {
    const placa = searchParams.get('placa');
    const codigoInfracao = searchParams.get('codigoInfracao');
    
    if (!placa && !codigoInfracao) return undefined;
    
    // Tentar parsear endereço do cliente se existir
    let clienteEndereco: any = null;
    try {
      const enderecoParam = searchParams.get('clienteEndereco');
      if (enderecoParam) {
        clienteEndereco = JSON.parse(enderecoParam);
      }
    } catch (e) {
      console.error('Erro ao parsear endereço:', e);
    }
    
    return {
      // Dados do veículo
      placa: searchParams.get('placa') || '',
      modelo: searchParams.get('modelo') || '',
      renavam: searchParams.get('renavam') || '',
      
      // Dados da infração
      codigoInfracao: searchParams.get('codigoInfracao') || '',
      descricaoInfracao: searchParams.get('descricaoInfracao') || '',
      valorMulta: searchParams.get('valorMulta') ? parseFloat(searchParams.get('valorMulta')!) : 0,
      pontos: searchParams.get('pontos') ? parseInt(searchParams.get('pontos')!) : 0,
      gravidade: searchParams.get('gravidade') || '',
      dataInfracao: searchParams.get('dataInfracao') || '',
      horaInfracao: searchParams.get('horaInfracao') || '',
      numeroAuto: searchParams.get('numeroAuto') || '',
      localInfracao: searchParams.get('localInfracao') || '',
      orgaoAutuador: searchParams.get('orgaoAutuador') || '',
      municipio: searchParams.get('municipio') || '',
      ufInfracao: searchParams.get('ufInfracao') || '',
      
      // Dados do cliente/recorrente
      nomeRecorrente: searchParams.get('clienteNome') || '',
      cpfCnpj: searchParams.get('clienteCpf') || searchParams.get('clienteCnpj') || '',
      email: searchParams.get('clienteEmail') || '',
      telefone: searchParams.get('clienteTelefone') || '',
      
      // Endereço do cliente (se disponível)
      endereco: clienteEndereco?.logradouro 
        ? `${clienteEndereco.logradouro}, ${clienteEndereco.numero || 'S/N'}${clienteEndereco.complemento ? ` - ${clienteEndereco.complemento}` : ''}`
        : '',
      cidade: clienteEndereco?.cidade || '',
      estado: clienteEndereco?.estado || searchParams.get('ufInfracao') || '',
      cep: clienteEndereco?.cep || '',
    };
  }, [searchParams]);
  
  const [gerando, setGerando] = useState(false);
  const [animacaoAberta, setAnimacaoAberta] = useState(false);
  const [recursoGerado, setRecursoGerado] = useState<{ conteudo: string; recursoId: string; clienteId?: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmacaoCompra, setConfirmacaoCompra] = useState<{ valor: number; dados: DadosRecurso } | null>(null);
  const [processandoCobranca, setProcessandoCobranca] = useState(false);
  const [etapaCobranca, setEtapaCobranca] = useState<'debitando' | 'confirmado'>('debitando');

  // Recuperar recurso em edição do sessionStorage ao carregar a página
  useEffect(() => {
    const recursoSalvo = sessionStorage.getItem(RECURSO_SESSAO_KEY);
    if (recursoSalvo) {
      try {
        const dados = JSON.parse(recursoSalvo);
        if (dados.conteudo && dados.recursoId) {
          console.log('✅ Recurso recuperado da sessão:', dados.recursoId);
          setRecursoGerado(dados);
        }
      } catch (e) {
        console.error('Erro ao recuperar recurso da sessão:', e);
        sessionStorage.removeItem(RECURSO_SESSAO_KEY);
      }
    }
  }, []);

  // Salvar recurso em edição no sessionStorage sempre que mudar
  useEffect(() => {
    if (recursoGerado) {
      sessionStorage.setItem(RECURSO_SESSAO_KEY, JSON.stringify(recursoGerado));
    }
  }, [recursoGerado]);

  // Limpar sessão ao finalizar/fechar o visualizador
  const handleFecharVisualizador = () => {
    sessionStorage.removeItem(RECURSO_SESSAO_KEY);
    setRecursoGerado(null);
    navigate('/rastreamento');
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGerarRecurso = async (dados: DadosRecurso) => {
    if (!currentOrganization) {
      showToast('Organização não identificada', 'error');
      return;
    }

    // Verificar se o veículo tem placa_protegida (recursos ilimitados)
    let isPlacaProtegida = false;
    if (idsVinculacao.veiculoId) {
      const { data: veiculo } = await supabase
        .from('veiculos')
        .select('rastreamento_tipo')
        .eq('id', idsVinculacao.veiculoId)
        .single();
      
      isPlacaProtegida = veiculo?.rastreamento_tipo === 'placa_protegida';
    }

    // Verificar se é gratuito ou pago
    // Gratuito se: placa_protegida, preço IA = 0, ou tem créditos gratuitos
    const isFree = isPlacaProtegida || (prices?.ia === 0) || (prices && (prices.ia_remaining_free || 0) > 0);
    const custo = prices?.ia || 15.00;

    if (!isFree) {
      setConfirmacaoCompra({ valor: custo, dados });
      return;
    }

    // Executar geração diretamente (animação é mostrada junto)
    await executarGeracao(dados, isFree, custo);
  };

  const executarGeracao = async (dados: DadosRecurso, isFree: boolean, custo: number) => {
    setGerando(true);
    setAnimacaoAberta(true); // Mostrar animação ENQUANTO gera
    setConfirmacaoCompra(null);
    
    try {
      // Se for pago, deduzir créditos primeiro
      if (!isFree) {
        await deductCredits(
          custo,
          `Geração de Recurso IA: ${dados.placa}`,
          'ia_generations'
        );
      }

      // Determinar o cliente_id a ser usado no recurso
      let clienteIdFinal: string | null = null;
      
      // 1. Se veio da URL (rastreamento), usar esse
      if (idsVinculacao.clienteId) {
        clienteIdFinal = idsVinculacao.clienteId;
        console.log('Usando cliente da URL (rastreamento):', clienteIdFinal);
      }
      // 2. Se selecionou um cliente existente no formulário
      else if (dados.clienteId) {
        clienteIdFinal = dados.clienteId;
        console.log('Usando cliente selecionado:', clienteIdFinal);
      }
      // 3. Se marcou para criar novo cliente e tem dados mínimos
      else if (dados.criarNovoCliente && dados.nomeRecorrente && dados.cpfCnpj) {
        console.log('Criando novo cliente...');
        
        // Verificar se já existe cliente com mesmo CPF/CNPJ na organização
        const cpfCnpjLimpo = dados.cpfCnpj.replace(/[^\d]/g, '');
        const isCpf = cpfCnpjLimpo.length <= 11;
        
        const { data: clienteExistente } = await supabase
          .from('clientes')
          .select('id')
          .eq('organization_id', currentOrganization!.id)
          .or(isCpf ? `cpf.eq.${cpfCnpjLimpo}` : `cnpj.eq.${cpfCnpjLimpo}`)
          .limit(1);
        
        if (clienteExistente && clienteExistente.length > 0) {
          // Cliente já existe, usar o existente
          clienteIdFinal = clienteExistente[0].id;
          console.log('Cliente já existia, usando:', clienteIdFinal);
        } else {
          // Criar novo cliente
          const novoCliente: any = {
            organization_id: currentOrganization!.id,
            nome_completo: dados.nomeRecorrente,
            tipo_pessoa: isCpf ? 'fisica' : 'juridica',
            ativo: true,
          };
          
          if (isCpf) {
            novoCliente.cpf = cpfCnpjLimpo;
          } else {
            novoCliente.cnpj = cpfCnpjLimpo;
          }
          
          if (dados.email) novoCliente.email = dados.email;
          if (dados.telefone) novoCliente.celular = dados.telefone;
          
          // Montar endereço se tiver dados
          if (dados.endereco || dados.cidade || dados.estado || dados.cep) {
            novoCliente.endereco = {
              logradouro: dados.endereco || '',
              cidade: dados.cidade || '',
              estado: dados.estado || '',
              cep: dados.cep || '',
            };
          }
          
          const { data: clienteCriado, error: erroCliente } = await supabase
            .from('clientes')
            .insert(novoCliente)
            .select('id')
            .single();
          
          if (erroCliente) {
            console.error('Erro ao criar cliente:', erroCliente);
            // Não vamos parar o fluxo, apenas logamos
          } else {
            clienteIdFinal = clienteCriado.id;
            console.log('Cliente criado com sucesso:', clienteIdFinal);
          }
        }
      }

      // Chamar a edge function
      const { data, error } = await supabase.functions.invoke('generate-recurso', {
        body: {
          dados,
          organizationId: currentOrganization!.id,
        },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao gerar recurso');
      }

      // Salvar recurso no banco com status 'aguardando_julgamento' para aparecer na listagem
      // Incluindo os IDs de vinculação (cliente, veículo, multa)
      const { data: recursoSalvo, error: insertError } = await supabase
        .from('recursos')
        .insert({
          status: 'aguardando_julgamento',
          instancia: dados.tipoRecurso,
          conteudo: data.content,
          organization_id: currentOrganization!.id,
          is_ia: true,
          ait_url: dados.aitBase64 ? `data:image/jpeg;base64,${dados.aitBase64}` : null,
          ait_dados_extraidos: dados.aitBase64 ? dados : null,
          // IDs de vinculação para rastreabilidade - usar cliente_id final (criado ou selecionado)
          cliente_id: clienteIdFinal,
          veiculo_id: idsVinculacao.veiculoId || null,
          multa_id: idsVinculacao.multaId || null,
        } as any)
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao salvar recurso:', insertError);
      } else {
        console.log('Recurso salvo:', recursoSalvo);
        refresh();
      }

      // Fechar animação e MOSTRAR o recurso gerado (SEM abrir impressão)
      console.log('✅ Geração concluída, mostrando visualizador...');
      console.log('RecursoId:', recursoSalvo?.id);
      console.log('ClienteId:', clienteIdFinal);
      setAnimacaoAberta(false);
      setRecursoGerado({ 
        conteudo: data.content, 
        recursoId: recursoSalvo?.id || '',
        clienteId: clienteIdFinal || undefined
      });
      showToast('Recurso gerado com sucesso! Finalize para salvar o PDF.', 'success');
      
    } catch (err: any) {
      console.error('Erro ao gerar recurso:', err);
      setAnimacaoAberta(false);
      showToast(err.message || 'Erro ao gerar recurso. Tente novamente.', 'error');
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <i className={toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
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
        <div className="flex items-center gap-3">
          {/* Contador de recursos gratuitos */}
          {plan?.recursos_ia_inclusos && plan.recursos_ia_inclusos > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 px-4 py-2 rounded-xl border border-emerald-200 shadow-sm">
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest leading-tight">Recursos Grátis</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-black text-emerald-700 leading-tight font-mono">
                  {prices?.ia_remaining_free || 0}
                  <span className="text-sm font-medium text-emerald-500">/{plan.recursos_ia_inclusos}</span>
                </p>
                {(prices?.ia_remaining_free || 0) === 0 && (
                  <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                    ESGOTADO
                  </span>
                )}
              </div>
              {/* Barra de progresso */}
              <div className="mt-1 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${((prices?.ia_remaining_free || 0) / plan.recursos_ia_inclusos) * 100}%` }}
                />
              </div>
            </div>
          )}
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-tight">Saldo</p>
            <p className="text-xl font-black text-blue-700 leading-tight font-mono">
              {formatCurrency(balance)}
            </p>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all"
            title="Adicionar Créditos"
          >
            <i className="ri-add-circle-line text-xl"></i>
          </button>
        </div>
      </div>

      {/* Banner informativo */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-xl p-6 text-white">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-brain-line text-3xl text-white"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Inteligência Artificial Especializada</h3>
            <p className="text-blue-100 text-sm mb-4 leading-relaxed">
              Nossa IA foi treinada com mais de 5 anos de recursos de trânsito deferidos, 
              garantindo argumentação jurídica sólida e atualizada para cada caso.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <span className="text-2xl font-bold">+7.000</span>
                <span className="text-xs text-blue-100 block">Recursos Deferidos</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <span className="text-2xl font-bold">81</span>
                <span className="text-xs text-blue-100 block">Tipos de Infrações</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <span className="text-2xl font-bold">27</span>
                <span className="text-xs text-blue-100 block">DETRANs Cadastrados</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <span className="font-bold">{formatCurrency(prices?.ia || 0)}</span>
                <span className="text-xs text-blue-100 block">por Recurso</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resultado Gerado */}
      {recursoGerado && (
        <VisualizadorRecurso
          conteudo={recursoGerado.conteudo}
          recursoId={recursoGerado.recursoId}
          clienteId={recursoGerado.clienteId || idsVinculacao.clienteId || undefined}
          onClose={handleFecharVisualizador}
        />
      )}

      {/* Formulário */}
      {!recursoGerado && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Banner indicando dados pré-preenchidos */}
          {dadosIniciais && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-flashlight-line text-xl text-blue-600"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Dados importados do Rastreamento de Multas
                  </p>
                  <p className="text-xs text-blue-600">
                    Placa: <strong>{dadosIniciais.placa}</strong> | Infração: <strong>{dadosIniciais.codigoInfracao}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <i className="ri-robot-line text-2xl text-white"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Gerador Automático de Recursos</h3>
              <p className="text-sm text-gray-600">Preencha todos os dados para gerar um recurso completo</p>
            </div>
          </div>

          <FormularioRecurso
            onSubmit={handleGerarRecurso}
            gerando={gerando}
            organizationId={currentOrganization?.id || ''}
            dadosIniciais={dadosIniciais}
          />
        </div>
      )}

      {/* Modal de Confirmação de Compra */}
      {confirmacaoCompra && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-coins-line text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Confirmar Geração</h3>
              <p className="text-sm text-gray-600 mt-2">
                A geração deste recurso custará:
              </p>
              <p className="text-3xl font-black text-blue-600 mt-2">
                {formatCurrency(confirmacaoCompra.valor)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Seu saldo: {formatCurrency(balance)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmacaoCompra(null)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const dados = confirmacaoCompra.dados;
                  const valor = confirmacaoCompra.valor;
                  setConfirmacaoCompra(null);
                  
                  // Mostrar animação de cobrança
                  setProcessandoCobranca(true);
                  setEtapaCobranca('debitando');
                  
                  // Simular tempo de processamento
                  await new Promise(resolve => setTimeout(resolve, 1500));
                  setEtapaCobranca('confirmado');
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  setProcessandoCobranca(false);
                  
                  // Continuar com a geração
                  executarGeracao(dados, false, valor);
                }}
                disabled={balance < confirmacaoCompra.valor}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>

            {balance < confirmacaoCompra.valor && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 mb-3 flex items-center gap-2">
                  <i className="ri-error-warning-fill text-lg"></i>
                  <span><strong>Saldo insuficiente.</strong> Você precisa de mais {formatCurrency(confirmacaoCompra.valor - balance)} para continuar.</span>
                </p>
                <button
                  onClick={() => {
                    setConfirmacaoCompra(null);
                    navigate('/checkout');
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                >
                  <i className="ri-add-circle-line"></i>
                  Adicionar Créditos Agora
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animação de Cobrança */}
      {processandoCobranca && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex items-center justify-center">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Círculo animado */}
            <div className="relative mx-auto w-32 h-32">
              {etapaCobranca === 'confirmado' ? (
                <>
                  {/* Círculos de pulso - sucesso */}
                  <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-green-500/30 animate-pulse" />
                  
                  {/* Círculo principal - sucesso */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/50">
                    <svg 
                      className="w-16 h-16 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </>
              ) : (
                <>
                  {/* Círculos de pulso - processando */}
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-blue-500/30 animate-pulse" />
                  
                  {/* Círculo principal - processando */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/50">
                    <i className="ri-money-dollar-circle-line text-5xl text-white animate-pulse"></i>
                  </div>
                </>
              )}
            </div>

            {/* Texto dinâmico */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white">
                {etapaCobranca === 'debitando' && 'Processando Cobrança...'}
                {etapaCobranca === 'confirmado' && 'Pagamento Confirmado!'}
              </h2>
              <p className="text-gray-300 text-lg">
                {etapaCobranca === 'debitando' && 'Debitando do seu saldo disponível'}
                {etapaCobranca === 'confirmado' && 'Iniciando geração do recurso'}
              </p>
            </div>

            {/* Barra de progresso */}
            <div className="w-64 mx-auto h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  etapaCobranca === 'confirmado' 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 w-full' 
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500 w-1/2 animate-pulse'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Animação de geração de recurso - roda enquanto gera */}
      <AnimacaoGeracaoRecurso
        isOpen={animacaoAberta}
        tipo="gerando"
        onComplete={() => {}} // Animação é fechada quando geração termina, não precisa de callback
      />
    </div>
  );
}
