import { useState } from 'react';
import { useServicosConfig, VARIAVEIS_CONTRATO, TEMPLATES_CONTRATO } from '../../hooks/useServicosConfig';
import type { Servico } from '../../types/database';
import { useOrganization } from '../../contexts/OrganizationContext';
import RichTextEditor from '../../components/contracts/RichTextEditor';

export default function ServicosPage() {
    const { currentOrganization } = useOrganization();
    const {
        servicos,
        loading,
        createServico,
        updateServico,
        toggleAtivo,
        deleteServico,
        substituirVariaveis
    } = useServicosConfig();

    // Estados
    const [showModal, setShowModal] = useState(false);
    const [editingServico, setEditingServico] = useState<Servico | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'dados' | 'contrato' | 'preview'>('dados');

    // Form state
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco_base: 0,
        contrato_modelo: '',
        ativo: true,
        ordem: 0,
    });

    // Reset form
    const resetForm = () => {
        setFormData({
            nome: '',
            descricao: '',
            preco_base: 0,
            contrato_modelo: '',
            ativo: true,
            ordem: servicos.length,
        });
        setEditingServico(null);
        setActiveTab('dados');
    };

    // Abrir modal para novo serviço
    const handleNovoServico = () => {
        resetForm();
        setShowModal(true);
    };

    // Abrir modal para editar
    const handleEditServico = (servico: Servico) => {
        setEditingServico(servico);
        setFormData({
            nome: servico.nome,
            descricao: servico.descricao || '',
            preco_base: servico.preco_base,
            contrato_modelo: servico.contrato_modelo || '',
            ativo: servico.ativo,
            ordem: servico.ordem,
        });
        setShowModal(true);
    };

    // Fechar modal
    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    // Salvar serviço
    const handleSave = async () => {
        if (!formData.nome.trim()) {
            setMessage({ type: 'error', text: 'Nome do serviço é obrigatório.' });
            setActiveTab('dados');
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            if (editingServico) {
                await updateServico(editingServico.id, formData);
                setMessage({ type: 'success', text: 'Serviço atualizado com sucesso!' });
            } else {
                await createServico(formData);
                setMessage({ type: 'success', text: 'Serviço criado com sucesso!' });
            }
            handleCloseModal();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erro ao salvar serviço.' });
        } finally {
            setSaving(false);
        }
    };

    // Excluir serviço
    const handleDelete = async (id: string) => {
        try {
            await deleteServico(id);
            setMessage({ type: 'success', text: 'Serviço excluído.' });
            setShowDeleteConfirm(null);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erro ao excluir.' });
        }
    };

    // Inserir variável no cursor
    const inserirVariavel = (variavel: string) => {
        setFormData(prev => ({
            ...prev,
            contrato_modelo: prev.contrato_modelo + variavel
        }));
    };

    // Preview do contrato com dados de exemplo
    const getPreview = () => {
        if (!formData.contrato_modelo) return '<div style="text-align: center; color: #999; padding: 60px 20px;"><p style="font-size: 48px; margin-bottom: 16px;">📄</p><p>Nenhum contrato configurado</p><p style="font-size: 13px; margin-top: 8px;">Vá para a aba "Contrato" para criar o modelo</p></div>';

        const clienteExemplo = {
            nome: 'JOÃO DA SILVA',
            cpf: '123.456.789-00',
            rg: '12.345.678-9',
            endereco_completo: 'Rua Exemplo, 123 - Centro - Campo Grande/MS',
            telefone: '(67) 99999-9999',
            email: 'joao@email.com',
        };

        const orgExemplo = {
            nome: currentOrganization?.nome || 'EMPRESA EXEMPLO',
            cnpj: currentOrganization?.cnpj || '12.345.678/0001-90',
            nome_contrato: currentOrganization?.nome_contrato || currentOrganization?.nome || 'EMPRESA',
            cnpj_contrato: currentOrganization?.cnpj_contrato || currentOrganization?.cnpj || '12.345.678/0001-90',
            endereco_contrato: currentOrganization?.endereco_contrato || 'Rua Principal, 456',
            endereco_completo: currentOrganization?.endereco_completo || 'Rua Principal, 456',
        };

        return substituirVariaveis(
            formData.contrato_modelo,
            clienteExemplo,
            orgExemplo,
            { auto_infracao: 'NQ00123456', placa: 'ABC-1234', valor: formData.preco_base, nome_servico: formData.nome || 'Serviço' }
        );
    };

    // Tabs do modal
    const tabs = [
        { id: 'dados' as const, label: 'Dados do Serviço', icon: 'ri-settings-3-line' },
        { id: 'contrato' as const, label: 'Modelo do Contrato', icon: 'ri-file-text-line' },
        { id: 'preview' as const, label: 'Prévia', icon: 'ri-eye-line' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Serviços e Contratos</h1>
                        <p className="text-gray-500 mt-1">Gerencie seus serviços e modelos de contrato</p>
                    </div>
                    <button
                        onClick={handleNovoServico}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                    >
                        <i className="ri-add-line text-xl"></i>
                        Novo Serviço
                    </button>
                </div>

                {/* Mensagem */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        <i className={message.type === 'success' ? 'ri-check-line text-xl' : 'ri-error-warning-line text-xl'}></i>
                        {message.text}
                        <button onClick={() => setMessage(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                            <i className="ri-close-line"></i>
                        </button>
                    </div>
                )}

                {/* Lista de Serviços */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <i className="ri-loader-4-line animate-spin text-4xl text-gray-400"></i>
                            <p className="text-gray-500 mt-2">Carregando serviços...</p>
                        </div>
                    ) : servicos.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="ri-folder-add-line text-4xl text-blue-400"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-600">Nenhum serviço cadastrado</h3>
                            <p className="text-gray-400 mt-2 mb-6">Crie seu primeiro serviço com contrato modelo</p>
                            <button
                                onClick={handleNovoServico}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all inline-flex items-center gap-2"
                            >
                                <i className="ri-add-line"></i>
                                Criar Primeiro Serviço
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {servicos.map((servico) => (
                                <div
                                    key={servico.id}
                                    className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-lg cursor-pointer ${servico.ativo ? 'border-gray-100' : 'border-orange-200 bg-orange-50'
                                        }`}
                                    onClick={() => handleEditServico(servico)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-lg font-bold text-gray-800">{servico.nome}</h3>
                                                {!servico.ativo && (
                                                    <span className="px-2.5 py-0.5 bg-orange-200 text-orange-700 text-xs rounded-full font-medium">
                                                        Inativo
                                                    </span>
                                                )}
                                                {servico.contrato_modelo && (
                                                    <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                                                        <i className="ri-file-text-line"></i>
                                                        Contrato
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-sm mt-1">{servico.descricao || 'Sem descrição'}</p>
                                            <p className="text-2xl font-bold text-blue-600 mt-3">
                                                R$ {servico.preco_base.toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => toggleAtivo(servico.id)}
                                                className={`p-2.5 rounded-xl transition-colors ${servico.ativo ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                title={servico.ativo ? 'Desativar' : 'Ativar'}
                                            >
                                                <i className={servico.ativo ? 'ri-pause-circle-line text-xl' : 'ri-play-circle-line text-xl'}></i>
                                            </button>
                                            <button
                                                onClick={() => handleEditServico(servico)}
                                                className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                title="Editar"
                                            >
                                                <i className="ri-edit-line text-xl"></i>
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(servico.id)}
                                                className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                title="Excluir"
                                            >
                                                <i className="ri-delete-bin-line text-xl"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal de Edição - Tela Cheia */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-900/80 z-[100] flex items-center justify-center p-2">
                        <div className="bg-white rounded-2xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl overflow-hidden">
                            {/* Header do Modal */}
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-0.5">Configure os dados e o contrato modelo</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <i className="ri-close-line text-2xl"></i>
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-100 bg-gray-50 px-5">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 py-4 font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.id
                                            ? 'text-blue-600 border-blue-600 bg-white'
                                            : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <i className={`${tab.icon} text-lg`}></i>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Conteúdo das Tabs */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Tab Dados */}
                                {activeTab === 'dados' && (
                                    <div className="max-w-2xl mx-auto space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Serviço *</label>
                                            <input
                                                type="text"
                                                value={formData.nome}
                                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                                placeholder="Ex: Recurso de Multa - Defesa Prévia"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                                            <textarea
                                                value={formData.descricao}
                                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500"
                                                rows={3}
                                                placeholder="Descrição breve do serviço..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Valor (R$)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.preco_base}
                                                    onChange={(e) => setFormData({ ...formData, preco_base: parseFloat(e.target.value) || 0 })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ordem de Exibição</label>
                                                <input
                                                    type="number"
                                                    value={formData.ordem}
                                                    onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                            <input
                                                type="checkbox"
                                                id="ativo"
                                                checked={formData.ativo}
                                                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="ativo" className="text-gray-700 font-medium">
                                                Serviço ativo (disponível para contratação)
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Tab Contrato */}
                                {activeTab === 'contrato' && (
                                    <div className="space-y-5">
                                        {/* Templates Pré-definidos */}
                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                                <i className="ri-file-copy-line"></i>
                                                Templates Pré-definidos
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                                {TEMPLATES_CONTRATO.map((template) => (
                                                    <button
                                                        key={template.id}
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            contrato_modelo: template.contrato,
                                                            nome: prev.nome || template.nome,
                                                            descricao: prev.descricao || template.descricao
                                                        }))}
                                                        className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all"
                                                    >
                                                        <p className="font-medium text-gray-800 text-sm truncate">{template.nome}</p>
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">{template.descricao}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Variáveis Dinâmicas */}
                                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                            <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                                                <i className="ri-braces-line"></i>
                                                Variáveis Dinâmicas (clique para inserir)
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {VARIAVEIS_CONTRATO.map((v) => (
                                                    <button
                                                        key={v.key}
                                                        onClick={() => inserirVariavel(v.key)}
                                                        className="px-3 py-1.5 bg-white text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-colors border border-purple-200 font-medium"
                                                        title={v.descricao}
                                                    >
                                                        {v.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Editor */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Texto do Contrato
                                            </label>
                                            <RichTextEditor
                                                value={formData.contrato_modelo}
                                                onChange={(value) => setFormData({ ...formData, contrato_modelo: value })}
                                                placeholder="Digite o texto do contrato ou selecione um template acima..."
                                                minHeight="500px"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Tab Preview */}
                                {activeTab === 'preview' && (
                                    <div>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
                                            <p className="text-yellow-800 text-sm flex items-center gap-2">
                                                <i className="ri-information-line text-lg"></i>
                                                Esta é uma prévia com dados fictícios. Os dados reais do cliente serão inseridos automaticamente na hora da contratação.
                                            </p>
                                        </div>

                                        <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-inner">
                                            <div
                                                className="prose prose-sm max-w-none"
                                                style={{ fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: '1.7' }}
                                                dangerouslySetInnerHTML={{ __html: getPreview() }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer do Modal */}
                            <div className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    {activeTab === 'dados' && <span>Passo 1 de 3</span>}
                                    {activeTab === 'contrato' && <span>Passo 2 de 3</span>}
                                    {activeTab === 'preview' && <span>Passo 3 de 3</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                    {activeTab !== 'dados' && (
                                        <button
                                            onClick={() => setActiveTab(activeTab === 'preview' ? 'contrato' : 'dados')}
                                            className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium flex items-center gap-2"
                                        >
                                            <i className="ri-arrow-left-line"></i>
                                            Voltar
                                        </button>
                                    )}
                                    {activeTab !== 'preview' ? (
                                        <button
                                            onClick={() => setActiveTab(activeTab === 'dados' ? 'contrato' : 'preview')}
                                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                                        >
                                            Próximo
                                            <i className="ri-arrow-right-line"></i>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-green-200"
                                        >
                                            {saving && <i className="ri-loader-4-line animate-spin"></i>}
                                            <i className="ri-save-line"></i>
                                            Salvar Serviço
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Confirmação de Exclusão */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className="ri-delete-bin-line text-3xl text-red-500"></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Excluir Serviço?</h3>
                                <p className="text-gray-500 mt-2">Esta ação não pode ser desfeita. O contrato modelo também será excluído.</p>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
