import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo-central-multa.png';
import { supabase } from '../../../lib/supabase';

type Tela = 'login' | 'esqueci_senha' | 'senha_enviada';

export default function Login() {
    const { signIn, loading } = useAuth();
    const navigate = useNavigate();
    const [tela, setTela] = useState<Tela>('login');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [emailReset, setEmailReset] = useState('');
    const [erro, setErro] = useState<string | null>(null);
    const [enviandoReset, setEnviandoReset] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
            setErro('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
        } else {
            navigate('/');
        }
    };

    const handleEsqueciSenha = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);
        if (!emailReset) {
            setErro('Informe seu e-mail cadastrado.');
            return;
        }
        setEnviandoReset(true);
        try {
            // 1. Dispara o reset via Supabase Auth (gera link)
            const { error } = await supabase.auth.resetPasswordForEmail(emailReset, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                setErro('Não foi possível enviar o e-mail. Verifique se o endereço está correto.');
                return;
            }

            // 2. Dispara template personalizado via Brevo em paralelo (best-effort)
            const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
            fetch(`https://${projectId}.supabase.co/functions/v1/enviar-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo: 'redefinicao_senha',
                    destinatario_email: emailReset,
                    destinatario_nome: emailReset,
                    dados: {
                        nome: emailReset,
                        link: `${window.location.origin}/reset-password`,
                    },
                }),
            }).catch(() => {});

            setTela('senha_enviada');
        } catch {
            setErro('Erro inesperado. Tente novamente.');
        } finally {
            setEnviandoReset(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-[#1A1A1A] border border-[#3D3D3D] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent";

    return (
        <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
            <div className="bg-[#2D2D2D] rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#3D3D3D]">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src={logo} alt="Central da Multa" className="h-16 mx-auto mb-4" />
                    {tela === 'login' && (
                        <>
                            <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h1>
                            <p className="text-gray-400">Faça login para acessar sua conta</p>
                        </>
                    )}
                    {tela === 'esqueci_senha' && (
                        <>
                            <h1 className="text-2xl font-bold text-white mb-2">Recuperar Acesso</h1>
                            <p className="text-gray-400">Informe seu e-mail para receber o link de redefinição</p>
                        </>
                    )}
                    {tela === 'senha_enviada' && (
                        <>
                            <div className="text-5xl mb-4">📧</div>
                            <h1 className="text-2xl font-bold text-white mb-2">E-mail Enviado!</h1>
                            <p className="text-gray-400">Verifique sua caixa de entrada</p>
                        </>
                    )}
                </div>

                {/* Error */}
                {erro && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 flex items-start space-x-3">
                        <i className="ri-error-warning-fill text-red-400 text-xl mt-0.5"></i>
                        <p className="text-sm text-red-400">{erro}</p>
                    </div>
                )}

                {/* ── TELA LOGIN ── */}
                {tela === 'login' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">E-mail</label>
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
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-gray-300">Senha</label>
                                <button
                                    type="button"
                                    onClick={() => { setErro(null); setEmailReset(formData.email); setTela('esqueci_senha'); }}
                                    className="text-xs text-[#D4A017] hover:underline"
                                >
                                    Esqueci minha senha
                                </button>
                            </div>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={inputClass}
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 gradient-gold text-white rounded-lg font-semibold transition-all shadow-gold ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                        >
                            {loading ? (
                                <><i className="ri-loader-4-line mr-2 animate-spin"></i>Entrando...</>
                            ) : (
                                <><i className="ri-login-box-line mr-2"></i>Entrar</>
                            )}
                        </button>
                        <div className="text-center">
                            <p className="text-sm text-gray-400">
                                Não tem uma conta?{' '}
                                <a href="/register" className="text-[#D4A017] font-semibold hover:underline">Cadastre-se</a>
                            </p>
                        </div>
                    </form>
                )}

                {/* ── TELA ESQUECI SENHA ── */}
                {tela === 'esqueci_senha' && (
                    <form onSubmit={handleEsqueciSenha} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">E-mail cadastrado</label>
                            <input
                                type="email"
                                required
                                value={emailReset}
                                onChange={(e) => setEmailReset(e.target.value)}
                                className={inputClass}
                                placeholder="seu@email.com"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={enviandoReset}
                            className={`w-full py-3 gradient-gold text-white rounded-lg font-semibold transition-all shadow-gold ${enviandoReset ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                        >
                            {enviandoReset ? (
                                <><i className="ri-loader-4-line mr-2 animate-spin"></i>Enviando...</>
                            ) : (
                                <><i className="ri-mail-send-line mr-2"></i>Enviar Link de Recuperação</>
                            )}
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => { setErro(null); setTela('login'); }}
                                className="text-sm text-gray-400 hover:text-[#D4A017] transition-colors"
                            >
                                <i className="ri-arrow-left-line mr-1"></i>Voltar ao login
                            </button>
                        </div>
                    </form>
                )}

                {/* ── TELA SENHA ENVIADA ── */}
                {tela === 'senha_enviada' && (
                    <div className="space-y-6">
                        <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-5 text-center">
                            <p className="text-green-300 text-sm leading-relaxed">
                                Enviamos um link de redefinição de senha para<br/>
                                <strong className="text-white">{emailReset}</strong>
                            </p>
                            <p className="text-gray-500 text-xs mt-3">
                                Verifique também a pasta de spam. O link expira em 1 hora.
                            </p>
                        </div>
                        <div className="text-center space-y-3">
                            <button
                                onClick={() => { setEnviandoReset(true); handleEsqueciSenha({ preventDefault: () => {} } as any).finally(() => setEnviandoReset(false)); }}
                                disabled={enviandoReset}
                                className="text-sm text-[#D4A017] hover:underline disabled:opacity-50"
                            >
                                {enviandoReset ? 'Reenviando...' : 'Reenviar e-mail'}
                            </button>
                            <br/>
                            <button
                                type="button"
                                onClick={() => { setErro(null); setTela('login'); }}
                                className="text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <i className="ri-arrow-left-line mr-1"></i>Voltar ao login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
