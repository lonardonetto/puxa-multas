import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LegislacaoTab from '@/components/super-admin/LegislacaoTab';

interface RecursoConhecimento {
  id: string;
  codigo_infracao: string;
  tipo_recurso: string;
  conteudo: string;
  argumentos_chave: string[] | null;
  detran_estado: string | null;
  resultado: string | null;
  data_deferimento: string | null;
  is_global: boolean | null;
  observacoes: string | null;
  created_at: string | null;
  status_aprovacao: string | null;
  recurso_origem_id: string | null;
  organization_id: string | null;
  arquivo_ait_url: string | null;
  arquivo_deferimento_url: string | null;
  dados_extraidos_ia: any | null;
}

const TIPOS_RECURSO = [
  { value: 'defesa_previa', label: 'Defesa Prévia' },
  { value: 'jari', label: 'JARI' },
  { value: 'cetran', label: 'CETRAN' },
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function KnowledgeBasePage() {
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState<'recursos' | 'legislacao'>('recursos');
  const [activeTab, setActiveTab] = useState<'pendentes' | 'aprovados'>('pendentes');
  const [showModal, setShowModal] = useState(false);
  const [viewingRecurso, setViewingRecurso] = useState<RecursoConhecimento | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  
  // Upload states
  const [uploadingAit, setUploadingAit] = useState(false);
  const [uploadingDeferimento, setUploadingDeferimento] = useState(false);
  const [analisandoAit, setAnalisandoAit] = useState(false);
  const [analisandoDeferimento, setAnalisandoDeferimento] = useState(false);
  const aitInputRef = useRef<HTMLInputElement>(null);
  const deferimentoInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    codigo_infracao: '',
    tipo_recurso: 'defesa_previa',
    conteudo: '',
    argumentos_chave: '',
    detran_estado: '',
    resultado: 'deferido',
    data_deferimento: '',
    observacoes: '',
    is_global: true,
    arquivo_ait_url: '',
    arquivo_deferimento_url: '',
    dados_extraidos_ia: null as any,
  });

  // Fetch recursos conhecimento
  const { data: recursos, isLoading } = useQuery({
    queryKey: ['recursos-conhecimento'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recursos_conhecimento')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RecursoConhecimento[];
    },
  });

  // Upload file to storage
  const uploadFile = async (file: File, tipo: 'ait' | 'deferimento'): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${tipo}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('conhecimento-ia')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      toast.error('Erro ao fazer upload do arquivo');
      return null;
    }

    const { data } = supabase.storage
      .from('conhecimento-ia')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Analisar documento com IA
  const analisarDocumento = async (fileUrl: string, fileType: 'ait' | 'deferimento') => {
    try {
      const { data, error } = await supabase.functions.invoke('analisar-documento-conhecimento', {
        body: { fileUrl, fileType }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro na análise:', error);
      toast.error('Erro ao analisar documento com IA');
      return null;
    }
  };

  // Handle AIT upload
  const handleAitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAit(true);
    const url = await uploadFile(file, 'ait');
    setUploadingAit(false);

    if (url) {
      setFormData(prev => ({ ...prev, arquivo_ait_url: url }));
      toast.success('AIT enviado! Analisando com IA...');
      
      setAnalisandoAit(true);
      const resultado = await analisarDocumento(url, 'ait');
      setAnalisandoAit(false);

      if (resultado?.dados) {
        // Preencher campos automaticamente
        const dados = resultado.dados;
        setFormData(prev => ({
          ...prev,
          codigo_infracao: dados.codigo_infracao || dados.Código_da_Infração || prev.codigo_infracao,
          dados_extraidos_ia: {
            ...prev.dados_extraidos_ia,
            ait: dados
          }
        }));
        toast.success('Dados do AIT extraídos com sucesso!');
      }
    }
  };

  // Handle Deferimento upload
  const handleDeferimentoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDeferimento(true);
    const url = await uploadFile(file, 'deferimento');
    setUploadingDeferimento(false);

    if (url) {
      setFormData(prev => ({ ...prev, arquivo_deferimento_url: url }));
      toast.success('Deferimento enviado! Analisando com IA...');
      
      setAnalisandoDeferimento(true);
      const resultado = await analisarDocumento(url, 'deferimento');
      setAnalisandoDeferimento(false);

      if (resultado?.dados) {
        const dados = resultado.dados;
        // Extrair argumentos
        const args = dados.argumentos_aceitos || dados.Argumentos_aceitos || [];
        setFormData(prev => ({
          ...prev,
          argumentos_chave: Array.isArray(args) ? args.join(', ') : prev.argumentos_chave,
          dados_extraidos_ia: {
            ...prev.dados_extraidos_ia,
            deferimento: dados
          }
        }));
        toast.success('Dados do deferimento extraídos com sucesso!');
      }
    }
  };

  // Aprovar/Rejeitar mutation
  const aprovarMutation = useMutation({
    mutationFn: async ({ id, status, is_global }: { id: string; status: 'aprovado' | 'rejeitado'; is_global?: boolean }) => {
      const payload: any = { status_aprovacao: status };
      if (status === 'aprovado' && is_global !== undefined) {
        payload.is_global = is_global;
      }
      const { error } = await supabase
        .from('recursos_conhecimento')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recursos-conhecimento'] });
      toast.success(variables.status === 'aprovado' ? 'Recurso aprovado e adicionado à base!' : 'Recurso rejeitado');
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        codigo_infracao: data.codigo_infracao,
        tipo_recurso: data.tipo_recurso,
        conteudo: data.conteudo,
        argumentos_chave: data.argumentos_chave ? data.argumentos_chave.split(',').map(a => a.trim()) : null,
        detran_estado: data.detran_estado || null,
        resultado: data.resultado,
        data_deferimento: data.data_deferimento || null,
        observacoes: data.observacoes || null,
        is_global: data.is_global,
        status_aprovacao: 'aprovado',
        arquivo_ait_url: data.arquivo_ait_url || null,
        arquivo_deferimento_url: data.arquivo_deferimento_url || null,
        dados_extraidos_ia: data.dados_extraidos_ia || null,
      };

      if (data.id) {
        const { error } = await supabase
          .from('recursos_conhecimento')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('recursos_conhecimento')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recursos-conhecimento'] });
      toast.success(editingId ? 'Recurso atualizado!' : 'Recurso adicionado à base!');
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error('Erro ao salvar: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recursos_conhecimento')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recursos-conhecimento'] });
      toast.success('Recurso removido da base!');
    },
    onError: (error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      codigo_infracao: '',
      tipo_recurso: 'defesa_previa',
      conteudo: '',
      argumentos_chave: '',
      detran_estado: '',
      resultado: 'deferido',
      data_deferimento: '',
      observacoes: '',
      is_global: true,
      arquivo_ait_url: '',
      arquivo_deferimento_url: '',
      dados_extraidos_ia: null,
    });
    setEditingId(null);
  };

  const handleEdit = (recurso: RecursoConhecimento) => {
    setFormData({
      codigo_infracao: recurso.codigo_infracao,
      tipo_recurso: recurso.tipo_recurso,
      conteudo: recurso.conteudo,
      argumentos_chave: recurso.argumentos_chave?.join(', ') || '',
      detran_estado: recurso.detran_estado || '',
      resultado: recurso.resultado || 'deferido',
      data_deferimento: recurso.data_deferimento || '',
      observacoes: recurso.observacoes || '',
      is_global: recurso.is_global ?? true,
      arquivo_ait_url: recurso.arquivo_ait_url || '',
      arquivo_deferimento_url: recurso.arquivo_deferimento_url || '',
      dados_extraidos_ia: recurso.dados_extraidos_ia || null,
    });
    setEditingId(recurso.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo_infracao || !formData.conteudo) {
      toast.error('Preencha o código da infração e o conteúdo');
      return;
    }
    saveMutation.mutate(editingId ? { ...formData, id: editingId } : formData);
  };

  // Separar recursos por status
  const recursosPendentes = recursos?.filter(r => r.status_aprovacao === 'pendente' || !r.status_aprovacao) || [];
  const recursosAprovados = recursos?.filter(r => r.status_aprovacao === 'aprovado') || [];

  // Filter recursos baseado na aba ativa
  const currentList = activeTab === 'pendentes' ? recursosPendentes : recursosAprovados;
  
  const filteredRecursos = currentList.filter(r => {
    const matchesSearch = searchTerm === '' ||
      r.codigo_infracao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.conteudo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'all' || r.tipo_recurso === filterTipo;
    const matchesEstado = filterEstado === 'all' || r.detran_estado === filterEstado;
    return matchesSearch && matchesTipo && matchesEstado;
  });

  const stats = {
    pendentes: recursosPendentes.length,
    aprovados: recursosAprovados.length,
    total: recursos?.length || 0,
  };

  const getTipoLabel = (value: string) => TIPOS_RECURSO.find(t => t.value === value)?.label || value;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Base de Conhecimento IA</h1>
          <p className="text-gray-600 mt-1">Gerencie recursos deferidos e legislação para treinar a IA</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setMainTab('recursos')}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
            mainTab === 'recursos' 
              ? 'bg-white text-purple-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="ri-file-text-line"></i>
          Recursos Deferidos
        </button>
        <button
          onClick={() => setMainTab('legislacao')}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
            mainTab === 'legislacao' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="ri-scales-line"></i>
          Legislação (CTB / CONTRAN)
        </button>
      </div>

      {/* Render tab content */}
      {mainTab === 'legislacao' ? (
        <LegislacaoTab />
      ) : (
        <>
          {/* Button for Recursos */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <i className="ri-add-line mr-2"></i>
              Adicionar Manual
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              onClick={() => setActiveTab('pendentes')}
              className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all ${
                activeTab === 'pendentes' ? 'border-orange-500' : 'border-transparent hover:border-orange-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <i className="ri-time-line text-2xl text-orange-600"></i>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendentes}</p>
                  <p className="text-sm text-gray-500">Pendentes de Análise</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('aprovados')}
              className={`bg-white rounded-xl p-5 shadow-sm border-2 cursor-pointer transition-all ${
                activeTab === 'aprovados' ? 'border-green-500' : 'border-transparent hover:border-green-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <i className="ri-check-double-line text-2xl text-green-600"></i>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">{stats.aprovados}</p>
                  <p className="text-sm text-gray-500">Aprovados na Base</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <i className="ri-brain-line text-2xl text-purple-600"></i>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total Geral</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 mb-6 border border-purple-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <i className="ri-lightbulb-line text-xl text-purple-600"></i>
              </div>
              <div>
                <h3 className="font-bold text-purple-900">Upload Inteligente com IA</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Anexe o <strong>AIT</strong> e o <strong>recurso que foi deferido</strong>. A IA irá analisar automaticamente
                  os documentos, extrair argumentos vencedores e aprender padrões de sucesso. Quanto mais exemplos reais, melhor
                  a IA gerará novos recursos!
                </p>
              </div>
            </div>
          </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar por código ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
          </div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
          >
            <option value="all">Todos os tipos</option>
            {TIPOS_RECURSO.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
          >
            <option value="all">Todos os estados</option>
            {ESTADOS.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Title */}
      <div className="flex items-center gap-2 mb-4">
        <i className={`text-xl ${activeTab === 'pendentes' ? 'ri-time-line text-orange-600' : 'ri-check-double-line text-green-600'}`}></i>
        <h2 className="text-xl font-bold text-gray-800">
          {activeTab === 'pendentes' ? 'Recursos Pendentes de Aprovação' : 'Recursos Aprovados'}
        </h2>
        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
          {filteredRecursos.length}
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <i className="ri-loader-4-line text-4xl animate-spin text-purple-600"></i>
        </div>
      ) : filteredRecursos.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
          <i className="ri-inbox-line text-5xl text-gray-300"></i>
          <p className="text-gray-500 mt-4">
            {activeTab === 'pendentes' 
              ? 'Nenhum recurso pendente de aprovação'
              : 'Nenhum recurso aprovado ainda'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Anexos</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecursos.map((recurso) => (
                <tr key={recurso.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-purple-600">{recurso.codigo_infracao}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded">
                      {getTipoLabel(recurso.tipo_recurso)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {recurso.detran_estado || 'Nacional'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {recurso.arquivo_ait_url && (
                        <a href={recurso.arquivo_ait_url} target="_blank" rel="noopener noreferrer"
                          className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded flex items-center gap-1 hover:bg-red-100">
                          <i className="ri-file-text-line"></i> AIT
                        </a>
                      )}
                      {recurso.arquivo_deferimento_url && (
                        <a href={recurso.arquivo_deferimento_url} target="_blank" rel="noopener noreferrer"
                          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded flex items-center gap-1 hover:bg-blue-100">
                          <i className="ri-file-text-line"></i> Recurso
                        </a>
                      )}
                      {!recurso.arquivo_ait_url && !recurso.arquivo_deferimento_url && (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {recurso.created_at 
                      ? format(new Date(recurso.created_at), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingRecurso(recurso)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                      
                      {activeTab === 'pendentes' && (
                        <>
                          <button
                            onClick={() => aprovarMutation.mutate({ id: recurso.id, status: 'aprovado', is_global: true })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Aprovar"
                          >
                            <i className="ri-check-line"></i>
                          </button>
                          <button
                            onClick={() => aprovarMutation.mutate({ id: recurso.id, status: 'rejeitado' })}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rejeitar"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </>
                      )}
                      
                      {activeTab === 'aprovados' && (
                        <>
                          <button
                            onClick={() => handleEdit(recurso)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja remover este recurso da base?')) {
                                deleteMutation.mutate(recurso.id);
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Adicionar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? 'Editar Recurso' : 'Adicionar Recurso à Base'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Anexe documentos para análise automática com IA
                </p>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Upload de Arquivos */}
              <div className="grid grid-cols-2 gap-4">
                {/* Upload AIT */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-purple-400 transition-colors">
                  <input
                    ref={aitInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleAitUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                      formData.arquivo_ait_url ? 'bg-green-100' : 'bg-red-50'
                    }`}>
                      {uploadingAit || analisandoAit ? (
                        <i className="ri-loader-4-line text-2xl text-purple-600 animate-spin"></i>
                      ) : formData.arquivo_ait_url ? (
                        <i className="ri-check-line text-2xl text-green-600"></i>
                      ) : (
                        <i className="ri-file-warning-line text-2xl text-red-500"></i>
                      )}
                    </div>
                    <p className="font-bold text-gray-700 mb-1">Auto de Infração (AIT)</p>
                    <p className="text-xs text-gray-500 mb-3">
                      {analisandoAit ? 'Analisando com IA...' : 
                       uploadingAit ? 'Enviando...' :
                       formData.arquivo_ait_url ? 'Arquivo anexado' : 'Imagem ou PDF do AIT'}
                    </p>
                    {formData.arquivo_ait_url ? (
                      <div className="flex gap-2 justify-center">
                        <a href={formData.arquivo_ait_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline">
                          Ver arquivo
                        </a>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, arquivo_ait_url: '' }))}
                          className="text-xs text-red-500 hover:underline">
                          Remover
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => aitInputRef.current?.click()}
                        disabled={uploadingAit || analisandoAit}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                      >
                        <i className="ri-upload-2-line mr-1"></i> Anexar AIT
                      </button>
                    )}
                  </div>
                </div>

                {/* Upload Recurso Deferido */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-purple-400 transition-colors">
                  <input
                    ref={deferimentoInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleDeferimentoUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                      formData.arquivo_deferimento_url ? 'bg-green-100' : 'bg-blue-50'
                    }`}>
                      {uploadingDeferimento || analisandoDeferimento ? (
                        <i className="ri-loader-4-line text-2xl text-purple-600 animate-spin"></i>
                      ) : formData.arquivo_deferimento_url ? (
                        <i className="ri-check-line text-2xl text-green-600"></i>
                      ) : (
                        <i className="ri-file-text-line text-2xl text-blue-600"></i>
                      )}
                    </div>
                    <p className="font-bold text-gray-700 mb-1">Recurso Deferido</p>
                    <p className="text-xs text-gray-500 mb-3">
                      {analisandoDeferimento ? 'Analisando com IA...' : 
                       uploadingDeferimento ? 'Enviando...' :
                       formData.arquivo_deferimento_url ? 'Arquivo anexado' : 'O recurso que foi aprovado'}
                    </p>
                    {formData.arquivo_deferimento_url ? (
                      <div className="flex gap-2 justify-center">
                        <a href={formData.arquivo_deferimento_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline">
                          Ver arquivo
                        </a>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, arquivo_deferimento_url: '' }))}
                          className="text-xs text-red-500 hover:underline">
                          Remover
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => deferimentoInputRef.current?.click()}
                        disabled={uploadingDeferimento || analisandoDeferimento}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-50"
                      >
                        <i className="ri-upload-2-line mr-1"></i> Anexar Recurso
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Dados extraídos pela IA */}
              {formData.dados_extraidos_ia && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-robot-line text-purple-600"></i>
                    <span className="font-bold text-purple-800">Dados Extraídos pela IA</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {formData.dados_extraidos_ia.ait && (
                      <div>
                        <p className="text-purple-600 font-medium mb-1">Do AIT:</p>
                        <ul className="text-purple-700 space-y-1">
                          {Object.entries(formData.dados_extraidos_ia.ait).slice(0, 5).map(([key, value]) => (
                            <li key={key} className="truncate">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {formData.dados_extraidos_ia.deferimento && (
                      <div>
                        <p className="text-purple-600 font-medium mb-1">Do Deferimento:</p>
                        <ul className="text-purple-700 space-y-1">
                          {Object.entries(formData.dados_extraidos_ia.deferimento).slice(0, 5).map(([key, value]) => (
                            <li key={key} className="truncate">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Primeira linha */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Código da Infração *</label>
                  <input
                    type="text"
                    placeholder="Ex: 74550, 50100"
                    value={formData.codigo_infracao}
                    onChange={(e) => setFormData({ ...formData, codigo_infracao: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Recurso</label>
                  <select
                    value={formData.tipo_recurso}
                    onChange={(e) => setFormData({ ...formData, tipo_recurso: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  >
                    {TIPOS_RECURSO.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Segunda linha */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">DETRAN/Estado</label>
                  <select
                    value={formData.detran_estado}
                    onChange={(e) => setFormData({ ...formData, detran_estado: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  >
                    <option value="">Nacional (todos)</option>
                    {ESTADOS.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Data do Deferimento</label>
                  <input
                    type="date"
                    value={formData.data_deferimento}
                    onChange={(e) => setFormData({ ...formData, data_deferimento: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Argumentos */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Argumentos-Chave (separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: erro de preenchimento, ausência de foto, local incorreto"
                  value={formData.argumentos_chave}
                  onChange={(e) => setFormData({ ...formData, argumentos_chave: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Liste os principais argumentos que levaram ao deferimento</p>
              </div>

              {/* Conteúdo */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Conteúdo do Recurso Deferido *</label>
                <textarea
                  placeholder="Cole aqui o texto completo do recurso que foi deferido..."
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Este conteúdo será usado pela IA como referência para gerar novos recursos</p>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Observações</label>
                <textarea
                  placeholder="Anotações adicionais sobre este recurso..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saveMutation.isPending || uploadingAit || uploadingDeferimento || analisandoAit || analisandoDeferimento}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {saveMutation.isPending ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Salvando...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line"></i>
                    {editingId ? 'Atualizar' : 'Adicionar à Base'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualizar */}
      {viewingRecurso && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Visualizar Recurso</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Código: <span className="font-mono font-bold text-purple-600">{viewingRecurso.codigo_infracao}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingRecurso(null)}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Tipo</p>
                  <p className="font-semibold text-gray-800 mt-1">{getTipoLabel(viewingRecurso.tipo_recurso)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Estado</p>
                  <p className="font-semibold text-gray-800 mt-1">{viewingRecurso.detran_estado || 'Nacional'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${
                    viewingRecurso.status_aprovacao === 'aprovado' 
                      ? 'bg-green-100 text-green-700' 
                      : viewingRecurso.status_aprovacao === 'rejeitado'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {viewingRecurso.status_aprovacao === 'aprovado' ? 'Aprovado' 
                      : viewingRecurso.status_aprovacao === 'rejeitado' ? 'Rejeitado' : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Arquivos anexados */}
              {(viewingRecurso.arquivo_ait_url || viewingRecurso.arquivo_deferimento_url) && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Arquivos Anexados</p>
                  <div className="flex gap-3">
                    {viewingRecurso.arquivo_ait_url && (
                      <a href={viewingRecurso.arquivo_ait_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
                        <i className="ri-file-text-line"></i>
                        Ver AIT
                        <i className="ri-external-link-line text-sm"></i>
                      </a>
                    )}
                    {viewingRecurso.arquivo_deferimento_url && (
                      <a href={viewingRecurso.arquivo_deferimento_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                        <i className="ri-file-check-line"></i>
                        Ver Deferimento
                        <i className="ri-external-link-line text-sm"></i>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {viewingRecurso.argumentos_chave && viewingRecurso.argumentos_chave.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Argumentos-Chave</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingRecurso.argumentos_chave.map((arg, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm">
                        {arg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Conteúdo do Recurso</p>
                <div className="bg-gray-50 p-4 rounded-xl max-h-[300px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {viewingRecurso.conteudo}
                  </pre>
                </div>
              </div>

              {viewingRecurso.observacoes && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Observações</p>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{viewingRecurso.observacoes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              {(viewingRecurso.status_aprovacao === 'pendente' || !viewingRecurso.status_aprovacao) && (
                <>
                  <button
                    onClick={() => {
                      aprovarMutation.mutate({ id: viewingRecurso.id, status: 'rejeitado' });
                      setViewingRecurso(null);
                    }}
                    className="px-6 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-medium flex items-center gap-2"
                  >
                    <i className="ri-close-line"></i>
                    Rejeitar
                  </button>
                  <button
                    onClick={() => {
                      aprovarMutation.mutate({ id: viewingRecurso.id, status: 'aprovado', is_global: true });
                      setViewingRecurso(null);
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold flex items-center gap-2"
                  >
                    <i className="ri-check-line"></i>
                    Aprovar
                  </button>
                </>
              )}
              <button
                onClick={() => setViewingRecurso(null)}
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
