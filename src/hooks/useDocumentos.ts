import { useState, useCallback } from 'react';
import { supabase, uploadFile, STORAGE_BUCKET } from '../lib/supabase';
import type { Documento, DocumentoInsert } from '../types/database';

interface UseDocumentosReturn {
    documentos: Documento[];
    loading: boolean;
    error: Error | null;
    fetchDocumentosByCliente: (clienteId: string) => Promise<void>;
    uploadDocumento: (clienteId: string, file: File, tipo: string) => Promise<Documento | null>;
    deleteDocumento: (id: string, path: string) => Promise<boolean>;
}

export function useDocumentos(): UseDocumentosReturn {
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchDocumentosByCliente = useCallback(async (clienteId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await (supabase
                .from('documentos')
                .select('*') as any)
                .eq('cliente_id', clienteId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setDocumentos(data || []);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar documentos'));
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadDocumento = useCallback(async (clienteId: string, file: File, tipo: string): Promise<Documento | null> => {
        setLoading(true);
        setError(null);
        try {
            // Sanitizar o nome do arquivo: remover acentos, espaços e caracteres especiais
            const sanitizedName = file.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remove acentos
                .replace(/[^a-zA-Z0-9.-]/g, '_') // Mantém apenas letras, números, ponto e hifen
                .replace(/_{2,}/g, '_'); // Remove underscores duplicados

            const fileName = `${clienteId}/${Date.now()}_${sanitizedName}`;
            const { url, error: uploadError } = await uploadFile(fileName, file);

            if (uploadError) throw uploadError;

            const novoDoc: DocumentoInsert = {
                cliente_id: clienteId,
                tipo: tipo as any,
                nome_arquivo: file.name,
                url_storage: fileName,
                tamanho_bytes: file.size,
            };

            const { data, error: insertError } = await (supabase
                .from('documentos')
                .insert(novoDoc as any) as any)
                .select()
                .single();

            if (insertError) throw insertError;

            setDocumentos(prev => [data, ...prev]);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao fazer upload do documento'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteDocumento = useCallback(async (id: string, path: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            // Deletar do Storage
            const { error: storageError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove([path]);

            if (storageError) throw storageError;

            // Deletar do Banco
            const { error: dbError } = await supabase
                .from('documentos')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            setDocumentos(prev => prev.filter(d => d.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao deletar documento'));
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        documentos,
        loading,
        error,
        fetchDocumentosByCliente,
        uploadDocumento,
        deleteDocumento
    };
}

export default useDocumentos;
