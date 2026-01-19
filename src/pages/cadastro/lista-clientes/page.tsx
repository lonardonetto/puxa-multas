import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCurrentPlan } from '../../../hooks/useCurrentPlan';
import { useClientes, useVeiculos, useServicos, useContratos, useDocumentos } from '../../../hooks';
import { useHistorico } from '../../../hooks/useHistorico';
import { useCustomFases } from '../../../hooks/useCustomFases';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { getPublicUrl, supabase } from '../../../lib/supabase';
import { CONTRACT_TEMPLATES, type ContractTemplateId } from '../../../components/contracts/contractTemplates';
import { ContractHeader, ContractFooter } from '../../../components/contracts/ContractHeader';
import type { Cliente, Documento, Contrato, Servico, Veiculo } from '../../../types/database';

export default function ListaClientes() {
  const { currentOrganization } = useOrganization();
  const { clientes, loading: loadingClientes, fetchClientesByOrganization, updateCliente, deleteCliente, createCliente } = useClientes();
  const { veiculos, fetchVeiculosByOrganization, fetchVeiculosByCliente } = useVeiculos();
  const { servicos, fetchServicos } = useServicos();
  const { contratos, fetchContratosByCliente, createContrato, deleteContrato, updateContrato } = useContratos();
  const { documentos, fetchDocumentosByCliente, uploadDocumento, deleteDocumento } = useDocumentos();
  const { activities, fetchActivities, addActivity } = useHistorico();
  const { fases: customFases, addFase } = useCustomFases();
  const [searchParams, setSearchParams] = useSearchParams();

  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [clienteIdSelecionado, setClienteIdSelecionado] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'dados' | 'servicos' | 'documentos'>('dados');
  const [editando, setEditando] = useState(false);
  const [criandoContrato, setCriandoContrato] = useState(false);
  const [salvandoContrato, setSalvandoContrato] = useState(false);
  const [contratoVisualizado, setContratoVisualizado] = useState<Contrato | null>(null);

  // Estados para Contrato Avançado
  const [servicoSelecionadoParaContrato, setServicoSelecionadoParaContrato] = useState<Servico | null>(null);
  const [modeloSelecionado, setModeloSelecionado] = useState<ContractTemplateId | null>(null);
  const [autoInfracao, setAutoInfracao] = useState('');
  const [processoAdministrativo, setProcessoAdministrativo] = useState('');
  const [penalidades, setPenalidades] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [faseAit, setFaseAit] = useState<string>('');
  const [faseProcesso, setFaseProcesso] = useState<string>('');
  const [editandoConteudo, setEditandoConteudo] = useState<string | null>(null);
  const [intervaloNotificacao, setIntervaloNotificacao] = useState<number>(7);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info' | 'success';
    confirmLabel?: string;
    cancelLabel?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'danger'
  });

  const showConfirm = (config: Omit<typeof confirmModal, 'isOpen'>) => {
    setConfirmModal({ ...config, isOpen: true });
  };

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchClientesByOrganization(currentOrganization.id);
      fetchVeiculosByOrganization(currentOrganization.id);
      fetchServicos(currentOrganization.id);
    }
  }, [currentOrganization?.id, fetchClientesByOrganization, fetchVeiculosByOrganization, fetchServicos]);

  useEffect(() => {
    if (clienteIdSelecionado) {
      fetchContratosByCliente(clienteIdSelecionado);
      fetchDocumentosByCliente(clienteIdSelecionado);
      fetchActivities(clienteIdSelecionado);
    }
  }, [clienteIdSelecionado, fetchContratosByCliente, fetchDocumentosByCliente, fetchActivities]);

  // Handle deep-linking from URL
  useEffect(() => {
    const idFromUrl = searchParams.get('clienteId');
    if (idFromUrl && clientes.length > 0) {
      if (idFromUrl !== clienteIdSelecionado) {
        const exists = clientes.some(c => c.id === idFromUrl);
        if (exists) {
          setClienteIdSelecionado(idFromUrl);
          setAbaAtiva('dados');
        }
      }
    } else if (!idFromUrl && clienteIdSelecionado) {
      // If URL is cleared, close the modal
      setClienteIdSelecionado(null);
      setEditando(false);
    }
  }, [searchParams, clientes]);

  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente => {
      const matchBusca = busca === '' ||
        cliente.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.email.toLowerCase().includes(busca.toLowerCase()) ||
        (cliente.cpf && cliente.cpf.includes(busca)) ||
        (cliente.cnpj && cliente.cnpj.includes(busca));

      const matchTipo = filtroTipo === 'todos' || cliente.tipo_pessoa === filtroTipo;

      return matchBusca && matchTipo;
    });
  }, [clientes, busca, filtroTipo]);

  const stats = useMemo(() => {
    const total = clientes.length;
    const pf = clientes.filter(c => c.tipo_pessoa === 'fisica').length;
    const pj = clientes.filter(c => c.tipo_pessoa === 'juridica').length;
    const totalVeiculos = veiculos.length;
    return { total, pf, pj, totalVeiculos };
  }, [clientes, veiculos]);

  const abrirPastaCliente = (id: string, startEditing: boolean = false) => {
    setClienteIdSelecionado(id);
    fetchActivities(id);
    if (startEditing) {
      setAbaAtiva('dados');
      setEditando(true);
    } else {
      setEditando(false);
    }
    // Update URL with clienteId
    setSearchParams({ clienteId: id });
  };

  const fecharPastaCliente = () => {
    setClienteIdSelecionado(null);
    setAbaAtiva('dados');
    setEditando(false);
    // Remove clienteId from URL when closing
    setSearchParams({});
  };

  const clienteAtual = clientes.find((c) => c.id === clienteIdSelecionado);
  const veiculosDoCliente = veiculos.filter(v => v.cliente_id === clienteIdSelecionado);

  const formatarData = (dataStr: string) => {
    try {
      return new Intl.DateTimeFormat('pt-BR').format(new Date(dataStr));
    } catch {
      return dataStr;
    }
  };

  const contratosDoCliente = contratos; // Agora vem do hook
  const documentosDoCliente = documentos; // Agora vem do hook

  const gerarConteudoContrato = (cliente: Cliente, servico: Servico, extra?: { ait?: string, penalidades?: string, pagamento?: string }) => {
    const doc = cliente.tipo_pessoa === 'fisica' ? `CPF: ${cliente.cpf}` : `CNPJ: ${cliente.cnpj}`;
    const endereco = cliente.endereco ?
      `${cliente.endereco.logradouro}, ${cliente.endereco.numero} - ${cliente.endereco.bairro}, ${cliente.endereco.cidade}/${cliente.endereco.estado} - CEP: ${cliente.endereco.cep}` :
      'Endereço não informado';

    const orgDados = currentOrganization ? `
CONTRATADO: ${currentOrganization.nome}, pessoa jurídica de direito privado, devidamente inscrito no CNPJ: ${currentOrganization.cnpj || 'Não cadastrado'}, representado neste ato por seu sócio proprietário, com escritório profissional a ${currentOrganization.endereco_completo || 'Endereço da empresa'}.` : '';

    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // Modelo Especializado (Modelo 01)
    if (extra?.ait) {
      return `CONTRATO DE PRESTAÇÃO DE SERVIÇO:

CONTRATANTE:
NOME: ${cliente.nome_completo.toUpperCase()}
ESTADO CIVIL: ${cliente.estado_civil || 'Não informado'}
PROFISSÃO: ${cliente.profissao || 'Não informado'}
NACIONALIDADE: Brasileira
DOCUMENTO: ${doc}
RG/IE: ${cliente.rg || 'Não informado'}
ENDEREÇO: ${endereco}
TELEFONE: ${cliente.celular}
E-MAIL: ${cliente.email}

${orgDados}

CLÁUSULA PRIMEIRA – DAS OBRIGAÇÕES DO CONTRATADO: 
A parte Contratada obriga-se, a prestar seus serviços profissionais: 

Nº do Auto de Infração: Nº AUTO: ${extra.ait}
Nesses autos serão discutidas as penalidades: ${extra.penalidades || 'MULTA + SUSPENSÃO'}.

CLÁUSULA SEGUNDA – DAS OBRIGAÇÕES DO(A) CONTRATANTE: 
Em remuneração dos serviços descritos na cláusula anterior, o CONTRATANTE pagará a título de valores convencionais ao CONTRATADO, o valor:

    1. VALOR: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.preco_base)}
    2. FORMA DE PAGAMENTO: ${extra.pagamento || 'Honorários pactuados conforme negociação.'}

§ 1° - O atraso no pagamento por mais de 10 dias sujeitará ao Contratante a multa de 10% (dez por cento) sobre o valor a ser pago, mais a incidência de juros moratórios e juros compensatórios, considerados, ambos, individualmente, a razão de 1% (um por cento) ao mês. 
§ 2° - O critério de correção monetária, incidente sobre os valores deste contrato, será o resultante do IGPM/FGV. 
§ 3° - Custas e 20% de honorários advocatícios, caso o contrato precise ser executado judicial.
§ 4° - O contrato poderá ser reincidido pela parte contratada por falta de pagamento integral ou parcial dos valores ajustado, onde notificará a parte contratante extrajudicialmente para pagamento e regularização do débito em 10 dias, ou o presente serviço será suspenso, devendo a parte contratante nomear outrem.
§ 5º - Caso houver valores vinculados ao final do processo seja em fase de multa ou suspensão, será comunicado ao contratante a decisão e emitido boleto bancário com vencimento para 15 dias.
§ 6° - Em caso de pagamento a vista ou cartão de crédito, desconsiderar os parágrafos acima.

CLÁUSULA TERCEIRA – DA VIGÊNCIA E DEMAIS OBRIGAÇÕES: 
O termo inicial do presente contrato é o de sua assinatura, e terminará no finde do 
 ( x ) Auto de infração – Fase do AIT: ( X )  SEPEN (   ) JARI  (   ) CETRAN

    1. Todos os recursos serão revisados a pretensão de protocolo para os departamentos - SEPEN-JARI-CETRAN.
    2. Caso o auto esteja em fase do SEPEN- Iremos apresentar procuração e formular argumentos, e aguardar notificação para JARI e CETRAN, onde são analisados os méritos alegados em recurso.
    3. Caso vier ocorrer a distribuição do processo administrativo face a este auto de infração, ele está incluso neste contrato, posto o novo sistema do órgão autuador, onde em alguns casos possuem auto de infração para multa e outro processo para suspensão.
    4. A venda do veículo e demais procedimentos durante o trâmite do processo, é de responsabilidade do Contratante, visto que a multa até o julgamento definitivo, estará apenas suspensa.
    5. Não possui prazo estabelecido para julgamento dos recursos, visto dependermos do órgão julgador.
    6. A rescisão do contrato pela parte contratante após o protocolo do recurso, seja em fase SEPEN- JARI- CETRAN, não a exonera do pagamento, devendo os valores serem pagos em sua totalidade;

Data de Emissão: ${dataAtual}

Status: PENDENTE DE ASSINATURA DIGITAL`;
    }

    // Modelo Padrão
    return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: ${cliente.nome_completo}
DOCUMENTO: ${doc}
RG/IE: ${cliente.rg || 'Não informado'}
ENDEREÇO: ${endereco}
CONTATO: ${cliente.celular} | ${cliente.email}

${orgDados}

Pelo presente instrumento particular, as partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes:

CLÁUSULA PRIMEIRA - DO OBJETO
O objeto do presente contrato é a prestação de serviços de: ${servico.nome}.

CLÁUSULA SEGUNDA - DOS VALORES
Pela prestação dos serviços ora contratados, o CONTRATANTE pagará à CONTRATADA o valor total de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.preco_base)}.

CLÁUSULA TERCEIRA - DAS OBRIGAÇÕES
A CONTRATADA se compromete a realizar os serviços com zelo e profissionalismo, dentro dos prazos acordados.

Data de Emissão: ${dataAtual}

Status: PENDENTE DE ASSINATURA DIGITAL`;
  };


  const handleCriarContrato = async () => {
    if (!clienteIdSelecionado || !currentOrganization || !servicoSelecionadoParaContrato || !editandoConteudo) return;

    setSalvandoContrato(true);
    try {
      const result = await createContrato({
        cliente_id: clienteIdSelecionado,
        servico_id: servicoSelecionadoParaContrato.id,
        organization_id: currentOrganization.id,
        status: 'pendente',
        valor: servicoSelecionadoParaContrato.preco_base || 0,
        conteudo: editandoConteudo,
        auto_infracao: autoInfracao || null,
        penalidades: penalidades || null,
        forma_pagamento: formaPagamento || null,
        modelo_slug: modeloSelecionado || 'modelo_01',
        processo_administrativo: processoAdministrativo || null,
        fase_ait: faseAit || null,
        fase_processo: faseProcesso || null,
        intervalo_notificacao: intervaloNotificacao
      } as any);

      if (result) {
        // Limpar estados
        setCriandoContrato(false);
        setServicoSelecionadoParaContrato(null);
        setModeloSelecionado(null);
        setEditandoConteudo(null);
        setAutoInfracao('');
        setProcessoAdministrativo('');
        setPenalidades('');
        setFormaPagamento('');
        setFaseAit('');
        setFaseProcesso('');
        setIntervaloNotificacao(7);
        addActivity({
          cliente_id: clienteIdSelecionado,
          tipo: 'contrato_criado',
          descricao: `Contrato de ${servicoSelecionadoParaContrato.nome} gerado`,
          metadata: { contrato_id: result.id }
        });
        fetchContratosByCliente(clienteIdSelecionado);
        showConfirm({
          title: 'Sucesso',
          message: 'Contrato gerado com sucesso!',
          type: 'success',
          confirmLabel: 'OK',
          onConfirm: () => { }
        });
      } else {
        showConfirm({
          title: 'Erro',
          message: 'Erro ao gerar contrato. Verifique sua conexão ou permissões.',
          type: 'danger',
          confirmLabel: 'Tentar Novamente',
          onConfirm: () => { }
        });
      }
    } catch (err) {
      console.error('Erro ao criar contrato:', err);
      showConfirm({
        title: 'Erro Inesperado',
        message: 'Ocorreu um erro inesperado ao criar o contrato.',
        type: 'danger',
        confirmLabel: 'Fechar',
        onConfirm: () => { }
      });
    } finally {
      setSalvandoContrato(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Lista de Clientes</h2>
          <p className="text-sm text-gray-600 mt-1">Gerencie todos os clientes cadastrados</p>
        </div>
        <Link
          to="/cadastro/novo-cliente"
          className="px-6 py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-green-600 transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-user-add-line mr-2"></i>
          Novo Cliente
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-[#10B981]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-team-line text-2xl text-[#10B981]"></i>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-[#1E3A8A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pessoa Física</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pf}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-user-line text-2xl text-[#1E3A8A]"></i>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-[#F59E0B]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pessoa Jurídica</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pj}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="ri-building-line text-2xl text-[#F59E0B]"></i>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-[#EF4444]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Veículos</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalVeiculos}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i className="ri-car-line text-2xl text-[#EF4444]"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por nome, documento ou e-mail..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] cursor-pointer"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="fisica">Pessoa Física</option>
            <option value="juridica">Pessoa Jurídica</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Documento</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contato</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Veículos</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => {
                const numVeiculos = veiculos.filter(v => v.cliente_id === cliente.id).length;
                return (
                  <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {cliente.nome_completo.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{cliente.nome_completo}</p>
                          <p className="text-xs text-gray-500">Cadastro: {formatarData(cliente.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cliente.tipo_pessoa === 'fisica'
                          ? 'bg-blue-100 text-[#1E3A8A]'
                          : 'bg-yellow-100 text-[#F59E0B]'
                          }`}
                      >
                        {cliente.tipo_pessoa === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">{cliente.tipo_pessoa === 'fisica' ? cliente.cpf : cliente.cnpj}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-700">
                        <p>{cliente.email}</p>
                        <p className="text-xs text-gray-500">{cliente.celular}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        {numVeiculos} {numVeiculos === 1 ? 'veículo' : 'veículos'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${cliente.ativo ? 'bg-[#10B981]' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-gray-700">
                          {cliente.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => abrirPastaCliente(cliente.id)}
                          className="px-3 py-2 bg-[#10B981] text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                          title="Abrir Pasta do Cliente"
                        >
                          <i className="ri-folder-open-line"></i>
                          Pasta
                        </button>
                        <button
                          onClick={async () => {
                            showConfirm({
                              title: 'Alterar Status',
                              message: `Tem certeza que deseja ${cliente.ativo ? 'desativar' : 'ativar'} este cliente?`,
                              type: 'warning',
                              confirmLabel: cliente.ativo ? 'Desativar' : 'Ativar',
                              onConfirm: async () => {
                                const success = await updateCliente(cliente.id, { ativo: !cliente.ativo } as any);
                                if (success) {
                                  addActivity({
                                    cliente_id: cliente.id,
                                    tipo: 'status_alterado',
                                    descricao: `Cliente ${!cliente.ativo ? 'ativado' : 'desativado'}`,
                                    metadata: { novo_status: !cliente.ativo }
                                  });
                                }
                              }
                            });
                          }}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${cliente.ativo ? 'text-gray-400 border-gray-200 hover:text-red-500 hover:border-red-200' : 'text-green-500 border-green-200 hover:bg-green-50'
                            }`}
                          title={cliente.ativo ? 'Desativar Cliente' : 'Ativar Cliente'}
                        >
                          <i className={cliente.ativo ? 'ri-user-unfollow-line' : 'ri-user-follow-line'}></i>
                        </button>
                        <button
                          onClick={async () => {
                            showConfirm({
                              title: 'Excluir Cliente',
                              message: 'Tem certeza que deseja EXCLUIR este cliente permanentemente? Todos os dados, contratos e documentos vinculados serão perdidos.',
                              type: 'danger',
                              confirmLabel: 'Sim, Excluir',
                              onConfirm: async () => {
                                const success = await deleteCliente(cliente.id);
                                if (success) {
                                  showConfirm({
                                    title: 'Sucesso',
                                    message: 'Cliente excluído com sucesso.',
                                    type: 'success',
                                    confirmLabel: 'OK',
                                    onConfirm: () => { }
                                  });
                                }
                              }
                            });
                          }}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Cliente"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredClientes.length === 0 && !loadingClientes && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
              {loadingClientes && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Carregando clientes...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pasta do Cliente */}
      {clienteIdSelecionado && clienteAtual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{clienteAtual.nome_completo}</h3>
                  <p className="text-sm text-gray-600">Pasta do Cliente</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${clienteAtual.ativo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {clienteAtual.ativo ? 'Ativo' : 'Inativo'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    showConfirm({
                      title: 'Excluir Cliente',
                      message: 'Tem certeza que deseja EXCLUIR este cliente permanentemente?',
                      type: 'danger',
                      confirmLabel: 'Excluir permanentemente',
                      onConfirm: async () => {
                        const success = await deleteCliente(clienteAtual.id);
                        if (success) {
                          showConfirm({
                            title: 'Sucesso',
                            message: 'Cliente excluído com sucesso.',
                            type: 'success',
                            confirmLabel: 'Entendido',
                            onConfirm: () => {
                              fecharPastaCliente();
                            }
                          });
                        }
                      }
                    });
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium cursor-pointer"
                  title="Excluir Cliente"
                >
                  <i className="ri-delete-bin-line text-lg"></i>
                  Excluir
                </button>
                <div className="w-px h-6 bg-gray-200 mx-2"></div>
                <button
                  onClick={fecharPastaCliente}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            {/* Abas de Navegação */}
            <div className="border-b border-gray-200">
              {/* Header de Abas */}
              <div className="flex border-b border-gray-200 overflow-x-auto">
                <button
                  onClick={() => setAbaAtiva('dados')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${abaAtiva === 'dados' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <i className="ri-user-line mr-2"></i>
                  Dados do Cliente
                </button>
                <button
                  onClick={() => setAbaAtiva('servicos')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${abaAtiva === 'servicos' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <i className="ri-briefcase-line mr-2"></i>
                  Serviços e Contratos
                </button>
                <button
                  onClick={() => setAbaAtiva('documentos')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${abaAtiva === 'documentos' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <i className="ri-folder-open-line mr-2"></i>
                  Documentos
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Aba Dados do Cliente */}
              {abaAtiva === 'dados' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-bold text-gray-800 flex items-center">
                          <i className="ri-information-line mr-2 text-[#10B981]"></i>
                          Informações Básicas
                        </h4>
                        <button
                          onClick={() => setEditando(!editando)}
                          className="text-[#1E3A8A] hover:underline text-sm font-medium cursor-pointer"
                        >
                          {editando ? 'Cancelar' : 'Editar'}
                        </button>
                      </div>

                      {editando ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Nome Completo</label>
                              <input
                                type="text"
                                defaultValue={clienteAtual.nome_completo}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-nome"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Tipo de Pessoa</label>
                                <select
                                  defaultValue={clienteAtual.tipo_pessoa}
                                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                  id="edit-tipo-pessoa"
                                >
                                  <option value="fisica">Física</option>
                                  <option value="juridica">Jurídica</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Documento (CPF/CNPJ)</label>
                                <input
                                  type="text"
                                  defaultValue={clienteAtual.tipo_pessoa === 'fisica' ? clienteAtual.cpf || '' : clienteAtual.cnpj || ''}
                                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                  id="edit-documento"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">E-mail</label>
                              <input
                                type="email"
                                defaultValue={clienteAtual.email}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-email"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Celular</label>
                              <input
                                type="text"
                                defaultValue={clienteAtual.celular}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-celular"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Profissão</label>
                              <input
                                type="text"
                                defaultValue={clienteAtual.profissao || ''}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-profissao"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">RG (opcional)</label>
                              <input
                                type="text"
                                defaultValue={clienteAtual.rg || ''}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-rg"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Data de Nascimento</label>
                              <input
                                type="date"
                                defaultValue={clienteAtual.data_nascimento || ''}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-data-nascimento"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Estado Civil</label>
                              <select
                                defaultValue={clienteAtual.estado_civil || ''}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-estado-civil"
                              >
                                <option value="">Não informado</option>
                                <option value="solteiro">Solteiro(a)</option>
                                <option value="casado">Casado(a)</option>
                                <option value="divorciado">Divorciado(a)</option>
                                <option value="viuvo">Viúvo(a)</option>
                                <option value="uniao_estavel">União Estável</option>
                              </select>
                            </div>

                            {/* Campos para Pessoa Jurídica */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Razão Social (PJ)</label>
                                <input
                                  type="text"
                                  defaultValue={clienteAtual.razao_social || ''}
                                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                  id="edit-razao-social"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Nome Fantasia (PJ)</label>
                                <input
                                  type="text"
                                  defaultValue={clienteAtual.nome_fantasia || ''}
                                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                  id="edit-nome-fantasia"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Inscrição Estadual (PJ)</label>
                                <input
                                  type="text"
                                  defaultValue={clienteAtual.inscricao_estadual || ''}
                                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                  id="edit-inscricao-estadual"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Nome:</span>
                            <span className="font-bold text-gray-800">{clienteAtual.nome_completo}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Tipo:</span>
                            <span className="font-bold text-gray-800">
                              {clienteAtual.tipo_pessoa === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">Documento:</span>
                            <span className="font-bold text-gray-800">{clienteAtual.tipo_pessoa === 'fisica' ? clienteAtual.cpf : clienteAtual.cnpj}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">RG:</span>
                            <span className="font-bold text-gray-800">{clienteAtual.rg || 'Não informado'}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-500">Profissão:</span>
                            <span className="font-bold text-gray-800">{clienteAtual.profissao || 'Não informado'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-5 bg-gray-50 rounded-lg">
                      <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                        <i className="ri-map-pin-line mr-2 text-[#10B981]"></i>
                        Endereço Residencial
                      </h4>
                      {editando ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">CEP</label>
                              <input
                                type="text"
                                defaultValue={clienteAtual.endereco?.cep || ''}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-cep"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Bairro</label>
                              <input
                                type="text"
                                defaultValue={clienteAtual.endereco?.bairro || ''}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-bairro"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Logradouro (Rua/Av)</label>
                            <input
                              type="text"
                              defaultValue={clienteAtual.endereco?.logradouro || ''}
                              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                              id="edit-logradouro"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Número</label>
                              <input
                                type="text"
                                defaultValue={clienteAtual.endereco?.numero || ''}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-numero"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Complemento</label>
                              <input
                                type="text"
                                defaultValue={clienteAtual.endereco?.complemento || ''}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-complemento"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Cidade</label>
                              <input
                                type="text"
                                defaultValue={clienteAtual.endereco?.cidade || ''}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-cidade"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Estado (UF)</label>
                              <input
                                type="text"
                                defaultValue={clienteAtual.endereco?.estado || ''}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#10B981] outline-none"
                                id="edit-estado"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Logradouro</p>
                            <p className="text-gray-800 font-medium leading-relaxed">
                              {clienteAtual.endereco ?
                                `${clienteAtual.endereco.logradouro}, ${clienteAtual.endereco.numero} - ${clienteAtual.endereco.bairro}` :
                                'Endereço não informado'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Cidade / Estado</p>
                            <p className="text-gray-800 font-medium">
                              {clienteAtual.endereco ? `${clienteAtual.endereco.cidade}/${clienteAtual.endereco.estado}` : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">CEP</p>
                            <p className="text-gray-800 font-medium">
                              {clienteAtual.endereco?.cep || '-'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botão de Salvar (Abaixo das duas colunas quando em edição) */}
                    {editando && (
                      <div className="md:col-span-2 pt-4">
                        <button
                          onClick={async () => {
                            if (!clienteAtual) return;

                            // Pegar todos os valores
                            const nome = (document.getElementById('edit-nome') as HTMLInputElement).value;
                            const tipoPessoa = (document.getElementById('edit-tipo-pessoa') as HTMLSelectElement).value as any;
                            const documento = (document.getElementById('edit-documento') as HTMLInputElement).value;
                            const email = (document.getElementById('edit-email') as HTMLInputElement).value;
                            const celular = (document.getElementById('edit-celular') as HTMLInputElement).value;
                            const profissao = (document.getElementById('edit-profissao') as HTMLInputElement).value;
                            const rg = (document.getElementById('edit-rg') as HTMLInputElement).value;
                            const dataNascimento = (document.getElementById('edit-data-nascimento') as HTMLInputElement).value;
                            const estadoCivil = (document.getElementById('edit-estado-civil') as HTMLSelectElement).value;
                            const razaoSocial = (document.getElementById('edit-razao-social') as HTMLInputElement).value;
                            const nomeFantasia = (document.getElementById('edit-nome-fantasia') as HTMLInputElement).value;
                            const inscricaoEstadual = (document.getElementById('edit-inscricao-estadual') as HTMLInputElement).value;

                            const cep = (document.getElementById('edit-cep') as HTMLInputElement).value;
                            const bairro = (document.getElementById('edit-bairro') as HTMLInputElement).value;
                            const logradouro = (document.getElementById('edit-logradouro') as HTMLInputElement).value;
                            const numero = (document.getElementById('edit-numero') as HTMLInputElement).value;
                            const complemento = (document.getElementById('edit-complemento') as HTMLInputElement).value;
                            const cidade = (document.getElementById('edit-cidade') as HTMLInputElement).value;
                            const estado = (document.getElementById('edit-estado') as HTMLInputElement).value;

                            const updates: any = {
                              nome_completo: nome,
                              tipo_pessoa: tipoPessoa,
                              email: email,
                              celular: celular,
                              profissao: profissao,
                              rg: rg,
                              data_nascimento: dataNascimento || null,
                              estado_civil: estadoCivil || null,
                              razao_social: razaoSocial || null,
                              nome_fantasia: nomeFantasia || null,
                              inscricao_estadual: inscricaoEstadual || null,
                              endereco: {
                                cep, bairro, logradouro, numero, complemento, cidade, estado
                              }
                            };

                            if (tipoPessoa === 'fisica') {
                              updates.cpf = documento;
                              updates.cnpj = null;
                            } else {
                              updates.cnpj = documento;
                              updates.cpf = null;
                            }

                            const success = await updateCliente(clienteAtual.id, updates);

                            if (success) {
                              addActivity({
                                cliente_id: clienteAtual.id,
                                tipo: 'cliente_editado',
                                descricao: 'Dados cadastrais e endereço atualizados',
                                metadata: { alteracoes: updates }
                              });
                              showConfirm({
                                title: 'Atualizado!',
                                message: 'Os dados do cliente foram salvos com sucesso.',
                                type: 'success',
                                confirmLabel: 'Ótimo',
                                onConfirm: () => { }
                              });
                              setEditando(false);
                            }
                          }}
                          className="w-full py-4 bg-[#10B981] text-white rounded-xl text-lg font-bold shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                          <i className="ri-save-line"></i>
                          Salvar Todas as Alterações
                        </button>
                      </div>
                    )}

                    {/* Histórico de Atividades */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <i className="ri-history-line text-lg text-[#10B981]"></i>
                        <h4 className="text-base font-bold text-gray-800">Histórico de Atividades</h4>
                      </div>

                      <div className="space-y-3">
                        {activities.length > 0 ? (
                          activities.map((activity) => (
                            <div key={activity.id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.tipo === 'contrato_assinado' ? 'bg-green-100 text-green-600' :
                                activity.tipo === 'documento_enviado' ? 'bg-blue-100 text-blue-600' :
                                  activity.tipo === 'cadastro' ? 'bg-orange-100 text-orange-600' :
                                    activity.tipo === 'cliente_editado' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                <i className={
                                  activity.tipo === 'contrato_assinado' ? 'ri-checkbox-circle-line' :
                                    activity.tipo === 'documento_enviado' ? 'ri-file-upload-line' :
                                      activity.tipo === 'cadastro' ? 'ri-user-add-line' :
                                        activity.tipo === 'cliente_editado' ? 'ri-pencil-line' : 'ri-time-line'
                                }></i>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-bold text-gray-800">{activity.descricao}</p>
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(activity.created_at))}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
                            Nenhuma atividade registrada ainda.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba Serviços e Contratos */}
              {abaAtiva === 'servicos' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-800">Serviços e Contratos</h4>
                    {!criandoContrato && (
                      <button
                        onClick={() => setCriandoContrato(true)}
                        className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-file-add-line mr-2"></i>
                        Novo Serviço/Contrato
                      </button>
                    )}
                  </div>

                  {criandoContrato ? (
                    <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between mb-6">
                        <h5 className="font-bold text-gray-800">
                          {servicoSelecionadoParaContrato ? `Configurar: ${servicoSelecionadoParaContrato.nome}` : 'Selecione o Serviço'}
                        </h5>
                        <button
                          onClick={() => {
                            setCriandoContrato(false);
                            setServicoSelecionadoParaContrato(null);
                            setEditandoConteudo(null);
                          }}
                          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      </div>

                      {!servicoSelecionadoParaContrato ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {servicos.map((servico) => (
                            <button
                              key={servico.id}
                              onClick={() => setServicoSelecionadoParaContrato(servico)}
                              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-[#10B981] hover:shadow-md transition-all text-left group"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-800 group-hover:text-[#10B981] transition-colors">{servico.nome}</span>
                                <span className="text-sm font-bold text-[#10B981]">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.preco_base)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">{servico.descricao}</p>
                            </button>
                          ))}
                        </div>
                      ) : !modeloSelecionado ? (
                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                            <p className="text-xs text-blue-700">
                              <i className="ri-information-line mr-1"></i>
                              Serviço: <strong>{servicoSelecionadoParaContrato.nome}</strong> — Selecione o modelo de contrato abaixo.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.values(CONTRACT_TEMPLATES).map((template) => (
                              <button
                                key={template.id}
                                onClick={() => setModeloSelecionado(template.id as ContractTemplateId)}
                                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-[#1E3A8A] hover:shadow-md transition-all text-left group"
                              >
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <i className={`ri-file-text-line text-xl text-[#1E3A8A]`}></i>
                                  </div>
                                  <span className="font-bold text-gray-800 group-hover:text-[#1E3A8A] transition-colors">
                                    {template.nome}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">{template.descricao}</p>
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setServicoSelecionadoParaContrato(null)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            ← Voltar para seleção de serviço
                          </button>
                        </div>
                      ) : editandoConteudo ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3 mb-4">
                            <i className="ri-information-line text-yellow-600 text-xl"></i>
                            <p className="text-xs text-yellow-700">
                              Você está revisando o conteúdo final do contrato. Se precisar, ajuste o texto abaixo antes de salvar.
                            </p>
                          </div>
                          <textarea
                            value={editandoConteudo}
                            onChange={(e) => setEditandoConteudo(e.target.value)}
                            className="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                          />
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => setEditandoConteudo(null)}
                              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              Voltar para Dados
                            </button>
                            <button
                              onClick={handleCriarContrato}
                              disabled={salvandoContrato}
                              className="px-6 py-2 bg-[#10B981] text-white rounded-lg font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              {salvandoContrato ? 'Salvando...' : 'Salvar e Finalizar'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                            <p className="text-xs text-green-700">
                              <i className="ri-file-text-line mr-1"></i>
                              Modelo: <strong>{CONTRACT_TEMPLATES[modeloSelecionado]?.nome}</strong>
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nº do Auto de Infração</label>
                              <input
                                value={autoInfracao}
                                onChange={(e) => setAutoInfracao(e.target.value)}
                                placeholder="Ex: NQ00223404"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                              />
                            </div>
                            {modeloSelecionado === 'modelo_02' && (
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Processo Administrativo</label>
                                <input
                                  value={processoAdministrativo}
                                  onChange={(e) => setProcessoAdministrativo(e.target.value)}
                                  placeholder="Ex: 019454/2025"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                                />
                              </div>
                            )}
                            {modeloSelecionado !== 'modelo_04' && modeloSelecionado !== 'procuracao' && (
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Penalidades</label>
                                <input
                                  value={penalidades}
                                  onChange={(e) => setPenalidades(e.target.value)}
                                  placeholder="Ex: Multa + Suspensão"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                                />
                              </div>
                            )}
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fase do Processo</label>
                              <div className="flex gap-2">
                                <select
                                  value={faseAit}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFaseAit(val);
                                    setFaseProcesso(val);
                                  }}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                                >
                                  <option value="" disabled hidden>Selecione...</option>
                                  <option value="SEPEN">SEPEN</option>
                                  <option value="JARI">JARI</option>
                                  <option value="CETRAN">CETRAN</option>
                                  {customFases.map((f) => (
                                    <option key={f.id} value={f.nome}>{f.nome}</option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nome = prompt('Digite o nome da nova fase:');
                                    if (nome) addFase(nome);
                                  }}
                                  className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                  title="Adicionar fase personalizada"
                                >
                                  <i className="ri-add-line text-xl"></i>
                                </button>
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Forma de Pagamento</label>
                              <input
                                value={formaPagamento}
                                onChange={(e) => setFormaPagamento(e.target.value)}
                                placeholder="Ex: Parcelado em 10x no cartão"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Intervalo Lembrete (Dias)</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={intervaloNotificacao}
                                  onChange={(e) => setIntervaloNotificacao(parseInt(e.target.value) || 7)}
                                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                                />
                                <span className="text-xs text-gray-500 italic">Será notificado a cada {intervaloNotificacao} dias.</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-4">
                            <button
                              onClick={() => setModeloSelecionado(null)}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              ← Trocar modelo
                            </button>
                            <button
                              onClick={() => {
                                if (!clienteAtual || !servicoSelecionadoParaContrato || !modeloSelecionado) return;
                                const orgData = {
                                  nome: currentOrganization?.nome || '',
                                  cnpj: currentOrganization?.cnpj,
                                  endereco_completo: currentOrganization?.endereco_completo
                                };
                                const contractData = {
                                  autoInfracao,
                                  processoAdministrativo,
                                  penalidades,
                                  faseAit: faseAit || undefined,
                                  faseProcesso: faseProcesso || undefined,
                                  valor: servicoSelecionadoParaContrato.preco_base,
                                  formaPagamento
                                };
                                const template = CONTRACT_TEMPLATES[modeloSelecionado];
                                const content = template.gerador(clienteAtual as any, orgData, contractData as any);
                                setEditandoConteudo(content);
                              }}
                              className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg font-bold hover:bg-blue-800 transition-colors"
                            >
                              Gerar Prévia Editável
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contratos.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="ri-file-list-3-line text-3xl text-gray-400"></i>
                          </div>
                          <p className="font-medium">Nenhum serviço ou contrato vinculado.</p>
                          <p className="text-sm">Comece gerando um novo contrato para este cliente.</p>
                          <button
                            onClick={() => setCriandoContrato(true)}
                            className="mt-4 px-4 py-2 text-[#10B981] font-bold hover:bg-green-50 rounded-lg transition-colors"
                          >
                            + Gerar Primeiro Contrato
                          </button>
                        </div>
                      ) : (
                        contratos.map((contrato) => {
                          const servico = servicos.find(s => s.id === contrato.servico_id);
                          const modeloStr = contrato.modelo_slug ? CONTRACT_TEMPLATES[contrato.modelo_slug as ContractTemplateId]?.nome : 'Contrato Padrão';

                          return (
                            <div
                              key={contrato.id}
                              className="p-5 border border-gray-200 rounded-lg hover:border-[#10B981] transition-all bg-white shadow-sm"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                  <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <i className="ri-file-text-line text-3xl text-[#1E3A8A]"></i>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="text-base font-bold text-gray-800">
                                        {servico?.nome || 'Serviço de Trânsito'}
                                      </h5>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${contrato.status === 'deferido' ? 'bg-green-100 text-green-700' :
                                        contrato.status === 'indeferido' ? 'bg-red-100 text-red-600' :
                                          contrato.status === 'aguardando_julgamento' ? 'bg-yellow-100 text-orange-600' :
                                            contrato.status === 'assinado' ? 'bg-blue-100 text-blue-700' :
                                              'bg-gray-100 text-gray-600'
                                        }`}>
                                        {contrato.status === 'aguardando_julgamento' ? 'Aguardando Julgamento' : contrato.status}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                                      <div className="flex items-center">
                                        <i className="ri-barcode-line mr-1.5 opacity-50"></i>
                                        <span>Auto: <strong>{contrato.auto_infracao || 'N/A'}</strong></span>
                                      </div>
                                      <div className="flex items-center">
                                        <i className="ri-information-line mr-1.5 opacity-50"></i>
                                        <span>Fase: {contrato.fase_ait || 'N/A'}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <i className="ri-money-dollar-circle-line mr-1.5 opacity-50"></i>
                                        <span>Valor: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contrato.valor)}</strong></span>
                                      </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                      <span className="font-semibold">Modelo:</span> {modeloStr} •
                                      <span className="font-semibold ml-2">Gerado em:</span> {formatarData(contrato.created_at)}
                                    </div>

                                    {/* Seletor de Status (Restaurado) */}
                                    <div className="mt-4 flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-gray-400 uppercase">Alterar Status:</span>
                                      <div className="flex gap-1">
                                        {[
                                          { val: 'aguardando_julgamento', label: 'Aguardando', color: 'hover:bg-yellow-50 hover:text-orange-600' },
                                          { val: 'deferido', label: 'Deferido', color: 'hover:bg-green-50 hover:text-green-600' },
                                          { val: 'indeferido', label: 'Indeferido', color: 'hover:bg-red-50 hover:text-red-600' },
                                          { val: 'cancelado', label: 'Cancelar', color: 'hover:bg-gray-100 hover:text-gray-600' }
                                        ].map(opt => (
                                          <button
                                            key={opt.val}
                                            onClick={async () => {
                                              const prevStatus = contrato.status;
                                              const success = await updateContrato(contrato.id, { status: opt.val as any });
                                              if (success) {
                                                addActivity({
                                                  cliente_id: clienteIdSelecionado!,
                                                  tipo: 'status_alterado',
                                                  descricao: `Status do contrato ${contrato.auto_infracao || ''} alterado de ${prevStatus} para ${opt.val}`
                                                });
                                              }
                                            }}
                                            className={`px-2 py-1 text-[10px] border border-gray-100 rounded-md transition-colors cursor-pointer ${opt.color}`}
                                          >
                                            {opt.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Agendador de Lembretes Avançado */}
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                          <i className={`ri-notification-3-line ${contrato.lembrete_ativado ? 'text-blue-500' : 'text-gray-400'}`}></i>
                                          <span className="text-[10px] font-bold text-gray-400 uppercase">Acompanhamento:</span>
                                        </div>
                                        <button
                                          onClick={async () => {
                                            const newState = !contrato.lembrete_ativado;
                                            await updateContrato(contrato.id, { lembrete_ativado: newState });
                                            addActivity({
                                              cliente_id: clienteIdSelecionado!,
                                              tipo: 'manual',
                                              descricao: `Notificações do contrato ${contrato.auto_infracao || ''} ${newState ? 'ativadas' : 'desativadas'}`
                                            });
                                          }}
                                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${contrato.lembrete_ativado ? 'bg-blue-600' : 'bg-gray-200'}`}
                                        >
                                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${contrato.lembrete_ativado ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                      </div>

                                      {contrato.lembrete_ativado && (
                                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                          <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Próxima Revisão</label>
                                            <input
                                              type="datetime-local"
                                              defaultValue={contrato.data_proximo_lembrete ? new Date(contrato.data_proximo_lembrete).toISOString().slice(0, 16) : ''}
                                              onBlur={async (e) => {
                                                const newVal = e.target.value;
                                                if (newVal && newVal !== contrato.data_proximo_lembrete) {
                                                  await updateContrato(contrato.id, { data_proximo_lembrete: new Date(newVal).toISOString() });
                                                }
                                              }}
                                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Intervalo (Dias)</label>
                                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 h-[34px]">
                                              <input
                                                type="number"
                                                min="1"
                                                defaultValue={contrato.intervalo_notificacao || currentOrganization?.intervalo_notificacao || 7}
                                                onBlur={async (e) => {
                                                  const newVal = parseInt(e.target.value);
                                                  if (!isNaN(newVal) && newVal !== contrato.intervalo_notificacao) {
                                                    await updateContrato(contrato.id, { intervalo_notificacao: newVal });
                                                  }
                                                }}
                                                className="w-full bg-transparent text-xs font-bold text-gray-700 outline-none text-center"
                                              />
                                              <span className="text-[9px] text-gray-400 font-bold ml-1">DIAS</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {!contrato.lembrete_ativado && (
                                        <p className="text-[10px] text-gray-400 italic">Configure lembretes para não esquecer de revisar este processo.</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => setContratoVisualizado(contrato)}
                                    className="px-3 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                    title="Visualizar Contrato"
                                  >
                                    <i className="ri-eye-line mr-1"></i>
                                    PDF
                                  </button>
                                  <button
                                    onClick={() => {
                                      const nomeContrato = servico?.nome || 'Contrato';
                                      showConfirm({
                                        title: 'Excluir Item',
                                        message: `Tem certeza que deseja remover "${nomeContrato}"? Esta ação não pode ser desfeita.`,
                                        type: 'danger',
                                        confirmLabel: 'Excluir',
                                        onConfirm: async () => {
                                          const success = await deleteContrato(contrato.id);
                                          if (success) {
                                            addActivity({
                                              cliente_id: clienteIdSelecionado!,
                                              tipo: 'manual',
                                              descricao: `Serviço/Contrato ${nomeContrato} removido`
                                            });
                                          }
                                        }
                                      });
                                    }}
                                    className="px-3 py-2 border border-gray-200 rounded-md text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                                    title="Remover"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Aba Documentos */}
              {abaAtiva === 'documentos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-800">Documentos do Cliente</h4>
                    <label className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap">
                      <i className="ri-upload-2-line mr-2"></i>
                      Upload Documento
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="*/*"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (files && files.length > 0 && clienteIdSelecionado) {
                            let successCount = 0;
                            let errorCount = 0;

                            for (let i = 0; i < files.length; i++) {
                              try {
                                const result = await uploadDocumento(clienteIdSelecionado, files[i], 'outro');
                                if (result) successCount++;
                                else errorCount++;
                              } catch (err) {
                                errorCount++;
                              }
                            }

                            if (successCount > 0) {
                              addActivity({
                                cliente_id: clienteIdSelecionado!,
                                tipo: 'documento_enviado',
                                descricao: `${successCount} documento(s) enviado(s) com sucesso!`,
                                metadata: { count: successCount }
                              });
                              showConfirm({
                                title: 'Upload Concluído',
                                message: `${successCount} arquivo(s) enviado(s) com sucesso.`,
                                type: 'success',
                                confirmLabel: 'OK',
                                onConfirm: () => { }
                              });
                            }
                            if (errorCount > 0) {
                              showConfirm({
                                title: 'Erro no Upload',
                                message: `Ocorreu um erro ao enviar ${errorCount} arquivo(s).`,
                                type: 'danger',
                                confirmLabel: 'Entendi',
                                onConfirm: () => { }
                              });
                            }
                          }
                        }}
                      />
                    </label>
                  </div>

                  {documentosDoCliente.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <i className="ri-folder-open-line text-4xl mb-2 block opacity-20"></i>
                      <p>Nenhum documento anexado.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documentosDoCliente.map((doc) => (
                        <div key={doc.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-[#1E3A8A] transition-colors group">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.tipo === 'crlv'
                                ? 'bg-red-100'
                                : doc.tipo === 'contrato'
                                  ? 'bg-green-100'
                                  : doc.tipo === 'identidade'
                                    ? 'bg-blue-100'
                                    : doc.nome_arquivo.toLowerCase().endsWith('.pdf')
                                      ? 'bg-red-50'
                                      : doc.nome_arquivo.toLowerCase().match(/\.(doc|docx)$/)
                                        ? 'bg-blue-50'
                                        : doc.nome_arquivo.toLowerCase().match(/\.(xls|xlsx)$/)
                                          ? 'bg-green-50'
                                          : 'bg-yellow-100'
                                }`}
                            >
                              <i
                                className={`text-2xl ${doc.tipo === 'crlv'
                                  ? 'ri-file-warning-line text-[#EF4444]'
                                  : doc.tipo === 'contrato'
                                    ? 'ri-file-user-line text-[#10B981]'
                                    : doc.tipo === 'identidade'
                                      ? 'ri-id-card-line text-[#1E3A8A]'
                                      : doc.nome_arquivo.toLowerCase().endsWith('.pdf')
                                        ? 'ri-file-pdf-line text-red-600'
                                        : doc.nome_arquivo.toLowerCase().match(/\.(doc|docx)$/)
                                          ? 'ri-file-word-line text-blue-600'
                                          : doc.nome_arquivo.toLowerCase().match(/\.(xls|xlsx)$/)
                                            ? 'ri-file-excel-line text-green-600'
                                            : 'ri-file-list-line text-[#F59E0B]'
                                  }`}
                              ></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate" title={doc.nome_arquivo}>
                                {doc.nome_arquivo}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{doc.tipo} • {formatarData(doc.created_at)}</span>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a
                                    href={getPublicUrl(doc.url_storage)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#1E3A8A] transition-colors cursor-pointer"
                                    title="Visualizar"
                                  >
                                    <i className="ri-eye-line text-lg"></i>
                                  </a>
                                  <a
                                    href={getPublicUrl(doc.url_storage)}
                                    download={doc.nome_arquivo}
                                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#1E3A8A] transition-colors cursor-pointer"
                                    title="Baixar"
                                  >
                                    <i className="ri-download-2-line text-lg"></i>
                                  </a>
                                  <button
                                    onClick={() => {
                                      showConfirm({
                                        title: 'Excluir Documento',
                                        message: `Tem certeza que deseja excluir permanentemente o documento "${doc.nome_arquivo}"?`,
                                        type: 'danger',
                                        confirmLabel: 'Excluir',
                                        onConfirm: () => deleteDocumento(doc.id, doc.url_storage)
                                      });
                                    }}
                                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#EF4444] transition-colors cursor-pointer"
                                    title="Excluir"
                                  >
                                    <i className="ri-delete-bin-line text-lg"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rodapé com ações */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3" >
              <button
                onClick={fecharPastaCliente}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Fechar
              </button>
              <button
                onClick={() => setEditando(!editando)}
                className="px-5 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-edit-line mr-2"></i>
                Editar Cliente
              </button>
            </div >
          </div >
        </div >
      )
      }

      {/* Modal de Detalhes do Contrato */}
      {
        contratoVisualizado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 print:hidden">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">
                    {servicos.find(s => s.id === contratoVisualizado.servico_id)?.nome || 'Detalhes do Contrato'}
                  </h4>
                  <p className="text-xs text-gray-500">ID: {contratoVisualizado.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const text = `Olá! Segue o resumo do contrato: ${servicos.find(s => s.id === contratoVisualizado.servico_id)?.nome || 'Contrato'} \n\nStatus: ${contratoVisualizado.status} \nValor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contratoVisualizado.valor || 0)}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Enviar por WhatsApp"
                  >
                    <i className="ri-whatsapp-line text-2xl"></i>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Imprimir / Salvar PDF"
                  >
                    <i className="ri-printer-line text-2xl"></i>
                  </button>
                  <button
                    onClick={() => setContratoVisualizado(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
              </div>

              <div id="printable-contract" className="flex-1 p-8 space-y-6 overflow-y-auto bg-white">
                {/* Cabeçalho Visual com Faixas - Usa dados de branding personalizados se disponíveis */}
                <ContractHeader
                  organizationName={currentOrganization?.nome_contrato || currentOrganization?.nome || 'LF TRÂNSITO'}
                  organizationCnpj={currentOrganization?.cnpj_contrato || currentOrganization?.cnpj || '52.475.410/0001-92'}
                  organizationAddress={currentOrganization?.endereco_contrato || currentOrganization?.endereco_completo || 'Rua Sebastião Lima, n.790 – Jardim Monte Líbano – Campo Grande – MS'}
                  logoUrl={currentOrganization?.logo_contrato_url || currentOrganization?.logo_url || undefined}
                  primaryColor={currentOrganization?.cor_primaria || '#1a1a1a'}
                  secondaryColor={currentOrganization?.cor_secundaria || '#333333'}
                  headerStyle={(currentOrganization?.estilo_cabecalho as 'elegant' | 'classic' | 'minimal') || 'elegant'}
                />

                {/* Info do Contrato */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Contrato de Prestação de Serviços</p>
                    <p className="text-lg font-bold text-gray-800">
                      {servicos.find(s => s.id === contratoVisualizado.servico_id)?.nome || 'Serviço'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">ID: #{contratoVisualizado.id.split('-')[0].toUpperCase()}</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${contratoVisualizado.status === 'assinado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {contratoVisualizado.status}
                    </span>
                  </div>
                </div>

                {/* Conteúdo do Contrato */}
                <div className="prose max-w-none text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-serif">
                  {contratoVisualizado.conteudo || 'Nenhum conteúdo detalhado disponível.'}
                </div>

                {/* Assinaturas */}
                <div className="grid grid-cols-2 gap-12 mt-20 pt-12 border-t border-gray-200 print:mt-12">
                  <div className="text-center">
                    <div className="h-16 mb-2"></div>
                    <div className="border-t-2 border-gray-400 pt-2">
                      <p className="text-xs font-bold text-gray-700">{clienteAtual?.nome_completo || 'Contratante'}</p>
                      <p className="text-[10px] text-gray-400">CONTRATANTE</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="h-16 mb-2"></div>
                    <div className="border-t-2 border-gray-400 pt-2">
                      <p className="text-xs font-bold text-gray-700">{currentOrganization?.nome || 'LF TRÂNSITO'}</p>
                      <p className="text-[10px] text-gray-400">CONTRATADA</p>
                    </div>
                  </div>
                </div>

                {/* Testemunhas */}
                <div className="grid grid-cols-2 gap-12 mt-8">
                  <div className="text-center">
                    <div className="h-12 mb-2"></div>
                    <div className="border-t border-gray-300 pt-2">
                      <p className="text-[10px] text-gray-500">TESTEMUNHA 1</p>
                      <p className="text-[9px] text-gray-400">CPF: ___________________</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="h-12 mb-2"></div>
                    <div className="border-t border-gray-300 pt-2">
                      <p className="text-[10px] text-gray-500">TESTEMUNHA 2</p>
                      <p className="text-[9px] text-gray-400">CPF: ___________________</p>
                    </div>
                  </div>
                </div>

                {/* Rodapé Visual com Faixas */}
                <ContractFooter
                  primaryColor={currentOrganization?.cor_primaria || '#1a1a1a'}
                  secondaryColor="#333333"
                />

                <div className="text-[9px] text-gray-400 text-center pt-4 print:pt-2">
                  Este documento é uma cópia digital fiel do contrato registrado no sistema em {new Date(contratoVisualizado.created_at).toLocaleString('pt-BR')}.
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end print:hidden">
                <button
                  onClick={() => setContratoVisualizado(null)}
                  className="px-6 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Modal de Confirmação Personalizado */}
      {
        confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.type === 'danger' ? 'bg-red-100 text-red-600' :
                  confirmModal.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                    confirmModal.type === 'success' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                  }`}>
                  <i className={`text-3xl ${confirmModal.type === 'danger' ? 'ri-error-warning-line' :
                    confirmModal.type === 'warning' ? 'ri-alert-line' :
                      confirmModal.type === 'success' ? 'ri-checkbox-circle-line' :
                        'ri-information-line'
                    }`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
                <p className="text-gray-600 leading-relaxed">{confirmModal.message}</p>
              </div>
              <div className="p-4 bg-gray-50 flex gap-3">
                {confirmModal.type !== 'success' && (
                  <button
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {confirmModal.cancelLabel || 'Cancelar'}
                  </button>
                )}
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`flex-1 py-3 px-4 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer ${confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                    confirmModal.type === 'warning' ? 'bg-orange-500 hover:bg-orange-600' :
                      confirmModal.type === 'success' ? 'bg-[#10B981] hover:bg-green-600' :
                        'bg-[#1E3A8A] hover:bg-blue-800'
                    }`}
                >
                  {confirmModal.confirmLabel || 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Estilos para Impressão */}
      <style>{`
        @media print {
          @page {
            margin: 10mm;
            size: A4;
          }

          html, body {
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Primeiro: esconde tudo com visibility */
          body * {
            visibility: hidden;
          }

          /* Mostra o contrato e TODOS os seus descendentes */
          #printable-contract,
          #printable-contract * {
            visibility: visible !important;
          }

          /* Posiciona o contrato no topo da página */
          #printable-contract {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 20px !important;
            margin: 0 !important;
            background: white !important;
          }

          /* Remove limitações dos containers ancestrais */
          .fixed {
            position: static !important;
          }

          .max-h-\\[90vh\\],
          .overflow-y-auto,
          .flex-col {
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
          }

          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div >
  );
}
