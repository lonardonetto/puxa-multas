import { useState, useEffect } from 'react';

interface AIProcessingAnimationProps {
  isProcessing: boolean;
  onComplete?: () => void;
}

const STEPS = [
  { id: 1, label: 'Lendo documento', icon: 'ri-file-search-line', description: 'Interpretando o conteúdo...' },
  { id: 2, label: 'Extraindo dados', icon: 'ri-scissors-cut-line', description: 'Identificando informações relevantes...' },
  { id: 3, label: 'Analisando padrões', icon: 'ri-brain-line', description: 'Processando argumentos jurídicos...' },
  { id: 4, label: 'Aprendendo', icon: 'ri-lightbulb-flash-line', description: 'Incorporando à base de conhecimento...' },
];

export default function AIProcessingAnimation({ isProcessing, onComplete }: AIProcessingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStep(0);
      setCompleted(false);
      return;
    }

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(stepInterval);
          setCompleted(true);
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(stepInterval);
  }, [isProcessing, onComplete]);

  if (!isProcessing && !completed) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-6 border border-amber-200 animate-fade-in">
      {/* Header with brain animation */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-14 h-14 gradient-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold">
            <i className="ri-brain-line text-2xl text-white"></i>
          </div>
          {!completed && (
            <>
              <div className="absolute inset-0 gradient-gold rounded-xl animate-ping opacity-30"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white animate-pulse"></div>
            </>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">
            {completed ? '✅ Análise Concluída!' : 'Inteligência Artificial Processando'}
          </h3>
          <p className="text-sm text-gray-500">
            {completed 
              ? 'O documento foi processado e integrado à base' 
              : 'Aguarde enquanto analisamos o documento...'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isActive = index === currentStep && !completed;
          const isCompleted = index < currentStep || completed;
          const isPending = index > currentStep && !completed;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${
                isActive 
                  ? 'bg-white shadow-md border border-amber-300 scale-[1.02]' 
                  : isCompleted 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-white/50 border border-gray-100 opacity-50'
              }`}
            >
              {/* Step icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-100' 
                  : isActive 
                    ? 'bg-amber-100' 
                    : 'bg-gray-100'
              }`}>
                {isCompleted ? (
                  <i className="ri-check-line text-xl text-green-600"></i>
                ) : isActive ? (
                  <i className={`${step.icon} text-xl text-amber-600 animate-pulse`}></i>
                ) : (
                  <i className={`${step.icon} text-xl text-gray-400`}></i>
                )}
              </div>

              {/* Step info */}
              <div className="flex-1">
                <p className={`font-medium transition-colors ${
                  isCompleted 
                    ? 'text-green-700' 
                    : isActive 
                      ? 'text-amber-700' 
                      : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-xs text-amber-500 animate-pulse mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="text-right">
                {isCompleted && (
                  <span className="text-xs text-green-600 font-medium">Concluído</span>
                )}
                {isActive && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
                {isPending && (
                  <span className="text-xs text-gray-400">Aguardando</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {!completed && (
        <div className="mt-6">
          <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
            <div 
              className="h-full gradient-gold rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Etapa {currentStep + 1} de {STEPS.length}
          </p>
        </div>
      )}

      {/* Success message */}
      {completed && (
        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-sparkling-line text-xl text-green-600"></i>
            </div>
            <div>
              <p className="font-medium text-green-800">Base de conhecimento atualizada!</p>
              <p className="text-sm text-green-600">
                Os padrões de sucesso foram extraídos e salvos para uso futuro.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
