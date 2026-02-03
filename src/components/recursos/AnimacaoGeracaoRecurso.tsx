import { useState, useEffect } from 'react';

interface AnimacaoGeracaoRecursoProps {
  isOpen: boolean;
  tipo: 'iniciando' | 'gerando';
  onComplete: () => void;
}

const ETAPAS_INICIANDO = [
  { id: 1, texto: 'Preparando ambiente jurídico...', icone: 'ri-scales-3-line', duracao: 800 },
  { id: 2, texto: 'Carregando dados da infração...', icone: 'ri-file-search-line', duracao: 1000 },
  { id: 3, texto: 'Abrindo formulário de defesa...', icone: 'ri-draft-line', duracao: 700 },
];

const ETAPAS_GERANDO = [
  { id: 1, texto: 'Analisando dados da infração...', icone: 'ri-file-search-line', duracao: 1200 },
  { id: 2, texto: 'Consultando base de legislação...', icone: 'ri-book-3-line', duracao: 1500 },
  { id: 3, texto: 'Buscando precedentes jurídicos...', icone: 'ri-scales-3-line', duracao: 1500 },
  { id: 4, texto: 'Identificando falhas formais...', icone: 'ri-error-warning-line', duracao: 1300 },
  { id: 5, texto: 'Construindo argumentação...', icone: 'ri-quill-pen-line', duracao: 1500 },
  { id: 6, texto: 'Elaborando petição de defesa...', icone: 'ri-draft-line', duracao: 1200 },
  { id: 7, texto: 'Finalizando recurso...', icone: 'ri-check-double-line', duracao: 800 },
];

export default function AnimacaoGeracaoRecurso({ isOpen, tipo, onComplete }: AnimacaoGeracaoRecursoProps) {
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [concluido, setConcluido] = useState(false);

  const etapas = tipo === 'iniciando' ? ETAPAS_INICIANDO : ETAPAS_GERANDO;
  const titulo = tipo === 'iniciando' ? 'Iniciando Geração de Recurso' : 'IA Gerando Recurso Jurídico';
  const subtitulo = tipo === 'iniciando' 
    ? 'Preparando o ambiente...' 
    : 'Analisando e construindo sua defesa...';

  useEffect(() => {
    if (!isOpen) {
      setEtapaAtual(0);
      setProgresso(0);
      setConcluido(false);
      return;
    }

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
        setConcluido(true);
        setTimeout(onComplete, 500);
      }
    };

    setTimeout(executarProximaEtapa, 300);
  }, [isOpen, tipo, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              {tipo === 'iniciando' ? (
                <i className="ri-draft-line text-white text-2xl animate-pulse"></i>
              ) : (
                <i className="ri-brain-line text-white text-2xl animate-pulse"></i>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{titulo}</h3>
              <p className="text-emerald-100 text-sm">{subtitulo}</p>
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
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          {/* Lista de etapas */}
          <div className="space-y-2">
            {etapas.map((etapa, index) => {
              const isAtiva = etapaAtual === index + 1;
              const isConcluida = etapaAtual > index + 1 || concluido;

              return (
                <div 
                  key={etapa.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    isAtiva 
                      ? 'bg-emerald-50 border border-emerald-200 shadow-sm' 
                      : isConcluida 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isAtiva 
                      ? 'bg-emerald-500 text-white animate-pulse' 
                      : isConcluida 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isConcluida ? (
                      <i className="ri-check-line text-sm"></i>
                    ) : (
                      <i className={`${etapa.icone} text-sm ${isAtiva ? 'animate-pulse' : ''}`}></i>
                    )}
                  </div>
                  <span className={`text-sm transition-all flex-1 ${
                    isAtiva 
                      ? 'text-emerald-800 font-medium' 
                      : isConcluida 
                        ? 'text-green-700' 
                        : 'text-gray-400'
                  }`}>
                    {etapa.texto}
                  </span>
                  {isAtiva && (
                    <i className="ri-loader-4-line animate-spin text-emerald-600"></i>
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
                <p className="font-bold text-green-800">
                  {tipo === 'iniciando' ? 'Pronto!' : 'Recurso Gerado!'}
                </p>
                <p className="text-sm text-green-600">
                  {tipo === 'iniciando' ? 'Redirecionando...' : 'Defesa elaborada com sucesso'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            {tipo === 'iniciando' 
              ? 'Aguarde enquanto preparamos o formulário...'
              : 'A IA está analisando legislação e construindo sua defesa jurídica...'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
