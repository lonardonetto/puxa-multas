import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Legislacao {
  id: string;
  tipo: 'ctb' | 'contran' | 'jurisprudencia' | 'outro';
  titulo: string;
  descricao: string | null;
  conteudo: string | null;
  arquivo_url: string | null;
  numero_resolucao: string | null;
  data_publicacao: string | null;
  data_vigencia: string | null;
  artigos_relacionados: string[] | null;
  palavras_chave: string[] | null;
  ativo: boolean;
  is_global: boolean;
  created_at: string | null;
}

const TIPOS_LEGISLACAO = [
  { value: 'ctb', label: 'CTB - Código de Trânsito', icon: 'ri-book-2-line', color: 'text-blue-600 bg-blue-50' },
  { value: 'contran', label: 'Resolução CONTRAN', icon: 'ri-file-list-3-line', color: 'text-purple-600 bg-purple-50' },
  { value: 'jurisprudencia', label: 'Jurisprudência', icon: 'ri-scales-3-line', color: 'text-amber-600 bg-amber-50' },
  { value: 'outro', label: 'Outro', icon: 'ri-file-text-line', color: 'text-gray-600 bg-gray-50' },
];

export default function LegislacaoTab() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [analisando, setAnalisando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    tipo: 'ctb' as 'ctb' | 'contran' | 'jurisprudencia' | 'outro',
    titulo: '',
    descricao: '',
    conteudo: '',
    arquivo_url: '',
    numero_resolucao: '',
    data_publicacao: '',
    data_vigencia: '',
    artigos_relacionados: '',
    palavras_chave: '',
    ativo: true,
    is_global: true,
  });

  // Fetch legislação
  const { data: legislacoes, isLoading } = useQuery({
    queryKey: ['legislacao-base'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legislacao_base' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as Legislacao[];
    },
  });

  // Upload file
  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `legislacao_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('conhecimento-ia')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      toast.error('Erro ao fazer upload do arquivo');
      return null;
    }

    const { data } = supabase.storage
      .from('conhecimento-ia')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // Analisar documento com IA para extrair conteúdo
  const analisarDocumento = async (fileUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analisar-documento-conhecimento', {
        body: { fileUrl, fileType: 'legislacao' }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro na análise:', error);
      toast.error('Erro ao analisar documento com IA');
      return null;
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await uploadFile(file);
    setUploading(false);

    if (url) {
      setFormData(prev => ({ ...prev, arquivo_url: url }));
      toast.success('Arquivo enviado! Analisando com IA...');
      
      setAnalisando(true);
      const resultado = await analisarDocumento(url);
      setAnalisando(false);

      if (resultado?.dados) {
        const dados = resultado.dados;
        setFormData(prev => ({
          ...prev,
          conteudo: dados.conteudo_extraido || dados.texto || prev.conteudo,
          titulo: dados.titulo || prev.titulo,
          palavras_chave: dados.palavras_chave?.join(', ') || prev.palavras_chave,
        }));
        toast.success('Conteúdo extraído com sucesso!');
      }
    }
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        tipo: data.tipo,
        titulo: data.titulo,
        descricao: data.descricao || null,
        conteudo: data.conteudo || null,
        arquivo_url: data.arquivo_url || null,
        numero_resolucao: data.numero_resolucao || null,
        data_publicacao: data.data_publicacao || null,
        data_vigencia: data.data_vigencia || null,
        artigos_relacionados: data.artigos_relacionados ? data.artigos_relacionados.split(',').map(a => a.trim()) : null,
        palavras_chave: data.palavras_chave ? data.palavras_chave.split(',').map(a => a.trim()) : null,
        ativo: data.ativo,
        is_global: data.is_global,
      };

      if (data.id) {
        const { error } = await supabase
          .from('legislacao_base' as any)
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('legislacao_base' as any)
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legislacao-base'] });
      toast.success(editingId ? 'Legislação atualizada!' : 'Legislação adicionada à base!');
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
        .from('legislacao_base' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legislacao-base'] });
      toast.success('Legislação removida!');
    },
    onError: (error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      tipo: 'ctb',
      titulo: '',
      descricao: '',
      conteudo: '',
      arquivo_url: '',
      numero_resolucao: '',
      data_publicacao: '',
      data_vigencia: '',
      artigos_relacionados: '',
      palavras_chave: '',
      ativo: true,
      is_global: true,
    });
    setEditingId(null);
  };

  const handleEdit = (leg: Legislacao) => {
    setFormData({
      tipo: leg.tipo,
      titulo: leg.titulo,
      descricao: leg.descricao || '',
      conteudo: leg.conteudo || '',
      arquivo_url: leg.arquivo_url || '',
      numero_resolucao: leg.numero_resolucao || '',
      data_publicacao: leg.data_publicacao || '',
      data_vigencia: leg.data_vigencia || '',
      artigos_relacionados: leg.artigos_relacionados?.join(', ') || '',
      palavras_chave: leg.palavras_chave?.join(', ') || '',
      ativo: leg.ativo,
      is_global: leg.is_global,
    });
    setEditingId(leg.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo) {
      toast.error('Preencha o título');
      return;
    }
    saveMutation.mutate(editingId ? { ...formData, id: editingId } : formData);
  };

  // Filter
  const filteredLegislacoes = (legislacoes || []).filter(l => {
    const matchesSearch = searchTerm === '' ||
      l.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.conteudo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.numero_resolucao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'all' || l.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  const getTipoConfig = (tipo: string) => TIPOS_LEGISLACAO.find(t => t.value === tipo) || TIPOS_LEGISLACAO[3];

  // Stats
  const stats = {
    ctb: legislacoes?.filter(l => l.tipo === 'ctb').length || 0,
    contran: legislacoes?.filter(l => l.tipo === 'contran').length || 0,
    jurisprudencia: legislacoes?.filter(l => l.tipo === 'jurisprudencia').length || 0,
    total: legislacoes?.length || 0,
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="ri-book-2-line text-2xl text-blue-600"></i>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{stats.ctb}</p>
              <p className="text-sm text-gray-500">Artigos CTB</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <i className="ri-file-list-3-line text-2xl text-purple-600"></i>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">{stats.contran}</p>
              <p className="text-sm text-gray-500">Resoluções CONTRAN</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <i className="ri-scales-3-line text-2xl text-amber-600"></i>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">{stats.jurisprudencia}</p>
              <p className="text-sm text-gray-500">Jurisprudências</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="ri-database-2-line text-2xl text-green-600"></i>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{stats.total}</p>
              <p className="text-sm text-gray-500">Total na Base</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 mb-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <i className="ri-scales-line text-xl text-blue-600"></i>
          </div>
          <div>
            <h3 className="font-bold text-blue-900">Base de Legislação para IA</h3>
            <p className="text-sm text-blue-700 mt-1">
              Adicione artigos do <strong>CTB</strong> e <strong>Resoluções do CONTRAN</strong> que a IA usará para fundamentar
              os recursos gerados. Quanto mais atualizada a base, melhor a argumentação jurídica!
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Buscar por título, conteúdo ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="all">Todos os tipos</option>
            {TIPOS_LEGISLACAO.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="ri-add-line mr-2"></i>
          Adicionar Legislação
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <i className="ri-loader-4-line text-4xl animate-spin text-blue-600"></i>
        </div>
      ) : filteredLegislacoes.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
          <i className="ri-book-open-line text-5xl text-gray-300"></i>
          <p className="text-gray-500 mt-4">Nenhuma legislação cadastrada ainda</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Adicionar Primeira Legislação
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Título</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nº Resolução</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Artigos</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLegislacoes.map((leg) => {
                const tipoConfig = getTipoConfig(leg.tipo);
                return (
                  <tr key={leg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${tipoConfig.color}`}>
                        <i className={`${tipoConfig.icon} mr-1`}></i>
                        {tipoConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800 line-clamp-1">{leg.titulo}</p>
                      {leg.descricao && (
                        <p className="text-xs text-gray-500 line-clamp-1">{leg.descricao}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">
                        {leg.numero_resolucao || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {leg.artigos_relacionados?.slice(0, 3).map((art, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            Art. {art}
                          </span>
                        ))}
                        {(leg.artigos_relacionados?.length || 0) > 3 && (
                          <span className="text-xs text-gray-400">+{(leg.artigos_relacionados?.length || 0) - 3}</span>
                        )}
                        {!leg.artigos_relacionados?.length && '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        leg.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {leg.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {leg.arquivo_url && (
                          <a
                            href={leg.arquivo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver arquivo"
                          >
                            <i className="ri-file-download-line"></i>
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(leg)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja remover esta legislação?')) {
                              deleteMutation.mutate(leg.id);
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                  {editingId ? 'Editar Legislação' : 'Adicionar Legislação'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  CTB, Resoluções CONTRAN ou Jurisprudências para a IA consultar
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
              {/* Upload de Arquivo */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${
                    formData.arquivo_url ? 'bg-green-100' : 'bg-blue-50'
                  }`}>
                    {uploading || analisando ? (
                      <i className="ri-loader-4-line text-3xl text-blue-600 animate-spin"></i>
                    ) : formData.arquivo_url ? (
                      <i className="ri-check-line text-3xl text-green-600"></i>
                    ) : (
                      <i className="ri-file-upload-line text-3xl text-blue-500"></i>
                    )}
                  </div>
                  <p className="font-bold text-gray-700 mb-1">Upload de Documento (Opcional)</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {analisando ? 'Extraindo conteúdo com IA...' : 
                     uploading ? 'Enviando...' :
                     formData.arquivo_url ? 'Arquivo anexado' : 'PDF, DOC ou TXT do documento legal'}
                  </p>
                  {formData.arquivo_url ? (
                    <div className="flex gap-2 justify-center">
                      <a href={formData.arquivo_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline">
                        Ver arquivo
                      </a>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, arquivo_url: '' }))}
                        className="text-sm text-red-500 hover:underline">
                        Remover
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || analisando}
                      className="px-6 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 disabled:opacity-50"
                    >
                      <i className="ri-upload-2-line mr-2"></i> Enviar Documento
                    </button>
                  )}
                </div>
              </div>

              {/* Tipo e Dados Básicos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {TIPOS_LEGISLACAO.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº Resolução</label>
                  <input
                    type="text"
                    value={formData.numero_resolucao}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero_resolucao: e.target.value }))}
                    placeholder="Ex: 780/2019"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Art. 280 CTB - Requisitos do Auto de Infração"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Breve descrição do conteúdo"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo / Texto Legal</label>
                <textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData(prev => ({ ...prev, conteudo: e.target.value }))}
                  rows={8}
                  placeholder="Cole aqui o texto completo do artigo, resolução ou jurisprudência..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artigos Relacionados</label>
                  <input
                    type="text"
                    value={formData.artigos_relacionados}
                    onChange={(e) => setFormData(prev => ({ ...prev, artigos_relacionados: e.target.value }))}
                    placeholder="280, 281, 282 (separados por vírgula)"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave</label>
                  <input
                    type="text"
                    value={formData.palavras_chave}
                    onChange={(e) => setFormData(prev => ({ ...prev, palavras_chave: e.target.value }))}
                    placeholder="nulidade, ampla defesa, notificação"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Publicação</label>
                  <input
                    type="date"
                    value={formData.data_publicacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_publicacao: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vigência</label>
                  <input
                    type="date"
                    value={formData.data_vigencia}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_vigencia: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_global}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_global: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Disponível para todas as organizações</span>
                </label>
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saveMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saveMutation.isPending && <i className="ri-loader-4-line animate-spin"></i>}
                {editingId ? 'Salvar Alterações' : 'Adicionar à Base'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
