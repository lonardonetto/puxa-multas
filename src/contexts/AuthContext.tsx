import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface CustomUser extends User {
    nome?: string;
    telefone?: string;
    avatar_url?: string;
    role?: string;
}

interface AuthContextType {
    user: CustomUser | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
    updateProfile: (data: { nome?: string; telefone?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (!error && data) {
            setUserProfile(data);
        }
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                setSession(session);
                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    await fetchUserProfile(currentUser.id);
                } else {
                    setUserProfile(null);
                }

                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err instanceof Error ? err : new Error('Erro ao fazer login') };
        }
    };

    const signUp = async (
        email: string,
        password: string,
        metadata?: { nome?: string; telefone?: string }
    ) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err instanceof Error ? err : new Error('Erro ao criar conta') };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const signInWithMagicLink = async (email: string) => {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                },
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err instanceof Error ? err : new Error('Erro ao enviar magic link') };
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err instanceof Error ? err : new Error('Erro ao solicitar reset de senha') };
        }
    };

    const updatePassword = async (newPassword: string) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            return { error: error ? new Error(error.message) : null };
        } catch (err) {
            return { error: err instanceof Error ? err : new Error('Erro ao atualizar senha') };
        }
    };

    const updateProfile = async (data: { nome?: string; telefone?: string; avatar_url?: string }) => {
        if (!user) return { error: new Error('Usuário não autenticado') };

        try {
            // Update auth metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { ...data }
            });

            if (authError) return { error: new Error(authError.message) };

            // Profile table will be updated by trigger, we refresh local state asynchronously
            fetchUserProfile(user.id).catch(err => console.error('Erro ao atualizar cache do perfil:', err));

            return { error: null };
        } catch (err) {
            console.error('Erro fatal no updateProfile:', err);
            return { error: err instanceof Error ? err : new Error('Erro ao atualizar perfil') };
        }
    };

    const refreshUser = async () => {
        if (user) await fetchUserProfile(user.id);
    };

    const value: AuthContextType = {
        user: user ? { ...user, ...userProfile } as CustomUser : null,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithMagicLink,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
