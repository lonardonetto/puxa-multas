import { useState, useEffect } from 'react';
import { useBilling } from '../../../../hooks/useBilling';
import { useOrganizations } from '../../../../hooks/useOrganizations';
import type { Organization } from '../../../../types/database';

interface DetailsModalProps {
    organization: Organization;
    onClose: () => void;
    onUpdate?: () => void;
}

export default function OrganizationDetailsModal({ organization, onClose, onUpdate }: DetailsModalProps) {
    const { billing, loading: billingLoading, fetchBilling, createInvoice } = useBilling();
    const { getOrganization } = useOrganizations();
    const [activeTab, setActiveTab] = useState<'geral' | 'financeiro'>('geral');
    const [localOrg, setLocalOrg] = useState<Organization>(organization);

    // Estados para o formulário de crédito
    const [showAddCredit, setShowAddCredit] = useState(false);
    const [creditValue, setCreditValue] = useState('');
    const [creditDesc, setCreditDesc] = useState('Carga manual de créditos');
    const [isBonus, setIsBonus] = useState(false);
    const [expiryDate, setExpiryDate] = useState('');

    // Estado para Notificação (Toast)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchBilling(localOrg.id);
    }, [localOrg.id, fetchBilling]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-green-600 bg-green-50';
            case 'pending': return 'text-amber-600 bg-amber-50';
            case 'overdue': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Pago';
            case 'pending': return 'Pendente';
            case 'overdue': return 'Vencido';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const handleAddCredit = async () => {
        const value = parseFloat(creditValue);
        if (isNaN(value) || value <= 0) {
            showToast('Por favor, informe um valor válido.', 'error');
            return;
        }

        const result = await createInvoice({
            organization_id: localOrg.id,
            tipo: 'adjustment',
            valor: value,
            status: 'paid',
            descricao: creditDesc,
            is_bonus: true,
            data_expiracao: expiryDate ? new Date(expiryDate).toISOString() : null,
            data_pagamento: new Date().toISOString(),
            metodo_pagamento: 'balance'
        });

        if (result) {
            setCreditValue('');
            setExpiryDate('');
            setShowAddCredit(false);

            // Recarrega histórico e dados da organização
            await fetchBilling(localOrg.id);
            const updatedOrg = await getOrganization(localOrg.id);
            if (updatedOrg) setLocalOrg(updatedOrg);

            // Notifica o sistema pai para atualizar a tabela no fundo
            if (onUpdate) onUpdate();

            showToast('Créditos adicionados com sucesso!');
        } else {
            showToast('Erro ao adicionar créditos.', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{localOrg.nome}</h2>
                        <p className="text-sm text-gray-500">ID: {localOrg.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <i className="ri-close-line text-2xl text-gray-400"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('geral')}
                        className={`py-4 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'geral' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('financeiro')}
                        className={`py-4 px-6 text-sm font-bold border-b-2 transition-all ${activeTab === 'financeiro' ? 'border-[#10B981] text-[#10B981]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Financeiro & Faturas
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'geral' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 transition-all hover:shadow-md">
                                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Saldo Bônus</p>
                                    <h3 className="text-3xl font-black text-purple-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(localOrg.saldo_bonus || 0)}
                                    </h3>
                                    <p className="text-[10px] text-purple-700 mt-2 flex items-center gap-1">
                                        <i className="ri-gift-line"></i> Créditos para uso no sistema
                                    </p>
                                </div>

                                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Status da Conta</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${localOrg.ativo ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                                        <h3 className="text-2xl font-bold text-green-900">{localOrg.ativo ? 'Ativa' : 'Desativada'}</h3>
                                    </div>
                                    <p className="text-xs text-green-700 mt-2">Vencimento: {localOrg.data_expiracao ? new Date(localOrg.data_expiracao).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                </div>

                                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Plano Atual</p>
                                    <h3 className="text-2xl font-bold text-orange-900 capitalize">{localOrg.plano}</h3>
                                    <p className="text-xs text-orange-700 mt-2">{localOrg.limite_usuarios} usuários / {localOrg.limite_clientes} clientes</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Histórico de Lançamentos</h3>
                                <button
                                    onClick={() => setShowAddCredit(!showAddCredit)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
                                >
                                    <i className={`ri-${showAddCredit ? 'close' : 'add'}-line mr-1`}></i>
                                    {showAddCredit ? 'Cancelar' : 'Adicionar Crédito'}
                                </button>
                            </div>

                            {showAddCredit && (
                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6 animate-in fade-in slide-in-from-top-4">
                                    <h4 className="text-sm font-bold text-blue-800 mb-4">Nova Carga de Crédito</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">Valor (R$)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-bold">R$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={creditValue}
                                                    onChange={(e) => setCreditValue(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none font-black text-purple-900 text-lg transition-all"
                                                    placeholder="0,00"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">Validade (Opcional)</label>
                                            <input
                                                type="date"
                                                value={expiryDate}
                                                onChange={(e) => setExpiryDate(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none text-gray-700 transition-all font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">Descrição / Motivo</label>
                                            <input
                                                type="text"
                                                value={creditDesc}
                                                onChange={(e) => setCreditDesc(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-0 outline-none text-gray-700 transition-all"
                                                placeholder="Ex: Bonificação / Compensação"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <button
                                            onClick={handleAddCredit}
                                            disabled={billingLoading}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-blue-200"
                                        >
                                            {billingLoading ? <i className="ri-loader-4-line animate-spin"></i> : 'Confirmar Lançamento'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {billingLoading ? (
                                <div className="flex justify-center py-10">
                                    <i className="ri-loader-4-line text-3xl animate-spin text-[#10B981]"></i>
                                </div>
                            ) : billing.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <i className="ri-file-list-3-line text-4xl text-gray-300 mb-2"></i>
                                    <p className="text-gray-500">Nenhuma fatura ou transação encontrada.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead>
                                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <th className="pb-3 px-4">Data</th>
                                                <th className="pb-3 px-4">Descrição</th>
                                                <th className="pb-3 px-4">Valor</th>
                                                <th className="pb-3 px-4">Status</th>
                                                <th className="pb-3 px-4">Vencimento</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {billing.map((item) => (
                                                <tr key={item.id} className="text-sm">
                                                    <td className="py-4 px-4 text-gray-500">
                                                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="py-4 px-4 font-medium text-gray-800">
                                                        {item.descricao}
                                                    </td>
                                                    <td className="py-4 px-4 font-bold text-gray-900">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(item.status)}`}>
                                                            {getStatusLabel(item.status)}
                                                        </span>
                                                        {item.is_bonus && (
                                                            <span className="ml-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-100 text-purple-600 uppercase">
                                                                Bônus
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4 text-gray-500 text-xs">
                                                        {item.data_expiracao
                                                            ? <span className="text-[#7C3AED] font-bold">Expira: {new Date(item.data_expiracao).toLocaleDateString('pt-BR')}</span>
                                                            : item.data_vencimento ? new Date(item.data_vencimento).toLocaleDateString('pt-BR') : '-'
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                    >
                        Fechar
                    </button>
                </div>

                {/* Toasts / Notifications */}
                {toast && (
                    <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-300 z-[100] ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                        <i className={`ri-${toast.type === 'success' ? 'checkbox-circle' : 'error-warning'}-line text-xl`}></i>
                        <span className="font-bold">{toast.message}</span>
                    </div>
                )}
            </div>
        </div >
    );
}
