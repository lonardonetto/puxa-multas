import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../../lib/supabase';
import RichTextEditor from '../contracts/RichTextEditor';

interface VisualizadorRecursoProps {
  conteudo: string;
  recursoId?: string;
  clienteId?: string;
  onClose: () => void;
}

export default function VisualizadorRecurso({ 
  conteudo, 
  recursoId,
  clienteId,
  onClose
}: VisualizadorRecursoProps) {
  // Converter texto simples para HTML (preservar quebras de linha e parágrafos)
  const converterParaHTML = (texto: string) => {
    if (!texto) return '';
    // Se já parece ser HTML, retornar como está
    if (texto.includes('<p>') || texto.includes('<br>') || texto.includes('<div>')) {
      return texto;
    }
    // Converter quebras de linha duplas em parágrafos
    // Converter quebras de linha simples em <br>
    return texto
      .split(/\n\n+/)
      .map(paragrafo => `<p>${paragrafo.replace(/\n/g, '<br>')}</p>`)
      .join('');
  };

  const [textoEditado, setTextoEditado] = useState(() => converterParaHTML(conteudo));
  const [copiado, setCopiado] = useState(false);
  const [concluindo, setConcluindo] = useState(false);
  const [salvandoPDF, setSalvandoPDF] = useState(false);
  const [etapaConclusao, setEtapaConclusao] = useState<'gerando' | 'salvando' | 'concluido'>('gerando');
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Extrair texto puro do HTML para copiar e para o PDF
  const extrairTextoPuro = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    // Substituir <br> e </p> por quebras de linha antes de extrair
    div.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    div.querySelectorAll('p').forEach(p => {
      p.insertAdjacentText('afterend', '\n\n');
    });
    return (div.textContent || div.innerText || '').trim();
  };

  const handleCopiar = () => {
    navigator.clipboard.writeText(extrairTextoPuro(textoEditado));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleImprimir = () => {
    const printWindow = window.open('about:blank', '_blank');
    if (printWindow) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Recurso de Trânsito</title>
            <style>
              * { box-sizing: border-box; }
              body {
                font-family: 'Georgia', 'Times New Roman', serif;
                font-size: 12pt;
                line-height: 1.8;
                padding: 40px 60px;
                max-width: 800px;
                margin: 0 auto;
                color: #000;
              }
              p { 
                margin-bottom: 1em; 
                text-align: justify;
              }
              ul, ol { margin-left: 20px; margin-bottom: 1em; }
              strong, b { font-weight: bold; }
              em, i { font-style: italic; }
              u { text-decoration: underline; }
            </style>
          </head>
          <body>
            ${textoEditado}
          </body>
        </html>
      `;
      
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Aguardar o documento carregar antes de imprimir
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  const gerarPDF = async (): Promise<Blob> => {
    console.log('Iniciando geração de PDF profissional...');
    
    // Criar PDF A4 com margens profissionais
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 25;
    const marginRight = 25;
    const marginTop = 35; // Espaço para cabeçalho
    const marginBottom = 30; // Espaço para rodapé
    const contentWidth = pageWidth - marginLeft - marginRight;
    const contentHeight = pageHeight - marginTop - marginBottom;

    // Converter HTML para texto estruturado
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = textoEditado;
    
    // Extrair parágrafos do HTML
    const paragraphs: string[] = [];
    const processNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) paragraphs.push(text);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'P' || el.tagName === 'DIV') {
          const text = el.textContent?.trim();
          if (text) paragraphs.push(text);
        } else if (el.tagName === 'BR') {
          // Ignorar BRs isolados
        } else {
          el.childNodes.forEach(processNode);
        }
      }
    };
    
    // Processar apenas elementos de parágrafo de primeiro nível
    tempDiv.querySelectorAll('p, div').forEach(el => {
      const text = el.textContent?.trim();
      if (text && text.length > 0) {
        paragraphs.push(text);
      }
    });
    
    // Se não encontrou parágrafos, usar texto puro
    if (paragraphs.length === 0) {
      const plainText = tempDiv.textContent || '';
      plainText.split(/\n\n+/).forEach(p => {
        const trimmed = p.trim();
        if (trimmed) paragraphs.push(trimmed);
      });
    }

    console.log('Parágrafos extraídos:', paragraphs.length);

    // Configurar fonte
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    
    let currentPage = 1;
    let yPosition = marginTop;

    // Função para adicionar cabeçalho
    const addHeader = (pageNum: number) => {
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('RECURSO DE TRÂNSITO', pageWidth / 2, 15, { align: 'center' });
      doc.setDrawColor(200, 200, 200);
      doc.line(marginLeft, 22, pageWidth - marginRight, 22);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
    };

    // Função para adicionar rodapé
    const addFooter = (pageNum: number, totalPages?: number) => {
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.setDrawColor(200, 200, 200);
      doc.line(marginLeft, pageHeight - 20, pageWidth - marginRight, pageHeight - 20);
      doc.text(`Página ${pageNum}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
    };

    // Adicionar cabeçalho na primeira página
    addHeader(currentPage);

    // Função para verificar se precisa nova página
    const checkNewPage = (heightNeeded: number): boolean => {
      if (yPosition + heightNeeded > pageHeight - marginBottom) {
        addFooter(currentPage);
        doc.addPage();
        currentPage++;
        addHeader(currentPage);
        yPosition = marginTop;
        return true;
      }
      return false;
    };

    // Processar cada parágrafo
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;

      // Quebrar texto em linhas que cabem na largura
      const lines = doc.splitTextToSize(paragraph, contentWidth);
      const lineHeight = 6; // mm por linha
      const paragraphHeight = lines.length * lineHeight + 4; // +4 para espaço entre parágrafos

      // Verificar se o parágrafo inteiro cabe na página atual
      // Se não couber e não estiver no início da página, criar nova página
      if (yPosition > marginTop && yPosition + paragraphHeight > pageHeight - marginBottom) {
        // O parágrafo não cabe - verificar se é muito grande
        if (paragraphHeight > contentHeight) {
          // Parágrafo muito grande, precisa dividir
          for (let i = 0; i < lines.length; i++) {
            checkNewPage(lineHeight);
            doc.text(lines[i], marginLeft, yPosition);
            yPosition += lineHeight;
          }
        } else {
          // Parágrafo cabe em uma página, mover para próxima
          addFooter(currentPage);
          doc.addPage();
          currentPage++;
          addHeader(currentPage);
          yPosition = marginTop;
          
          // Adicionar parágrafo
          doc.text(lines, marginLeft, yPosition);
          yPosition += paragraphHeight;
        }
      } else {
        // Parágrafo cabe na página atual
        doc.text(lines, marginLeft, yPosition);
        yPosition += paragraphHeight;
      }
    }

    // Adicionar rodapé na última página
    addFooter(currentPage);

    // Atualizar todas as páginas com número total
    const totalPages = currentPage;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      // Limpar rodapé anterior
      doc.setFillColor(255, 255, 255);
      doc.rect(marginLeft, pageHeight - 18, contentWidth, 10, 'F');
      doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    }

    console.log('PDF gerado com', totalPages, 'páginas');
    const blob = doc.output('blob');
    console.log('Blob criado, tamanho:', blob.size, 'bytes');
    
    return blob;
  };


  const handleConcluir = async () => {
    setConcluindo(true);
    setSalvandoPDF(true);
    setEtapaConclusao('gerando');

    try {
      console.log('Iniciando geração de PDF...');
      console.log('RecursoId:', recursoId);
      console.log('ClienteId:', clienteId);
      
      // 1. Gerar PDF
      const pdfBlob = await gerarPDF();
      console.log('PDF gerado, tamanho:', pdfBlob.size);
      
      setEtapaConclusao('salvando');

      // 2. Fazer upload para o Storage
      const timestamp = Date.now();
      const fileName = `recursos/${clienteId || 'sem-cliente'}/${recursoId || timestamp}_recurso.pdf`;
      console.log('Fazendo upload para:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('Upload concluído:', uploadData);

      // 3. Obter URL pública
      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName);

      const pdfUrl = urlData?.publicUrl;
      console.log('URL pública:', pdfUrl);

      // 4. Atualizar recurso no banco como finalizado
      if (recursoId) {
        console.log('Atualizando recurso no banco...');
        const { data: updateData, error: updateError } = await supabase
          .from('recursos')
          .update({
            pdf_url: pdfUrl,
            finalizado: true,
            conteudo: textoEditado
          } as any)
          .eq('id', recursoId)
          .select();

        if (updateError) {
          console.error('Erro ao atualizar recurso:', updateError);
          throw new Error(`Erro ao atualizar: ${updateError.message}`);
        }
        
        console.log('Recurso atualizado:', updateData);
      } else {
        console.warn('RecursoId não fornecido, PDF salvo mas não vinculado');
      }

      setEtapaConclusao('concluido');
      console.log('Processo concluído com sucesso!');

      // Limpar sessionStorage
      sessionStorage.removeItem('recurso_em_edicao');

      // Aguardar animação e fechar
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Erro ao finalizar recurso:', error);
      setEtapaConclusao('concluido'); // Mostrar como concluído mesmo com erro
      
      // Mostrar mensagem de erro ao usuário
      alert(`Erro ao salvar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Verifique o console para mais detalhes.`);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } finally {
      setSalvandoPDF(false);
    }
  };

  // Tela de animação de conclusão
  if (concluindo) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Círculo animado */}
          <div className="relative mx-auto w-32 h-32">
            {etapaConclusao === 'concluido' ? (
              <>
                {/* Círculos de pulso - sucesso */}
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-green-500/30 animate-pulse" />
                
                {/* Círculo principal - sucesso */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/50">
                  <svg 
                    className="w-16 h-16 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </>
            ) : (
              <>
                {/* Círculos de pulso - processando */}
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-blue-500/30 animate-pulse" />
                
                {/* Círculo principal - processando */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/50">
                  <i className="ri-file-pdf-2-line text-5xl text-white animate-pulse"></i>
                </div>
              </>
            )}
          </div>

          {/* Texto dinâmico */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">
              {etapaConclusao === 'gerando' && 'Gerando PDF...'}
              {etapaConclusao === 'salvando' && 'Salvando na Pasta do Cliente...'}
              {etapaConclusao === 'concluido' && 'Recurso Finalizado!'}
            </h2>
            <p className="text-gray-300 text-lg">
              {etapaConclusao === 'gerando' && 'Convertendo documento para PDF'}
              {etapaConclusao === 'salvando' && 'Armazenando de forma segura'}
              {etapaConclusao === 'concluido' && 'PDF salvo com sucesso - Recurso bloqueado para edição'}
            </p>
          </div>

          {/* Indicador de redirecionamento */}
          {etapaConclusao === 'concluido' && (
            <div className="flex items-center justify-center gap-3 text-gray-400 animate-fade-in">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Redirecionando para Rastreamento</span>
            </div>
          )}

          {/* Barra de progresso */}
          <div className="w-64 mx-auto h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                etapaConclusao === 'concluido' 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 w-full' 
                  : etapaConclusao === 'salvando'
                    ? 'bg-gradient-to-r from-blue-400 to-indigo-500 w-2/3'
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500 w-1/3 animate-pulse'
              }`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <i className="ri-file-text-line text-2xl"></i>
            <div>
              <h3 className="font-bold text-lg">Recurso Gerado com Sucesso!</h3>
              <p className="text-green-100 text-sm">Revise o conteúdo antes de finalizar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>
      </div>

      {/* Aviso importante */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
        <div className="flex items-center gap-2 text-amber-800">
          <i className="ri-lock-line text-lg"></i>
          <p className="text-sm font-medium">
            Após clicar em "Finalizar", o recurso será salvo como PDF e <strong>não poderá mais ser editado</strong>.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopiar}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              copiado 
                ? 'bg-green-100 text-green-700 border border-green-300 scale-105' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-105'
            }`}
          >
            <i className={`${copiado ? 'ri-check-line' : 'ri-file-copy-line'} mr-2`}></i>
            {copiado ? 'Copiado!' : 'Copiar'}
          </button>
          <button
            onClick={handleImprimir}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 hover:scale-105 transition-all duration-200"
          >
            <i className="ri-printer-line mr-2"></i>
            Pré-visualizar
          </button>
        </div>
      </div>

      {/* Conteúdo do Recurso - Editor Rico */}
      <div className="p-6 max-h-[60vh] overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto">
          <RichTextEditor
            value={textoEditado}
            onChange={setTextoEditado}
            placeholder="Edite o conteúdo do recurso aqui..."
            minHeight="400px"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <i className="ri-information-line mr-1"></i>
            O PDF será salvo automaticamente na pasta do cliente
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleConcluir}
              disabled={salvandoPDF}
              className="group px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="ri-lock-line text-lg"></i>
              Finalizar e Salvar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
