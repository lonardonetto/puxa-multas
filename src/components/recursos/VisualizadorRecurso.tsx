import { useState } from 'react';

interface VisualizadorRecursoProps {
  conteudo: string;
  onClose: () => void;
}

export default function VisualizadorRecurso({ 
  conteudo, 
  onClose
}: VisualizadorRecursoProps) {
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState(conteudo);
  const [copiado, setCopiado] = useState(false);
  const [concluindo, setConcluindo] = useState(false);

  const handleCopiar = () => {
    navigator.clipboard.writeText(textoEditado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleImprimir = () => {
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
            <pre>${textoEditado}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleConcluir = () => {
    setConcluindo(true);
    // Aguardar animação completa antes de fechar
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // Tela de animação de conclusão
  if (concluindo) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Círculo animado de sucesso */}
          <div className="relative mx-auto w-32 h-32">
            {/* Círculos de pulso */}
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-green-500/30 animate-pulse" />
            
            {/* Círculo principal */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/50">
              <svg 
                className="w-16 h-16 text-white animate-scale-in" 
                style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7"
                  className="animate-draw-check"
                />
              </svg>
            </div>
          </div>

          {/* Texto */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              Recurso Concluído!
            </h2>
            <p className="text-gray-300 text-lg animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
              Salvo com sucesso na lista de acompanhamento
            </p>
          </div>

          {/* Indicador de redirecionamento */}
          <div className="flex items-center justify-center gap-3 text-gray-400 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Redirecionando para Rastreamento</span>
          </div>

          {/* Barra de progresso */}
          <div className="w-64 mx-auto h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              style={{
                animation: 'progress 2s ease-out forwards'
              }}
            />
          </div>
        </div>

        <style>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
          @keyframes draw-check {
            0% { stroke-dasharray: 0 100; }
            100% { stroke-dasharray: 100 0; }
          }
          .animate-draw-check {
            stroke-dasharray: 100;
            animation: draw-check 0.5s ease-out 0.3s forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <i className="ri-file-text-line text-2xl"></i>
            <div>
              <h3 className="font-bold text-lg">Recurso Gerado com Sucesso!</h3>
              <p className="text-green-100 text-sm">Revise o conteúdo antes de protocolar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditando(!editando)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              editando 
                ? 'bg-blue-100 text-blue-700 border border-blue-300 scale-105' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-105'
            }`}
          >
            <i className={`${editando ? 'ri-save-line' : 'ri-edit-line'} mr-2`}></i>
            {editando ? 'Salvar Edição' : 'Editar'}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopiar}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              copiado 
                ? 'bg-green-100 text-green-700 border border-green-300 scale-105' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-105'
            }`}
          >
            <i className={`${copiado ? 'ri-check-line' : 'ri-file-copy-line'} mr-2`}></i>
            {copiado ? 'Copiado!' : 'Copiar'}
          </button>
          <button
            onClick={handleImprimir}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 hover:scale-105 transition-all duration-200"
          >
            <i className="ri-printer-line mr-2"></i>
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Conteúdo do Recurso */}
      <div className="p-6 max-h-[60vh] overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto bg-gray-50 border border-gray-200 rounded-lg p-8 shadow-inner">
          {editando ? (
            <textarea
              value={textoEditado}
              onChange={(e) => setTextoEditado(e.target.value)}
              className="w-full min-h-[500px] p-4 border border-gray-300 rounded-lg font-serif text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y transition-all"
              style={{ fontFamily: "'Times New Roman', serif" }}
            />
          ) : (
            <pre 
              className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed"
              style={{ fontFamily: "'Times New Roman', serif" }}
            >
              {textoEditado}
            </pre>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <i className="ri-information-line mr-1"></i>
            Revise cuidadosamente antes de protocolar no órgão competente
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleConcluir}
              className="group px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 flex items-center gap-2"
            >
              <i className="ri-check-double-line text-lg group-hover:animate-bounce"></i>
              Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}