import { useState } from 'react';

interface VisualizadorRecursoProps {
  conteudo: string;
  onClose: () => void;
  onSalvar: () => void;
  onCopiar: () => void;
  onImprimir: () => void;
}

export default function VisualizadorRecurso({ 
  conteudo, 
  onClose, 
  onSalvar, 
  onCopiar, 
  onImprimir 
}: VisualizadorRecursoProps) {
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState(conteudo);

  const handleCopiar = () => {
    navigator.clipboard.writeText(textoEditado);
    onCopiar();
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
    onImprimir();
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              editando 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <i className={`${editando ? 'ri-save-line' : 'ri-edit-line'} mr-2`}></i>
            {editando ? 'Salvar Edição' : 'Editar'}
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopiar}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <i className="ri-file-copy-line mr-2"></i>
            Copiar
          </button>
          <button
            onClick={handleImprimir}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <i className="ri-printer-line mr-2"></i>
            Imprimir
          </button>
          <button
            onClick={onSalvar}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <i className="ri-download-line mr-2"></i>
            Salvar como PDF
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
              className="w-full min-h-[500px] p-4 border border-gray-300 rounded-lg font-serif text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
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
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={onSalvar}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <i className="ri-check-line mr-2"></i>
              Finalizar e Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
