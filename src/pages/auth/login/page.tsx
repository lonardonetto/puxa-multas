import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const { signIn, loading } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [erro, setErro] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);

        const { error } = await signIn(formData.email, formData.password);

        if (error) {
            setErro(error.message);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo de volta</h1>
                    <p className="text-gray-600">Faça login para acessar sua conta</p>
                </div>

                {erro && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                        <i className="ri-error-warning-fill text-red-600 text-xl"></i>
                        <div>
                            <h4 className="text-sm font-bold text-red-800">Erro ao fazer login</h4>
                            <p className="text-sm text-red-700 mt-1">{erro}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            E-mail
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Senha
                        </label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                            placeholder="••••••••"
                        />
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
                                Entrando...
                            </>
                        ) : (
                            <>
                                <i className="ri-login-box-line mr-2"></i>
                                Entrar
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Não tem uma conta?{' '}
                        <a href="/register" className="text-[#10B981] font-semibold hover:underline">
                            Cadastre-se
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
