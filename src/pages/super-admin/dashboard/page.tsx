import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState({
        totalOrgs: 0,
        totalUsers: 0,
        totalClientes: 0,
        totalMultas: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);

            const [
                { count: orgs },
                { count: users },
                { count: clientes },
                { count: multas }
            ] = await Promise.all([
                supabase.from('organizations').select('*', { count: 'exact', head: true }),
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('clientes').select('*', { count: 'exact', head: true }),
                supabase.from('multas').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                totalOrgs: orgs || 0,
                totalUsers: users || 0,
                totalClientes: clientes || 0,
                totalMultas: multas || 0
            });
            setLoading(false);
        };

        fetchStats();
    }, []);

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Painel Global Super Admin</h1>
                <p className="text-gray-600 mt-1">Visão geral de todo o ecossistema Rekorra Multas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <i className="ri-building-line text-2xl"></i>
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total de Organizações</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        {loading ? '...' : stats.totalOrgs}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                            <i className="ri-group-line text-2xl"></i>
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Usuários Ativos</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        {loading ? '...' : stats.totalUsers}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                            <i className="ri-user-star-line text-2xl"></i>
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Clientes Cadastrados</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        {loading ? '...' : stats.totalClientes}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                            <i className="ri-alarm-warning-line text-2xl"></i>
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total de Multas</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        {loading ? '...' : stats.totalMultas}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Configurações Gerais</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800">Manutenção do Sistema</p>
                                <p className="text-sm text-gray-500">Desativa temporariamente o acesso</p>
                            </div>
                            <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-not-allowed">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-800">Inscrições Públicas</p>
                                <p className="text-sm text-gray-500">Permite novos registros via /register</p>
                            </div>
                            <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-not-allowed text-right pr-1 pt-1">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Métricas Rápidas</h3>
                    <div className="space-y-4">
                        <p className="text-gray-500 italic text-sm">Mais métricas estarão disponíveis em breve.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
