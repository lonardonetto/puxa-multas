import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Edital {
    id: string;
    detran: string;
    tipo_penalidade: string;
    descricao: string;
    data_publicacao: string;
    prazo_recurso: string;
    quantidade_nomes: number;
    nomes_vendidos: number;
    preco_por_nome: number;
    status: 'disponivel' | 'vendido' | 'expirado';
    arquivo_url?: string | null;
    arquivos?: string[] | null;
    comprado_por?: string | null;
    created_at: string;
}

export default function EditaisManagement() {
    const [editais, setEditais] = useState<Edital[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEdital, setEditingEdital] = useState<Partial<Edital> | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    // Buscar cargo
    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getSession();
            setUserRole(data.session?.user?.user_metadata?.role || 'autenticado');
        };
        init();
    }, []);

    // Toast helper
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Buscar editais
    const fetchEditais = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('editais')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEditais(data || []);
        } catch (err) {
            console.error('Erro ao buscar editais:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEditais();
    }, []);

    // Abrir modal para novo edital
    const handleCreate = () => {
        setEditingEdital({
            detran: '',
            tipo_penalidade: '',
            descricao: '',
            data_publicacao: new Date().toISOString().split('T')[0],
            prazo_recurso: '',
            quantidade_nomes: 0,
            preco_por_nome: 0.80,
            status: 'disponivel'
        });
        setShowModal(true);
    };

    // Editar edital
    const handleEdit = (edital: Edital) => {
        setEditingEdital(edital);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!editingEdital?.detran || !editingEdital?.tipo_penalidade) {
            showToast('Campos obrigatórios faltando', 'error');
            return;
        }

        setSalvando(true);
        try {
            // 0. Upload de arquivos se houver novos selecionados
            let arquivos = Array.isArray(editingEdital.arquivos) ? [...editingEdital.arquivos] : [];

            if (selectedFiles.length > 0) {
                setUploading(true);
                for (const file of selectedFiles) {
                    const fileExt = file.name.split('.').pop();
                    const originalName = file.name.replace(`.${fileExt}`, '');
                    // Delimitador _---_ para separar o ID único do nome original
                    const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}_---_${originalName}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('editais')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                        .from('editais')
                        .getPublicUrl(filePath);

                    arquivos.push(publicUrl);
                }
                setUploading(false);
            }

            // Função para limpar espaços e caracteres de controle invisíveis ao colar
            const sanitizeString = (val: any) => String(val || '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

            // Função para converter valores colados (ex: "1.000,50" ou "R$ 1,50" -> 1500.5)
            const sanitizeNumber = (val: any) => {
                if (typeof val === 'number') return val;
                let s = String(val || '0').replace('R$', '').trim();
                // Se tem vírgula e ponto, ou só vírgula, tratamos como formato BR (1.234,56 ou 1,50)
                if (s.includes(',')) {
                    s = s.replace(/\./g, '').replace(',', '.');
                }
                const num = parseFloat(s.replace(/[^\d.-]/g, ''));
                return isNaN(num) ? 0 : num;
            };

            // Função para converter data colada (DD/MM/AAAA ou DD/MM/AA) para ISO (YYYY-MM-DD)
            const sanitizeDate = (val: any) => {
                const s = sanitizeString(val);
                // DD/MM/AAAA
                if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
                    const [d, m, y] = s.split('/');
                    return `${y}-${m}-${d}`;
                }
                // DD/MM/AA
                if (/^\d{2}\/\d{2}\/\d{2}$/.test(s)) {
                    const [d, m, y] = s.split('/');
                    return `20${y}-${m}-${d}`;
                }
                return s; // Se já estava correto ou vazio
            };

            const payload = {
                detran: sanitizeString(editingEdital.detran),
                tipo_penalidade: sanitizeString(editingEdital.tipo_penalidade),
                descricao: sanitizeString(editingEdital.descricao),
                data_publicacao: sanitizeDate(editingEdital.data_publicacao),
                prazo_recurso: sanitizeDate(editingEdital.prazo_recurso),
                quantidade_nomes: Math.floor(sanitizeNumber(editingEdital.quantidade_nomes)),
                preco_por_nome: sanitizeNumber(editingEdital.preco_por_nome),
                status: editingEdital.status || 'disponivel',
                arquivos: arquivos,
                arquivo_url: arquivos[0] || null // Mantém compatibilidade por enquanto
            };

            console.log('Dados Sanitizados (V6):', payload);

            let result;
            if (editingEdital.id) {
                result = await supabase
                    .from('editais')
                    .update(payload)
                    .eq('id', editingEdital.id);
            } else {
                result = await supabase
                    .from('editais')
                    .insert(payload);
            }

            if (result.error) throw result.error;

            showToast(editingEdital.id ? 'Edital atualizado com sucesso!' : 'Edital criado com sucesso!');
            setShowModal(false);
            setEditingEdital(null);
            setSelectedFiles([]);
            fetchEditais();
        } catch (err: any) {
            console.error('Erro ao salvar:', err);
            showToast(err.message || 'Erro ao salvar edital', 'error');
        } finally {
            setSalvando(false);
            setUploading(false);
        }
    };

    // Deletar edital
    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este edital?')) return;

        try {
            const { error } = await supabase
                .from('editais')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchEditais();
        } catch (err) {
            console.error('Erro ao deletar edital:', err);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    const getFileName = (url: string) => {
        try {
            const decoded = decodeURIComponent(url);
            const parts = decoded.split('_---_');
            if (parts.length > 1) return parts[parts.length - 1];
            const urlParts = decoded.split('/');
            return urlParts[urlParts.length - 1];
        } catch (e) {
            return 'Arquivo';
        }
    };

    // Calcular estatísticas
    const totalEditais = editais.length;
    const editaisDisponiveis = editais.filter(e => e.status === 'disponivel').length;
    const editaisVendidos = editais.filter(e => e.status === 'vendido').length;
    const totalNomes = editais.reduce((acc, e) => acc + e.quantidade_nomes, 0);

    return (
        <div className="p-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } animate-in fade-in slide-in-from-top-4 duration-300`}>
                    <i className={`${toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} mr-2`}></i>
                    {toast.message}
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestão de Editais</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-600">Cadastre editais para venda aos parceiros</p>
                        {userRole && (
                            <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded cursor-help"
                                title="Diagnóstico: Verifica se seu login tem permissão de Super Admin">
                                Cargo: {userRole}
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                    <i className="ri-add-line mr-2"></i>
                    Novo Edital
                </button>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
                    <p className="text-sm font-medium text-gray-600">Total de Editais</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{totalEditais}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
                    <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{editaisDisponiveis}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-500">
                    <p className="text-sm font-medium text-gray-600">Vendidos</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">{editaisVendidos}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
                    <p className="text-sm font-medium text-gray-600">Total de Nomes</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{totalNomes.toLocaleString()}</p>
                </div>
            </div>

            {/* Tabela de Editais */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <i className="ri-loader-4-line text-4xl animate-spin text-[#10B981]"></i>
                    </div>
                ) : editais.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <i className="ri-file-list-3-line text-5xl mb-4 block"></i>
                        <p className="text-lg font-medium">Nenhum edital cadastrado</p>
                        <p className="text-sm mt-1">Clique em "Novo Edital" para adicionar.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Detran</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo Penalidade</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Publicação</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Prazo</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nomes</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Preço/Nome</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {editais.map((edital) => (
                                <tr key={edital.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <i className="ri-government-line text-blue-600"></i>
                                            </div>
                                            <span className="font-semibold text-gray-800">{edital.detran}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">
                                        {edital.tipo_penalidade}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-600">
                                        {formatDate(edital.data_publicacao)}
                                    </td>
                                    <td className="py-4 px-4 text-sm">
                                        <span className="text-green-600 font-medium">
                                            {formatDate(edital.prazo_recurso)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="font-bold text-gray-800">
                                            {edital.quantidade_nomes.toLocaleString()}
                                        </span>
                                        {edital.nomes_vendidos > 0 && (
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({edital.nomes_vendidos} vendidos)
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 font-bold text-purple-600">
                                        {formatCurrency(edital.preco_por_nome)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${edital.status === 'disponivel' ? 'bg-green-100 text-green-700' :
                                                edital.status === 'vendido' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {edital.status === 'disponivel' ? 'Disponível' :
                                                    edital.status === 'vendido' ? 'Vendido' : 'Expirado'}
                                            </span>
                                            {((edital.arquivos && edital.arquivos.length > 0) || edital.arquivo_url) && (
                                                <i className="ri-attachment-line text-blue-500" title="Possui arquivos anexos"></i>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(edital)}
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <i className="ri-edit-line"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(edital.id)}
                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <i className="ri-delete-bin-line"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de Edição */}
            {showModal && editingEdital && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingEdital.id ? 'Editar Edital' : 'Novo Edital'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full"
                            >
                                <i className="ri-close-line text-xl text-gray-600"></i>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Detran <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editingEdital.detran || ''}
                                        onChange={(e) => setEditingEdital({ ...editingEdital, detran: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                        placeholder="Ex: Detran São Paulo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={editingEdital.status || 'disponivel'}
                                        onChange={(e) => setEditingEdital({ ...editingEdital, status: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                    >
                                        <option value="disponivel">Disponível</option>
                                        <option value="vendido">Vendido</option>
                                        <option value="expirado">Expirado</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Tipo de Penalidade <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={editingEdital.tipo_penalidade || ''}
                                    onChange={(e) => setEditingEdital({ ...editingEdital, tipo_penalidade: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                    placeholder="Ex: Suspensão do direito de dirigir"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    value={editingEdital.descricao || ''}
                                    onChange={(e) => setEditingEdital({ ...editingEdital, descricao: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                    rows={2}
                                    placeholder="Descrição adicional do edital..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Data de Publicação <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editingEdital.data_publicacao || ''}
                                        onChange={(e) => setEditingEdital({ ...editingEdital, data_publicacao: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                        placeholder="DD/MM/AAAA ou AAAA-MM-DD"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Prazo para Recurso <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editingEdital.prazo_recurso || ''}
                                        onChange={(e) => setEditingEdital({ ...editingEdital, prazo_recurso: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                        placeholder="DD/MM/AAAA ou AAAA-MM-DD"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Quantidade de Nomes <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editingEdital.quantidade_nomes || ''}
                                        onChange={(e) => setEditingEdital({ ...editingEdital, quantidade_nomes: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                        placeholder="Ex: 5.000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Preço por Nome (R$) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={editingEdital.preco_por_nome || ''}
                                        onChange={(e) => setEditingEdital({ ...editingEdital, preco_por_nome: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Arquivos do Edital (PDF/Excel/Imagens)
                                </label>

                                {/* Lista de arquivos já vinculados */}
                                {((editingEdital.arquivos && editingEdital.arquivos.length > 0) || editingEdital.arquivo_url) && (
                                    <div className="space-y-2 mb-3">
                                        {(editingEdital.arquivos || (editingEdital.arquivo_url ? [editingEdital.arquivo_url] : [])).map((url, index) => (
                                            <div key={index} className="p-3 border border-green-200 bg-green-50 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <i className="ri-file-line text-xl text-[#10B981]"></i>
                                                    <div className="overflow-hidden">
                                                        <p className="text-xs font-bold text-gray-800 truncate max-w-[200px]" title={getFileName(url)}>
                                                            {getFileName(url)}
                                                        </p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                window.open(url, '_blank');
                                                            }}
                                                            className="text-[10px] text-[#10B981] hover:underline flex items-center gap-1"
                                                        >
                                                            <i className="ri-external-link-line font-normal"></i> Abrir Atual
                                                        </button>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (confirm('Remover este arquivo?')) {
                                                            const currentArquivos = editingEdital.arquivos || (editingEdital.arquivo_url ? [editingEdital.arquivo_url] : []);
                                                            const newArquivos = currentArquivos.filter((_, i) => i !== index);
                                                            setEditingEdital({ ...editingEdital, arquivos: newArquivos, arquivo_url: newArquivos[0] || null });
                                                        }
                                                    }}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                    title="Remover este arquivo"
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#10B981] transition-colors">
                                    <div className="space-y-1 text-center">
                                        <i className="ri-upload-cloud-2-line text-3xl text-gray-400"></i>
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#10B981] hover:text-green-500 focus-within:outline-none">
                                                <span>Selecionar Novos Arquivos</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="sr-only"
                                                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                                                    accept=".pdf, .xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, image/*"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {selectedFiles.length > 0
                                                ? `${selectedFiles.length} novos selecionados`
                                                : 'PDF, Excel ou Imagens (múltiplos)'}
                                        </p>
                                    </div>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                        <p className="text-[10px] font-bold text-blue-700 mb-1">Para carregar ({selectedFiles.length}):</p>
                                        {selectedFiles.map((f, i) => (
                                            <p key={i} className="text-[10px] text-blue-600 flex items-center gap-1 truncate">
                                                <i className="ri-add-circle-line"></i> {f.name}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Preview do valor total */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600">Valor Total do Edital:</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatCurrency((sanitizeNumber(editingEdital.quantidade_nomes)) * (sanitizeNumber(editingEdital.preco_por_nome)))}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={salvando}
                                className="flex-1 px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
                            >
                                {salvando ? (
                                    <div className="flex items-center justify-center">
                                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                                        Salvando...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <i className="ri-check-line mr-2"></i>
                                        Salvar
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Função auxiliar para sanitização (usada no preview também)
    function sanitizeNumber(val: any) {
        if (typeof val === 'number') return val;
        let s = String(val || '0').replace('R$', '').trim();
        if (s.includes(',')) {
            s = s.replace(/\./g, '').replace(',', '.');
        }
        const num = parseFloat(s.replace(/[^\d.-]/g, ''));
        return isNaN(num) ? 0 : num;
    }
}
