import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

        // Validar senhas
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Criar Conta</h1>
                    <p className="text-gray-600">Cadastre sua organização e comece a usar</p>
                </div>

                {sucesso && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                        <i className="ri-checkbox-circle-fill text-green-600 text-xl"></i>
                        <div>
                            <h4 className="text-sm font-bold text-green-800">Conta criada com sucesso!</h4>
                            <p className="text-sm text-green-700 mt-1">Você será redirecionado para o login...</p>
                        </div>
                    </div>
                )}

                {erro && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                        <i className="ri-error-warning-fill text-red-600 text-xl"></i>
                        <div>
                            <h4 className="text-sm font-bold text-red-800">Erro ao criar conta</h4>
                            <p className="text-sm text-red-700 mt-1">{erro}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nome da Organização *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.organizationName}
                                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                                placeholder="Minha Empresa Ltda"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                CPF ou CNPJ da Empresa *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.organizationDocument}
                                onChange={(e) => setFormData({ ...formData, organizationDocument: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 text-center">
                            Configuração de Acesso (Login)
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nome do Admin (Responsável) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                                    placeholder="Nome completo do administrador"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        E-mail de Login *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                                        placeholder="seu@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Telefone de Contato
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telefone}
                                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Senha de Acesso *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirmar Senha *
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 bg-[#10B981] text-white rounded-lg font-semibold transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
                            }`}
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
                    <p className="text-sm text-gray-600">
                        Já tem uma conta?{' '}
                        <a href="/login" className="text-[#10B981] font-semibold hover:underline">
                            Faça login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
