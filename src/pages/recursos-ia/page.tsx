import { useState, useMemo } from 'react';
import { useCurrentPlan } from '../../hooks/useCurrentPlan';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { supabase } from '../../lib/supabase';
import { useWallet } from '../../hooks/useWallet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormularioRecurso, { DadosRecurso } from '../../components/recursos/FormularioRecurso';
import VisualizadorRecurso from '../../components/recursos/VisualizadorRecurso';
import AnimacaoGeracaoRecurso from '../../components/recursos/AnimacaoGeracaoRecurso';

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
  const [recursoGerado, setRecursoGerado] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmacaoCompra, setConfirmacaoCompra] = useState<{ valor: number; dados: DadosRecurso } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleGerarRecurso = async (dados: DadosRecurso) => {
    if (!currentOrganization) {
      showToast('Organização não identificada', 'error');
      return;
    }

    // Verificar se é gratuito ou pago
    const isFree = (prices?.ia === 0) || (prices && (prices.ia_remaining_free || 0) > 0);
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

      // Salvar recurso no banco com vínculo ao cliente e veículo
      const { data: recursoSalvo, error: insertError } = await supabase
        .from('recursos')
        .insert({
          status: 'rascunho',
          instancia: dados.tipoRecurso,
          conteudo: data.content,
          organization_id: currentOrganization!.id,
          is_ia: true,
          ait_url: dados.aitBase64 ? `data:image/jpeg;base64,${dados.aitBase64}` : null,
          ait_dados_extraidos: dados.aitBase64 ? dados : null,
        } as any)
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao salvar recurso:', insertError);
      } else {
        console.log('Recurso salvo:', recursoSalvo);
        refresh();
      }

      // Fechar animação e MOSTRAR o recurso gerado
      setAnimacaoAberta(false);
      setRecursoGerado(data.content);
      showToast('Recurso gerado e salvo com sucesso!', 'success');
      
    } catch (err: any) {
      console.error('Erro ao gerar recurso:', err);
      setAnimacaoAberta(false);
      showToast(err.message || 'Erro ao gerar recurso. Tente novamente.', 'error');
    } finally {
      setGerando(false);
    }
  };

  const handleSalvarPDF = () => {
    if (!recursoGerado) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Recurso de Trânsito</title>
            <style>
              body {
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
                line-height: 1.8;
                padding: 40px 60px;
                max-width: 800px;
                margin: 0 auto;
              }
              pre {
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
              }
            </style>
          </head>
          <body>
            <pre>${recursoGerado}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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
        <div className="flex items-center gap-4">
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
          conteudo={recursoGerado}
          onClose={() => setRecursoGerado(null)}
          onSalvar={handleSalvarPDF}
          onCopiar={() => showToast('Recurso copiado para a área de transferência!', 'success')}
          onImprimir={() => showToast('Preparando impressão...', 'success')}
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
                onClick={() => {
                  setConfirmacaoCompra(null);
                  executarGeracao(confirmacaoCompra.dados, false, confirmacaoCompra.valor);
                }}
                disabled={balance < confirmacaoCompra.valor}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>

            {balance < confirmacaoCompra.valor && (
              <p className="text-center text-sm text-red-500 mt-4">
                <i className="ri-error-warning-line mr-1"></i>
                Saldo insuficiente. Adicione créditos para continuar.
              </p>
            )}
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
