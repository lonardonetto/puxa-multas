import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

interface DadosVeiculoAPI {
  dados_do_veiculo?: {
    uf?: string;
    cor?: string;
    marca?: string;
    placa?: string;
    chassi?: string;
    modelo?: string;
    renavam?: string;
    municipio?: string;
    anofabricacao?: string;
  };
  informacoes_tecnicas_e_adicionais?: {
    motor?: string;
    especie?: string;
    potencia?: string;
    cilindradas?: string;
    caixadecambio?: string;
    nomeproprietario?: string;
    quantidadedeeixos?: string;
    documentoproprietario?: string;
    capacidadedepassageiros?: string;
  };
  restricoes_e_impedimentos?: {
    situacao_veiculo?: string;
    multa_renainf?: string;
    roubo_e_furto?: string;
    recall?: string;
  };
}

interface Props {
  isOpen: boolean;
  placa: string;
  tipoPlano: 'mensal' | 'anual';
  onComplete: (dadosAPI: DadosVeiculoAPI | null) => void;
}

// Etapas com tempos maiores para dar tempo da API responder
const etapas = [
  { id: 1, texto: 'Conectando ao sistema...', icone: 'ri-wifi-line', duracao: 1500 },
  { id: 2, texto: 'Autenticando credenciais...', icone: 'ri-key-2-line', duracao: 2000 },
  { id: 3, texto: 'Consultando base do DETRAN...', icone: 'ri-building-2-line', duracao: 2500 },
  { id: 4, texto: 'Buscando dados do veículo...', icone: 'ri-car-line', duracao: 2500 },
  { id: 5, texto: 'Verificando multas pendentes...', icone: 'ri-file-search-line', duracao: 2000 },
  { id: 6, texto: 'Analisando restrições...', icone: 'ri-shield-check-line', duracao: 1500 },
  { id: 7, texto: 'Finalizando cadastro...', icone: 'ri-check-double-line', duracao: 1500 },
];

export default function AnimacaoRastreamento({ isOpen, placa, tipoPlano, onComplete }: Props) {
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [aguardandoAPI, setAguardandoAPI] = useState(false);
  
  // Refs para controlar estados
  const dadosAPIRef = useRef<DadosVeiculoAPI | null>(null);
  const apiConcluidaRef = useRef(false);
  const animacaoConcluidaRef = useRef(false);
  const onCompleteChamadoRef = useRef(false);
  const processandoRef = useRef(false);

  // Função para verificar se pode finalizar
  const tentarFinalizar = () => {
    if (onCompleteChamadoRef.current) return;
    
    // Só finaliza quando AMBOS terminarem
    if (animacaoConcluidaRef.current && apiConcluidaRef.current) {
      onCompleteChamadoRef.current = true;
      console.log('✅ Finalizando com dados:', dadosAPIRef.current);
      
      // Delay final para mostrar a mensagem de sucesso
      setTimeout(() => {
        onComplete(dadosAPIRef.current);
      }, 1000);
    } else if (animacaoConcluidaRef.current && !apiConcluidaRef.current) {
      // Animação terminou mas API ainda não retornou
      setAguardandoAPI(true);
    }
  };

  // Efeito principal
  useEffect(() => {
    if (!isOpen) {
      // Reset completo quando fecha
      setEtapaAtual(0);
      setProgresso(0);
      setConcluido(false);
      setAguardandoAPI(false);
      dadosAPIRef.current = null;
      apiConcluidaRef.current = false;
      animacaoConcluidaRef.current = false;
      onCompleteChamadoRef.current = false;
      processandoRef.current = false;
      return;
    }

    // Evitar re-execução
    if (processandoRef.current) return;
    processandoRef.current = true;

    // Chamar API IMEDIATAMENTE ao abrir
    const buscarDadosAPI = async () => {
      try {
        const placaFormatada = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
        console.log('🚗 Iniciando busca para placa:', placaFormatada);
        
        const { data, error } = await supabase.functions.invoke('consultar-veiculo', {
          body: { placa: placaFormatada }
        });
        
        if (error) {
          console.error('❌ Erro na API:', error);
        } else if (data?.result) {
          console.log('✅ Dados recebidos:', data.result);
          dadosAPIRef.current = data.result;
        } else {
          console.warn('⚠️ Nenhum dado retornado');
        }
      } catch (err) {
        console.error('❌ Erro ao buscar dados:', err);
      } finally {
        apiConcluidaRef.current = true;
        console.log('📡 API concluída, aguardandoAPI:', aguardandoAPI);
        
        // Se já estava aguardando, finalizar agora
        if (animacaoConcluidaRef.current) {
          setAguardandoAPI(false);
          tentarFinalizar();
        }
      }
    };

    // Iniciar busca da API
    buscarDadosAPI();

    // Executar animação das etapas
    let etapaIndex = 0;
    let progressoAtual = 0;

    const executarProximaEtapa = () => {
      if (etapaIndex < etapas.length) {
        const etapa = etapas[etapaIndex];
        setEtapaAtual(etapaIndex + 1);
        
        const incremento = 100 / etapas.length;
        progressoAtual += incremento;
        setProgresso(Math.min(progressoAtual, 100));
        
        etapaIndex++;
        
        setTimeout(executarProximaEtapa, etapa.duracao);
      } else {
        // Todas as etapas concluídas
        setConcluido(true);
        animacaoConcluidaRef.current = true;
        console.log('🎬 Animação concluída');
        
        // Tentar finalizar
        tentarFinalizar();
      }
    };

    // Iniciar após pequeno delay
    setTimeout(executarProximaEtapa, 500);
  }, [isOpen, placa]);

  // Efeito para quando API terminar enquanto aguardando
  useEffect(() => {
    if (aguardandoAPI && apiConcluidaRef.current) {
      setAguardandoAPI(false);
      tentarFinalizar();
    }
  }, [aguardandoAPI]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header com gradiente */}
        <div className="gradient-gold px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <i className="ri-radar-line text-white text-2xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Ativando Rastreamento</h3>
              <p className="text-amber-100 text-sm">
                Placa: <span className="font-mono font-bold">{placa}</span>
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {tipoPlano === 'anual' ? 'Anual' : 'Mensal'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Barra de progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progresso</span>
              <span className="font-bold">{Math.round(progresso)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          {/* Lista de etapas */}
          <div className="space-y-3">
            {etapas.map((etapa, index) => {
              const isAtiva = etapaAtual === index + 1;
              const isConcluida = etapaAtual > index + 1;

              return (
                <div 
                  key={etapa.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    isAtiva 
                      ? 'bg-amber-50 border border-amber-200 shadow-sm' 
                      : isConcluida 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isAtiva 
                      ? 'bg-amber-500 text-white animate-pulse' 
                      : isConcluida 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isConcluida ? (
                      <i className="ri-check-line text-sm"></i>
                    ) : isAtiva ? (
                      <i className={`${etapa.icone} text-sm animate-pulse`}></i>
                    ) : (
                      <i className={`${etapa.icone} text-sm`}></i>
                    )}
                  </div>
                  <span className={`text-sm transition-all ${
                    isAtiva 
                      ? 'text-amber-800 font-medium' 
                      : isConcluida 
                        ? 'text-green-700' 
                        : 'text-gray-400'
                  }`}>
                    {etapa.texto}
                  </span>
                  {isAtiva && (
                    <i className="ri-loader-4-line animate-spin ml-auto text-amber-600"></i>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mensagem de aguardando API */}
          {aguardandoAPI && (
            <div className="flex items-center justify-center gap-3 p-4 bg-blue-100 border border-blue-300 rounded-xl animate-fade-in">
              <i className="ri-loader-4-line animate-spin text-blue-600 text-2xl"></i>
              <div>
                <p className="font-bold text-blue-800">Recebendo dados do DETRAN...</p>
                <p className="text-sm text-blue-600">Aguarde mais alguns segundos</p>
              </div>
            </div>
          )}

          {/* Mensagem de conclusão */}
          {concluido && !aguardandoAPI && (
            <div className="flex items-center justify-center gap-3 p-4 bg-green-100 border border-green-300 rounded-xl animate-fade-in">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-white text-xl"></i>
              </div>
              <div>
                <p className="font-bold text-green-800">Rastreamento ativado!</p>
                <p className="text-sm text-green-600">Monitoramento automático configurado</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            {aguardandoAPI 
              ? 'Finalizando consulta ao DETRAN...'
              : concluido 
                ? 'Você receberá notificações de novas multas automaticamente'
                : 'Por favor, aguarde enquanto configuramos o rastreamento...'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
