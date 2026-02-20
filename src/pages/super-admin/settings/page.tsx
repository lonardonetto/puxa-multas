import { useState, useEffect } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { supabase } from '@/integrations/supabase/client';

type TipoChavePix = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';

interface PixSettings {
    tipoChave: TipoChavePix;
    chave: string;
    nomeRecebedor: string;
    cidade: string;
    banco: string;
}

export default function SystemSettings() {
    const { settings: dbSettings, loading: dbLoading, updateSetting } = useSystemSettings();
    
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        allowNewRegistrations: true,
        requireEmailVerification: false,
        maxUsersPerFreeOrg: 3,
        maxClientesPerFreeOrg: 5,
        systemEmail: 'suporte@rekorramultas.com.br',
        whatsappSupportNumber: ''
    });
    const [savingWhatsapp, setSavingWhatsapp] = useState(false);
    const [whatsappSaved, setWhatsappSaved] = useState(false);

    // AI API Keys state
    const [aiProvider, setAiProvider] = useState('google');
    const [googleApiKey, setGoogleApiKey] = useState('');
    const [openaiApiKey, setOpenaiApiKey] = useState('');
    const [anthropicApiKey, setAnthropicApiKey] = useState('');
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [savingAi, setSavingAi] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);

    // InfinitePay settings state
    const [infiniteTag, setInfiniteTag] = useState('');
    const [savingInfinite, setSavingInfinite] = useState(false);
    const [infiniteSaved, setInfiniteSaved] = useState(false);

    // PIX settings state
    const [pixSettings, setPixSettings] = useState<PixSettings>({
        tipoChave: 'aleatoria',
        chave: '',
        nomeRecebedor: '',
        cidade: '',
        banco: '',
    });
    const [savingPix, setSavingPix] = useState(false);
    const [pixSaved, setPixSaved] = useState(false);

    // Load API settings from database - only once when first loaded
    useEffect(() => {
        if (dbSettings.length > 0 && !initialLoaded) {
            const provider = dbSettings.find(s => s.key === 'ai_provider')?.value || 'google';
            const googleKey = dbSettings.find(s => s.key === 'google_ai_api_key')?.value || '';
            const openaiKey = dbSettings.find(s => s.key === 'openai_api_key')?.value || '';
            const anthropicKey = dbSettings.find(s => s.key === 'anthropic_api_key')?.value || '';
            
            // Load PIX settings
            // Load InfinitePay tag
            const infiniteTagValue = dbSettings.find(s => s.key === 'infinitepay_tag')?.value || '';
            setInfiniteTag(infiniteTagValue);

            const pixTipo = (dbSettings.find(s => s.key === 'pix_tipo_chave')?.value || 'aleatoria') as TipoChavePix;
            const pixChave = dbSettings.find(s => s.key === 'pix_chave')?.value || '';
            const pixNome = dbSettings.find(s => s.key === 'pix_nome_recebedor')?.value || '';
            const pixCidade = dbSettings.find(s => s.key === 'pix_cidade')?.value || '';
            const pixBanco = dbSettings.find(s => s.key === 'pix_banco')?.value || '';
            const whatsappNum = dbSettings.find(s => s.key === 'whatsapp_suporte')?.value || '';

            setAiProvider(provider);
            setGoogleApiKey(googleKey);
            setOpenaiApiKey(openaiKey);
            setAnthropicApiKey(anthropicKey);
            setPixSettings({ tipoChave: pixTipo, chave: pixChave, nomeRecebedor: pixNome, cidade: pixCidade, banco: pixBanco });
            setSettings(prev => ({ ...prev, whatsappSupportNumber: whatsappNum }));
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

    const handleSavePixSettings = async () => {
        setSavingPix(true);
        try {
            await updateSetting('pix_tipo_chave', pixSettings.tipoChave);
            await updateSetting('pix_chave', pixSettings.chave);
            await updateSetting('pix_nome_recebedor', pixSettings.nomeRecebedor);
            await updateSetting('pix_cidade', pixSettings.cidade);
            await updateSetting('pix_banco', pixSettings.banco);
            setPixSaved(true);
            setTimeout(() => setPixSaved(false), 3000);
        } catch (error) {
            alert('Erro ao salvar configurações de PIX');
        } finally {
            setSavingPix(false);
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

    const tiposChavePix: { value: TipoChavePix; label: string; placeholder: string; mask?: string }[] = [
        { value: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
        { value: 'cnpj', label: 'CNPJ', placeholder: '00.000.000/0001-00' },
        { value: 'email', label: 'E-mail', placeholder: 'exemplo@email.com' },
        { value: 'telefone', label: 'Telefone', placeholder: '+5511999999999' },
        { value: 'aleatoria', label: 'Chave Aleatória (EVP)', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
    ];

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

                {/* InfinitePay */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-[#00C88C]/10 rounded-xl flex items-center justify-center">
                            <i className="ri-bank-card-line text-[#00C88C] text-lg"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">InfinitePay — Checkout Integrado</h2>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Configura sua <strong>InfiniteTag</strong> (o @ da sua conta, sem o $) para gerar links de pagamento automáticos com cartão de crédito e PIX.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                InfiniteTag <span className="text-gray-400 font-normal">(sem o símbolo $)</span>
                            </label>
                            <div className="flex gap-2 items-center">
                                <span className="text-gray-400 font-bold text-lg">$</span>
                                <input
                                    type="text"
                                    value={infiniteTag}
                                    onChange={e => setInfiniteTag(e.target.value.replace(/[$\s]/g, '').toLowerCase())}
                                    placeholder="suatag"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00C88C]/50 font-mono text-sm"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Encontre em: App InfinitePay → Perfil → InfiniteTag
                            </p>
                        </div>

                        {infiniteTag && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-sm">
                                <i className="ri-check-double-line text-emerald-600"></i>
                                <span className="text-emerald-800">
                                    Pagamentos serão gerados para: <strong>${infiniteTag}</strong>
                                </span>
                            </div>
                        )}

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex gap-2">
                            <i className="ri-information-line mt-0.5 shrink-0"></i>
                            <div>
                                <p className="font-semibold mb-1">Como funciona:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                                    <li>Cliente escolhe o valor → sistema gera link InfinitePay</li>
                                    <li>Aceita cartão de crédito (até 12x) e PIX</li>
                                    <li>Confirmação automática — sem aprovação manual</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={async () => {
                                    setSavingInfinite(true);
                                    await updateSetting('infinitepay_tag', infiniteTag);
                                    setInfiniteSaved(true);
                                    setTimeout(() => setInfiniteSaved(false), 3000);
                                    setSavingInfinite(false);
                                }}
                                disabled={savingInfinite || !infiniteTag}
                                className={`px-5 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 text-sm ${
                                    infiniteSaved
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                        : 'bg-[#00C88C] text-white hover:bg-emerald-600 disabled:opacity-50'
                                }`}
                            >
                                {savingInfinite ? (
                                    <><i className="ri-loader-4-line animate-spin"></i> Salvando...</>
                                ) : infiniteSaved ? (
                                    <><i className="ri-check-line"></i> Salvo!</>
                                ) : (
                                    <><i className="ri-save-line"></i> Salvar InfiniteTag</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Configurações PIX */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                        <i className="ri-qr-code-line mr-2 text-green-600"></i>
                        Configurações PIX — Recebimento de Créditos
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Esses dados serão usados para gerar o QR Code PIX quando os clientes adicionarem créditos na plataforma.
                    </p>

                    <div className="space-y-5">
                        {/* Tipo de chave */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Chave PIX</label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {tiposChavePix.map(tipo => (
                                    <button
                                        key={tipo.value}
                                        onClick={() => setPixSettings(p => ({ ...p, tipoChave: tipo.value, chave: '' }))}
                                        className={`py-2 px-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                                            pixSettings.tipoChave === tipo.value
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        {tipo.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chave PIX */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chave PIX ({tiposChavePix.find(t => t.value === pixSettings.tipoChave)?.label})
                            </label>
                            <input
                                type="text"
                                value={pixSettings.chave}
                                onChange={e => setPixSettings(p => ({ ...p, chave: e.target.value }))}
                                placeholder={tiposChavePix.find(t => t.value === pixSettings.tipoChave)?.placeholder}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                            />
                            {pixSettings.tipoChave === 'aleatoria' && (
                                <button
                                    onClick={() => setPixSettings(p => ({ ...p, chave: '48eca431-470d-49bb-bade-7e976e4ba928' }))}
                                    className="mt-1 text-xs text-green-600 hover:underline"
                                >
                                    Usar chave configurada
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nome do Recebedor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Recebedor</label>
                                <input
                                    type="text"
                                    value={pixSettings.nomeRecebedor}
                                    onChange={e => setPixSettings(p => ({ ...p, nomeRecebedor: e.target.value }))}
                                    placeholder="Nome ou razão social (max 25 chars)"
                                    maxLength={25}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">{pixSettings.nomeRecebedor.length}/25 caracteres</p>
                            </div>

                            {/* Cidade */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cidade do Recebedor</label>
                                <input
                                    type="text"
                                    value={pixSettings.cidade}
                                    onChange={e => setPixSettings(p => ({ ...p, cidade: e.target.value }))}
                                    placeholder="Ex: Sao Paulo"
                                    maxLength={15}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">{pixSettings.cidade.length}/15 caracteres (sem acentos)</p>
                            </div>
                        </div>

                        {/* Banco */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Banco / Instituição (informativo)</label>
                            <input
                                type="text"
                                value={pixSettings.banco}
                                onChange={e => setPixSettings(p => ({ ...p, banco: e.target.value }))}
                                placeholder="Ex: Nubank, Itaú, Bradesco..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* Preview da chave */}
                        {pixSettings.chave && pixSettings.nomeRecebedor && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                                <i className="ri-check-double-line text-green-600 mt-0.5"></i>
                                <div className="text-sm">
                                    <p className="font-semibold text-green-800">Dados configurados:</p>
                                    <p className="text-green-700 mt-1">
                                        <span className="font-medium">Chave:</span> {pixSettings.chave} ({tiposChavePix.find(t => t.value === pixSettings.tipoChave)?.label})
                                    </p>
                                    <p className="text-green-700">
                                        <span className="font-medium">Recebedor:</span> {pixSettings.nomeRecebedor} — {pixSettings.cidade}
                                        {pixSettings.banco && ` (${pixSettings.banco})`}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                onClick={handleSavePixSettings}
                                disabled={savingPix || !pixSettings.chave || !pixSettings.nomeRecebedor || !pixSettings.cidade}
                                className={`px-5 py-2.5 font-bold rounded-lg transition-all flex items-center gap-2 ${
                                    pixSaved
                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                        : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                                }`}
                            >
                                {savingPix ? (
                                    <><i className="ri-loader-4-line animate-spin"></i> Salvando...</>
                                ) : pixSaved ? (
                                    <><i className="ri-check-line"></i> Salvo!</>
                                ) : (
                                    <><i className="ri-save-line"></i> Salvar Dados PIX</>
                                )}
                            </button>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                WhatsApp de Suporte
                                <span className="ml-2 text-xs text-green-600 font-normal">— usado no link de envio de comprovante PIX</span>
                            </label>
                            <input
                                type="text"
                                value={settings.whatsappSupportNumber}
                                onChange={(e) => setSettings({ ...settings, whatsappSupportNumber: e.target.value })}
                                placeholder="+5511999999999 (com código do país)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                            <p className="text-xs text-gray-400 mt-1">Formato: +5511999999999 (código do país + DDD + número)</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={async () => {
                                    setSavingWhatsapp(true);
                                    await updateSetting('whatsapp_suporte', settings.whatsappSupportNumber);
                                    setWhatsappSaved(true);
                                    setTimeout(() => setWhatsappSaved(false), 3000);
                                    setSavingWhatsapp(false);
                                }}
                                disabled={savingWhatsapp || !settings.whatsappSupportNumber}
                                className={`px-4 py-2 font-bold rounded-lg transition-all flex items-center gap-2 text-sm ${
                                    whatsappSaved
                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                        : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
                                }`}
                            >
                                {savingWhatsapp ? (
                                    <><i className="ri-loader-4-line animate-spin"></i> Salvando...</>
                                ) : whatsappSaved ? (
                                    <><i className="ri-check-line"></i> Salvo!</>
                                ) : (
                                    <><i className="ri-whatsapp-fill"></i> Salvar WhatsApp</>
                                )}
                            </button>
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
