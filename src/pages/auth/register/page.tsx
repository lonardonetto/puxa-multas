import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo-central-multa.png';

export default function Register() {
    const { signUp, loading } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        password: '',
        confirmPassword: '',
        organizationName: '',
        organizationDocument: '',
    });
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);

        if (formData.password !== formData.confirmPassword) {
            setErro('As senhas não coincidem');
            return;
        }

        if (formData.password.length < 6) {
            setErro('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        const { error } = await signUp(
            formData.email,
            formData.password,
            {
                nome: formData.nome,
                telefone: formData.telefone,
                organization_name: formData.organizationName,
                organization_document: formData.organizationDocument,
            }
        );

        if (error) {
            setErro(error.message);
        } else {
            setSucesso(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-[#1A1A1A] border border-[#3D3D3D] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent";
    const labelClass = "block text-sm font-semibold text-gray-300 mb-2";

    return (
        <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
            <div className="bg-[#2D2D2D] rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-[#3D3D3D]">
                <div className="text-center mb-8">
                    <img 
                        src={logo} 
                        alt="Central da Multa" 
                        className="h-16 mx-auto mb-4"
                    />
                    <h1 className="text-2xl font-bold text-white mb-2">Criar Conta</h1>
                    <p className="text-gray-400">Cadastre sua organização e comece a usar</p>
                </div>

                {sucesso && (
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6 flex items-start space-x-3">
                        <i className="ri-checkbox-circle-fill text-green-400 text-xl"></i>
                        <div>
                            <h4 className="text-sm font-bold text-green-300">Conta criada com sucesso!</h4>
                            <p className="text-sm text-green-400 mt-1">Você será redirecionado para o login...</p>
                        </div>
                    </div>
                )}

                {erro && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 flex items-start space-x-3">
                        <i className="ri-error-warning-fill text-red-400 text-xl"></i>
                        <div>
                            <h4 className="text-sm font-bold text-red-300">Erro ao criar conta</h4>
                            <p className="text-sm text-red-400 mt-1">{erro}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>
                                Nome da Organização *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.organizationName}
                                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                className={inputClass}
                                placeholder="Minha Empresa Ltda"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>
                                CPF ou CNPJ da Empresa *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.organizationDocument}
                                onChange={(e) => setFormData({ ...formData, organizationDocument: e.target.value })}
                                className={inputClass}
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#3D3D3D]">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">
                            Configuração de Acesso (Login)
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>
                                    Nome do Admin (Responsável) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    className={inputClass}
                                    placeholder="Nome completo do administrador"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>
                                        E-mail de Login *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={inputClass}
                                        placeholder="seu@email.com"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Telefone de Contato
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                        className={inputClass}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>
                                        Senha de Acesso *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={inputClass}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Confirmar Senha *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className={inputClass}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 gradient-gold text-white rounded-lg font-semibold transition-all shadow-gold ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                    >
                        {loading ? (
                            <>
                                <i className="ri-loader-4-line mr-2 animate-spin"></i>
                                Criando conta...
                            </>
                        ) : (
                            <>
                                <i className="ri-user-add-line mr-2"></i>
                                Criar Conta
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Já tem uma conta?{' '}
                        <a href="/login" className="text-[#D4A017] font-semibold hover:underline">
                            Faça login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
