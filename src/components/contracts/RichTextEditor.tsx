import React, { useRef, useCallback, useEffect, useState } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

/**
 * Editor de texto rico para contratos
 * Suporta: Negrito, Itálico, Sublinhado, Alinhamento, Listas
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Digite o texto aqui...',
    minHeight = '400px'
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Inicializar conteúdo apenas uma vez
    useEffect(() => {
        if (editorRef.current && !isInitialized && value) {
            editorRef.current.innerHTML = value;
            setIsInitialized(true);
        }
    }, [value, isInitialized]);

    // Aplicar formatação
    const applyFormat = useCallback((command: string, cmdValue?: string) => {
        // Salvar seleção atual
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        
        document.execCommand(command, false, cmdValue);
        
        // Restaurar foco no editor
        if (editorRef.current) {
            editorRef.current.focus();
            
            // Restaurar seleção se possível
            if (range && selection) {
                try {
                    selection.removeAllRanges();
                    selection.addRange(range);
                } catch (e) {
                    // Ignorar erros de seleção
                }
            }
            
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    // Verificar se formato está ativo
    const isFormatActive = (command: string) => {
        try {
            return document.queryCommandState(command);
        } catch {
            return false;
        }
    };

    // Botão de formatação - prevenir comportamento padrão
    const FormatButton: React.FC<{
        command: string;
        icon: string;
        title: string;
        cmdValue?: string;
    }> = ({ command, icon, title, cmdValue }) => (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault(); // Prevenir perda de foco
            }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                applyFormat(command, cmdValue);
            }}
            className={`p-2 rounded transition-colors ${isFormatActive(command)
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            title={title}
        >
            <i className={`${icon} text-lg`}></i>
        </button>
    );

    // Separador
    const Separator = () => (
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
    );

    // Handler de mudança - debounced
    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    // Handler de paste para limpar formatação externa
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        handleInput();
    }, [handleInput]);

    // Handler de keydown para manter comportamento normal
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Permitir Enter para criar nova linha
        if (e.key === 'Enter' && !e.shiftKey) {
            // Comportamento padrão do contentEditable
        }
    }, []);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            {/* Barra de Ferramentas */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                {/* Formatação de Texto */}
                <FormatButton command="bold" icon="ri-bold" title="Negrito (Ctrl+B)" />
                <FormatButton command="italic" icon="ri-italic" title="Itálico (Ctrl+I)" />
                <FormatButton command="underline" icon="ri-underline" title="Sublinhado (Ctrl+U)" />
                <FormatButton command="strikeThrough" icon="ri-strikethrough" title="Riscado" />

                <Separator />

                {/* Alinhamento */}
                <FormatButton command="justifyLeft" icon="ri-align-left" title="Alinhar à Esquerda" />
                <FormatButton command="justifyCenter" icon="ri-align-center" title="Centralizar" />
                <FormatButton command="justifyRight" icon="ri-align-right" title="Alinhar à Direita" />
                <FormatButton command="justifyFull" icon="ri-align-justify" title="Justificar" />

                <Separator />

                {/* Listas */}
                <FormatButton command="insertUnorderedList" icon="ri-list-unordered" title="Lista com Marcadores" />
                <FormatButton command="insertOrderedList" icon="ri-list-ordered" title="Lista Numerada" />

                <Separator />

                {/* Recuo */}
                <FormatButton command="indent" icon="ri-indent-increase" title="Aumentar Recuo" />
                <FormatButton command="outdent" icon="ri-indent-decrease" title="Diminuir Recuo" />

                <Separator />

                {/* Desfazer/Refazer */}
                <FormatButton command="undo" icon="ri-arrow-go-back-line" title="Desfazer (Ctrl+Z)" />
                <FormatButton command="redo" icon="ri-arrow-go-forward-line" title="Refazer (Ctrl+Y)" />

                <Separator />

                {/* Limpar Formatação */}
                <FormatButton command="removeFormat" icon="ri-format-clear" title="Limpar Formatação" />
            </div>

            {/* Área de Edição */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="p-4 outline-none prose prose-sm max-w-none overflow-y-auto focus:ring-2 focus:ring-green-500/20"
                style={{
                    minHeight,
                    fontFamily: 'Georgia, serif',
                    fontSize: '14px',
                    lineHeight: '1.7'
                }}
                onInput={handleInput}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                data-placeholder={placeholder}
            />

            {/* Estilo para placeholder */}
            <style>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
