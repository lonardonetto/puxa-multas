import { MultaRastreada } from '../../hooks/useMultasRastreamento';

interface ModalDetalhesMultaProps {
  multa: MultaRastreada;
  onClose: () => void;
  onGerarRecurso: (multa: MultaRastreada) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const formatTime = (timeString: string) => {
  if (!timeString) return '-';
  return timeString.substring(0, 5);
};

export default function ModalDetalhesMulta({ multa, onClose, onGerarRecurso }: ModalDetalhesMultaProps) {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      suspensiva: 'bg-red-100 text-red-700',
      analise: 'bg-yellow-100 text-yellow-700',
      pendente: 'bg-gray-100 text-gray-700',
      concluido: 'bg-green-100 text-green-700',
      pago: 'bg-green-100 text-green-700',
    };
    const labels: Record<string, string> = {
      suspensiva: 'Suspensiva',
      analise: 'Em Análise',
      pendente: 'Pendente',
      concluido: 'Concluído',
      pago: 'Pago',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.pendente}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getGravidadeBadge = (gravidade: string) => {
    const styles: Record<string, string> = {
      'Leve': 'bg-blue-100 text-blue-700',
      'Média': 'bg-yellow-100 text-yellow-700',
      'Grave': 'bg-orange-100 text-orange-700',
      'Gravíssima': 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[gravidade] || 'bg-gray-100 text-gray-700'}`}>
        {gravidade || 'Não informada'}
      </span>
    );
  };

  const endereco = multa.clienteEndereco;
  const enderecoFormatado = endereco ? 
    `${endereco.rua || ''}, ${endereco.numero || ''} ${endereco.complemento ? '- ' + endereco.complemento : ''}, ${endereco.bairro || ''}, ${endereco.cidade || ''} - ${endereco.estado || ''}, CEP: ${endereco.cep || ''}` 
    : 'Não informado';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
              <i className="ri-file-list-3-line text-2xl text-white"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Detalhes da Multa</h3>
              <p className="text-sm text-gray-500">Auto de Infração: {multa.numeroAuto || 'Não informado'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status e Gravidade */}
          <div className="flex items-center gap-4">
            {getStatusBadge(multa.status)}
            {getGravidadeBadge(multa.gravidade)}
          </div>

          {/* Informações do Veículo */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-[#1E3A8A] mb-4">
              <i className="ri-car-line"></i>
              Dados do Veículo
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Placa</p>
                <p className="text-sm font-semibold text-gray-800">{multa.placa}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Modelo</p>
                <p className="text-sm font-semibold text-gray-800">{multa.modelo || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Ano</p>
                <p className="text-sm font-semibold text-gray-800">{multa.ano || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">RENAVAM</p>
                <p className="text-sm font-semibold text-gray-800">{multa.renavam || '-'}</p>
              </div>
            </div>
          </div>

          {/* Informações do Proprietário */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-[#10B981] mb-4">
              <i className="ri-user-line"></i>
              Dados do Proprietário
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Nome</p>
                <p className="text-sm font-semibold text-gray-800">{multa.clienteNome || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">CPF/CNPJ</p>
                <p className="text-sm font-semibold text-gray-800">{multa.clienteCpf || multa.clienteCnpj || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">E-mail</p>
                <p className="text-sm font-semibold text-gray-800">{multa.clienteEmail || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Telefone</p>
                <p className="text-sm font-semibold text-gray-800">{multa.clienteCelular || multa.clienteTelefone || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 uppercase">Endereço</p>
                <p className="text-sm font-semibold text-gray-800">{enderecoFormatado}</p>
              </div>
            </div>
          </div>

          {/* Dados da Infração */}
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-[#EF4444] mb-4">
              <i className="ri-error-warning-line"></i>
              Dados da Infração
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Nº Auto de Infração</p>
                <p className="text-sm font-semibold text-gray-800">{multa.numeroAuto || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Data</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(multa.dataMulta)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Hora</p>
                <p className="text-sm font-semibold text-gray-800">{formatTime(multa.horaInfracao || '')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Código da Infração</p>
                <p className="text-sm font-semibold text-gray-800">{multa.codigoInfracao || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Descrição</p>
                <p className="text-sm font-semibold text-gray-800">{multa.descricaoInfracao || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Local da Infração</p>
                <p className="text-sm font-semibold text-gray-800">{multa.localInfracao || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Município</p>
                <p className="text-sm font-semibold text-gray-800">{multa.municipio || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">UF</p>
                <p className="text-sm font-semibold text-gray-800">{multa.ufInfracao || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Órgão Autuador</p>
                <p className="text-sm font-semibold text-gray-800">{multa.orgaoAutuador || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Agente</p>
                <p className="text-sm font-semibold text-gray-800">{multa.agenteAutuador || '-'}</p>
              </div>
            </div>
          </div>

          {/* Valores e Pontos */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="flex items-center gap-2 text-lg font-semibold text-[#F59E0B] mb-4">
              <i className="ri-money-dollar-circle-line"></i>
              Valores e Penalidades
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Valor da Multa</p>
                <p className="text-xl font-bold text-[#EF4444]">{formatCurrency(multa.valor)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Pontos</p>
                <p className="text-xl font-bold text-gray-800">{multa.pontos} pts</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Gravidade</p>
                <p className="text-sm font-semibold text-gray-800">{multa.gravidade || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Vencimento</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(multa.dataVencimento || '')}</p>
              </div>
            </div>
          </div>

          {/* Observações */}
          {multa.observacoes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-2">
                <i className="ri-file-text-line"></i>
                Observações
              </h4>
              <p className="text-sm text-gray-600">{multa.observacoes}</p>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={() => onGerarRecurso(multa)}
              className="px-6 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer flex items-center gap-2"
            >
              <i className="ri-robot-line"></i>
              Gerar Recurso IA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
