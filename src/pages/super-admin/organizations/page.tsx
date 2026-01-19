import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useOrganizations } from '../../../hooks/useOrganizations';
import type { Organization } from '../../../types/database';
import { usePlans } from '../../../hooks/usePlans';
import OrganizationDetailsModal from './components/DetailsModal';

export default function Organizations() {
    const { organizations, loading, error: apiError, fetchOrganizations, createOrganization, updateOrganization, deleteOrganization } = useOrganizations();
    const [editingOrg, setEditingOrg] = useState<Partial<Organization> | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrgForDetails, setSelectedOrgForDetails] = useState<Organization | null>(null);

    // Estados para o primeiro administrador
    const [adminNome, setAdminNome] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    const { plans, fetchPlans: fetchDynamicPlans } = usePlans();

    useEffect(() => {
        fetchDynamicPlans();
    }, [fetchDynamicPlans]);

    useEffect(() => {
        fetchOrganizations();
    }, [fetchOrganizations]);

    const handleCreate = () => {
        setEditingOrg({
            nome: '',
            cnpj: '',
            cpf: '',
            email: '',
            telefone: '',
            plano: (plans[0]?.slug as any) || 'free',
            ativo: true,
            limite_usuarios: plans[0]?.limite_usuarios || 5,
            limite_clientes: plans[0]?.limite_clientes || 10,
        });
        setIsCreating(true);
        setAdminNome('');
        setAdminEmail('');
        setAdminPassword('');
        setShowModal(true);
    };

    const handleEdit = (org: Organization) => {
        setEditingOrg(org);
        setIsCreating(false);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!editingOrg || !editingOrg.nome) return;

        const doc = (editingOrg.cnpj || editingOrg.cpf || '').replace(/\D/g, '');
        const isCpf = doc.length <= 11;

        const finalData = {
            ...editingOrg,
            cnpj: isCpf ? null : doc,
            cpf: isCpf ? doc : null,
        };

        if (isCreating) {
            const result = await createOrganization({
                nome: finalData.nome!,
                cnpj: finalData.cnpj || null,
                cpf: finalData.cpf || null,
                email: finalData.email || null,
                telefone: finalData.telefone || null,
                plano: finalData.plano || 'free',
                ativo: finalData.ativo ?? true,
                limite_usuarios: finalData.limite_usuarios || 5,
                limite_clientes: finalData.limite_clientes || 10,
            });

            if (!result) {
                alert('Erro ao criar organização.');
                return;
            }

            if (adminEmail && adminPassword) {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

                const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
                    auth: { persistSession: false }
                });

                const { error: signUpError } = await tempSupabase.auth.signUp({
                    email: adminEmail,
                    password: adminPassword,
                    options: {
                        data: {
                            nome: adminNome || finalData.nome,
                            role: 'admin',
                            organization_id: result.id
                        }
                    }
                });

                if (signUpError) {
                    alert('Empresa criada, mas erro ao criar o administrador: ' + signUpError.message);
                }
            }
        } else if (finalData.id) {
            await updateOrganization(finalData.id, {
                nome: finalData.nome,
                cnpj: finalData.cnpj || null,
                cpf: finalData.cpf || null,
                email: finalData.email || null,
                telefone: finalData.telefone || null,
                plano: finalData.plano,
                ativo: finalData.ativo,
                limite_usuarios: finalData.limite_usuarios,
                limite_clientes: finalData.limite_clientes,
                saldo_sacavel: finalData.saldo_sacavel,
                saldo_bonus: finalData.saldo_bonus
            });
        }

        setShowModal(false);
        setEditingOrg(null);
        setIsCreating(false);
        fetchOrganizations();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza?')) return;
        await deleteOrganization(id);
        fetchOrganizations();
    };

    const getPlanoBadge = (plano: string) => {
        const colors: Record<string, string> = {
            free: 'bg-gray-500',
            gratuito: 'bg-gray-500',
            intermediario: 'bg-blue-600',
            top: 'bg-purple-600',
            enterprise: 'bg-yellow-500',
        };
        return colors[plano] || 'bg-gray-500';
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gerenciar Organizações</h1>
                    <p className="text-gray-600 mt-1">Controle total de todas as organizações</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    <i className="ri-add-line mr-2"></i> Nova Organização
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <i className="ri-loader-4-line text-4xl text-[#10B981] animate-spin"></i>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organização</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano / Créditos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limites</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {organizations.map((org) => (
                                <tr key={org.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{org.nome}</div>
                                        <div className="text-xs text-gray-400">{org.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full text-white w-fit uppercase ${getPlanoBadge(org.plano)}`}>
                                                {org.plano}
                                            </span>
                                            <span className="text-sm font-black text-purple-600 mt-1">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(org.saldo_bonus || 0)}
                                                <span className="block text-[10px] text-gray-500 font-normal">Saldo Bônus</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                        <div><i className="ri-user-line"></i> {org.limite_usuarios}</div>
                                        <div><i className="ri-team-line"></i> {org.limite_clientes}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${org.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {org.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(org.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <button onClick={() => setSelectedOrgForDetails(org)} className="text-blue-500 mr-4"><i className="ri-search-line"></i></button>
                                        <button onClick={() => handleEdit(org)} className="text-[#10B981] mr-4"><i className="ri-edit-line"></i></button>
                                        <button onClick={() => handleDelete(org.id)} className="text-red-600"><i className="ri-delete-bin-line"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && editingOrg && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">{isCreating ? 'Nova Empresa' : 'Editar Empresa'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
                                <input type="text" value={editingOrg.nome} onChange={e => setEditingOrg({ ...editingOrg, nome: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">CPF / CNPJ</label>
                                <input type="text" value={editingOrg.cnpj || editingOrg.cpf || ''} onChange={e => setEditingOrg({ ...editingOrg, cnpj: e.target.value, cpf: null })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                <input type="email" value={editingOrg.email || ''} onChange={e => setEditingOrg({ ...editingOrg, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Telefone</label>
                                <input type="text" value={editingOrg.telefone || ''} onChange={e => setEditingOrg({ ...editingOrg, telefone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Plano</label>
                                <select
                                    value={editingOrg.plano}
                                    onChange={e => {
                                        const slug = e.target.value;
                                        const p = plans.find(x => x.slug === slug);
                                        setEditingOrg({ ...editingOrg, plano: slug as any, limite_usuarios: p?.limite_usuarios ?? editingOrg.limite_usuarios, limite_clientes: p?.limite_clientes ?? editingOrg.limite_clientes });
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    {plans.filter(p => !!p.ativo || p.slug === editingOrg.plano).map(p => (
                                        <option key={p.id} value={p.slug}>{p.nome}{!p.ativo ? ' (Inativo)' : ''}</option>
                                    ))}
                                    {plans.length === 0 && <option value="free">Free</option>}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                                <select value={editingOrg.ativo ? 'true' : 'false'} onChange={e => setEditingOrg({ ...editingOrg, ativo: e.target.value === 'true' })} className="w-full px-3 py-2 border rounded-lg">
                                    <option value="true">Ativo</option>
                                    <option value="false">Inativo</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Limite Usuários</label>
                                <input type="number" value={editingOrg.limite_usuarios} onChange={e => setEditingOrg({ ...editingOrg, limite_usuarios: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Limite Clientes</label>
                                <input type="number" value={editingOrg.limite_clientes} onChange={e => setEditingOrg({ ...editingOrg, limite_clientes: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                        </div>

                        {isCreating && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Primeiro Administrador</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <input placeholder="Nome" value={adminNome} onChange={e => setAdminNome(e.target.value)} className="px-3 py-2 border rounded-lg" />
                                    <input placeholder="Email login" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="px-3 py-2 border rounded-lg" />
                                </div>
                                <input type="password" placeholder="Senha" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-[#10B981] text-white rounded-lg hover:bg-green-600 font-bold">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedOrgForDetails && (
                <OrganizationDetailsModal
                    organization={selectedOrgForDetails}
                    onClose={() => setSelectedOrgForDetails(null)}
                    onUpdate={fetchOrganizations}
                />
            )}
        </div>
    );
}
