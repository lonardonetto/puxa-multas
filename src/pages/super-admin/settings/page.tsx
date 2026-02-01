import { useState, useEffect } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';

export default function SystemSettings() {
    const { settings: dbSettings, loading: dbLoading, updateSetting, getSetting, refetch } = useSystemSettings();
    
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        allowNewRegistrations: true,
        requireEmailVerification: false,
        maxUsersPerFreeOrg: 3,
        maxClientesPerFreeOrg: 5,
        systemEmail: 'suporte@rekorramultas.com.br',
        whatsappSupportNumber: '+5521999999999'
    });

    // AI API Keys state
    const [aiProvider, setAiProvider] = useState('google');
    const [googleApiKey, setGoogleApiKey] = useState('');
    const [openaiApiKey, setOpenaiApiKey] = useState('');
    const [anthropicApiKey, setAnthropicApiKey] = useState('');
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [savingAi, setSavingAi] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);

    // Load API settings from database - only once when first loaded
    useEffect(() => {
        if (dbSettings.length > 0 && !initialLoaded) {
            const provider = dbSettings.find(s => s.key === 'ai_provider')?.value || 'google';
            const googleKey = dbSettings.find(s => s.key === 'google_ai_api_key')?.value || '';
            const openaiKey = dbSettings.find(s => s.key === 'openai_api_key')?.value || '';
            const anthropicKey = dbSettings.find(s => s.key === 'anthropic_api_key')?.value || '';
            
            setAiProvider(provider);
            setGoogleApiKey(googleKey);
            setOpenaiApiKey(openaiKey);
            setAnthropicApiKey(anthropicKey);
            setInitialLoaded(true);
        }
    }, [dbSettings, initialLoaded]);

    const handleToggle = (key: keyof typeof settings) => {
        if (typeof settings[key] === 'boolean') {
            setSettings({ ...settings, [key]: !settings[key] });
        }
    };

    const handleSave = () => {
        alert('Configurações salvas com sucesso (simulado)');
    };

    const handleSaveAiSettings = async () => {
        setSavingAi(true);
        try {
            await updateSetting('ai_provider', aiProvider);
            await updateSetting('google_ai_api_key', googleApiKey);
            await updateSetting('openai_api_key', openaiApiKey);
            await updateSetting('anthropic_api_key', anthropicApiKey);
            alert('Configurações de IA salvas com sucesso!');
        } catch (error) {
            alert('Erro ao salvar configurações de IA');
        } finally {
            setSavingAi(false);
        }
    };

    const toggleShowKey = (key: string) => {
        setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const maskApiKey = (key: string) => {
        if (!key) return '';
        if (key.length <= 8) return '••••••••';
        return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
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

                {/* Configurações de IA */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <i className="ri-robot-line mr-2 text-indigo-600"></i>
                        Configurações de IA (API Keys)
                    </h2>
                    
                    {dbLoading ? (
                        <div className="text-center py-4 text-gray-500">Carregando configurações...</div>
                    ) : (
                        <div className="space-y-6">
                            {/* Provedor Ativo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Provedor de IA Ativo
                                </label>
                                <select
                                    value={aiProvider}
                                    onChange={(e) => setAiProvider(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="google">Google AI (Gemini) - Recomendado</option>
                                    <option value="openai">OpenAI (GPT-4)</option>
                                    <option value="anthropic">Anthropic (Claude)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Selecione qual provedor será usado para gerar recursos com IA
                                </p>
                            </div>

                            {/* Google AI API Key */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center">
                                        <i className="ri-google-fill mr-2 text-blue-500"></i>
                                        Google AI API Key (Gemini)
                                        {aiProvider === 'google' && (
                                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Ativo</span>
                                        )}
                                    </label>
                                    <a 
                                        href="https://aistudio.google.com/app/apikey" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-600 hover:underline"
                                    >
                                        Obter API Key →
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showKeys.google ? "text" : "password"}
                                        value={googleApiKey}
                                        onChange={(e) => setGoogleApiKey(e.target.value)}
                                        placeholder="AIzaSy..."
                                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShowKey('google')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        <i className={`ri-${showKeys.google ? 'eye-off' : 'eye'}-line`}></i>
                                    </button>
                                </div>
                            </div>

                            {/* OpenAI API Key */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center">
                                        <i className="ri-openai-fill mr-2 text-gray-800"></i>
                                        OpenAI API Key
                                        {aiProvider === 'openai' && (
                                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Ativo</span>
                                        )}
                                    </label>
                                    <a 
                                        href="https://platform.openai.com/api-keys" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-600 hover:underline"
                                    >
                                        Obter API Key →
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showKeys.openai ? "text" : "password"}
                                        value={openaiApiKey}
                                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShowKey('openai')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        <i className={`ri-${showKeys.openai ? 'eye-off' : 'eye'}-line`}></i>
                                    </button>
                                </div>
                            </div>

                            {/* Anthropic API Key */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center">
                                        <i className="ri-brain-line mr-2 text-orange-500"></i>
                                        Anthropic API Key (Claude)
                                        {aiProvider === 'anthropic' && (
                                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Ativo</span>
                                        )}
                                    </label>
                                    <a 
                                        href="https://console.anthropic.com/settings/keys" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-600 hover:underline"
                                    >
                                        Obter API Key →
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showKeys.anthropic ? "text" : "password"}
                                        value={anthropicApiKey}
                                        onChange={(e) => setAnthropicApiKey(e.target.value)}
                                        placeholder="sk-ant-..."
                                        className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShowKey('anthropic')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        <i className={`ri-${showKeys.anthropic ? 'eye-off' : 'eye'}-line`}></i>
                                    </button>
                                </div>
                            </div>

                            {/* Save AI Settings Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveAiSettings}
                                    disabled={savingAi}
                                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {savingAi ? (
                                        <span className="flex items-center">
                                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                                            Salvando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <i className="ri-save-line mr-2"></i>
                                            Salvar Configurações de IA
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Info Box */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start">
                                    <i className="ri-information-line text-blue-500 mr-2 mt-0.5"></i>
                                    <div className="text-sm text-blue-700">
                                        <p className="font-medium mb-1">Como obter as API Keys:</p>
                                        <ul className="list-disc list-inside space-y-1 text-blue-600">
                                            <li><strong>Google AI:</strong> Gratuito com limite generoso. Acesse o Google AI Studio.</li>
                                            <li><strong>OpenAI:</strong> Pago por uso. Crie conta na plataforma OpenAI.</li>
                                            <li><strong>Anthropic:</strong> Pago por uso. Solicite acesso no console Anthropic.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
