import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultasRastreamento, MultaRastreada } from '../../hooks/useMultasRastreamento';
import ModalDetalhesMulta from '../../components/rastreamento/ModalDetalhesMulta';
import ModalHistoricoConsultas from '../../components/rastreamento/ModalHistoricoConsultas';
import ModalEditarVeiculo from '../../components/rastreamento/ModalEditarVeiculo';
import ModalEditarMulta from '../../components/rastreamento/ModalEditarMulta';
import ModalPreviewDadosVeiculo from '../../components/rastreamento/ModalPreviewDadosVeiculo';
import ListaVeiculosCadastrados from '../../components/rastreamento/ListaVeiculosCadastrados';
import { useClientes } from '../../hooks/useClientes';
import { useVeiculos } from '../../hooks/useVeiculos';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export default function Rastreamento() {
  const navigate = useNavigate();
  const { multas: multasReais, loading, contadores, refresh } = useMultasRastreamento();
  const { createCliente } = useClientes();
  const { createVeiculo, createVeiculosBatch } = useVeiculos();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoRastreamento, setTipoRastreamento] = useState<'frota' | 'individual' | null>(null);
  const [multaSelecionada, setMultaSelecionada] = useState<MultaRastreada | null>(null);
  const [multaParaEditar, setMultaParaEditar] = useState<MultaRastreada | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [historicoModalAberto, setHistoricoModalAberto] = useState(false);
  const [editarVeiculoModalAberto, setEditarVeiculoModalAberto] = useState(false);
  const [veiculoParaEditar, setVeiculoParaEditar] = useState<{
    id: string;
    placa: string;
    modelo: string;
    ano: string | null;
    renavam: string | null;
    rastreamento_ativo: boolean;
    rastreamento_valor: number;
    cliente_id: string;
    cliente_nome: string;
  } | null>(null);
  const [veiculoParaHistorico, setVeiculoParaHistorico] = useState<{
    id: string;
    placa: string;
    modelo: string;
    ano: string | null;
    cliente_nome: string;
    cliente_documento: string | null;
  } | null>(null);
  const [previewDadosAberto, setPreviewDadosAberto] = useState(false);
  const [dadosVeiculoAPI, setDadosVeiculoAPI] = useState<{
    dados: unknown;
    veiculoId: string;
    clienteId: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    nomeCliente: '',
    cpfCnpj: '',
    email: '',
    telefone: '',
    placas: [{ placa: '', modelo: '', ano: '', renavam: '' }],
    nomeEmpresa: '',
    numeroVeiculos: '',
  });

  // Função para abrir o modal de preview com dados da API
  const handleDadosVeiculoRecebidos = (dados: unknown, veiculoId: string, clienteId: string | null) => {
    setDadosVeiculoAPI({ dados, veiculoId, clienteId });
    setPreviewDadosAberto(true);
  };

  // Função para navegar para recursos-ia com todos os dados completos
  const navegarParaRecursoIA = (multa: MultaRastreada) => {
    const params = new URLSearchParams({
      placa: multa.placa,
      modelo: multa.modelo || '',
      ano: multa.ano || '',
      renavam: multa.renavam || '',
      codigoInfracao: multa.codigoInfracao,
      descricaoInfracao: multa.descricaoInfracao,
      valorMulta: String(multa.valor),
      pontos: String(multa.pontos),
      gravidade: multa.gravidade || '',
      dataInfracao: multa.dataMulta,
      horaInfracao: multa.horaInfracao || '',
      numeroAuto: multa.numeroAuto || '',
      localInfracao: multa.localInfracao || '',
      orgaoAutuador: multa.orgaoAutuador || '',
      municipio: multa.municipio || '',
      ufInfracao: multa.ufInfracao || '',
      clienteNome: multa.clienteNome || '',
      clienteCpf: multa.clienteCpf || '',
      clienteCnpj: multa.clienteCnpj || '',
      clienteEmail: multa.clienteEmail || '',
      clienteTelefone: multa.clienteCelular || multa.clienteTelefone || '',
    });
    
    // Adicionar endereço se existir
    if (multa.clienteEndereco) {
      params.set('clienteEndereco', JSON.stringify(multa.clienteEndereco));
    }
    
    navigate(`/recursos-ia?${params.toString()}`);
  };

  // Filtrar multas
  const multasFiltradas = multasReais.filter(multa => {
    const matchBusca = !busca || multa.placa.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || multa.status === filtroStatus;
    const matchTipo = filtroTipo === 'todos' || multa.codigoInfracao.includes(filtroTipo);
    return matchBusca && matchStatus && matchTipo;
  });

  // Função para excluir multa
  const handleDeleteMulta = async (multaId: string, placa: string) => {
    if (!confirm(`Tem certeza que deseja excluir a multa do veículo ${placa}?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('multas').delete().eq('id', multaId);
      
      if (error) throw error;

      toast.success('Multa excluída com sucesso');
      refresh();
    } catch (error) {
      console.error('Erro ao excluir multa:', error);
      toast.error('Erro ao excluir multa');
    }
  };

  const abrirModal = (tipo: 'frota' | 'individual') => {
    setTipoRastreamento(tipo);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setTipoRastreamento(null);
    setFormData({
      nomeCliente: '',
      cpfCnpj: '',
      email: '',
      telefone: '',
      placas: [{ placa: '', modelo: '', ano: '', renavam: '' }],
      nomeEmpresa: '',
      numeroVeiculos: '',
    });
  };

  const adicionarPlaca = () => {
    setFormData({ 
      ...formData, 
      placas: [...formData.placas, { placa: '', modelo: '', ano: '', renavam: '' }] 
    });
  };

  const removerPlaca = (index: number) => {
    const novasPlacas = formData.placas.filter((_, i) => i !== index);
    setFormData({ ...formData, placas: novasPlacas });
  };

  const atualizarPlaca = (index: number, campo: 'placa' | 'modelo' | 'ano' | 'renavam', valor: string) => {
    const novasPlacas = [...formData.placas];
    novasPlacas[index] = { ...novasPlacas[index], [campo]: valor };
    setFormData({ ...formData, placas: novasPlacas });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrganization) {
      toast.error('Organização não encontrada');
      return;
    }

    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Validar que tem pelo menos uma placa preenchida
    const placasValidas = formData.placas.filter(p => p.placa.trim() !== '');
    if (placasValidas.length === 0) {
      toast.error('Informe pelo menos uma placa');
      return;
    }

    setSalvando(true);
    
    try {
      // 1. Criar o cliente
      const tipoPessoa = tipoRastreamento === 'frota' ? 'juridica' : 'fisica';
      const clienteData = {
        user_id: user.id,
        nome_completo: formData.nomeCliente,
        tipo_pessoa: tipoPessoa as 'fisica' | 'juridica',
        cpf: tipoPessoa === 'fisica' ? formData.cpfCnpj : null,
        cnpj: tipoPessoa === 'juridica' ? formData.cpfCnpj : null,
        razao_social: tipoRastreamento === 'frota' ? formData.nomeEmpresa : null,
        nome_fantasia: tipoRastreamento === 'frota' ? formData.nomeEmpresa : null,
        email: formData.email,
        celular: formData.telefone,
        organization_id: currentOrganization.id,
        ativo: true,
      };

      const cliente = await createCliente(clienteData);
      
      if (!cliente) {
        throw new Error('Falha ao criar cliente');
      }

      // 2. Criar os veículos com rastreamento ativo
      const veiculosData = placasValidas.map(p => ({
        placa: p.placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
        modelo: p.modelo || 'Não informado',
        ano: p.ano || null,
        renavam: p.renavam || null,
        cliente_id: cliente.id,
        rastreamento_ativo: true,
        rastreamento_inicio: new Date().toISOString(),
        rastreamento_valor: tipoRastreamento === 'frota' ? 50 : 60,
        ativo: true,
      }));

      if (veiculosData.length === 1) {
        await createVeiculo(veiculosData[0]);
      } else {
        await createVeiculosBatch(veiculosData);
      }

      toast.success(`${placasValidas.length} veículo(s) cadastrado(s) com sucesso!`);
      fecharModal();
      refresh(); // Atualizar lista de multas
      
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar rastreamento');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Rastreamento de Multas</h2>
          <p className="text-sm text-gray-600 mt-2">Gerencie todas as multas rastreadas da sua frota</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => abrirModal('frota')}
          className="bg-white rounded-lg shadow-md p-8 border-2 border-gray-200 hover:border-[#1E3A8A] transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-[#1E3A8A] transition-colors">
              <i className="ri-truck-line text-4xl text-[#1E3A8A] group-hover:text-white"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Rastreamento de Frotas</h3>
              <p className="text-sm text-gray-600 mt-2">Para empresas com múltiplos veículos</p>
              <p className="text-xs text-gray-500 mt-1">A partir de 3 veículos - R$ 50/placa (Gratuito) | R$ 25/placa (Premium)</p>
            </div>
            <button className="px-6 py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-green-600 transition-colors whitespace-nowrap">
              <i className="ri-add-line mr-2"></i>
              Cadastrar Frota
            </button>
          </div>
        </div>

        <div
          onClick={() => abrirModal('individual')}
          className="bg-white rounded-lg shadow-md p-8 border-2 border-gray-200 hover:border-[#10B981] transition-all cursor-pointer group"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-[#10B981] transition-colors">
              <i className="ri-user-line text-4xl text-[#10B981] group-hover:text-white"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Rastreamento Individual</h3>
              <p className="text-sm text-gray-600 mt-2">Para pessoas físicas ou veículos individuais</p>
              <p className="text-xs text-gray-500 mt-1">R$ 60 por veículo (Gratuito) | R$ 30 por veículo (Premium)</p>
            </div>
            <button className="px-6 py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-green-600 transition-colors whitespace-nowrap">
              <i className="ri-add-line mr-2"></i>
              Cadastrar Individual
            </button>
          </div>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {tipoRastreamento === 'frota' ? 'Cadastrar Rastreamento de Frota' : 'Cadastrar Rastreamento Individual'}
              </h3>
              <button
                onClick={fecharModal}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {tipoRastreamento === 'frota' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nomeEmpresa}
                    onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="Digite o nome da empresa"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {tipoRastreamento === 'frota' ? 'Nome do Responsável *' : 'Nome Completo *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomeCliente}
                  onChange={(e) => setFormData({ ...formData, nomeCliente: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {tipoRastreamento === 'frota' ? 'CNPJ *' : 'CPF *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.cpfCnpj}
                  onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  placeholder={tipoRastreamento === 'frota' ? '00.000.000/0000-00' : '000.000.000-00'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              {tipoRastreamento === 'frota' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Veículos *
                  </label>
                  <input
                    type="number"
                    required
                    min="3"
                    value={formData.numeroVeiculos}
                    onChange={(e) => setFormData({ ...formData, numeroVeiculos: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="Mínimo 3 veículos"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Placas dos Veículos *
                  </label>
                  <button
                    type="button"
                    onClick={adicionarPlaca}
                    className="text-sm text-[#10B981] font-medium hover:underline cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-add-line mr-1"></i>
                    Adicionar Placa
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.placas.map((veiculoData, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Veículo {index + 1}</span>
                        {formData.placas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removerPlaca(index)}
                            className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                          >
                            <i className="ri-delete-bin-line mr-1"></i>
                            Remover
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Placa *</label>
                          <input
                            type="text"
                            required
                            value={veiculoData.placa}
                            onChange={(e) => atualizarPlaca(index, 'placa', e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                            placeholder="ABC1D23"
                            maxLength={7}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Modelo</label>
                          <input
                            type="text"
                            value={veiculoData.modelo}
                            onChange={(e) => atualizarPlaca(index, 'modelo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                            placeholder="Ex: Fiat Uno"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Ano</label>
                          <input
                            type="text"
                            value={veiculoData.ano}
                            onChange={(e) => atualizarPlaca(index, 'ano', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                            placeholder="2024"
                            maxLength={4}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">RENAVAM</label>
                          <input
                            type="text"
                            value={veiculoData.renavam}
                            onChange={(e) => atualizarPlaca(index, 'renavam', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                            placeholder="00000000000"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-6 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 flex items-center"
                >
                  {salvando ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className="ri-check-line mr-2"></i>
                      Cadastrar Rastreamento
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Veículos Cadastrados com opção de Rastrear Multas */}
      <ListaVeiculosCadastrados 
        onRefreshMultas={refresh} 
        onEditVeiculo={(veiculo) => {
          setVeiculoParaEditar({
            id: veiculo.id,
            placa: veiculo.placa,
            modelo: veiculo.modelo,
            ano: veiculo.ano,
            renavam: veiculo.renavam,
            rastreamento_ativo: veiculo.rastreamento_ativo,
            rastreamento_valor: veiculo.rastreamento_valor,
            cliente_id: veiculo.cliente_id,
            cliente_nome: veiculo.cliente_nome,
          });
          setEditarVeiculoModalAberto(true);
        }}
        onViewHistorico={(veiculo) => {
          setVeiculoParaHistorico({
            id: veiculo.id,
            placa: veiculo.placa,
            modelo: veiculo.modelo,
            ano: veiculo.ano,
            cliente_nome: veiculo.cliente_nome,
            cliente_documento: veiculo.cliente_cpf || veiculo.cliente_cnpj,
          });
          setHistoricoModalAberto(true);
        }}
        onDadosVeiculoRecebidos={handleDadosVeiculoRecebidos}
      />

      {/* Modal de Editar Veículo */}
      <ModalEditarVeiculo
        veiculo={veiculoParaEditar}
        isOpen={editarVeiculoModalAberto}
        onClose={() => {
          setEditarVeiculoModalAberto(false);
          setVeiculoParaEditar(null);
        }}
        onSave={() => {
          refresh();
        }}
      />
      
      {/* Modal de Histórico de Consultas */}
      <ModalHistoricoConsultas
        veiculo={veiculoParaHistorico}
        isOpen={historicoModalAberto}
        onClose={() => {
          setHistoricoModalAberto(false);
          setVeiculoParaHistorico(null);
        }}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por placa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
          >
            <option value="todos">Todos os Status</option>
            <option value="suspensiva">Suspensiva</option>
            <option value="analise">Em Análise</option>
            <option value="concluido">Concluído</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] cursor-pointer"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="5169">5169 - Dirigir sob efeito de substância</option>
            <option value="7579">7579 - Forçar passagem entre veículos</option>
            <option value="5797">5797 - Estacionamento irregular</option>
            <option value="5274">5274 - Manobras perigosas</option>
            <option value="5240">5240 - Disputar corrida (racha)</option>
            <option value="5266">5266 - Competição sem permissão</option>
            <option value="5290">5290 - Não adotar providências de segurança</option>
            <option value="7617">7617 - Interromper circulação da via</option>
            <option value="7471">7471 - Excesso de velocidade acima de 50%</option>
            <option value="5029">5029 - Dirigir com CNH cassada</option>
          </select>

          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-filter-3-line mr-2"></i>
            Mais Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-red-50 rounded-lg border-l-4 border-[#EF4444]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspensivas</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{contadores.suspensivas}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-alert-line text-2xl text-[#EF4444]"></i>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-[#F59E0B]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Análise</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{contadores.emAnalise}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="ri-time-line text-2xl text-[#F59E0B]"></i>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-[#10B981]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{contadores.concluidos}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-2xl text-[#10B981]"></i>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando multas...</span>
          </div>
        ) : multasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-file-list-3-line text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">Nenhuma multa encontrada</p>
            <p className="text-sm text-gray-400 mt-1">
              Cadastre veículos e multas para visualizá-los aqui
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Placa</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo de Multa</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Valor</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pontos</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {multasFiltradas.map((multa) => (
                    <tr key={multa.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{multa.placa.substring(0, 3)}</span>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-800">{multa.placa}</span>
                            {multa.clienteNome && (
                              <p className="text-xs text-gray-500">{multa.clienteNome}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {multa.codigoInfracao} - {multa.descricaoInfracao.substring(0, 50)}{multa.descricaoInfracao.length > 50 ? '...' : ''}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          multa.status === 'suspensiva' ? 'bg-red-100 text-[#EF4444]' :
                          multa.status === 'analise' ? 'bg-yellow-100 text-[#F59E0B]' :
                          multa.status === 'pendente' ? 'bg-gray-100 text-gray-600' :
                          'bg-green-100 text-[#10B981]'
                        }`}>
                          {multa.status === 'suspensiva' ? 'Suspensiva' :
                           multa.status === 'analise' ? 'Em Análise' :
                           multa.status === 'pendente' ? 'Pendente' :
                           'Concluído'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{formatDate(multa.dataMulta)}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-800">{formatCurrency(multa.valor)}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                          {multa.pontos} pts
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navegarParaRecursoIA(multa);
                            }}
                            className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-robot-line mr-1"></i>
                            Gerar Recurso IA
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setMultaParaEditar(multa);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar multa"
                          >
                            <i className="ri-pencil-line text-lg"></i>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMulta(multa.id, multa.placa);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir multa"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">Mostrando {multasFiltradas.length} de {contadores.total} multas</p>
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalhes da Multa */}
      {multaSelecionada && (
        <ModalDetalhesMulta
          multa={multaSelecionada}
          onClose={() => setMultaSelecionada(null)}
          onGerarRecurso={(multa) => {
            setMultaSelecionada(null);
            navegarParaRecursoIA(multa);
          }}
        />
      )}

      {/* Modal de Edição de Multa */}
      <ModalEditarMulta
        multa={multaParaEditar}
        isOpen={!!multaParaEditar}
        onClose={() => setMultaParaEditar(null)}
        onSave={() => {
          refresh();
        }}
      />

      {/* Modal de Preview de Dados do Veículo */}
      {dadosVeiculoAPI && currentOrganization && user && (
        <ModalPreviewDadosVeiculo
          aberto={previewDadosAberto}
          onClose={() => {
            setPreviewDadosAberto(false);
            setDadosVeiculoAPI(null);
          }}
          dadosAPI={dadosVeiculoAPI.dados as {
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
          }}
          veiculoId={dadosVeiculoAPI.veiculoId}
          clienteId={dadosVeiculoAPI.clienteId}
          organizationId={currentOrganization.id}
          userId={user.id}
          onSuccess={() => refresh()}
        />
      )}
    </div>
  );
}