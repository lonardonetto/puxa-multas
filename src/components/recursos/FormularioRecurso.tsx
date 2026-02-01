import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getEstadoFromPlaca, getNomeEstado } from '../../utils/placaUtils';

interface FormularioRecursoProps {
  onSubmit: (dados: DadosRecurso) => Promise<void>;
  gerando: boolean;
  organizationId: string;
  dadosIniciais?: Partial<DadosRecurso>;
}

export interface DadosRecurso {
  // Dados do Recorrente
  nomeRecorrente: string;
  cpfCnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  
  // Dados do Veículo
  placa: string;
  renavam: string;
  modelo: string;
  
  // Dados da Infração
  numeroAuto: string;
  dataInfracao: string;
  horaInfracao: string;
  localInfracao: string;
  codigoInfracao: string;
  descricaoInfracao: string;
  valorMulta: number;
  pontos: number;
  gravidade: string;
  
  // Dados do Recurso
  tipoRecurso: 'defesa_previa' | 'jari' | 'cetran';
  descricaoSituacao: string;
  
  // Dados do DETRAN
  detranId: string | null;
  detranNome: string | null;
  estadoDetran: string | null;
}

interface Infracao {
  id: string;
  codigo: string;
  descricao: string;
  gravidade: string;
  valor: number;
  pontos: number;
  categoria: string;
}

interface VeiculoEncontrado {
  id: string;
  placa: string;
  modelo: string;
  renavam: string | null;
  cliente: {
    id: string;
    nome_completo: string;
    cpf: string | null;
    cnpj: string | null;
    celular: string | null;
    telefone: string | null;
    email: string | null;
    endereco: any;
  } | null;
}

export default function FormularioRecurso({ onSubmit, gerando, organizationId, dadosIniciais }: FormularioRecursoProps) {
  // Estados do formulário - inicializar com dados iniciais completos
  const [dados, setDados] = useState<DadosRecurso>(() => {
    const defaultDados: DadosRecurso = {
      nomeRecorrente: '',
      cpfCnpj: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
      placa: '',
      renavam: '',
      modelo: '',
      numeroAuto: '',
      dataInfracao: '',
      horaInfracao: '',
      localInfracao: '',
      codigoInfracao: '',
      descricaoInfracao: '',
      valorMulta: 0,
      pontos: 0,
      gravidade: '',
      tipoRecurso: 'defesa_previa',
      descricaoSituacao: '',
      detranId: null,
      detranNome: null,
      estadoDetran: null,
    };
    
    // Aplicar dados iniciais se fornecidos (spread completo)
    if (dadosIniciais) {
      return {
        ...defaultDados,
        ...dadosIniciais,
      };
    }
    
    return defaultDados;
  });

  // Estados auxiliares
  const [infracoes, setInfracoes] = useState<Infracao[]>([]);
  const [loadingDados, setLoadingDados] = useState(true);
  const [buscandoPlaca, setBuscandoPlaca] = useState(false);
  const [veiculoEncontrado, setVeiculoEncontrado] = useState<VeiculoEncontrado | null>(null);
  const [detranDetectado, setDetranDetectado] = useState<any | null>(null);

  // Carregar infrações
  useEffect(() => {
    const carregarInfracoes = async () => {
      setLoadingDados(true);
      try {
        const { data, error } = await supabase
          .from('infracoes_transito')
          .select('id, codigo, descricao, gravidade, valor, pontos, categoria')
          .eq('ativo', true)
          .order('categoria', { ascending: true })
          .order('codigo', { ascending: true });

        if (error) throw error;
        setInfracoes(data || []);
      } catch (err) {
        console.error('Erro ao carregar infrações:', err);
      } finally {
        setLoadingDados(false);
      }
    };

    carregarInfracoes();
  }, []);

  // Pré-selecionar infração quando dados iniciais são fornecidos
  // Mas PRESERVAR os valores vindos do rastreamento (valorMulta, pontos, gravidade reais)
  useEffect(() => {
    if (dadosIniciais?.codigoInfracao && infracoes.length > 0) {
      const infracao = infracoes.find(i => i.codigo === dadosIniciais.codigoInfracao);
      if (infracao) {
        setDados(prev => ({
          ...prev,
          codigoInfracao: infracao.codigo,
          // Usar descrição da tabela se não veio do rastreamento
          descricaoInfracao: dadosIniciais.descricaoInfracao || infracao.descricao,
          // PRESERVAR valores vindos do rastreamento, usar da tabela apenas como fallback
          valorMulta: dadosIniciais.valorMulta || infracao.valor,
          pontos: dadosIniciais.pontos || infracao.pontos,
          gravidade: dadosIniciais.gravidade || infracao.gravidade,
        }));
      }
    }
  }, [dadosIniciais, infracoes]);

  // Estado para fonte dos dados
  const [fonteVeiculo, setFonteVeiculo] = useState<'interno' | 'api' | null>(null);

  // Detectar estado pela placa e buscar dados do veículo
  useEffect(() => {
    const buscarDadosPorPlaca = async () => {
      if (!dados.placa || dados.placa.length < 7) {
        setDetranDetectado(null);
        setVeiculoEncontrado(null);
        setFonteVeiculo(null);
        return;
      }

      setBuscandoPlaca(true);
      setFonteVeiculo(null);
      
      try {
        // 1. Detectar estado pela placa
        const estado = getEstadoFromPlaca(dados.placa);
        if (estado) {
          const { data: detran } = await supabase
            .from('orgaos_transito')
            .select('*')
            .eq('sigla_estado', estado)
            .eq('tipo', 'DETRAN')
            .single();

          if (detran) {
            setDetranDetectado(detran);
            setDados(prev => ({
              ...prev,
              estadoDetran: estado,
              detranId: detran.id,
              detranNome: detran.nome,
            }));
          }
        }

        // 2. Buscar veículo no banco interno PRIMEIRO
        const { data: veiculo, error } = await supabase
          .from('veiculos')
          .select(`
            id,
            placa,
            modelo,
            ano,
            renavam,
            clientes!inner (
              id,
              nome_completo,
              cpf,
              cnpj,
              celular,
              telefone,
              email,
              endereco
            )
          `)
          .ilike('placa', dados.placa.replace(/[^A-Za-z0-9]/g, ''))
          .single();

        if (!error && veiculo) {
          // Veículo encontrado no banco interno
          const cliente = (veiculo as any).clientes;
          setVeiculoEncontrado({
            id: veiculo.id,
            placa: veiculo.placa,
            modelo: veiculo.modelo,
            renavam: veiculo.renavam,
            cliente: cliente ? {
              id: cliente.id,
              nome_completo: cliente.nome_completo,
              cpf: cliente.cpf,
              cnpj: cliente.cnpj,
              celular: cliente.celular,
              telefone: cliente.telefone,
              email: cliente.email,
              endereco: cliente.endereco,
            } : null,
          });
          setFonteVeiculo('interno');

          // Preencher automaticamente os dados
          if (cliente) {
            const endereco = cliente.endereco || {};
            setDados(prev => ({
              ...prev,
              nomeRecorrente: cliente.nome_completo || prev.nomeRecorrente,
              cpfCnpj: cliente.cpf || cliente.cnpj || prev.cpfCnpj,
              telefone: cliente.celular || cliente.telefone || prev.telefone,
              email: cliente.email || prev.email,
              endereco: endereco.logradouro ? `${endereco.logradouro}, ${endereco.numero || 'S/N'}${endereco.complemento ? ` - ${endereco.complemento}` : ''}` : prev.endereco,
              cidade: endereco.cidade || prev.cidade,
              estado: endereco.estado || prev.estado,
              cep: endereco.cep || prev.cep,
              modelo: veiculo.modelo || prev.modelo,
              renavam: veiculo.renavam || prev.renavam,
            }));
          }
        } else {
          // Veículo NÃO encontrado no banco - consultar API externa
          setVeiculoEncontrado(null);
          
          try {
            console.log('Veículo não encontrado no banco, consultando API externa...');
            const { data: apiData, error: apiError } = await supabase.functions.invoke('consultar-veiculo', {
              body: { placa: dados.placa },
            });

            if (!apiError && apiData?.success && apiData?.dados) {
              const veiculoAPI = apiData.dados;
              setFonteVeiculo('api');
              
              // Preencher dados do veículo obtidos da API
              setDados(prev => ({
                ...prev,
                modelo: veiculoAPI.modelo ? `${veiculoAPI.marca} ${veiculoAPI.modelo}`.trim() : prev.modelo,
                estado: veiculoAPI.uf || prev.estado,
                cidade: veiculoAPI.cidade || prev.cidade,
              }));

              console.log('Dados obtidos da API:', veiculoAPI);
            }
          } catch (apiErr) {
            console.error('Erro ao consultar API externa:', apiErr);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setBuscandoPlaca(false);
      }
    };

    const debounce = setTimeout(buscarDadosPorPlaca, 500);
    return () => clearTimeout(debounce);
  }, [dados.placa]);

  // Atualizar dados quando selecionar infração
  const handleInfracaoChange = (codigo: string) => {
    const infracao = infracoes.find(i => i.codigo === codigo);
    if (infracao) {
      setDados(prev => ({
        ...prev,
        codigoInfracao: infracao.codigo,
        descricaoInfracao: infracao.descricao,
        valorMulta: infracao.valor,
        pontos: infracao.pontos,
        gravidade: infracao.gravidade,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(dados);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seção: Tipo de Recurso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <i className="ri-file-text-line"></i>
          Tipo de Recurso
        </h4>
        <select
          value={dados.tipoRecurso}
          onChange={(e) => setDados(prev => ({ ...prev, tipoRecurso: e.target.value as any }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="defesa_previa">Defesa Prévia (Antes do Julgamento)</option>
          <option value="jari">Recurso JARI (1ª Instância)</option>
          <option value="cetran">Recurso CETRAN (2ª Instância)</option>
        </select>
      </div>

      {/* Seção: Dados do Veículo */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <i className="ri-car-line"></i>
          Dados do Veículo
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
            <input
              type="text"
              value={dados.placa}
              onChange={(e) => setDados(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
              placeholder="ABC1D23"
              maxLength={8}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {buscandoPlaca && (
              <div className="absolute right-3 top-8">
                <i className="ri-loader-4-line animate-spin text-blue-500"></i>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
            <input
              type="text"
              value={dados.modelo}
              onChange={(e) => setDados(prev => ({ ...prev, modelo: e.target.value }))}
              placeholder="Ex: Fiat Uno 2020"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RENAVAM</label>
            <input
              type="text"
              value={dados.renavam}
              onChange={(e) => setDados(prev => ({ ...prev, renavam: e.target.value }))}
              placeholder="00000000000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Indicador de DETRAN detectado */}
        {detranDetectado && (
          <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded-lg flex items-center gap-2">
            <i className="ri-map-pin-line text-blue-600"></i>
            <span className="text-sm font-medium text-blue-800">
              {detranDetectado.nome} ({getNomeEstado(detranDetectado.sigla_estado)})
            </span>
            <span className="text-xs text-blue-600 ml-auto">
              Prazo Defesa: {detranDetectado.prazo_defesa_previa} dias | JARI: {detranDetectado.prazo_jari} dias
            </span>
          </div>
        )}

        {/* Indicador de veículo encontrado - banco interno */}
        {veiculoEncontrado && fonteVeiculo === 'interno' && (
          <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center gap-2">
            <i className="ri-checkbox-circle-line text-green-600"></i>
            <span className="text-sm text-green-800">
              <strong>Veículo cadastrado!</strong> Dados do cliente preenchidos automaticamente.
            </span>
          </div>
        )}

        {/* Indicador de veículo não encontrado - preencher manualmente */}
        {!buscandoPlaca && dados.placa.length >= 7 && !veiculoEncontrado && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-edit-line text-amber-600"></i>
              <span className="text-sm font-medium text-amber-800">
                Veículo não cadastrado no sistema
              </span>
            </div>
            <p className="text-xs text-amber-700">
              {detranDetectado 
                ? `Estado detectado pela placa: ${getNomeEstado(detranDetectado.sigla_estado)}. Preencha os demais dados manualmente (modelo, RENAVAM, proprietário).`
                : 'Preencha todos os dados do veículo e proprietário manualmente.'}
            </p>
          </div>
        )}
      </div>

      {/* Seção: Dados do Recorrente */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <i className="ri-user-line"></i>
          Dados do Recorrente
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              value={dados.nomeRecorrente}
              onChange={(e) => setDados(prev => ({ ...prev, nomeRecorrente: e.target.value }))}
              placeholder="Nome do proprietário/recorrente"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ *</label>
            <input
              type="text"
              value={dados.cpfCnpj}
              onChange={(e) => setDados(prev => ({ ...prev, cpfCnpj: e.target.value }))}
              placeholder="000.000.000-00"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
            <input
              type="text"
              value={dados.endereco}
              onChange={(e) => setDados(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Rua, número, complemento, bairro"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input
              type="text"
              value={dados.cidade}
              onChange={(e) => setDados(prev => ({ ...prev, cidade: e.target.value }))}
              placeholder="Cidade"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <input
                type="text"
                value={dados.estado}
                onChange={(e) => setDados(prev => ({ ...prev, estado: e.target.value }))}
                placeholder="UF"
                maxLength={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input
                type="text"
                value={dados.cep}
                onChange={(e) => setDados(prev => ({ ...prev, cep: e.target.value }))}
                placeholder="00000-000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              value={dados.telefone}
              onChange={(e) => setDados(prev => ({ ...prev, telefone: e.target.value }))}
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={dados.email}
              onChange={(e) => setDados(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Seção: Dados da Infração */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
          <i className="ri-error-warning-line"></i>
          Dados da Infração
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nº Auto de Infração *</label>
            <input
              type="text"
              value={dados.numeroAuto}
              onChange={(e) => setDados(prev => ({ ...prev, numeroAuto: e.target.value }))}
              placeholder="Número do auto"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input
                type="date"
                value={dados.dataInfracao}
                onChange={(e) => setDados(prev => ({ ...prev, dataInfracao: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input
                type="time"
                value={dados.horaInfracao}
                onChange={(e) => setDados(prev => ({ ...prev, horaInfracao: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Local da Infração</label>
            <input
              type="text"
              value={dados.localInfracao}
              onChange={(e) => setDados(prev => ({ ...prev, localInfracao: e.target.value }))}
              placeholder="Endereço onde ocorreu a infração"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Infração * ({infracoes.length} disponíveis)
            </label>
            <select
              value={dados.codigoInfracao}
              onChange={(e) => handleInfracaoChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loadingDados}
            >
              <option value="">{loadingDados ? 'Carregando...' : 'Selecione a infração'}</option>
              {Object.entries(
                infracoes.reduce((acc, inf) => {
                  const cat = inf.categoria || 'Outros';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(inf);
                  return acc;
                }, {} as Record<string, Infracao[]>)
              ).map(([categoria, items]) => (
                <optgroup key={categoria} label={categoria.charAt(0).toUpperCase() + categoria.slice(1).replace('_', ' ')}>
                  {items.map((inf) => (
                    <option key={inf.id} value={inf.codigo}>
                      {inf.codigo} - {inf.descricao.substring(0, 60)}{inf.descricao.length > 60 ? '...' : ''} ({inf.gravidade})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          
          {dados.codigoInfracao && (
            <div className="md:col-span-2 p-3 bg-white border border-red-200 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Valor da Multa</p>
                  <p className="font-bold text-red-600">{formatCurrency(dados.valorMulta)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pontos</p>
                  <p className="font-bold text-orange-600">{dados.pontos} pts</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gravidade</p>
                  <p className="font-bold text-gray-800">{dados.gravidade}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Seção: Descrição da Situação */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <i className="ri-chat-quote-line"></i>
          Descrição da Situação
        </h4>
        <textarea
          value={dados.descricaoSituacao}
          onChange={(e) => setDados(prev => ({ ...prev, descricaoSituacao: e.target.value }))}
          placeholder="Descreva detalhadamente as circunstâncias da infração, argumentos de defesa, e qualquer informação relevante que possa ajudar a IA a gerar uma argumentação sólida..."
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Quanto mais detalhes você fornecer, melhor será a argumentação jurídica gerada pela IA.
        </p>
      </div>

      {/* Botão de Submissão */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={gerando || !dados.nomeRecorrente || !dados.cpfCnpj || !dados.placa || !dados.numeroAuto || !dados.codigoInfracao}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {gerando ? (
            <>
              <i className="ri-loader-4-line animate-spin text-xl"></i>
              <span>Gerando Recurso...</span>
            </>
          ) : (
            <>
              <i className="ri-magic-line text-xl"></i>
              <span>Gerar Recurso com IA</span>
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => setDados({
            nomeRecorrente: '',
            cpfCnpj: '',
            endereco: '',
            cidade: '',
            estado: '',
            cep: '',
            telefone: '',
            email: '',
            placa: '',
            renavam: '',
            modelo: '',
            numeroAuto: '',
            dataInfracao: '',
            horaInfracao: '',
            localInfracao: '',
            codigoInfracao: '',
            descricaoInfracao: '',
            valorMulta: 0,
            pontos: 0,
            gravidade: '',
            tipoRecurso: 'defesa_previa',
            descricaoSituacao: '',
            detranId: null,
            detranNome: null,
            estadoDetran: null,
          })}
          className="px-6 py-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
        >
          <i className="ri-refresh-line"></i>
        </button>
      </div>
    </form>
  );
}
