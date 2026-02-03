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
  };
}

interface Props {
  isOpen: boolean;
  placa: string;
  tipoPlano: 'mensal' | 'anual';
  onComplete: (dadosAPI: DadosVeiculoAPI | null) => void;
}

const etapas = [
  { id: 1, texto: 'Conectando ao sistema...', icone: 'ri-wifi-line', duracao: 800 },
  { id: 2, texto: 'Buscando dados do veículo...', icone: 'ri-car-line', duracao: 1200, isAPICall: true },
  { id: 3, texto: 'Consultando base do DETRAN...', icone: 'ri-building-2-line', duracao: 1500 },
  { id: 4, texto: 'Verificando multas pendentes...', icone: 'ri-file-search-line', duracao: 1500 },
  { id: 5, texto: 'Analisando restrições...', icone: 'ri-shield-check-line', duracao: 1200 },
  { id: 6, texto: 'Finalizando cadastro...', icone: 'ri-check-double-line', duracao: 1000 },
];

export default function AnimacaoRastreamento({ isOpen, placa, tipoPlano, onComplete }: Props) {
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const dadosAPIRef = useRef<DadosVeiculoAPI | null>(null);
  const apiChamadaRef = useRef(false);
  const onCompleteChamadoRef = useRef(false);
  const animacaoIniciadaRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset quando fecha
      setEtapaAtual(0);
      setProgresso(0);
      setConcluido(false);
      dadosAPIRef.current = null;
      apiChamadaRef.current = false;
      onCompleteChamadoRef.current = false;
      animacaoIniciadaRef.current = false;
      return;
    }

    // Evitar re-execução se já iniciou
    if (animacaoIniciadaRef.current) return;
    animacaoIniciadaRef.current = true;

    let etapaIndex = 0;
    let progressoAtual = 0;

    const buscarDadosAPI = async () => {
      if (apiChamadaRef.current) return;
      apiChamadaRef.current = true;
      
      try {
        // Chamar a API CertaDoc para buscar dados do veículo
        const { data, error } = await supabase.functions.invoke('consultar-veiculo', {
          body: { placa: placa.toUpperCase().replace(/[^A-Z0-9]/g, '') }
        });
        
        if (!error && data?.result) {
          dadosAPIRef.current = data.result;
        }
      } catch (err) {
        console.error('Erro ao buscar dados do veículo:', err);
      }
    };

    const avancarEtapa = () => {
      if (etapaIndex < etapas.length) {
        setEtapaAtual(etapaIndex + 1);
        const incrementoProgresso = 100 / etapas.length;
        progressoAtual += incrementoProgresso;
        setProgresso(Math.min(progressoAtual, 100));
        
        // Chamar API na etapa 2
        if (etapas[etapaIndex].isAPICall) {
          buscarDadosAPI();
        }
        
        setTimeout(() => {
          etapaIndex++;
          avancarEtapa();
        }, etapas[etapaIndex].duracao);
      } else {
        setConcluido(true);
        // Garantir que onComplete é chamado apenas uma vez
        if (!onCompleteChamadoRef.current) {
          onCompleteChamadoRef.current = true;
          setTimeout(() => {
            onComplete(dadosAPIRef.current);
          }, 800);
        }
      }
    };

    // Iniciar após um pequeno delay
    setTimeout(avancarEtapa, 300);
  }, [isOpen, placa]); // Removido onComplete das deps para evitar re-execução

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

          {/* Mensagem de conclusão */}
          {concluido && (
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
            {concluido 
              ? 'Você receberá notificações de novas multas automaticamente'
              : 'Por favor, aguarde enquanto configuramos o rastreamento...'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
