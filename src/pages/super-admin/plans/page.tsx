import { useState, useEffect } from 'react';
import { usePlans } from '../../../hooks/usePlans';
import type { Plano } from '../../../types/database';

interface PlanoExtended extends Plano {
    // All fields are now in the base Plano type
}

export default function PlansManagement() {
    const { plans, loading, fetchPlans, createPlan, updatePlan, deletePlan } = usePlans();
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Partial<PlanoExtended> | null>(null);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleCreate = () => {
        setEditingPlan({
            nome: '',
            slug: '',
            descricao: '',
            preco_mensal: 0,
            limite_usuarios: 5,
            limite_clientes: 100,
            ativo: true,
            recursos: [],
            preco_recurso_ia: 150,
            preco_rastreamento: 50,
            preco_edital: 1.50,
            recursos_ia_inclusos: 0,
            acesso_crm: false,
            acesso_disparador: false,
            modulo_educacional: 'Nenhum',
            recursos_ia_suspensao_inclusos: 0,
            recursos_ia_suspensao_preco_adicional: 300,
            marketing_digital: '',
            suporte: 'Padrão',
            acesso_institucional: false,
            rastreamento_pf_preco: 0,
            rastreamento_frota_preco: 0,
            rastreamento_garantido_preco: 0
        });
        setShowModal(true);
    };

    const handleEdit = (plan: Plano) => {
        setEditingPlan(plan as PlanoExtended);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!editingPlan || !editingPlan.nome || !editingPlan.slug) return;

        if (editingPlan.id) {
            await updatePlan(editingPlan.id, editingPlan as any);
        } else {
            await createPlan(editingPlan as any);
        }
        setShowModal(false);
        setEditingPlan(null);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestão de Planos</h1>
                    <p className="text-gray-600 mt-1">Configure os preços e limites do sistema</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    <i className="ri-add-line mr-2"></i>
                    Novo Plano
                </button>
            </div>

            {loading && plans.length === 0 ? (
                <div className="flex justify-center py-10">
                    <i className="ri-loader-4-line text-4xl animate-spin text-[#10B981]"></i>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.filter(p => p.ativo).map((plan) => {
                        const p = plan as PlanoExtended;
                        return (
                            <div key={plan.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col transition-hover hover:shadow-xl duration-300">
                                {/* Header com nome e preço */}
                                <div className="bg-gradient-to-br from-[#1E3A8A] to-blue-600 p-6 text-white">
                                    <h3 className="text-2xl font-bold">{plan.nome}</h3>
                                    <div className="mt-2">
                                        <span className="text-4xl font-black">
                                            {formatCurrency(plan.preco_mensal)}
                                        </span>
                                        <span className="text-blue-200 text-sm">/mês</span>
                                    </div>
                                    <p className="text-blue-100 text-sm mt-2 line-clamp-2">{plan.descricao}</p>
                                </div>

                                {/* Conteúdo */}
                                <div className="p-6 flex-1 space-y-6">
                                    {/* Limites */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Limites Estruturais</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                                                <i className="ri-user-line mr-2 text-[#10B981]"></i>
                                                {plan.limite_usuarios} usuários
                                            </div>
                                            <div className="flex items-center text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                                                <i className="ri-team-line mr-2 text-[#10B981]"></i>
                                                {plan.limite_clientes === null ? 'Ilimitado' : `${plan.limite_clientes} clientes`}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preços por Serviço */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preços e IA</h4>
                                        <ul className="space-y-2">
                                            <li className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">IA Infrações</span>
                                                <span className="font-bold text-gray-800">
                                                    {p.recursos_ia_inclusos && p.recursos_ia_inclusos > 0
                                                        ? `${p.recursos_ia_inclusos} grátis + ${formatCurrency(p.preco_recurso_ia || 0)}`
                                                        : formatCurrency(p.preco_recurso_ia || 0)
                                                    }
                                                </span>
                                            </li>
                                            <li className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">IA Suspensão</span>
                                                <span className="font-bold text-gray-800">
                                                    {p.recursos_ia_suspensao_inclusos && p.recursos_ia_suspensao_inclusos > 0
                                                        ? `${p.recursos_ia_suspensao_inclusos} grátis + ${formatCurrency(p.recursos_ia_suspensao_preco_adicional || 0)}`
                                                        : formatCurrency(p.recursos_ia_suspensao_preco_adicional || 0)
                                                    }
                                                </span>
                                            </li>
                                            <li className="flex items-center justify-between text-sm border-t border-gray-50 pt-2 mt-2">
                                                <span className="text-gray-600">Rastreamento PF</span>
                                                <span className="font-bold text-gray-800">{formatCurrency(p.rastreamento_pf_preco || 0)}</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Extras */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status de Recursos</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {p.acesso_crm && <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-md border border-green-100 uppercase">CRM + IA</span>}
                                            {p.acesso_disparador && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-100 uppercase">Disparador</span>}
                                            {p.acesso_institucional && <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md border border-purple-100 uppercase">Institucional</span>}
                                            <span className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded-md border border-orange-100 uppercase">{p.suporte}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer com ações */}
                                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between">
                                    <button
                                        onClick={() => handleEdit(plan)}
                                        className="text-gray-600 hover:text-blue-600 font-bold text-sm flex items-center transition-colors"
                                    >
                                        <i className="ri-edit-line mr-1"></i> Configurar Plano
                                    </button>
                                    <button
                                        onClick={() => deletePlan(plan.id)}
                                        className="text-gray-400 hover:text-red-500 font-medium text-sm flex items-center transition-colors"
                                    >
                                        <i className="ri-delete-bin-line mr-1"></i> Desativar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de Edição */}
            {showModal && editingPlan && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingPlan.id ? `Configurando: ${editingPlan.nome}` : 'Novo Plano'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-8">
                                {/* Informações Básicas */}
                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                        <span className="mr-2">01</span> Informações Básicas
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Nome Exibido</label>
                                            <input
                                                type="text"
                                                value={editingPlan.nome}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, nome: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                                placeholder="Ex: Intermediário"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Slug (Identificador)</label>
                                            <input
                                                type="text"
                                                value={editingPlan.slug}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                                placeholder="intermediario"
                                                disabled={!!editingPlan.id}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Breve Descrição</label>
                                        <textarea
                                            value={editingPlan.descricao || ''}
                                            onChange={(e) => setEditingPlan({ ...editingPlan, descricao: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                            rows={2}
                                            placeholder="Descreva o propósito deste plano..."
                                        />
                                    </div>
                                </section>

                                {/* Preço e Limites */}
                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                        <span className="mr-2">02</span> Mensalidade e Limites
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Valor Mensal (R$)</label>
                                            <input
                                                type="number"
                                                value={editingPlan.preco_mensal}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, preco_mensal: parseFloat(e.target.value) })}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Usuários Inclusos</label>
                                            <input
                                                type="number"
                                                value={editingPlan.limite_usuarios}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, limite_usuarios: parseInt(e.target.value) })}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Limite Clientes</label>
                                            <input
                                                type="number"
                                                value={editingPlan.limite_clientes || ''}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, limite_clientes: e.target.value ? parseInt(e.target.value) : null })}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                                                placeholder="Ilimitado"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Inteligência Artificial */}
                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                        <span className="mr-2">03</span> Inteligência Artificial
                                    </h3>
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 grid grid-cols-2 gap-x-8 gap-y-4">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-bold text-blue-800 uppercase border-b border-blue-100 pb-1">Recursos IA - Infrações</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[8px] font-bold text-gray-500 mb-1 uppercase">Qtd Inclusa</label>
                                                    <input
                                                        type="number"
                                                        value={editingPlan.recursos_ia_inclusos || 0}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, recursos_ia_inclusos: parseInt(e.target.value) })}
                                                        className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-bold text-gray-500 mb-1 uppercase">Preço Extra (R$)</label>
                                                    <input
                                                        type="number"
                                                        value={editingPlan.preco_recurso_ia || 0}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, preco_recurso_ia: parseFloat(e.target.value) })}
                                                        className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-bold text-blue-800 uppercase border-b border-blue-100 pb-1">IA - Suspensão/Cassação</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[8px] font-bold text-gray-500 mb-1 uppercase">Qtd Inclusa</label>
                                                    <input
                                                        type="number"
                                                        value={editingPlan.recursos_ia_suspensao_inclusos || 0}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, recursos_ia_suspensao_inclusos: parseInt(e.target.value) })}
                                                        className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[8px] font-bold text-gray-500 mb-1 uppercase">Preço Extra (R$)</label>
                                                    <input
                                                        type="number"
                                                        value={editingPlan.recursos_ia_suspensao_preco_adicional || 0}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, recursos_ia_suspensao_preco_adicional: parseFloat(e.target.value) })}
                                                        className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Rastreamento e Editais */}
                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                        <span className="mr-2">04</span> Rastreamento e Prospecção
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">RASTREAMENTO PF (R$/mês)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editingPlan.rastreamento_pf_preco || 0}
                                                    onChange={(e) => setEditingPlan({ ...editingPlan, rastreamento_pf_preco: parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">RASTREAMENTO FROTA (R$/placa)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editingPlan.rastreamento_frota_preco || 0}
                                                    onChange={(e) => setEditingPlan({ ...editingPlan, rastreamento_frota_preco: parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">RECURSO GARANTIDO (R$/mês)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editingPlan.rastreamento_garantido_preco || 0}
                                                    onChange={(e) => setEditingPlan({ ...editingPlan, rastreamento_garantido_preco: parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1">EDITAL / CONTATO (R$/unid)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editingPlan.preco_edital || 0}
                                                    onChange={(e) => setEditingPlan({ ...editingPlan, preco_edital: parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Módulo Educacional</label>
                                                <select
                                                    value={editingPlan.modulo_educacional || 'Nenhum'}
                                                    onChange={(e) => setEditingPlan({ ...editingPlan, modulo_educacional: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Nenhum">Nenhum</option>
                                                    <option value="Parcial">Parcial</option>
                                                    <option value="Completo">Completo</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Suporte Técnico</label>
                                                <select
                                                    value={editingPlan.suporte || 'Padrão'}
                                                    onChange={(e) => setEditingPlan({ ...editingPlan, suporte: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Padrão">Padrão</option>
                                                    <option value="Prioritário">Prioritário</option>
                                                    <option value="VIP">VIP</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Outros Serviços */}
                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                        <span className="mr-2">05</span> Outros Serviços e Status
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Marketing Digital (Texto p/ tabela)</label>
                                            <input
                                                type="text"
                                                value={editingPlan.marketing_digital || ''}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, marketing_digital: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                                                placeholder="Ex: Posts inclusos + R$ 699"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-x-8 gap-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            <label className="flex items-center cursor-pointer group">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingPlan.acesso_crm || false}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, acesso_crm: e.target.checked })}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-10 h-5 rounded-full transition-colors ${editingPlan.acesso_crm ? 'bg-[#10B981]' : 'bg-gray-300'}`}></div>
                                                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${editingPlan.acesso_crm ? 'translate-x-5' : ''}`}></div>
                                                </div>
                                                <span className="ml-3 text-xs font-bold text-gray-700 uppercase">CRM + IA Incluso</span>
                                            </label>

                                            <label className="flex items-center cursor-pointer group">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingPlan.acesso_disparador || false}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, acesso_disparador: e.target.checked })}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-10 h-5 rounded-full transition-colors ${editingPlan.acesso_disparador ? 'bg-[#10B981]' : 'bg-gray-300'}`}></div>
                                                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${editingPlan.acesso_disparador ? 'translate-x-5' : ''}`}></div>
                                                </div>
                                                <span className="ml-3 text-xs font-bold text-gray-700 uppercase">Disparador Incluso</span>
                                            </label>

                                            <label className="flex items-center cursor-pointer group">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingPlan.acesso_institucional || false}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, acesso_institucional: e.target.checked })}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-10 h-5 rounded-full transition-colors ${editingPlan.acesso_institucional ? 'bg-[#10B981]' : 'bg-gray-300'}`}></div>
                                                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${editingPlan.acesso_institucional ? 'translate-x-5' : ''}`}></div>
                                                </div>
                                                <span className="ml-3 text-xs font-bold text-gray-700 uppercase">Uso de Marca</span>
                                            </label>

                                            <div className="w-full border-t border-gray-200 mt-2 pt-4">
                                                <label className="flex items-center cursor-pointer group">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={editingPlan.ativo}
                                                            onChange={(e) => setEditingPlan({ ...editingPlan, ativo: e.target.checked })}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-12 h-6 rounded-full transition-colors ${editingPlan.ativo ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${editingPlan.ativo ? 'translate-x-6' : ''}`}></div>
                                                    </div>
                                                    <span className="ml-3 text-sm font-black text-gray-900 uppercase">PLANO ATIVO</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition-colors"
                            >
                                Descartar Alterações
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-8 py-2.5 bg-[#10B981] text-white rounded-xl hover:bg-green-600 font-bold shadow-lg shadow-green-100 transition-all active:scale-95"
                            >
                                <i className="ri-save-line mr-2"></i>
                                Salvar Configurações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
