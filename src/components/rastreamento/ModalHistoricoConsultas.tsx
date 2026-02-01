import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ConsultaHistorico {
  id: string;
  placa: string;
  cliente_nome: string | null;
  cliente_documento: string | null;
  modelo_veiculo: string | null;
  ano_veiculo: string | null;
  valor_cobrado: number;
  resposta_api: any;
  multas_encontradas: number;
  status: string;
  created_at: string;
}

interface VeiculoInfo {
  id: string;
  placa: string;
  modelo: string;
  ano: string | null;
  cliente_nome: string;
  cliente_documento: string | null;
}

interface Props {
  veiculo: VeiculoInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export default function ModalHistoricoConsultas({ veiculo, isOpen, onClose }: Props) {
  const [consultas, setConsultas] = useState<ConsultaHistorico[]>([]);
  const [loading, setLoading] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] = useState<ConsultaHistorico | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && veiculo?.id) {
      fetchHistorico();
    }
  }, [isOpen, veiculo?.id]);

  const fetchHistorico = async () => {
    if (!veiculo?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('consultas_rastreamento')
        .select('*')
        .eq('veiculo_id', veiculo.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsultas(data || []);
      
      // Selecionar a última consulta automaticamente
      if (data && data.length > 0) {
        setConsultaSelecionada(data[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico de consultas');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Comprovante de Consulta - ${veiculo?.placa}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
                margin-bottom: 20px;
              }
              .header h1 {
                color: #1e40af;
                margin: 0;
              }
              .header p {
                color: #666;
                margin: 5px 0;
              }
              .section {
                margin-bottom: 20px;
              }
              .section-title {
                background: #f3f4f6;
                padding: 8px 12px;
                font-weight: bold;
                border-left: 4px solid #1e40af;
                margin-bottom: 10px;
              }
              .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
              }
              .field {
                margin-bottom: 8px;
              }
              .field-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 2px;
              }
              .field-value {
                font-weight: 500;
              }
              .result-box {
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                margin-top: 20px;
              }
              .result-success {
                background: #dcfce7;
                border: 1px solid #16a34a;
                color: #166534;
              }
              .result-found {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                color: #92400e;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 15px;
              }
              .api-response {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 12px;
                font-family: monospace;
                font-size: 11px;
                max-height: 200px;
                overflow: auto;
                white-space: pre-wrap;
              }
              @media print {
                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <div class="footer">
              <p>Documento gerado automaticamente pelo sistema de rastreamento de multas</p>
              <p>Este comprovante é válido como registro de consulta</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-history-line text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold">Histórico de Consultas</h2>
              <p className="text-blue-100 text-sm">
                {veiculo?.placa} - {veiculo?.modelo} {veiculo?.ano}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="flex h-[calc(90vh-76px)]">
          {/* Lista de consultas */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-700">
                {consultas.length} consulta{consultas.length !== 1 ? 's' : ''} realizada{consultas.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : consultas.length === 0 ? (
              <div className="text-center py-8 px-4">
                <i className="ri-inbox-line text-4xl text-gray-300 mb-2"></i>
                <p className="text-gray-500 text-sm">Nenhuma consulta realizada para este veículo</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {consultas.map((consulta) => (
                  <button
                    key={consulta.id}
                    onClick={() => setConsultaSelecionada(consulta)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      consultaSelecionada?.id === consulta.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        consulta.multas_encontradas > 0 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {consulta.multas_encontradas > 0 
                          ? `${consulta.multas_encontradas} multa${consulta.multas_encontradas > 1 ? 's' : ''}`
                          : 'Sem multas'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatCurrency(consulta.valor_cobrado)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {formatDateTime(consulta.created_at)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes da consulta */}
          <div className="flex-1 overflow-y-auto">
            {consultaSelecionada ? (
              <div className="p-6">
                {/* Área para impressão */}
                <div ref={printRef}>
                  <div className="header">
                    <h1>Comprovante de Consulta de Multas</h1>
                    <p>Sistema de Rastreamento de Multas</p>
                  </div>

                  {/* Dados da Consulta */}
                  <div className="section">
                    <div className="section-title">Dados da Consulta</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="field">
                        <p className="field-label text-xs text-gray-500">Data/Hora da Consulta</p>
                        <p className="field-value font-medium">{formatDateTime(consultaSelecionada.created_at)}</p>
                      </div>
                      <div className="field">
                        <p className="field-label text-xs text-gray-500">Valor Cobrado</p>
                        <p className="field-value font-medium text-blue-600">{formatCurrency(consultaSelecionada.valor_cobrado)}</p>
                      </div>
                      <div className="field">
                        <p className="field-label text-xs text-gray-500">Status</p>
                        <p className="field-value font-medium capitalize">{consultaSelecionada.status}</p>
                      </div>
                      <div className="field">
                        <p className="field-label text-xs text-gray-500">ID da Consulta</p>
                        <p className="field-value font-mono text-xs">{consultaSelecionada.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Veículo */}
                  <div className="section mt-6">
                    <div className="section-title bg-gray-100 px-3 py-2 rounded font-semibold text-gray-700 border-l-4 border-blue-600 mb-3">
                      Dados do Veículo
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="field">
                        <p className="field-label text-xs text-gray-500">Placa</p>
                        <p className="field-value font-bold text-lg">{consultaSelecionada.placa}</p>
                      </div>
                      <div className="field">
                        <p className="field-label text-xs text-gray-500">Modelo</p>
                        <p className="field-value font-medium">{consultaSelecionada.modelo_veiculo || '-'}</p>
                      </div>
                      <div className="field">
                        <p className="field-label text-xs text-gray-500">Ano</p>
                        <p className="field-value font-medium">{consultaSelecionada.ano_veiculo || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Cliente */}
                  <div className="section mt-6">
                    <div className="section-title bg-gray-100 px-3 py-2 rounded font-semibold text-gray-700 border-l-4 border-blue-600 mb-3">
                      Dados do Cliente
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="field">
                        <p className="field-label text-xs text-gray-500">Nome</p>
                        <p className="field-value font-medium">{consultaSelecionada.cliente_nome || '-'}</p>
                      </div>
                      <div className="field">
                        <p className="field-label text-xs text-gray-500">CPF/CNPJ</p>
                        <p className="field-value font-medium">{consultaSelecionada.cliente_documento || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Resultado */}
                  <div className={`result-box mt-6 rounded-lg p-4 text-center ${
                    consultaSelecionada.multas_encontradas > 0 
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <i className={`text-4xl mb-2 block ${
                      consultaSelecionada.multas_encontradas > 0 
                        ? 'ri-error-warning-line text-yellow-500'
                        : 'ri-checkbox-circle-line text-green-500'
                    }`}></i>
                    <p className={`font-bold text-lg ${
                      consultaSelecionada.multas_encontradas > 0 
                        ? 'text-yellow-700'
                        : 'text-green-700'
                    }`}>
                      {consultaSelecionada.multas_encontradas > 0 
                        ? `${consultaSelecionada.multas_encontradas} Multa${consultaSelecionada.multas_encontradas > 1 ? 's' : ''} Encontrada${consultaSelecionada.multas_encontradas > 1 ? 's' : ''}`
                        : 'Nenhuma Multa Encontrada'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Consulta realizada com sucesso na base de dados
                    </p>
                  </div>

                  {/* Resposta da API */}
                  {consultaSelecionada.resposta_api && (
                    <div className="section mt-6">
                      <div className="section-title bg-gray-100 px-3 py-2 rounded font-semibold text-gray-700 border-l-4 border-blue-600 mb-3">
                        Resposta da API (Dados Técnicos)
                      </div>
                      <div className="api-response bg-gray-50 rounded-lg p-3 font-mono text-xs max-h-48 overflow-auto border border-gray-200">
                        {JSON.stringify(consultaSelecionada.resposta_api, null, 2)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center"
                  >
                    <i className="ri-printer-line mr-2"></i>
                    Imprimir Comprovante
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <i className="ri-file-search-line text-5xl text-gray-300 mb-3"></i>
                  <p>Selecione uma consulta para ver os detalhes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
