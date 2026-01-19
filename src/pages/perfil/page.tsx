import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useOrganization } from '../../contexts/OrganizationContext';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const { currentOrganization } = useOrganization();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        nome: user?.nome || '',
        telefone: user?.telefone || '',
        avatar_url: user?.avatar_url || ''
    });

    const [themeData, setThemeData] = useState({
        cor_primaria: currentOrganization?.cor_primaria || '#1a1a1a',
        cor_secundaria: currentOrganization?.cor_secundaria || '#333333',
        estilo_cabecalho: (currentOrganization?.estilo_cabecalho as 'elegant' | 'classic' | 'minimal') || 'elegant',
        intervalo_notificacao: currentOrganization?.intervalo_notificacao || 7
    });
    const [savingTheme, setSavingTheme] = useState(false);

    // Estados para branding de contrato
    const [brandingData, setBrandingData] = useState({
        logo_contrato_url: currentOrganization?.logo_contrato_url || '',
        timbre_contrato_url: currentOrganization?.timbre_contrato_url || '',
        nome_contrato: currentOrganization?.nome_contrato || currentOrganization?.nome || '',
        cnpj_contrato: currentOrganization?.cnpj_contrato || currentOrganization?.cnpj || '',
        endereco_contrato: currentOrganization?.endereco_contrato || currentOrganization?.endereco_completo || ''
    });
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingTimbre, setUploadingTimbre] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const timbreInputRef = useRef<HTMLInputElement>(null);

    // useEffect para sincronizar estados quando a organizacao carregar
    useEffect(() => {
        if (currentOrganization) {
            console.log('[Perfil] Sincronizando dados da organizacao:', currentOrganization.nome);
            setThemeData({
                cor_primaria: currentOrganization.cor_primaria || '#1a1a1a',
                cor_secundaria: currentOrganization.cor_secundaria || '#333333',
                estilo_cabecalho: (currentOrganization.estilo_cabecalho as 'elegant' | 'classic' | 'minimal') || 'elegant',
                intervalo_notificacao: currentOrganization.intervalo_notificacao || 7
            });
            setBrandingData({
                logo_contrato_url: currentOrganization.logo_contrato_url || '',
                timbre_contrato_url: currentOrganization.timbre_contrato_url || '',
                nome_contrato: currentOrganization.nome_contrato || currentOrganization.nome || '',
                cnpj_contrato: currentOrganization.cnpj_contrato || currentOrganization.cnpj || '',
                endereco_contrato: currentOrganization.endereco_contrato || currentOrganization.endereco_completo || ''
            });
        }
    }, [currentOrganization]);


    const handleUploadBrandingImage = async (file: File, type: 'logo' | 'timbre') => {
        if (!currentOrganization) return;

        const setter = type === 'logo' ? setUploadingLogo : setUploadingTimbre;
        setter(true);
        setMessage(null);
        console.log(`[Upload ${type}] Iniciando...`, file.name, file.size);

        // Timeout de 15s para evitar loading infinito
        const timeoutId = setTimeout(() => {
            setter(false);
            setMessage({ type: 'error', text: 'Upload demorou muito. Tente novamente.' });
            console.error(`[Upload ${type}] Timeout atingido`);
        }, 15000);

        try {
            if (!file.type.startsWith('image/')) throw new Error('Selecione uma imagem válida.');
            if (file.size > 2 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 2MB.');

            const fileExt = file.name.split('.').pop();
            const fileName = `${type}_${Date.now()}.${fileExt}`;
            // Usa bucket 'avatars' com path da organização
            const filePath = `${currentOrganization.id}/${fileName}`;
            console.log(`[Upload ${type}] Path:`, filePath);

            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            console.log(`[Upload ${type}] Resultado:`, { error: uploadError, data: uploadData });

            if (uploadError) {
                console.error(`[Upload ${type}] Erro:`, uploadError);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            console.log(`[Upload ${type}] URL pública:`, publicUrl);

            setBrandingData(prev => ({
                ...prev,
                [type === 'logo' ? 'logo_contrato_url' : 'timbre_contrato_url']: publicUrl
            }));
            setMessage({ type: 'success', text: `${type === 'logo' ? 'Logo' : 'Timbre'} carregado com sucesso!` });
        } catch (err: any) {
            console.error(`[Upload ${type}] Erro fatal:`, err);
            setMessage({ type: 'error', text: err.message || 'Erro no upload. Verifique suas permissões.' });
        } finally {
            clearTimeout(timeoutId);
            setter(false);
        }
    };

    const handleSaveTheme = async () => {
        if (!currentOrganization) {
            setMessage({ type: 'error', text: 'Organizacao nao encontrada.' });
            return;
        }
        setSavingTheme(true);
        setMessage(null);
        console.log('[SaveTheme] Salvando...', { themeData, brandingData });

        // Timeout de 10s para evitar loading infinito
        const timeoutId = setTimeout(() => {
            setSavingTheme(false);
            setMessage({ type: 'error', text: 'Salvamento demorou muito. Tente novamente.' });
            console.error('[SaveTheme] Timeout atingido');
        }, 10000);

        try {
            const updateData = {
                cor_primaria: themeData.cor_primaria,
                cor_secundaria: themeData.cor_secundaria,
                estilo_cabecalho: themeData.estilo_cabecalho,
                intervalo_notificacao: themeData.intervalo_notificacao,
                logo_contrato_url: brandingData.logo_contrato_url || null,
                timbre_contrato_url: brandingData.timbre_contrato_url || null,
                nome_contrato: brandingData.nome_contrato || null,
                cnpj_contrato: brandingData.cnpj_contrato || null,
                endereco_contrato: brandingData.endereco_contrato || null
            };
            console.log('[SaveTheme] Dados a salvar:', updateData);

            const { error, data } = await supabase
                .from('organizations')
                .update(updateData)
                .eq('id', currentOrganization.id)
                .select();

            console.log('[SaveTheme] Resultado:', { error, data });

            if (error) {
                console.error('[SaveTheme] Erro:', error);
                throw error;
            }
            setMessage({ type: 'success', text: 'Personalização salva com sucesso!' });
        } catch (err: any) {
            console.error('[SaveTheme] Erro fatal:', err);
            setMessage({ type: 'error', text: err.message || 'Erro ao salvar.' });
        } finally {
            clearTimeout(timeoutId);
            setSavingTheme(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setLoading(true);
        setMessage(null);
        console.log('Iniciando processo de upload para usuário:', user.id);

        // Timeout mechanism to prevent infinite loading
        const timeoutId = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setMessage({ type: 'error', text: 'O upload demorou muito. Verifique sua conexão.' });
                console.error('Upload timeout atingido (15s)');
            }
        }, 15000);

        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Por favor, selecione uma imagem válida.');
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                throw new Error('A imagem deve ter no máximo 2MB.');
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`; // Use timestamp for uniqueness
            const filePath = `${user.id}/${fileName}`;

            console.log('Fazendo upload para:', filePath);
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Erro detalhado do Storage:', uploadError);
                throw uploadError;
            }

            console.log('Upload bem sucedido. Pegando URL pública...');
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            console.log('URL pública gerada:', publicUrl);
            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));

            // Save immediately in the profile
            console.log('Atualizando perfil auth e metadados...');
            const { error: updateError } = await updateProfile({ avatar_url: publicUrl });
            if (updateError) {
                console.error('Erro ao salvar URL no perfil:', updateError);
                throw updateError;
            }

            console.log('Perfil atualizado com sucesso!');
            setMessage({ type: 'success', text: 'Foto de perfil atualizada!' });
        } catch (error: any) {
            console.error('Erro fatal no fluxo de avatar:', error);
            setMessage({ type: 'error', text: error.message || 'Erro ao processar imagem' });
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        console.log('Iniciando salvamento de perfil...', formData);

        try {
            const { error } = await updateProfile({
                nome: formData.nome,
                telefone: formData.telefone
            });

            if (error) {
                console.error('Erro retornado pelo updateProfile:', error);
                setMessage({ type: 'error', text: error.message });
            } else {
                console.log('Perfil salvo com sucesso!');
                setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            }
        } catch (err: any) {
            console.error('Erro inesperado no handleSubmit:', err);
            setMessage({ type: 'error', text: 'Erro ao salvar alterações. Tente novamente.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-600 h-32"></div>

                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-8 flex flex-col items-center">
                        <div
                            className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 cursor-pointer group"
                            onClick={handleAvatarClick}
                        >
                            {formData.avatar_url ? (
                                <img
                                    src={formData.avatar_url}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#1E3A8A] text-white text-4xl font-bold">
                                    {formData.nome?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <i className="ri-camera-line text-white text-2xl"></i>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <h2 className="text-2xl font-bold text-gray-800 mt-4">{formData.nome || 'Meu Perfil'}</h2>
                        <p className="text-gray-500">{user?.email}</p>

                        {currentOrganization && (
                            <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 shadow-sm">
                                <i className="ri-medal-line"></i>
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    Plano {currentOrganization.plano}
                                </span>
                            </div>
                        )}
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            <i className={message.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}></i>
                            <span className="text-sm font-medium">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Telefone de Contato
                                </label>
                                <input
                                    type="text"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                E-mail (Identificador principal)
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-2">O e-mail não pode ser alterado por aqui para segurança da conta.</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-8 py-3 bg-[#1E3A8A] text-white rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading && <i className="ri-loader-4-line animate-spin"></i>}
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
                        <i className="ri-shield-keyhole-line text-xl"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-800">Segurança da Conta</h3>
                        <p className="text-sm text-amber-700 mt-1">
                            Sua senha pode ser alterada nas configurações de segurança. Nunca compartilhe seus dados de acesso com terceiros.
                        </p>
                    </div>
                </div>
            </div>

            {/* Seção de Configuração de Tema */}
            {currentOrganization && (
                <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <i className="ri-palette-line text-xl"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Personalização Visual</h3>
                                <p className="text-sm text-gray-500">Configure as cores e estilo dos contratos da sua organização</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Seletores de Cor */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Cor Primária
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={themeData.cor_primaria}
                                        onChange={(e) => setThemeData({ ...themeData, cor_primaria: e.target.value })}
                                        className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={themeData.cor_primaria}
                                        onChange={(e) => setThemeData({ ...themeData, cor_primaria: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                                        placeholder="#1a1a1a"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Usada no cabeçalho e elementos principais</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Cor Secundária
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={themeData.cor_secundaria}
                                        onChange={(e) => setThemeData({ ...themeData, cor_secundaria: e.target.value })}
                                        className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={themeData.cor_secundaria}
                                        onChange={(e) => setThemeData({ ...themeData, cor_secundaria: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono"
                                        placeholder="#333333"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Usada em detalhes e faixas decorativas</p>
                            </div>
                        </div>

                        {/* Configuração de Notificações */}
                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <i className="ri-notification-3-line"></i>
                                Agendamentos e Lembretes
                            </h4>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
                                <div className="flex-1">
                                    <h5 className="text-sm font-bold text-blue-900">Intervalo Padrão de Acompanhamento</h5>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Defina a cada quantos dias o sistema deve alertar para conferir o status de um recurso.
                                        Este valor será usado como padrão para novos contratos.
                                    </p>
                                </div>
                                <div className="flex items-center bg-white border border-blue-200 rounded-lg px-3 py-2 shadow-sm">
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={themeData.intervalo_notificacao}
                                        onChange={(e) => setThemeData({ ...themeData, intervalo_notificacao: parseInt(e.target.value) || 7 })}
                                        className="w-10 text-center font-bold text-blue-900 outline-none"
                                    />
                                    <span className="text-[10px] font-bold text-blue-400 ml-1 uppercase">Dias</span>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <i className="ri-image-line"></i>
                                Logo e Timbre do Contrato
                            </h4>
                            <p className="text-xs text-gray-400 mb-4">Personalize o logo e timbre que aparecerão nos contratos (independente do cadastro).</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Upload Logo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Logo para Contratos</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            onClick={() => logoInputRef.current?.click()}
                                            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors overflow-hidden bg-gray-50"
                                        >
                                            {brandingData.logo_contrato_url ? (
                                                <img src={brandingData.logo_contrato_url} alt="Logo" className="w-full h-full object-contain" />
                                            ) : uploadingLogo ? (
                                                <i className="ri-loader-4-line animate-spin text-2xl text-gray-400"></i>
                                            ) : (
                                                <i className="ri-image-add-line text-2xl text-gray-400"></i>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <button
                                                onClick={() => logoInputRef.current?.click()}
                                                disabled={uploadingLogo}
                                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                            >
                                                {brandingData.logo_contrato_url ? 'Alterar logo' : 'Carregar logo'}
                                            </button>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG até 2MB</p>
                                            {brandingData.logo_contrato_url && (
                                                <button
                                                    onClick={() => setBrandingData({ ...brandingData, logo_contrato_url: '' })}
                                                    className="text-xs text-red-500 hover:text-red-600 mt-1"
                                                >
                                                    Remover
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleUploadBrandingImage(e.target.files[0], 'logo')}
                                    />
                                </div>

                                {/* Upload Timbre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Timbre/Cabeçalho</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            onClick={() => timbreInputRef.current?.click()}
                                            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors overflow-hidden bg-gray-50"
                                        >
                                            {brandingData.timbre_contrato_url ? (
                                                <img src={brandingData.timbre_contrato_url} alt="Timbre" className="w-full h-full object-contain" />
                                            ) : uploadingTimbre ? (
                                                <i className="ri-loader-4-line animate-spin text-2xl text-gray-400"></i>
                                            ) : (
                                                <i className="ri-file-paper-line text-2xl text-gray-400"></i>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <button
                                                onClick={() => timbreInputRef.current?.click()}
                                                disabled={uploadingTimbre}
                                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                            >
                                                {brandingData.timbre_contrato_url ? 'Alterar timbre' : 'Carregar timbre'}
                                            </button>
                                            <p className="text-xs text-gray-400 mt-1">Imagem de cabeçalho</p>
                                            {brandingData.timbre_contrato_url && (
                                                <button
                                                    onClick={() => setBrandingData({ ...brandingData, timbre_contrato_url: '' })}
                                                    className="text-xs text-red-500 hover:text-red-600 mt-1"
                                                >
                                                    Remover
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        ref={timbreInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleUploadBrandingImage(e.target.files[0], 'timbre')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dados para o Contrato */}
                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <i className="ri-file-text-line"></i>
                                Dados que aparecem no Contrato
                            </h4>
                            <p className="text-xs text-gray-400 mb-4">Personalize o nome, CNPJ e endereço que serão exibidos nos contratos.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Nome da Empresa/Escritório</label>
                                    <input
                                        type="text"
                                        value={brandingData.nome_contrato}
                                        onChange={(e) => setBrandingData({ ...brandingData, nome_contrato: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                                        placeholder="Ex: LF Trânsito Assessoria"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">CNPJ</label>
                                        <input
                                            type="text"
                                            value={brandingData.cnpj_contrato}
                                            onChange={(e) => setBrandingData({ ...brandingData, cnpj_contrato: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                                            placeholder="00.000.000/0001-00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Endereço</label>
                                        <input
                                            type="text"
                                            value={brandingData.endereco_contrato}
                                            onChange={(e) => setBrandingData({ ...brandingData, endereco_contrato: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                                            placeholder="Rua, número - Bairro - Cidade/UF"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seletor de Estilo */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Estilo do Cabeçalho
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {(['elegant', 'classic', 'minimal'] as const).map((estilo) => (
                                    <button
                                        key={estilo}
                                        onClick={() => setThemeData({ ...themeData, estilo_cabecalho: estilo })}
                                        className={`p-4 border-2 rounded-xl transition-all ${themeData.estilo_cabecalho === estilo
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-center">
                                            <i className={`text-2xl mb-2 block ${estilo === 'elegant' ? 'ri-layout-5-line' :
                                                estilo === 'classic' ? 'ri-layout-3-line' : 'ri-layout-line'
                                                } ${themeData.estilo_cabecalho === estilo ? 'text-purple-600' : 'text-gray-400'}`}></i>
                                            <p className={`text-sm font-medium capitalize ${themeData.estilo_cabecalho === estilo ? 'text-purple-700' : 'text-gray-600'
                                                }`}>
                                                {estilo === 'elegant' ? 'Elegante' : estilo === 'classic' ? 'Clássico' : 'Minimalista'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {estilo === 'elegant' ? 'Com faixas decorativas' :
                                                    estilo === 'classic' ? 'Tradicional centralizado' : 'Limpo e simples'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview Completo do Contrato */}
                        <div className="border-t border-gray-100 pt-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <i className="ri-file-paper-2-line"></i>
                                Prévia Completa do Contrato
                            </label>
                            <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {/* Timbre (se carregado) */}
                                {brandingData.timbre_contrato_url && (
                                    <div className="w-full">
                                        <img src={brandingData.timbre_contrato_url} alt="Timbre" className="w-full h-24 object-cover" />
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Cabeçalho */}
                                    <div className="relative mb-6">
                                        {themeData.estilo_cabecalho === 'elegant' && (
                                            <>
                                                <div className="absolute top-0 right-0 w-20 h-14 overflow-hidden">
                                                    <svg viewBox="0 0 200 150" className="w-full h-full" preserveAspectRatio="xMaxYMin slice">
                                                        <polygon points="200,0 200,150 50,150" fill={themeData.cor_primaria} />
                                                        <polygon points="200,0 200,100 100,100" fill={themeData.cor_secundaria} opacity="0.8" />
                                                    </svg>
                                                </div>
                                                <div className="flex items-center gap-3 pb-3 border-b-4" style={{ borderColor: themeData.cor_primaria }}>
                                                    {brandingData.logo_contrato_url ? (
                                                        <img src={brandingData.logo_contrato_url} alt="Logo" className="w-10 h-10 object-contain" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: themeData.cor_primaria }}>
                                                            <span className="text-white text-sm font-black">{brandingData.nome_contrato?.charAt(0) || 'O'}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-black text-xs text-gray-900">
                                                            {brandingData.nome_contrato?.toUpperCase() || 'NOME DA EMPRESA'}
                                                        </h4>
                                                        <p className="text-[8px] text-gray-600">CNPJ: {brandingData.cnpj_contrato || '00.000.000/0001-00'}</p>
                                                        <p className="text-[8px] text-gray-500">{brandingData.endereco_contrato || 'Endereço'}</p>
                                                    </div>
                                                </div>
                                                <div className="h-0.5 mt-1" style={{ background: `linear-gradient(to right, ${themeData.cor_primaria}, ${themeData.cor_secundaria})` }} />
                                            </>
                                        )}
                                        {themeData.estilo_cabecalho === 'classic' && (
                                            <div className="text-center pb-3 border-b-2 border-gray-400">
                                                {brandingData.logo_contrato_url && (
                                                    <img src={brandingData.logo_contrato_url} alt="Logo" className="h-8 mx-auto mb-2 object-contain" />
                                                )}
                                                <h4 className="font-bold text-sm text-gray-900">{brandingData.nome_contrato || 'Nome da Empresa'}</h4>
                                                <p className="text-[8px] text-gray-600">CNPJ: {brandingData.cnpj_contrato || '00.000.000/0001-00'}</p>
                                            </div>
                                        )}
                                        {themeData.estilo_cabecalho === 'minimal' && (
                                            <div className="flex items-center gap-2 pb-2 border-b border-gray-300">
                                                {brandingData.logo_contrato_url ? (
                                                    <img src={brandingData.logo_contrato_url} alt="Logo" className="w-8 h-8 object-contain" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: themeData.cor_primaria }}>
                                                        <span className="text-white font-bold text-xs">{brandingData.nome_contrato?.charAt(0) || 'O'}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-xs text-gray-900">{brandingData.nome_contrato || 'Nome da Empresa'}</h4>
                                                    <p className="text-[7px] text-gray-600">CNPJ: {brandingData.cnpj_contrato || '00.000.000/0001-00'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Título do Contrato */}
                                    <div className="text-center mb-4">
                                        <h3 className="text-sm font-bold text-gray-800">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h3>
                                        <p className="text-[8px] text-gray-400">Recurso de Multa de Trânsito</p>
                                    </div>

                                    {/* Corpo do Contrato (Exemplo) */}
                                    <div className="text-[8px] text-gray-600 leading-relaxed mb-4 space-y-2">
                                        <p>Pelo presente instrumento particular, de um lado <strong>NOME DO CLIENTE</strong>, CPF: 000.000.000-00, e de outro <strong>{brandingData.nome_contrato || 'CONTRATADA'}</strong>, CNPJ: {brandingData.cnpj_contrato || '00.000.000/0001-00'}...</p>
                                        <p>CLÁUSULA PRIMEIRA: O objeto do presente contrato é a prestação de serviços de assessoria em recursos administrativos...</p>
                                        <p className="text-gray-400">[...conteúdo do contrato...]</p>
                                    </div>

                                    {/* Assinaturas */}
                                    <div className="grid grid-cols-2 gap-6 mt-6 pt-4 border-t border-gray-200">
                                        <div className="text-center">
                                            <div className="h-8 mb-1"></div>
                                            <div className="border-t border-gray-400 pt-1">
                                                <p className="text-[8px] font-bold text-gray-700">Nome do Cliente</p>
                                                <p className="text-[7px] text-gray-400">CONTRATANTE</p>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="h-8 mb-1"></div>
                                            <div className="border-t border-gray-400 pt-1">
                                                <p className="text-[8px] font-bold text-gray-700">{brandingData.nome_contrato || 'Nome da Empresa'}</p>
                                                <p className="text-[7px] text-gray-400">CONTRATADA</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Testemunhas */}
                                    <div className="grid grid-cols-2 gap-6 mt-4">
                                        <div className="text-center">
                                            <div className="h-6 mb-1"></div>
                                            <div className="border-t border-gray-300 pt-1">
                                                <p className="text-[7px] text-gray-500">TESTEMUNHA 1</p>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="h-6 mb-1"></div>
                                            <div className="border-t border-gray-300 pt-1">
                                                <p className="text-[7px] text-gray-500">TESTEMUNHA 2</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rodapé com Faixas */}
                                    <div className="mt-6 pt-4">
                                        <div className="relative">
                                            <div className="h-1" style={{ background: `linear-gradient(to right, ${themeData.cor_secundaria}, ${themeData.cor_primaria})` }} />
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-[7px] text-gray-400">{brandingData.endereco_contrato || 'Endereço da empresa'}</p>
                                                <div className="flex items-center gap-2">
                                                    <svg width="20" height="12" viewBox="0 0 40 24">
                                                        <polygon points="0,24 40,24 40,0" fill={themeData.cor_primaria} />
                                                        <polygon points="0,24 25,24 25,8" fill={themeData.cor_secundaria} opacity="0.7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botão Salvar */}
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                onClick={handleSaveTheme}
                                disabled={savingTheme}
                                className={`px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center gap-2 ${savingTheme ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {savingTheme && <i className="ri-loader-4-line animate-spin"></i>}
                                <i className="ri-palette-line"></i>
                                Salvar Tema
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
