import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface SuperAdminRouteProps {
    children: React.ReactNode;
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
    const { user, loading: authLoading } = useAuth();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSuperAdmin = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                setIsSuperAdmin(data?.role === 'super_admin' || false);
            } catch (error) {
                console.error('Error checking super admin:', error);
                setIsSuperAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkSuperAdmin();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <i className="ri-loader-4-line text-4xl text-[#10B981] animate-spin"></i>
                    <p className="mt-4 text-gray-600">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isSuperAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

export default SuperAdminRoute;
