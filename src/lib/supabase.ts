import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured. Some features may not work.');
}

// Create an untyped client to avoid strict type checking issues
// Type safety is handled at the application level via type assertions
export const supabase: SupabaseClient = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

// Storage bucket name for documents
export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'documentos';

// Helper function to get public URL for stored files
export const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
};

// Helper function to upload files
export const uploadFile = async (
    path: string,
    file: File
): Promise<{ url: string | null; error: Error | null }> => {
    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        return { url: null, error };
    }

    return { url: getPublicUrl(data.path), error: null };
};

export default supabase;
