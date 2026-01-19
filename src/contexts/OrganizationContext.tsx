import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import type { Organization, UserOrganization } from '../types/database';

interface OrganizationContextType {
    currentOrganization: Organization | null;
    userOrganizations: UserOrganization[];
    loading: boolean;
    switchOrganization: (organizationId: string) => void;
    refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
    children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
    const { user } = useAuth();
    const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
    const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUserOrganizations = async () => {
        if (!user) {
            setUserOrganizations([]);
            setCurrentOrganization(null);
            setLoading(false);
            return;
        }

        try {
            // Fetch user's organization memberships
            const { data: memberships, error: membershipsError } = await supabase
                .from('user_organizations')
                .select('*')
                .eq('user_id', user.id);

            if (membershipsError) throw membershipsError;

            setUserOrganizations(memberships || []);

            // If user has organizations, fetch the first one (or from localStorage)
            if (memberships && memberships.length > 0) {
                const savedOrgId = localStorage.getItem('currentOrganizationId');
                const orgIdToFetch = savedOrgId || (memberships[0] as any).organization_id;

                const { data: org, error: orgError } = await supabase
                    .from('organizations')
                    .select('*')
                    .eq('id', orgIdToFetch)
                    .single();

                if (orgError) {
                    // If saved org not found, use first available
                    const { data: firstOrg } = await supabase
                        .from('organizations')
                        .select('*')
                        .eq('id', (memberships[0] as any).organization_id)
                        .single();

                    setCurrentOrganization(firstOrg);
                    if (firstOrg) {
                        localStorage.setItem('currentOrganizationId', (firstOrg as any).id);
                    }
                } else {
                    setCurrentOrganization(org);
                }
            }
        } catch (error) {
            console.error('Error fetching organizations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserOrganizations();
    }, [user]);

    // Realtime subscription for the current organization
    useEffect(() => {
        if (!currentOrganization?.id) return;

        const subscription = supabase
            .channel(`org_changes_${currentOrganization.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'organizations',
                    filter: `id=eq.${currentOrganization.id}`
                },
                (payload) => {
                    console.log('Realtime update received for organization:', payload.new);
                    setCurrentOrganization(payload.new as Organization);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [currentOrganization?.id]);

    const switchOrganization = async (organizationId: string) => {
        try {
            const { data: org, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', organizationId)
                .single();

            if (error) throw error;

            setCurrentOrganization(org);
            localStorage.setItem('currentOrganizationId', organizationId);
        } catch (error) {
            console.error('Error switching organization:', error);
        }
    };

    const refreshOrganizations = async () => {
        setLoading(true);
        await fetchUserOrganizations();
    };

    const value: OrganizationContextType = {
        currentOrganization,
        userOrganizations,
        loading,
        switchOrganization,
        refreshOrganizations,
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization(): OrganizationContextType {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
}

export default OrganizationContext;
