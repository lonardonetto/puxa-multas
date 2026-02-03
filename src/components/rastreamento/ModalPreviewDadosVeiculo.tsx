import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

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
  const [salvando, setSalvando] = useState(false);
  const [opcoes, setOpcoes] = useState({
    atualizarVeiculo: true,
    atualizarCliente: true,
    criarClienteSeNaoExistir: true,
  });

  if (!aberto) return null;

  const { dados_do_veiculo, restricoes_e_impedimentos, informacoes_tecnicas_e_adicionais } = dadosAPI;

  const handleSalvar = async () => {
    setSalvando(true);

    try {
      let clienteAtualId = clienteId;

      // 1. Criar ou atualizar cliente
      if (opcoes.atualizarCliente || opcoes.criarClienteSeNaoExistir) {
        const nomeProprietario = informacoes_tecnicas_e_adicionais.nomeproprietario;
        const documento = informacoes_tecnicas_e_adicionais.documentoproprietario;
        const tipoDoc = informacoes_tecnicas_e_adicionais.tipodocumentoproprietario;
        const isCPF = tipoDoc === 'CPF';

        if (clienteId && opcoes.atualizarCliente) {
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
        } else if (!clienteId && opcoes.criarClienteSeNaoExistir) {
          // Criar novo cliente
          const { data: novoCliente, error: createError } = await supabase
            .from('clientes')
            .insert({
              user_id: userId,
              organization_id: organizationId,
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

      // 2. Atualizar veículo
      if (opcoes.atualizarVeiculo) {
        const updateData: Record<string, unknown> = {
          modelo: `${dados_do_veiculo.marca} ${dados_do_veiculo.modelo}`,
          ano: dados_do_veiculo.anofabricacao,
          renavam: dados_do_veiculo.renavam,
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
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opcoes.atualizarVeiculo}
                  onChange={(e) => setOpcoes({ ...opcoes, atualizarVeiculo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Atualizar dados do veículo (modelo, ano, RENAVAM)</span>
              </label>
              {clienteId ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opcoes.atualizarCliente}
                    onChange={(e) => setOpcoes({ ...opcoes, atualizarCliente: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Atualizar dados do cliente vinculado</span>
                </label>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opcoes.criarClienteSeNaoExistir}
                    onChange={(e) => setOpcoes({ ...opcoes, criarClienteSeNaoExistir: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Criar cliente e vincular ao veículo</span>
                </label>
              )}
            </div>
          </div>

          {/* Dados do Veículo */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="ri-car-fill text-blue-600"></i>
              Dados do Veículo
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="Placa" value={dados_do_veiculo.placa} />
              <InfoItem label="Marca" value={dados_do_veiculo.marca} />
              <InfoItem label="Modelo" value={dados_do_veiculo.modelo} />
              <InfoItem label="Ano Fab." value={dados_do_veiculo.anofabricacao} />
              <InfoItem label="Cor" value={dados_do_veiculo.cor} />
              <InfoItem label="RENAVAM" value={dados_do_veiculo.renavam} highlight />
              <InfoItem label="Chassi" value={dados_do_veiculo.chassi} />
              <InfoItem label="UF" value={dados_do_veiculo.uf} />
              <InfoItem label="Município" value={dados_do_veiculo.municipio} />
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
            disabled={salvando || (!opcoes.atualizarVeiculo && !opcoes.atualizarCliente && !opcoes.criarClienteSeNaoExistir)}
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
