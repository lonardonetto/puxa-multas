import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useClientes, useVeiculos, useServicos, useContratos } from '../../../hooks';
import { supabase, uploadFile } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useOrganization } from '../../../contexts/OrganizationContext';
import type { ClienteInsert, VeiculoInsert, Endereco, Servico, ContratoInsert } from '../../../types/database';

export default function NovoCliente() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { createCliente, loading: loadingCliente } = useClientes();
  const { createVeiculosBatch, loading: loadingVeiculos } = useVeiculos();
  const { servicos, fetchServicos } = useServicos();
  const { createContrato } = useContratos();
  const location = useLocation();

  const [etapaAtual, setEtapaAtual] = useState(1);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [leadConversao, setLeadConversao] = useState(false);

  const [formData, setFormData] = useState({
    // Dados Pessoais
    tipoPessoa: 'fisica',
    nomeCompleto: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    estadoCivil: '',
    profissao: '',
    // Dados Empresa
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    // Contato
    email: '',
    telefone: '',
    celular: '',
    // Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    // Veículos
    veiculos: [{ placa: '', modelo: '', ano: '', renavam: '' }],
    // Serviços e Contrato
    servicoId: '',
    aceiteContrato: false,
    // Documentos
    documentoIdentidade: null as File | null,
    comprovanteResidencia: null as File | null,
    cnh: null as File | null,
    documentoVeiculo: null as File | null,
  });

  const [buscandoCep, setBuscandoCep] = useState(false);

  // Pré-preencher dados do lead ao vir da conversão
  useEffect(() => {
    const leadData = (location.state as any)?.leadData;
    if (leadData) {
      setFormData(prev => ({
        ...prev,
        nomeCompleto: leadData.nome_completo || '',
        email: leadData.email || '',
        celular: leadData.celular || '',
      }));
      setLeadConversao(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchServicos(currentOrganization.id);
    }
  }, [currentOrganization?.id, fetchServicos]);

  const buscarEndereco = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          cep: cepLimpo,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        }));
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    } finally {
      setBuscandoCep(false);
    }
  };

  const etapas = [
    { numero: 1, titulo: 'Dados Básicos', icon: 'ri-user-line' },
    { numero: 2, titulo: 'Contato e Endereço', icon: 'ri-map-pin-line' },
    { numero: 3, titulo: 'Veículos', icon: 'ri-car-line' },
    { numero: 4, titulo: 'Documentos', icon: 'ri-file-line' },
    { numero: 5, titulo: 'Serviços', icon: 'ri-briefcase-line' },
    { numero: 6, titulo: 'Revisão', icon: 'ri-check-line' },
  ];

  const adicionarVeiculo = () => {
    setFormData({
      ...formData,
      veiculos: [...formData.veiculos, { placa: '', modelo: '', ano: '', renavam: '' }],
    });
  };

  const removerVeiculo = (index: number) => {
    const novosVeiculos = formData.veiculos.filter((_, i) => i !== index);
    setFormData({ ...formData, veiculos: novosVeiculos });
  };

  const atualizarVeiculo = (index: number, campo: string, valor: string) => {
    const novosVeiculos = [...formData.veiculos];
    novosVeiculos[index] = { ...novosVeiculos[index], [campo]: valor };
    setFormData({ ...formData, veiculos: novosVeiculos });
  };

  const handleFileChange = (campo: string, file: File | null) => {
    setFormData({ ...formData, [campo]: file });
  };

  const proximaEtapa = () => {
    if (etapaAtual < 6) setEtapaAtual(etapaAtual + 1);
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) setEtapaAtual(etapaAtual - 1);
  };

  const finalizarCadastro = async () => {
    if (!user) {
      setErro('Você precisa estar logado para cadastrar um cliente');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {

      // 1. Preparar dados do endereço
      const endereco: Endereco = {
        cep: formData.cep,
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
      };

      // 2. Criar cliente
      const clienteData: ClienteInsert = {
        user_id: user.id,
        tipo_pessoa: formData.tipoPessoa as 'fisica' | 'juridica',
        nome_completo: formData.nomeCompleto,
        razao_social: formData.razaoSocial || null,
        nome_fantasia: formData.nomeFantasia || null,
        cpf: formData.cpf || null,
        cnpj: formData.cnpj || null,
        rg: formData.rg || null,
        inscricao_estadual: formData.inscricaoEstadual || null,
        data_nascimento: formData.dataNascimento || null,
        estado_civil: formData.estadoCivil || null,
        profissao: formData.profissao || null,
        email: formData.email,
        telefone: formData.telefone || null,
        celular: formData.celular,
        endereco,
        organization_id: currentOrganization?.id,
      };

      const cliente = await createCliente(clienteData);

      if (!cliente) {
        throw new Error('Erro ao criar cliente');
      }

      // 3. Criar veículos
      const veiculosData: VeiculoInsert[] = formData.veiculos.map(veiculo => ({
        cliente_id: cliente.id,
        placa: veiculo.placa,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        renavam: veiculo.renavam || null,
      }));

      await createVeiculosBatch(veiculosData);

      // 4. Upload de documentos (opcional)
      const uploadPromises: Promise<any>[] = [];

      const saveDocumentRecord = async (file: File, path: string, tipo: string) => {
        const { error: uploadError } = await uploadFile(path, file);
        if (!uploadError) {
          // Criar registro no banco para o arquivo enviado
          await (supabase
            .from('documentos')
            .insert({
              cliente_id: cliente.id,
              tipo: tipo as any,
              nome_arquivo: file.name,
              url_storage: path,
              tamanho_bytes: file.size,
              organization_id: currentOrganization?.id
            } as any) as any);
        }
      };

      if (formData.documentoIdentidade) {
        const path = `${cliente.id}/identidade_${Date.now()}_${formData.documentoIdentidade.name.replace(/\s+/g, '_')}`;
        uploadPromises.push(saveDocumentRecord(formData.documentoIdentidade, path, 'identidade'));
      }

      if (formData.comprovanteResidencia) {
        const path = `${cliente.id}/comprovante_${Date.now()}_${formData.comprovanteResidencia.name.replace(/\s+/g, '_')}`;
        uploadPromises.push(saveDocumentRecord(formData.comprovanteResidencia, path, 'outro'));
      }

      if (formData.cnh) {
        const path = `${cliente.id}/cnh_${Date.now()}_${formData.cnh.name.replace(/\s+/g, '_')}`;
        uploadPromises.push(saveDocumentRecord(formData.cnh, path, 'cnh'));
      }

      if (formData.documentoVeiculo) {
        const path = `${cliente.id}/crlv_${Date.now()}_${formData.documentoVeiculo.name.replace(/\s+/g, '_')}`;
        uploadPromises.push(saveDocumentRecord(formData.documentoVeiculo, path, 'crlv'));
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      // 5. Gerar Contrato (se selecionado)
      if (formData.servicoId && formData.aceiteContrato) {
        const servicoSelecionado = servicos.find(s => s.id === formData.servicoId);
        const contratoData: ContratoInsert = {
          cliente_id: cliente.id,
          servico_id: formData.servicoId,
          organization_id: currentOrganization?.id!,
          valor: servicoSelecionado?.preco_base || 0,
          status: 'assinado',
          conteudo: `Contrato de Prestação de Serviços - ${servicoSelecionado?.nome || 'Serviço'}`,
          assinatura_data: {
            ip: '127.0.0.1', // Em produção, obter IP real
            data: new Date().toISOString(),
            user_agent: navigator.userAgent
          } as any
        };
        await createContrato(contratoData);
      }

      // Sucesso!
      setSucesso(true);
      setTimeout(() => {
        // Reset form
        setFormData({
          tipoPessoa: 'fisica',
          nomeCompleto: '',
          cpf: '',
          rg: '',
          dataNascimento: '',
          estadoCivil: '',
          profissao: '',
          razaoSocial: '',
          nomeFantasia: '',
          cnpj: '',
          inscricaoEstadual: '',
          email: '',
          telefone: '',
          celular: '',
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          veiculos: [{ placa: '', modelo: '', ano: '', renavam: '' }],
          servicoId: '',
          aceiteContrato: false,
          documentoIdentidade: null,
          comprovanteResidencia: null,
          cnh: null,
          documentoVeiculo: null,
        });
        setEtapaAtual(1);
        setSucesso(false);
      }, 3000);

    } catch (err) {
      console.error('Erro ao cadastrar cliente:', err);
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar cliente');
    } finally {
      setSalvando(false);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Novo Cliente</h2>
        <p className="text-sm text-gray-600 mt-1">Cadastre um novo cliente e gere automaticamente contratos e documentos</p>
      </div>

      {/* Success Message */}
      {sucesso && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <i className="ri-checkbox-circle-fill text-2xl text-green-600"></i>
          <div>
            <h4 className="text-sm font-bold text-green-800">Cliente cadastrado com sucesso!</h4>
            <p className="text-sm text-green-700 mt-1">O cliente e seus veículos foram salvos no banco de dados.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <i className="ri-error-warning-fill text-2xl text-red-600"></i>
          <div>
            <h4 className="text-sm font-bold text-red-800">Erro ao cadastrar cliente</h4>
            <p className="text-sm text-red-700 mt-1">{erro}</p>
          </div>
        </div>
      )}

      {/* Stepper */}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          {etapas.map((etapa, index) => (
            <div key={etapa.numero} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${etapaAtual >= etapa.numero
                    ? 'bg-[#10B981] text-white'
                    : 'bg-gray-200 text-gray-500'
                    } transition-all`}
                >
                  <i className={`${etapa.icon} text-xl`}></i>
                </div>
                <span
                  className={`text-xs font-medium mt-2 ${etapaAtual >= etapa.numero ? 'text-[#10B981]' : 'text-gray-500'
                    }`}
                >
                  {etapa.titulo}
                </span>
              </div>
              {index < etapas.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${etapaAtual > etapa.numero ? 'bg-[#10B981]' : 'bg-gray-200'
                    } transition-all`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Etapa 1: Dados Básicos */}
        {etapaAtual === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Dados Básicos</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Pessoa</label>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="tipoPessoa"
                    value="fisica"
                    checked={formData.tipoPessoa === 'fisica'}
                    onChange={(e) => setFormData({ ...formData, tipoPessoa: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Pessoa Física</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="tipoPessoa"
                    value="juridica"
                    checked={formData.tipoPessoa === 'juridica'}
                    onChange={(e) => setFormData({ ...formData, tipoPessoa: e.target.value })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Pessoa Jurídica</span>
                </label>
              </div>
            </div>

            {formData.tipoPessoa === 'fisica' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.nomeCompleto}
                      onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="Digite o nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CPF *</label>
                    <input
                      type="text"
                      required
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">RG</label>
                    <input
                      type="text"
                      value={formData.rg}
                      onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="00.000.000-0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Nascimento</label>
                    <input
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estado Civil</label>
                    <select
                      value={formData.estadoCivil}
                      onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] cursor-pointer"
                    >
                      <option value="">Selecione</option>
                      <option value="solteiro">Solteiro(a)</option>
                      <option value="casado">Casado(a)</option>
                      <option value="divorciado">Divorciado(a)</option>
                      <option value="viuvo">Viúvo(a)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profissão</label>
                  <input
                    type="text"
                    value={formData.profissao}
                    onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    placeholder="Digite a profissão"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Razão Social *</label>
                    <input
                      type="text"
                      required
                      value={formData.razaoSocial}
                      onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="Digite a razão social"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Fantasia</label>
                    <input
                      type="text"
                      value={formData.nomeFantasia}
                      onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="Digite o nome fantasia"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CNPJ *</label>
                    <input
                      type="text"
                      required
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Inscrição Estadual</label>
                    <input
                      type="text"
                      value={formData.inscricaoEstadual}
                      onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="000.000.000.000"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Etapa 2: Contato e Endereço */}
        {etapaAtual === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Contato e Endereço</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="(00) 0000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Celular *</label>
                <input
                  type="tel"
                  required
                  value={formData.celular}
                  onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Endereço</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CEP *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.cep}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      onBlur={(e) => buscarEndereco(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="00000-000"
                    />
                    {buscandoCep && (
                      <div className="absolute right-3 top-2.5">
                        <i className="ri-loader-4-line animate-spin text-gray-400"></i>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Logradouro *</label>
                  <input
                    type="text"
                    required
                    value={formData.logradouro}
                    onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    placeholder="Rua, Avenida, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número *</label>
                  <input
                    type="text"
                    required
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    placeholder="Nº"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Complemento</label>
                  <input
                    type="text"
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    placeholder="Apto, Sala, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro *</label>
                  <input
                    type="text"
                    required
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    placeholder="Digite o bairro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade *</label>
                  <input
                    type="text"
                    required
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                    placeholder="Digite a cidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                  <select
                    required
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] cursor-pointer"
                  >
                    <option value="">Selecione</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 3: Veículos */}
        {etapaAtual === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Veículos</h3>
              <button
                type="button"
                onClick={adicionarVeiculo}
                className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                Adicionar Veículo
              </button>
            </div>

            {formData.veiculos.map((veiculo, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-700">Veículo {index + 1}</h4>
                  {formData.veiculos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerVeiculo(index)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-lg"></i>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Placa *</label>
                    <input
                      type="text"
                      required
                      value={veiculo.placa}
                      onChange={(e) => atualizarVeiculo(index, 'placa', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="ABC-1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo *</label>
                    <input
                      type="text"
                      required
                      value={veiculo.modelo}
                      onChange={(e) => atualizarVeiculo(index, 'modelo', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="Ex: Fiat Uno"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ano *</label>
                    <input
                      type="text"
                      required
                      value={veiculo.ano}
                      onChange={(e) => atualizarVeiculo(index, 'ano', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="2020"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">RENAVAM</label>
                    <input
                      type="text"
                      value={veiculo.renavam}
                      onChange={(e) => atualizarVeiculo(index, 'renavam', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                      placeholder="00000000000"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Etapa 4: Documentos */}
        {etapaAtual === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upload de Documentos</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#10B981] transition-colors">
                <label className="block cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <i className="ri-file-user-line text-4xl text-gray-400"></i>
                    <span className="text-sm font-semibold text-gray-700">Documento de Identidade</span>
                    <span className="text-xs text-gray-500">RG ou CNH (PDF, JPG, PNG)</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('documentoIdentidade', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {formData.documentoIdentidade && (
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    <i className="ri-check-line mr-1"></i>
                    {formData.documentoIdentidade.name}
                  </div>
                )}
              </div>

              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#10B981] transition-colors">
                <label className="block cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <i className="ri-home-4-line text-4xl text-gray-400"></i>
                    <span className="text-sm font-semibold text-gray-700">Comprovante de Residência</span>
                    <span className="text-xs text-gray-500">Conta de luz, água, etc. (PDF, JPG, PNG)</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('comprovanteResidencia', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {formData.comprovanteResidencia && (
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    <i className="ri-check-line mr-1"></i>
                    {formData.comprovanteResidencia.name}
                  </div>
                )}
              </div>

              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#10B981] transition-colors">
                <label className="block cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <i className="ri-bank-card-line text-4xl text-gray-400"></i>
                    <span className="text-sm font-semibold text-gray-700">CNH</span>
                    <span className="text-xs text-gray-500">Carteira Nacional de Habilitação (PDF, JPG, PNG)</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('cnh', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {formData.cnh && (
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    <i className="ri-check-line mr-1"></i>
                    {formData.cnh.name}
                  </div>
                )}
              </div>

              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#10B981] transition-colors">
                <label className="block cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <i className="ri-car-line text-4xl text-gray-400"></i>
                    <span className="text-sm font-semibold text-gray-700">Documento do Veículo</span>
                    <span className="text-xs text-gray-500">CRLV (PDF, JPG, PNG)</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('documentoVeiculo', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {formData.documentoVeiculo && (
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    <i className="ri-check-line mr-1"></i>
                    {formData.documentoVeiculo.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Etapa 5: Serviços e Contrato */}
        {etapaAtual === 5 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Serviços e Contrato</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servicos.length > 0 ? (
                servicos.map((servico) => (
                  <div
                    key={servico.id}
                    onClick={() => setFormData({ ...formData, servicoId: servico.id })}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.servicoId === servico.id
                      ? 'border-[#10B981] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800">{servico.nome}</h4>
                      {formData.servicoId === servico.id && (
                        <i className="ri-checkbox-circle-fill text-[#10B981] text-xl"></i>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{servico.descricao || 'Nenhuma descrição disponível'}</p>
                    <div className="text-lg font-bold text-[#10B981]">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico.preco_base)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
                  <i className="ri-briefcase-line text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">Nenhum serviço cadastrado para esta organização.</p>
                </div>
              )}
            </div>

            {formData.servicoId && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 text-center">Termos do Contrato</h4>
                <div className="h-48 overflow-y-auto bg-white p-4 border border-gray-200 rounded text-sm text-gray-600 mb-6 font-serif">
                  <p className="mb-4"><strong>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</strong></p>
                  <p>Por este instrumento particular, o CONTRATANTE e a CONTRATADA têm entre si justo e acertado o presente contrato conforme as cláusulas abaixo:</p>
                  <p className="mt-4">1. Do Objeto: O presente contrato tem por objeto a prestação de serviços de assessoria administrativa para recursos de multas de trânsito.</p>
                  <p>2. Dos Dados: O CONTRATANTE declara que todos os dados fornecidos no cadastro são verdadeiros e de sua inteira responsabilidade.</p>
                  <p>3. Do Valor: Pelos serviços contratados, o CONTRATANTE pagará o valor estipulado no ato da contratação.</p>
                  <p>4. Do Aceite: Ao marcar a opção abaixo, o CONTRATANTE declara ter lido e aceito todos os termos deste contrato, gerando um registro digital de assinatura com seu IP e data/hora atual.</p>
                </div>

                <label className="flex items-center space-x-3 cursor-pointer p-4 bg-[#10B981] bg-opacity-10 rounded-lg border border-[#10B981] border-opacity-20 hover:bg-opacity-20 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.aceiteContrato}
                    onChange={(e) => setFormData({ ...formData, aceiteContrato: e.target.checked })}
                    className="w-5 h-5 text-[#10B981] rounded border-gray-300 focus:ring-[#10B981]"
                  />
                  <span className="text-sm font-semibold text-gray-800">
                    Eu li e aceito os termos do contrato e autorizo a geração da assinatura digital.
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Etapa 6: Revisão */}
        {etapaAtual === 6 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Revisão dos Dados</h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Dados Básicos</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <span className="ml-2 font-medium">{formData.tipoPessoa === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
                  </div>
                  {formData.tipoPessoa === 'fisica' ? (
                    <>
                      <div>
                        <span className="text-gray-600">Nome:</span>
                        <span className="ml-2 font-medium">{formData.nomeCompleto}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">CPF:</span>
                        <span className="ml-2 font-medium">{formData.cpf}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-600">Razão Social:</span>
                        <span className="ml-2 font-medium">{formData.razaoSocial}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">CNPJ:</span>
                        <span className="ml-2 font-medium">{formData.cnpj}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Contato e Endereço</h4>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">E-mail:</span>
                    <span className="ml-2 font-medium">{formData.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Celular:</span>
                    <span className="ml-2 font-medium">{formData.celular}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 border-t border-gray-200 pt-3 mt-3">
                  {formData.logradouro}, {formData.numero} {formData.complemento && `- ${formData.complemento}`}
                  <br />
                  {formData.bairro} - {formData.cidade}/{formData.estado}
                  <br />
                  CEP: {formData.cep}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Veículos ({formData.veiculos.length})</h4>
                <div className="space-y-2 mb-4 text-sm">
                  {formData.veiculos.map((v, i) => (
                    <div key={i} className="text-gray-600">
                      • {v.placa} ({v.modelo}, {v.ano})
                    </div>
                  ))}
                </div>

                {formData.servicoId && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Serviço Contratado</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">
                        {servicos.find(s => s.id === formData.servicoId)?.nome}
                      </span>
                      <span className="text-[#10B981] font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                          servicos.find(s => s.id === formData.servicoId)?.preco_base || 0
                        )}
                      </span>
                    </div>
                    {formData.aceiteContrato && (
                      <div className="mt-2 text-xs text-green-600 flex items-center">
                        <i className="ri-checkbox-circle-line mr-1"></i>
                        Contrato aceito digitalmente
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <i className="ri-information-line text-xl text-green-600 mt-0.5"></i>
                  <div>
                    <h4 className="text-sm font-bold text-green-800 mb-1">Próximos Passos</h4>
                    <p className="text-sm text-green-700">
                      Após finalizar o cadastro, os contratos e documentos serão gerados com os dados informados e registrados com validade digital.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Navegação */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={etapaAnterior}
            disabled={etapaAtual === 1 || salvando}
            className={`px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${etapaAtual === 1 || salvando
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
              }`}
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Anterior
          </button>

          {etapaAtual < 6 ? (
            <button
              type="button"
              onClick={proximaEtapa}
              className="px-6 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              Próximo
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          ) : (
            <button
              type="button"
              onClick={finalizarCadastro}
              disabled={salvando}
              className={`px-6 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${salvando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                }`}
            >
              {salvando ? (
                <>
                  <i className="ri-loader-4-line mr-2 animate-spin"></i>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="ri-check-line mr-2"></i>
                  Finalizar Cadastro
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
