import { useState, useEffect } from 'react';
import { usePlans } from '../../../hooks/usePlans';
import type { Plano } from '../../../types/database';

interface PlanoExtended extends Plano {
    rastreamento_mensal_pf_preco?: number | null;
    rastreamento_anual_pf_preco?: number | null;
    rastreamento_mensal_frota_preco?: number | null;
    rastreamento_anual_frota_preco?: number | null;
    rastreamento_placa_protegida_pf_preco?: number | null;
    rastreamento_placa_protegida_frota_preco?: number | null;
    preco_anual?: number | null;
}

const SAVE_PHASES = [
    { icon: 'ri-save-line', label: 'Validando dados...', duration: 1500 },
    { icon: 'ri-database-2-line', label: 'Atualizando banco de dados...', duration: 2000 },
    { icon: 'ri-refresh-line', label: 'Sincronizando sistema...', duration: 2000 },
    { icon: 'ri-check-double-line', label: 'Concluído!', duration: 1500 },
];

function SavingAnimation({ phase }: { phase: number }) {
    const currentPhase = SAVE_PHASES[phase] || SAVE_PHASES[0];
    const progress = ((phase + 1) / SAVE_PHASES.length) * 100;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200]">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center animate-scale-in">
                {/* Icon com animação */}
                <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-green-600 animate-pulse opacity-30"></div>
                    <div className="absolute inset-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-700 flex items-center justify-center">
                        <i className={`${currentPhase.icon} text-4xl text-white ${phase < SAVE_PHASES.length - 1 ? 'animate-spin' : ''}`}></i>
                    </div>
                </div>

                {/* Título */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">Salvando Configurações</h3>
                <p className="text-emerald-600 font-semibold mb-6">{currentPhase.label}</p>

                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Indicadores de fase */}
                <div className="flex justify-between mt-4">
                    {SAVE_PHASES.map((p, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full transition-colors ${
                                i <= phase ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function PlansManagement() {
    const { plans, loading, fetchPlans, createPlan, updatePlan, deletePlan } = usePlans();
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Partial<PlanoExtended> | null>(null);
    const [saving, setSaving] = useState(false);
    const [savePhase, setSavePhase] = useState(0);
    const [confirmDeactivate, setConfirmDeactivate] = useState<{ id: string; nome: string } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ id: string; nome: string } | null>(null);
    const [confirmReactivate, setConfirmReactivate] = useState<{ id: string; nome: string } | null>(null);
    const [deactivating, setDeactivating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [reactivating, setReactivating] = useState(false);
    const [showInactive, setShowInactive] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleReactivate = async () => {
        if (!confirmReactivate) return;
        
        setReactivating(true);
        setSavePhase(0);
        setConfirmReactivate(null);

        try {
            await new Promise(r => setTimeout(r, 1500));
            setSavePhase(1);

            await updatePlan(confirmReactivate.id, { ativo: true } as any);
            await new Promise(r => setTimeout(r, 2000));
            setSavePhase(2);

            await fetchPlans();
            await new Promise(r => setTimeout(r, 2000));
            setSavePhase(3);

            await new Promise(r => setTimeout(r, 1500));
        } catch (error) {
            console.error('Erro ao reativar plano:', error);
        } finally {
            setReactivating(false);
            setSavePhase(0);
        }
    };

    const handleCreate = () => {
        setEditingPlan({
            nome: '',
            slug: '',
            descricao: '',
            preco_mensal: 0,
            preco_anual: 0,
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
            rastreamento_garantido_preco: 0,
            rastreamento_mensal_pf_preco: 0,
            rastreamento_anual_pf_preco: 0,
            rastreamento_mensal_frota_preco: 0,
            rastreamento_anual_frota_preco: 0,
            rastreamento_placa_protegida_pf_preco: 0,
            rastreamento_placa_protegida_frota_preco: 0
        });
        setShowModal(true);
    };

    const handleEdit = (plan: Plano) => {
        setEditingPlan(plan as PlanoExtended);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!editingPlan || !editingPlan.nome || !editingPlan.slug) return;

        setSaving(true);
        setSavePhase(0);
        setShowModal(false);

        try {
            // Fase 1: Validando
            await new Promise(r => setTimeout(r, SAVE_PHASES[0].duration));
            setSavePhase(1);

            // Fase 2: Atualizando banco
            if (editingPlan.id) {
                await updatePlan(editingPlan.id, editingPlan as any);
            } else {
                await createPlan(editingPlan as any);
            }
            await new Promise(r => setTimeout(r, SAVE_PHASES[1].duration));
            setSavePhase(2);

            // Fase 3: Sincronizando
            await fetchPlans();
            await new Promise(r => setTimeout(r, SAVE_PHASES[2].duration));
            setSavePhase(3);

            // Fase 4: Concluído
            await new Promise(r => setTimeout(r, SAVE_PHASES[3].duration));
            
            setEditingPlan(null);
        } catch (error) {
            console.error('Erro ao salvar plano:', error);
        } finally {
            setSaving(false);
            setSavePhase(0);
        }
    };

    const handleDeactivate = async () => {
        if (!confirmDeactivate) return;
        
        setDeactivating(true);
        setSavePhase(0);
        setConfirmDeactivate(null);

        try {
            // Fase 1: Validando
            await new Promise(r => setTimeout(r, 1500));
            setSavePhase(1);

            // Fase 2: Desativando no banco
            await updatePlan(confirmDeactivate.id, { ativo: false } as any);
            await new Promise(r => setTimeout(r, 2000));
            setSavePhase(2);

            // Fase 3: Sincronizando
            await fetchPlans();
            await new Promise(r => setTimeout(r, 2000));
            setSavePhase(3);

            // Fase 4: Concluído
            await new Promise(r => setTimeout(r, 1500));
        } catch (error) {
            console.error('Erro ao desativar plano:', error);
        } finally {
            setDeactivating(false);
            setSavePhase(0);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        
        setDeleting(true);
        setSavePhase(0);
        setConfirmDelete(null);

        try {
            // Fase 1: Validando
            await new Promise(r => setTimeout(r, 1500));
            setSavePhase(1);

            // Fase 2: Excluindo do banco
            await deletePlan(confirmDelete.id);
            await new Promise(r => setTimeout(r, 2000));
            setSavePhase(2);

            // Fase 3: Sincronizando
            await fetchPlans();
            await new Promise(r => setTimeout(r, 2000));
            setSavePhase(3);

            // Fase 4: Concluído
            await new Promise(r => setTimeout(r, 1500));
        } catch (error) {
            console.error('Erro ao excluir plano:', error);
        } finally {
            setDeleting(false);
            setSavePhase(0);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <>
            {/* Animação de salvamento/desativação em tela cheia */}
            {saving && <SavingAnimation phase={savePhase} />}
            {deactivating && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200]">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center animate-scale-in">
                        <div className="relative mx-auto w-24 h-24 mb-6">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-orange-500 animate-pulse opacity-30"></div>
                            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center">
                                <i className={`ri-eye-off-line text-4xl text-white ${savePhase < 3 ? 'animate-pulse' : ''}`}></i>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Desativando Plano</h3>
                        <p className="text-orange-600 font-semibold mb-6">
                            {savePhase === 0 && 'Validando...'}
                            {savePhase === 1 && 'Atualizando banco de dados...'}
                            {savePhase === 2 && 'Sincronizando sistema...'}
                            {savePhase === 3 && 'Concluído!'}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${((savePhase + 1) / 4) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmação de desativação */}
            {confirmDeactivate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <i className="ri-eye-off-line text-3xl text-red-600"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Desativar Plano?</h3>
                            <p className="text-gray-600">
                                Tem certeza que deseja desativar o plano <strong className="text-gray-900">"{confirmDeactivate.nome}"</strong>?
                            </p>
                            <p className="text-sm text-orange-600 mt-2">
                                <i className="ri-information-line mr-1"></i>
                                O plano ficará oculto para novos usuários, mas organizações existentes não serão afetadas.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDeactivate(null)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeactivate}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="ri-eye-off-line"></i>
                                Desativar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animação de exclusão em tela cheia */}
            {deleting && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200]">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center animate-scale-in">
                        <div className="relative mx-auto w-24 h-24 mb-6">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-red-700 animate-pulse opacity-30"></div>
                            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center">
                                <i className={`ri-delete-bin-line text-4xl text-white ${savePhase < 3 ? 'animate-bounce' : ''}`}></i>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Excluindo Plano</h3>
                        <p className="text-red-600 font-semibold mb-6">
                            {savePhase === 0 && 'Verificando dependências...'}
                            {savePhase === 1 && 'Removendo do banco de dados...'}
                            {savePhase === 2 && 'Sincronizando sistema...'}
                            {savePhase === 3 && 'Concluído!'}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-red-500 to-red-700 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${((savePhase + 1) / 4) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmação de exclusão */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <i className="ri-delete-bin-line text-3xl text-red-600"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Excluir Plano Permanentemente?</h3>
                            <p className="text-gray-600">
                                Tem certeza que deseja <strong className="text-red-600">EXCLUIR</strong> o plano <strong className="text-gray-900">"{confirmDelete.nome}"</strong>?
                            </p>
                            <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
                                <p className="text-sm text-red-700 font-medium">
                                    <i className="ri-error-warning-line mr-1"></i>
                                    Esta ação é IRREVERSÍVEL! O plano será removido permanentemente do sistema.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="ri-delete-bin-line"></i>
                                Excluir Definitivamente
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal de confirmação de reativação */}
            {confirmReactivate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-scale-in">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <i className="ri-eye-line text-3xl text-green-600"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Reativar Plano?</h3>
                            <p className="text-gray-600">
                                Deseja reativar o plano <strong className="text-gray-900">"{confirmReactivate.nome}"</strong>?
                            </p>
                            <p className="text-sm text-green-600 mt-2">
                                <i className="ri-information-line mr-1"></i>
                                O plano ficará visível novamente para novos usuários.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmReactivate(null)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReactivate}
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="ri-eye-line"></i>
                                Reativar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animação de reativação */}
            {reactivating && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200]">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center animate-scale-in">
                        <div className="relative mx-auto w-24 h-24 mb-6">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse opacity-30"></div>
                            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                                <i className={`ri-eye-line text-4xl text-white ${savePhase < 3 ? 'animate-pulse' : ''}`}></i>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Reativando Plano</h3>
                        <p className="text-green-600 font-semibold mb-6">
                            {savePhase === 0 && 'Validando...'}
                            {savePhase === 1 && 'Atualizando banco de dados...'}
                            {savePhase === 2 && 'Sincronizando sistema...'}
                            {savePhase === 3 && 'Concluído!'}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${((savePhase + 1) / 4) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestão de Planos</h1>
                    <p className="text-gray-600 mt-1">Configure os preços e limites do sistema</p>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-600">
                            Mostrar inativos
                            {plans.filter(p => !p.ativo).length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-bold">
                                    {plans.filter(p => !p.ativo).length}
                                </span>
                            )}
                        </span>
                    </label>
                    <button
                        onClick={handleCreate}
                        className="flex items-center px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <i className="ri-add-line mr-2"></i>
                        Novo Plano
                    </button>
                </div>
            </div>

            {loading && plans.length === 0 ? (
                <div className="flex justify-center py-10">
                    <i className="ri-loader-4-line text-4xl animate-spin text-[#10B981]"></i>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.filter(p => showInactive ? true : p.ativo).map((plan) => {
                        const p = plan as PlanoExtended;
                        return (
                            <div key={plan.id} className={`bg-white rounded-2xl shadow-lg border overflow-hidden flex flex-col transition-hover hover:shadow-xl duration-300 ${!plan.ativo ? 'border-orange-300 opacity-75' : 'border-gray-100'}`}>
                                {/* Badge de inativo */}
                                {!plan.ativo && (
                                    <div className="bg-orange-500 text-white text-xs font-bold py-1 px-3 text-center">
                                        <i className="ri-eye-off-line mr-1"></i> PLANO INATIVO
                                    </div>
                                )}
                                {/* Header com nome e preço */}
                                <div className={`p-6 text-white ${!plan.ativo ? 'bg-gradient-to-br from-gray-500 to-gray-600' : 'bg-gradient-to-br from-[#1E3A8A] to-blue-600'}`}>
                                    <h3 className="text-2xl font-bold">{plan.nome}</h3>
                                    <div className="mt-2">
                                        <span className="text-4xl font-black">
                                            {formatCurrency(plan.preco_mensal)}
                                        </span>
                                        <span className={`text-sm ${!plan.ativo ? 'text-gray-300' : 'text-blue-200'}`}>/mês</span>
                                    </div>
                                    {(p as any).preco_anual > 0 && (
                                        <div className="mt-1">
                                            <span className={`text-lg font-bold ${!plan.ativo ? 'text-gray-300' : 'text-blue-200'}`}>
                                                {formatCurrency((p as any).preco_anual)}
                                            </span>
                                            <span className={`text-xs ${!plan.ativo ? 'text-gray-400' : 'text-blue-300'}`}>/ano</span>
                                        </div>
                                    )}
                                    <p className={`text-sm mt-2 line-clamp-2 ${!plan.ativo ? 'text-gray-300' : 'text-blue-100'}`}>{plan.descricao}</p>
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
                                                <span className="text-gray-600">Rastreamento PF Mensal</span>
                                                <span className="font-bold text-gray-800">{formatCurrency((p as any).rastreamento_mensal_pf_preco || 0)}</span>
                                            </li>
                                            <li className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Rastreamento PF Anual</span>
                                                <span className="font-bold text-amber-600">{formatCurrency((p as any).rastreamento_anual_pf_preco || 0)}</span>
                                            </li>
                                            <li className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Rastreamento Frota Mensal</span>
                                                <span className="font-bold text-gray-800">{formatCurrency((p as any).rastreamento_mensal_frota_preco || 0)}</span>
                                            </li>
                                            <li className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Rastreamento Frota Anual</span>
                                                <span className="font-bold text-green-600">{formatCurrency((p as any).rastreamento_anual_frota_preco || 0)}</span>
                                            </li>
                                            <li className="flex items-center justify-between text-sm border-t border-gray-100 pt-2 mt-2">
                                                <span className="text-gray-600 flex items-center gap-1">
                                                    <i className="ri-shield-star-line text-purple-500"></i>
                                                    Placa Protegida PF
                                                </span>
                                                <span className="font-bold text-purple-600">{formatCurrency((p as any).rastreamento_placa_protegida_pf_preco || 0)}</span>
                                            </li>
                                            <li className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 flex items-center gap-1">
                                                    <i className="ri-shield-star-line text-purple-500"></i>
                                                    Placa Protegida Frota
                                                </span>
                                                <span className="font-bold text-purple-600">{formatCurrency((p as any).rastreamento_placa_protegida_frota_preco || 0)}</span>
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
                                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                                    <button
                                        onClick={() => handleEdit(plan)}
                                        className="text-gray-600 hover:text-blue-600 font-bold text-sm flex items-center transition-colors"
                                    >
                                        <i className="ri-edit-line mr-1"></i> Configurar
                                    </button>
                                    <div className="flex gap-3">
                                        {plan.ativo ? (
                                            <button
                                                onClick={() => setConfirmDeactivate({ id: plan.id, nome: plan.nome })}
                                                className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center transition-colors"
                                                title="Oculta o plano para clientes, mas mantém no sistema"
                                            >
                                                <i className="ri-eye-off-line mr-1"></i> Desativar
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmReactivate({ id: plan.id, nome: plan.nome })}
                                                className="text-green-500 hover:text-green-600 font-medium text-sm flex items-center transition-colors"
                                                title="Torna o plano visível novamente para clientes"
                                            >
                                                <i className="ri-eye-line mr-1"></i> Reativar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setConfirmDelete({ id: plan.id, nome: plan.nome })}
                                            className="text-red-400 hover:text-red-600 font-medium text-sm flex items-center transition-colors"
                                            title="Remove permanentemente o plano"
                                        >
                                            <i className="ri-delete-bin-line mr-1"></i> Excluir
                                        </button>
                                    </div>
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
                                        <span className="mr-2">02</span> Valores de Assinatura
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                            <label className="block text-xs font-bold text-blue-700 mb-1 uppercase">Valor Mensal (R$)</label>
                                            <input
                                                type="number"
                                                value={editingPlan.preco_mensal}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, preco_mensal: parseFloat(e.target.value) })}
                                                className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                                            />
                                        </div>
                                        <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                            <label className="block text-xs font-bold text-green-700 mb-1 uppercase">Valor Anual (R$)</label>
                                            <input
                                                type="number"
                                                value={(editingPlan as PlanoExtended).preco_anual || 0}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, preco_anual: parseFloat(e.target.value) } as PlanoExtended)}
                                                className="w-full px-4 py-2 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 font-mono text-lg"
                                            />
                                            <p className="text-[10px] text-green-600 mt-1">Recomendado: 10x o mensal (2 meses grátis)</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Limites */}
                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                        <span className="mr-2">03</span> Limites Estruturais
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
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

                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                        <span className="mr-2">04</span> Inteligência Artificial
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

                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                        <span className="mr-2">05</span> Rastreamento e Prospecção
                                    </h3>
                                    <div className="space-y-4">
                                        {/* Rastreamento PF */}
                                        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                            <p className="text-[10px] font-bold text-amber-800 uppercase border-b border-amber-100 pb-1 mb-3">Rastreamento PF (Pessoa Física)</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-600 mb-1">MENSAL (R$/mês)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={(editingPlan as any).rastreamento_mensal_pf_preco || 0}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, rastreamento_mensal_pf_preco: parseFloat(e.target.value) } as any)}
                                                        className="w-full px-4 py-2 bg-white border border-amber-200 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-600 mb-1">ANUAL (R$/ano)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={(editingPlan as any).rastreamento_anual_pf_preco || 0}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, rastreamento_anual_pf_preco: parseFloat(e.target.value) } as any)}
                                                        className="w-full px-4 py-2 bg-white border border-amber-200 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rastreamento Frota */}
                                        <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                            <p className="text-[10px] font-bold text-green-800 uppercase border-b border-green-100 pb-1 mb-3">Rastreamento Frota (Pessoa Jurídica)</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-600 mb-1">MENSAL (R$/placa/mês)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={(editingPlan as any).rastreamento_mensal_frota_preco || 0}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, rastreamento_mensal_frota_preco: parseFloat(e.target.value) } as any)}
                                                        className="w-full px-4 py-2 bg-white border border-green-200 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-600 mb-1">ANUAL (R$/placa/ano)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={(editingPlan as any).rastreamento_anual_frota_preco || 0}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, rastreamento_anual_frota_preco: parseFloat(e.target.value) } as any)}
                                                        className="w-full px-4 py-2 bg-white border border-green-200 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Placa Protegida - PREMIUM */}
                                        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 relative overflow-hidden">
                                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-600 text-white text-[8px] font-bold rounded-full uppercase">
                                                Premium
                                            </div>
                                            <p className="text-[10px] font-bold text-purple-800 uppercase border-b border-purple-100 pb-1 mb-3 flex items-center gap-2">
                                                <i className="ri-shield-star-line"></i>
                                                Placa Protegida (Recursos IA Ilimitados)
                                            </p>
                                            <p className="text-[9px] text-purple-600 mb-3">
                                                Rastreamento anual + todos os recursos IA inclusos. O cliente pode gerar quantos recursos quiser sem pagar adicional.
                                            </p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-600 mb-1">PF (R$/ano)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={(editingPlan as any).rastreamento_placa_protegida_pf_preco || 0}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, rastreamento_placa_protegida_pf_preco: parseFloat(e.target.value) } as any)}
                                                        className="w-full px-4 py-2 bg-white border border-purple-200 rounded-xl"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-600 mb-1">FROTA (R$/placa/ano)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={(editingPlan as any).rastreamento_placa_protegida_frota_preco || 0}
                                                        onChange={(e) => setEditingPlan({ ...editingPlan, rastreamento_placa_protegida_frota_preco: parseFloat(e.target.value) } as any)}
                                                        className="w-full px-4 py-2 bg-white border border-purple-200 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Outros */}
                                        <div className="grid grid-cols-2 gap-4">
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
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mt-4">
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
                                </section>

                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                                        <span className="mr-2">06</span> Outros Serviços e Status
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
                                disabled={saving}
                                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition-colors disabled:opacity-50"
                            >
                                Descartar Alterações
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-8 py-2.5 bg-[#10B981] text-white rounded-xl hover:bg-green-600 font-bold shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <i className="ri-loader-4-line animate-spin"></i>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-save-line"></i>
                                        Salvar Configurações
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}
