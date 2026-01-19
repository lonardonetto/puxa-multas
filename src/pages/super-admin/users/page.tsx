import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { useOrganizations } from '../../../hooks/useOrganizations';
import type { UserRole, Organization } from '../../../types/database';

interface SystemUser {
    id: string;
    email: string | null;
    nome: string | null;
    role: UserRole;
    created_at: string;
    organization?: {
        id: string;
        nome: string;
    };
}

export default function UsersManagement() {
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [loading, setLoading] = useState(true);
    const { organizations, fetchOrganizations } = useOrganizations();
    const [editingUser, setEditingUser] = useState<Partial<SystemUser> | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        // Busca usuários e traz a PRIMEIRA organização vinculada (estratégia simples)
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                user_organizations (
                    role,
                    organization:organizations (
                        id,
                        nome
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const formattedUsers = data.map((u: any) => ({
                ...u,
                organization: u.user_organizations?.[0]?.organization
            }));
            setUsers(formattedUsers as SystemUser[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
        fetchOrganizations();
    }, []);

    const handleCreate = () => {
        setEditingUser({
            nome: '',
            email: '',
            role: 'admin',
        });
        setIsCreating(true);
        setPassword('');
        setSelectedOrgId('');
        setShowModal(true);
    };

    const handleEdit = (user: SystemUser) => {
        setEditingUser(user);
        setIsCreating(false);
        setSelectedOrgId(user.organization?.id || '');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!editingUser) return;

        if (isCreating) {
            if (!editingUser.email || !password) {
                alert('E-mail e senha são obrigatórios.');
                return;
            }

            // Criar um cliente temporário que NÃO persiste a sessão
            // Isso evita que o Supabase deslogue o admin e logue o novo usuário automaticamente
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
                auth: { persistSession: false }
            });

            const { data, error } = await tempSupabase.auth.signUp({
                email: editingUser.email,
                password: password,
                options: {
                    data: {
                        nome: editingUser.nome,
                        role: editingUser.role,
                        organization_id: selectedOrgId || null
                    }
                }
            });

            if (error) {
                alert('Erro ao criar usuário: ' + error.message);
                return;
            }
            alert('Usuário criado com sucesso! Ele já pode fazer login.');
        } else {
            // Atualizar Perfil do Usuário
            const { error: userError } = await (supabase.from('users') as any)
                .update({
                    role: editingUser.role,
                    nome: editingUser.nome
                })
                .eq('id', editingUser.id);

            if (userError) {
                alert('Erro ao atualizar usuário: ' + userError.message);
                return;
            }

            // Atualizar Vínculo com Organização
            // Primeiro remove vínculos existentes para evitar duplicidade (SaaS simples)
            await (supabase.from('user_organizations') as any)
                .delete()
                .eq('user_id', editingUser.id);

            if (selectedOrgId) {
                const { error: orgError } = await (supabase.from('user_organizations') as any)
                    .insert({
                        user_id: editingUser.id,
                        organization_id: selectedOrgId,
                        role: editingUser.role || 'user'
                    });

                if (orgError) {
                    console.error('Erro ao vincular empresa:', orgError);
                }
            }
        }

        setShowModal(false);
        setEditingUser(null);
        setIsCreating(false);
        fetchUsers();
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            super_admin: 'bg-red-500',
            admin: 'bg-blue-500',
            user: 'bg-green-500',
        };
        return colors[role as keyof typeof colors] || 'bg-gray-500';
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gerenciar Usuários</h1>
                    <p className="text-gray-600 mt-1">Gerencie todos os usuários e permissões do sistema</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                >
                    <i className="ri-user-add-line mr-2"></i>
                    Novo Usuário
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Empresa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Criado em
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{user.nome || 'Sem nome'}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.organization ? (
                                            <span className="text-sm text-gray-900 font-medium">
                                                {user.organization.nome}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sem empresa</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(user.role)} text-white`}>
                                            {user.role?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-[#10B981] hover:text-green-700"
                                        >
                                            <i className="ri-edit-line text-xl"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Edição */}
            {showModal && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {isCreating ? 'Cadastrar Novo Usuário' : 'Editar Usuário'}
                        </h2>
                        {!isCreating && <p className="text-sm text-gray-500 mb-4">{editingUser.email}</p>}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                                <input
                                    type="text"
                                    value={editingUser.nome || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Acesso (Role)</label>
                                <select
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                >
                                    <option value="admin">Admin (Administrador da Empresa)</option>
                                    <option value="user">User (Operador)</option>
                                    <option value="super_admin">Super Admin (Sistema)</option>
                                </select>
                            </div>

                            {isCreating && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                                        <input
                                            type="email"
                                            value={editingUser.email || ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Senha Inicial</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vincular à Empresa</label>
                                <select
                                    value={selectedOrgId}
                                    onChange={(e) => setSelectedOrgId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                                >
                                    <option value="">Selecione uma empresa (opcional para Super Admin)</option>
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id}>
                                            {org.nome} {org.cnpj ? `(${org.cnpj})` : (org.cpf ? `(${org.cpf})` : '')}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-1">Este usuário terá acesso total aos dados desta empresa.</p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingUser(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-green-600"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
