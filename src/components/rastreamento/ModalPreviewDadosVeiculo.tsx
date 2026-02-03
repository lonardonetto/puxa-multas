import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useAuth } from '../../contexts/AuthContext';

interface DadosVeiculoAPI {
  dados_do_veiculo: {
    uf: string;
    cor: string;
    marca: string;
    placa: string;
    chassi: string;
    modelo: string;
    renavam: string;
    municipio: string;
    anofabricacao: string;
  };
  restricoes_e_impedimentos: {
    recall: string;
    sinistro: string | null;
    multa_renainf: string;
    roubo_e_furto: string;
    situacao_veiculo: string;
    intencao_de_financiamento?: {
      agente: string;
      ncontrato: string;
      nomedofinanciado: string;
      documentofinanciado: string;
    };
  };
  informacoes_tecnicas_e_adicionais: {
    motor: string;
    especie: string;
    potencia: string;
    cilindradas: string;
    caixadecambio: string;
    nomeproprietario: string;
    quantidadedeeixos: string;
    documentoproprietario: string;
    capacidadedepassageiros: string;
    tipodocumentoproprietario: string;
  };
}

interface ClienteExistente {
  id: string;
  nome_completo: string;
  cpf: string | null;
  cnpj: string | null;
  tipo_pessoa: 'fisica' | 'juridica';
}

interface Props {
  aberto: boolean;
  onClose: () => void;
  dadosAPI: DadosVeiculoAPI;
  veiculoId: string;
  clienteId: string | null;
  organizationId: string;
  userId: string;
  onSuccess: () => void;
}

export default function ModalPreviewDadosVeiculo({
  aberto,
  onClose,
  dadosAPI,
  veiculoId,
  clienteId,
  organizationId,
  userId,
  onSuccess,
}: Props) {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const [salvando, setSalvando] = useState(false);
  const [clientesExistentes, setClientesExistentes] = useState<ClienteExistente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(clienteId);
  const [modoCliente, setModoCliente] = useState<'existente' | 'criar' | 'atualizar'>(
    clienteId ? 'atualizar' : 'existente'
  );
  const [opcoes, setOpcoes] = useState({
    atualizarVeiculo: true,
    sincronizarCliente: true,
  });

  // Buscar clientes existentes para seleção
  useEffect(() => {
    const fetchClientes = async () => {
      if (!currentOrganization?.id) return;
      
      const { data } = await supabase
        .from('clientes')
        .select('id, nome_completo, cpf, cnpj, tipo_pessoa')
        .eq('organization_id', currentOrganization.id)
        .eq('ativo', true)
        .order('nome_completo');

      if (data) {
        setClientesExistentes(data as ClienteExistente[]);
      }
    };

    if (aberto) {
      fetchClientes();
    }
  }, [aberto, currentOrganization?.id]);

  if (!aberto) return null;

  const { dados_do_veiculo, restricoes_e_impedimentos, informacoes_tecnicas_e_adicionais } = dadosAPI;

  const handleSalvar = async () => {
    setSalvando(true);

    try {
      let clienteAtualId = clienteId;

      // Gerenciar cliente baseado no modo selecionado
      if (opcoes.sincronizarCliente) {
        const nomeProprietario = informacoes_tecnicas_e_adicionais.nomeproprietario;
        const documento = informacoes_tecnicas_e_adicionais.documentoproprietario;
        const tipoDoc = informacoes_tecnicas_e_adicionais.tipodocumentoproprietario;
        const isCPF = tipoDoc === 'CPF';

        if (modoCliente === 'existente' && clienteSelecionado) {
          // Usar cliente existente selecionado
          clienteAtualId = clienteSelecionado;
          toast.success('Cliente vinculado ao veículo!');
        } else if (modoCliente === 'atualizar' && clienteId) {
          // Atualizar cliente existente
          const { error: clienteError } = await supabase
            .from('clientes')
            .update({
              nome_completo: nomeProprietario,
              cpf: isCPF ? documento : null,
              cnpj: !isCPF ? documento : null,
              tipo_pessoa: isCPF ? 'fisica' : 'juridica',
              updated_at: new Date().toISOString(),
            })
            .eq('id', clienteId);

          if (clienteError) {
            console.error('Erro ao atualizar cliente:', clienteError);
            toast.error('Erro ao atualizar dados do cliente');
          } else {
            toast.success('Dados do cliente atualizados!');
          }
        } else if (modoCliente === 'criar') {
          // Criar novo cliente
          const { data: novoCliente, error: createError } = await supabase
            .from('clientes')
            .insert({
              user_id: userId || user?.id,
              organization_id: organizationId || currentOrganization?.id,
              nome_completo: nomeProprietario,
              cpf: isCPF ? documento : null,
              cnpj: !isCPF ? documento : null,
              tipo_pessoa: isCPF ? 'fisica' : 'juridica',
              ativo: true,
            })
            .select()
            .single();

          if (createError) {
            console.error('Erro ao criar cliente:', createError);
            toast.error('Erro ao criar cliente');
          } else {
            clienteAtualId = novoCliente.id;
            toast.success('Cliente criado com sucesso!');
          }
        }
      }

      // Atualizar veículo com TODOS os dados da API
      if (opcoes.atualizarVeiculo) {
        const updateData: Record<string, unknown> = {
          // Dados básicos
          modelo: `${dados_do_veiculo.marca} ${dados_do_veiculo.modelo}`,
          ano: dados_do_veiculo.anofabricacao,
          renavam: dados_do_veiculo.renavam,
          // Novos campos completos
          chassi: dados_do_veiculo.chassi,
          cor: dados_do_veiculo.cor,
          municipio: dados_do_veiculo.municipio,
          uf: dados_do_veiculo.uf,
          motor: informacoes_tecnicas_e_adicionais.motor,
          potencia: informacoes_tecnicas_e_adicionais.potencia,
          cilindradas: informacoes_tecnicas_e_adicionais.cilindradas,
          especie: informacoes_tecnicas_e_adicionais.especie,
          capacidade_passageiros: informacoes_tecnicas_e_adicionais.capacidadedepassageiros,
          quantidade_eixos: informacoes_tecnicas_e_adicionais.quantidadedeeixos,
          caixa_cambio: informacoes_tecnicas_e_adicionais.caixadecambio,
          situacao_veiculo: restricoes_e_impedimentos.situacao_veiculo,
          ultima_sincronizacao: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Vincular ao cliente se houver
        if (clienteAtualId) {
          updateData.cliente_id = clienteAtualId;
        }

        const { error: veiculoError } = await supabase
          .from('veiculos')
          .update(updateData)
          .eq('id', veiculoId);

        if (veiculoError) {
          console.error('Erro ao atualizar veículo:', veiculoError);
          toast.error('Erro ao atualizar dados do veículo');
        } else {
          toast.success('Dados do veículo atualizados!');
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar dados');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-car-line text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold">Dados do Veículo Consultado</h3>
              <p className="text-sm text-blue-100">Placa: {dados_do_veiculo.placa}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Opções de salvamento */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <i className="ri-settings-3-line"></i>
              O que deseja atualizar?
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opcoes.atualizarVeiculo}
                  onChange={(e) => setOpcoes({ ...opcoes, atualizarVeiculo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  Atualizar TODOS os dados do veículo (modelo, ano, RENAVAM, chassi, cor, motor, etc.)
                </span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opcoes.sincronizarCliente}
                  onChange={(e) => setOpcoes({ ...opcoes, sincronizarCliente: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Sincronizar dados do proprietário</span>
              </label>

              {/* Opções de cliente */}
              {opcoes.sincronizarCliente && (
                <div className="ml-6 mt-2 space-y-2 p-3 bg-white rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-500 mb-2">Como deseja vincular o proprietário?</p>
                  
                  {!clienteId && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="modoCliente"
                        checked={modoCliente === 'existente'}
                        onChange={() => setModoCliente('existente')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Selecionar cliente existente</span>
                    </label>
                  )}
                  
                  {clienteId && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="modoCliente"
                        checked={modoCliente === 'atualizar'}
                        onChange={() => setModoCliente('atualizar')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Atualizar cliente já vinculado</span>
                    </label>
                  )}
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modoCliente"
                      checked={modoCliente === 'criar'}
                      onChange={() => setModoCliente('criar')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Criar novo cliente com dados do proprietário</span>
                  </label>

                  {/* Seletor de cliente existente */}
                  {modoCliente === 'existente' && !clienteId && (
                    <div className="mt-2">
                      <select
                        value={clienteSelecionado || ''}
                        onChange={(e) => setClienteSelecionado(e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione um cliente...</option>
                        {clientesExistentes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome_completo} - {cliente.cpf || cliente.cnpj}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dados do Veículo */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="ri-car-fill text-blue-600"></i>
              Dados do Veículo
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoItem label="Placa" value={dados_do_veiculo.placa} highlight />
              <InfoItem label="Marca" value={dados_do_veiculo.marca} />
              <InfoItem label="Modelo" value={dados_do_veiculo.modelo} />
              <InfoItem label="Ano Fab." value={dados_do_veiculo.anofabricacao} />
              <InfoItem label="Cor" value={dados_do_veiculo.cor} />
              <InfoItem label="RENAVAM" value={dados_do_veiculo.renavam} highlight />
              <InfoItem label="Chassi" value={dados_do_veiculo.chassi} highlight />
              <InfoItem label="UF" value={dados_do_veiculo.uf} />
              <InfoItem label="Município" value={dados_do_veiculo.municipio} className="col-span-2" />
            </div>
          </div>

          {/* Dados do Proprietário */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="ri-user-fill text-green-600"></i>
              Dados do Proprietário
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem 
                label="Nome" 
                value={informacoes_tecnicas_e_adicionais.nomeproprietario} 
                className="col-span-2"
                highlight
              />
              <InfoItem 
                label={informacoes_tecnicas_e_adicionais.tipodocumentoproprietario} 
                value={informacoes_tecnicas_e_adicionais.documentoproprietario}
                highlight
              />
            </div>
          </div>

          {/* Informações Técnicas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="ri-tools-fill text-gray-600"></i>
              Informações Técnicas
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoItem label="Motor" value={informacoes_tecnicas_e_adicionais.motor} />
              <InfoItem label="Espécie" value={informacoes_tecnicas_e_adicionais.especie} />
              <InfoItem label="Potência (cv)" value={informacoes_tecnicas_e_adicionais.potencia} />
              <InfoItem label="Cilindradas" value={informacoes_tecnicas_e_adicionais.cilindradas} />
              <InfoItem label="Câmbio" value={informacoes_tecnicas_e_adicionais.caixadecambio} />
              <InfoItem label="Eixos" value={informacoes_tecnicas_e_adicionais.quantidadedeeixos} />
              <InfoItem label="Passageiros" value={informacoes_tecnicas_e_adicionais.capacidadedepassageiros} />
            </div>
          </div>

          {/* Restrições */}
          <div className="bg-amber-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="ri-alert-fill text-amber-600"></i>
              Restrições e Impedimentos
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem 
                label="Situação" 
                value={restricoes_e_impedimentos.situacao_veiculo}
                status={restricoes_e_impedimentos.situacao_veiculo === 'EM CIRCULAÇÃO' ? 'success' : 'warning'}
              />
              <InfoItem 
                label="Multa RENAINF" 
                value={restricoes_e_impedimentos.multa_renainf}
                status={restricoes_e_impedimentos.multa_renainf === 'NÃO' ? 'success' : 'error'}
              />
              <InfoItem 
                label="Recall" 
                value={restricoes_e_impedimentos.recall}
                status={restricoes_e_impedimentos.recall === 'NÃO' ? 'success' : 'warning'}
              />
              <InfoItem 
                label="Roubo/Furto" 
                value={restricoes_e_impedimentos.roubo_e_furto}
                className="col-span-2 md:col-span-3"
                status={restricoes_e_impedimentos.roubo_e_furto?.includes('SEM OCORRÊNCIA') ? 'success' : 'error'}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando || (!opcoes.atualizarVeiculo && !opcoes.sincronizarCliente)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {salvando ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Salvando...
              </>
            ) : (
              <>
                <i className="ri-save-line"></i>
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para exibir informação
function InfoItem({ 
  label, 
  value, 
  highlight = false,
  className = '',
  status,
}: { 
  label: string; 
  value: string | null | undefined; 
  highlight?: boolean;
  className?: string;
  status?: 'success' | 'warning' | 'error';
}) {
  const getStatusStyles = () => {
    if (!status) return '';
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className={className}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-blue-700' : 'text-gray-800'} ${status ? `px-2 py-1 rounded ${getStatusStyles()}` : ''}`}>
        {value || '-'}
      </p>
    </div>
  );
}
