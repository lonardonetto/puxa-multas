import { useState } from 'react';

export default function SystemSettings() {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        allowNewRegistrations: true,
        requireEmailVerification: false,
        maxUsersPerFreeOrg: 3,
        maxClientesPerFreeOrg: 5,
        systemEmail: 'suporte@rekorramultas.com.br',
        whatsappSupportNumber: '+5521999999999'
    });

    const handleToggle = (key: keyof typeof settings) => {
        if (typeof settings[key] === 'boolean') {
            setSettings({ ...settings, [key]: !settings[key] });
        }
    };

    const handleSave = () => {
        alert('Configurações salvas com sucesso (simulado)');
        // Aqui seria um update em uma tabela 'system_settings'
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Configurações do Sistema</h1>
                <p className="text-gray-600 mt-1">Ajuste os parâmetros globais da plataforma</p>
            </div>

            <div className="max-w-4xl space-y-6">
                {/* Controle de Acesso */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <i className="ri-shield-keyhole-line mr-2 text-blue-600"></i>
                        Acesso e Registro
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800">Modo de Manutenção</p>
                                <p className="text-sm text-gray-500">Bloqueia o acesso de todos os usuários exceto Super Admins</p>
                            </div>
                            <button
                                onClick={() => handleToggle('maintenanceMode')}
                                className={`w-14 h-7 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-gray-800">Novos Registros Públicos</p>
                                <p className="text-sm text-gray-500">Permite que qualquer pessoa crie uma conta em /register</p>
                            </div>
                            <button
                                onClick={() => handleToggle('allowNewRegistrations')}
                                className={`w-14 h-7 rounded-full transition-colors relative ${settings.allowNewRegistrations ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.allowNewRegistrations ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Limites de Planos */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <i className="ri-scales-line mr-2 text-purple-600"></i>
                        Limites Padrão (Plano Free)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Máximo de Usuários</label>
                            <input
                                type="number"
                                value={settings.maxUsersPerFreeOrg}
                                onChange={(e) => setSettings({ ...settings, maxUsersPerFreeOrg: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Máximo de Clientes</label>
                            <input
                                type="number"
                                value={settings.maxClientesPerFreeOrg}
                                onChange={(e) => setSettings({ ...settings, maxClientesPerFreeOrg: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Contato e Suporte */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <i className="ri-customer-service-line mr-2 text-green-600"></i>
                        Suporte e Comunicação
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email do Sistema</label>
                            <input
                                type="email"
                                value={settings.systemEmail}
                                onChange={(e) => setSettings({ ...settings, systemEmail: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp de Suporte</label>
                            <input
                                type="text"
                                value={settings.whatsappSupportNumber}
                                onChange={(e) => setSettings({ ...settings, whatsappSupportNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-[#10B981] text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                    >
                        Salvar Todas as Configurações
                    </button>
                </div>
            </div>
        </div>
    );
}
