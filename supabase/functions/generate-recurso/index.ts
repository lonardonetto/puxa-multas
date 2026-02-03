import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface DadosRecurso {
  // Dados do Recorrente
  nomeRecorrente: string;
  cpfCnpj: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  
  // Dados do Veículo
  placa: string;
  renavam?: string;
  modelo?: string;
  
  // Dados da Infração
  numeroAuto: string;
  dataInfracao: string;
  horaInfracao?: string;
  localInfracao?: string;
  codigoInfracao: string;
  descricaoInfracao: string;
  valorMulta: number;
  pontos: number;
  gravidade: string;
  
  // Dados do Recurso
  tipoRecurso: 'defesa_previa' | 'jari' | 'cetran';
  descricaoSituacao: string;
  
  // AIT (Auto de Infração de Trânsito) - OBRIGATÓRIO
  aitBase64?: string;
  aitFileName?: string;
  
  // Dados do DETRAN
  detranId?: string | null;
  detranNome?: string | null;
  estadoDetran?: string | null;
}

interface GenerateRequest {
  dados: DadosRecurso;
  organizationId: string;
}

// Função para analisar AIT com IA
async function analisarAitComIA(aitBase64: string, lovableApiKey: string): Promise<any> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `Você é um especialista em análise de Autos de Infração de Trânsito (AIT).
Analise a imagem do AIT e extraia:
1. Erros formais de preenchimento (campo vazio, ilegível, rasurado, sem assinatura, data incorreta, etc.)
2. Inconsistências que possam ser usadas como argumentação
3. Dados relevantes que possam fortalecer o recurso

Retorne um JSON com:
{
  "erros_formais": ["lista de erros encontrados"],
  "inconsistencias": ["lista de inconsistências"],
  "observacoes_importantes": ["pontos que fortalecem o recurso"],
  "resumo_analise": "texto resumido da análise"
}` 
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analise este Auto de Infração e identifique todos os erros formais e inconsistências que possam ser usados em um recurso administrativo.'
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${aitBase64}` }
              }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('Erro ao analisar AIT:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Tentar extrair JSON da resposta
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      return { resumo_analise: content };
    }
    
    return { resumo_analise: content };
  } catch (error) {
    console.error('Erro ao analisar AIT:', error);
    return null;
  }
}

// Template base estruturado para o recurso com formatação HTML
function getTemplateBase(tipo: string, dados: DadosRecurso, orgao: any): string {
  const tipoFormatado = tipo === 'defesa_previa' ? 'DEFESA PRÉVIA' : 
                        tipo === 'jari' ? 'RECURSO À JARI' : 
                        'RECURSO AO CETRAN';
  
  const destinatario = tipo === 'defesa_previa' ? 'À AUTORIDADE DE TRÂNSITO' :
                       tipo === 'jari' ? 'EXCELENTÍSSIMO(A) SENHOR(A) PRESIDENTE DA JUNTA ADMINISTRATIVA DE RECURSOS DE INFRAÇÕES' :
                       'EXCELENTÍSSIMO(A) SENHOR(A) PRESIDENTE DO CONSELHO ESTADUAL DE TRÂNSITO';

  const dataFormatada = dados.dataInfracao ? new Date(dados.dataInfracao).toLocaleDateString('pt-BR') : '[DATA]';
  
  // Template com formatação HTML profissional (negrito nos títulos e dados importantes)
  return `<p style="text-align: center;"><strong>${tipoFormatado}</strong></p>

<p><strong>${destinatario}</strong><br>
<strong>${orgao?.nome || dados.detranNome || 'DETRAN'}</strong><br>
${orgao?.estado || dados.estadoDetran || ''}</p>

<p><strong>RECORRENTE:</strong> ${dados.nomeRecorrente}<br>
<strong>CPF/CNPJ:</strong> ${dados.cpfCnpj}<br>
${dados.endereco ? `<strong>ENDEREÇO:</strong> ${dados.endereco}${dados.cidade ? `, ${dados.cidade}` : ''}${dados.estado ? ` - ${dados.estado}` : ''}${dados.cep ? ` CEP: ${dados.cep}` : ''}<br>` : ''}
${dados.telefone ? `<strong>TELEFONE:</strong> ${dados.telefone}<br>` : ''}
${dados.email ? `<strong>E-MAIL:</strong> ${dados.email}` : ''}</p>

<p><strong>VEÍCULO:</strong> ${dados.modelo || ''} - Placa <strong>${dados.placa}</strong><br>
${dados.renavam ? `<strong>RENAVAM:</strong> ${dados.renavam}` : ''}</p>

<p><strong>AUTO DE INFRAÇÃO Nº:</strong> ${dados.numeroAuto}<br>
<strong>DATA DA INFRAÇÃO:</strong> ${dataFormatada}${dados.horaInfracao ? ` às ${dados.horaInfracao}` : ''}<br>
${dados.localInfracao ? `<strong>LOCAL:</strong> ${dados.localInfracao}` : ''}</p>

<p><strong>CÓDIGO DA INFRAÇÃO:</strong> ${dados.codigoInfracao}<br>
<strong>DESCRIÇÃO:</strong> ${dados.descricaoInfracao}<br>
<strong>VALOR DA MULTA:</strong> R$ ${dados.valorMulta.toFixed(2)}<br>
<strong>PONTUAÇÃO:</strong> ${dados.pontos} pontos<br>
<strong>GRAVIDADE:</strong> ${dados.gravidade}</p>

<hr>

`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: GenerateRequest = await req.json();
    const { dados, organizationId } = body;

    console.log('Generating recurso for:', dados.placa, 'tipo:', dados.tipoRecurso);

    // Buscar órgão de trânsito
    let orgao = null;
    if (dados.detranId) {
      const { data } = await supabase
        .from('orgaos_transito')
        .select('*')
        .eq('id', dados.detranId)
        .single();
      orgao = data;
    } else if (dados.estadoDetran) {
      const { data } = await supabase
        .from('orgaos_transito')
        .select('*')
        .eq('sigla_estado', dados.estadoDetran)
        .eq('tipo', 'DETRAN')
        .single();
      orgao = data;
    }

    // Buscar fundamentos legais relevantes
    const { data: fundamentos } = await supabase
      .from('fundamentos_legais')
      .select('*')
      .eq('tipo_recurso', dados.tipoRecurso)
      .eq('ativo', true)
      .or(`codigo_infracao.eq.${dados.codigoInfracao},codigo_infracao.is.null`)
      .order('ordem')
      .limit(5);

    // Buscar template específico
    const { data: templates } = await supabase
      .from('templates_recursos')
      .select('*')
      .eq('tipo_recurso', dados.tipoRecurso)
      .eq('ativo', true)
      .or(`codigo_infracao.eq.${dados.codigoInfracao},codigo_infracao.is.null`)
      .order('codigo_infracao', { ascending: false, nullsFirst: false })
      .limit(1);

    // Buscar recursos deferidos similares da base de conhecimento
    const { data: recursosDeferidos } = await supabase
      .from('recursos_conhecimento')
      .select('conteudo, argumentos_chave, resultado, dados_extraidos_ia')
      .eq('codigo_infracao', dados.codigoInfracao)
      .eq('resultado', 'deferido')
      .or(`is_global.eq.true,organization_id.eq.${organizationId}`)
      .order('created_at', { ascending: false })
      .limit(3);

    console.log('Recursos deferidos encontrados na base:', recursosDeferidos?.length || 0);

    // Buscar TODA legislação da base (CTB, CONTRAN e Jurisprudências)
    // Primeiro buscar legislação relacionada ao código da infração
    const codigoPrefix = dados.codigoInfracao?.substring(0, 3) || '';
    
    // Buscar legislação específica para a infração + legislação geral
    const { data: legislacaoRelevante } = await supabase
      .from('legislacao_base')
      .select('tipo, titulo, conteudo, artigos_relacionados, palavras_chave, tipo_conteudo')
      .eq('ativo', true)
      .eq('is_global', true)
      .or(`artigos_relacionados.cs.{${dados.codigoInfracao}},titulo.ilike.%${codigoPrefix}%`);

    // Buscar jurisprudências relevantes
    const { data: jurisprudencias } = await supabase
      .from('legislacao_base')
      .select('tipo, titulo, conteudo, artigos_relacionados, palavras_chave')
      .eq('ativo', true)
      .eq('is_global', true)
      .eq('tipo', 'jurisprudencia');

    // Buscar CTB e CONTRAN gerais (principais artigos)
    const { data: legislacaoGeral } = await supabase
      .from('legislacao_base')
      .select('tipo, titulo, conteudo, artigos_relacionados, palavras_chave')
      .eq('ativo', true)
      .eq('is_global', true)
      .in('tipo', ['ctb', 'contran']);

    // Combinar legislação (relevante + geral, sem duplicatas)
    const legislacaoIds = new Set<string>();
    const legislacaoBase: any[] = [];
    
    [legislacaoRelevante, jurisprudencias, legislacaoGeral].forEach(list => {
      list?.forEach(item => {
        const key = item.titulo;
        if (!legislacaoIds.has(key)) {
          legislacaoIds.add(key);
          legislacaoBase.push(item);
        }
      });
    });

    console.log('Legislação total encontrada:', legislacaoBase.length);
    console.log('- Relevante para infração:', legislacaoRelevante?.length || 0);
    console.log('- Jurisprudências:', jurisprudencias?.length || 0);
    console.log('- CTB/CONTRAN geral:', legislacaoGeral?.length || 0);

    // ANALISAR AIT COM IA (se enviado)
    let analiseAit: any = null;
    if (dados.aitBase64 && lovableApiKey) {
      console.log('Analisando AIT com IA...');
      analiseAit = await analisarAitComIA(dados.aitBase64, lovableApiKey);
      console.log('Análise do AIT:', analiseAit);
    }

    const template = templates?.[0];
    const fundamentosText = fundamentos?.map(f => `• ${f.titulo}: ${f.conteudo}`).join('\n\n') || '';

    // Preparar legislação para o prompt - agora inclui jurisprudência
    let legislacaoTexto = '';
    if (legislacaoBase && legislacaoBase.length > 0) {
      const ctb = legislacaoBase.filter((l: any) => l.tipo === 'ctb');
      const contran = legislacaoBase.filter((l: any) => l.tipo === 'contran');
      const jurisp = legislacaoBase.filter((l: any) => l.tipo === 'jurisprudencia');
      
      legislacaoTexto = `
=== BASE DE LEGISLAÇÃO COMPLETA DISPONÍVEL ===

📖 CÓDIGO DE TRÂNSITO BRASILEIRO (CTB) - ${ctb.length} artigos:
${ctb.map((l: any) => `
• ${l.titulo}
${l.conteudo?.substring(0, 800)}${l.conteudo?.length > 800 ? '...' : ''}
`).join('\n')}

📜 RESOLUÇÕES DO CONTRAN - ${contran.length} resoluções:
${contran.map((l: any) => `
• ${l.titulo}
${l.conteudo?.substring(0, 600)}${l.conteudo?.length > 600 ? '...' : ''}
`).join('\n')}

⚖️ JURISPRUDÊNCIA (STJ, STF, TJs) - ${jurisp.length} decisões:
${jurisp.map((l: any) => `
• ${l.titulo}
${l.conteudo}
`).join('\n')}
===

`;
    }

    // Preparar exemplos da base de conhecimento
    let exemplosConhecimento = '';
    if (recursosDeferidos && recursosDeferidos.length > 0) {
      exemplosConhecimento = `
=== RECURSOS DEFERIDOS ANTERIORES (USE COMO REFERÊNCIA) ===
Os seguintes recursos foram DEFERIDOS para a mesma infração. Use-os como inspiração para a argumentação:

${recursosDeferidos.map((r, i) => `
--- EXEMPLO ${i + 1} (DEFERIDO) ---
${r.argumentos_chave?.length > 0 ? `Argumentos-chave que funcionaram: ${r.argumentos_chave.join(', ')}` : ''}
${r.dados_extraidos_ia ? `Dados extraídos por IA: ${JSON.stringify(r.dados_extraidos_ia).substring(0, 500)}` : ''}
Trecho relevante: ${r.conteudo.substring(0, 1500)}...
`).join('\n')}
===

`;
    }

    // Preparar análise do AIT para o prompt
    let analiseAitTexto = '';
    if (analiseAit) {
      analiseAitTexto = `
=== ANÁLISE DO AUTO DE INFRAÇÃO (AIT) PELA IA ===
${analiseAit.erros_formais?.length > 0 ? `
🔴 ERROS FORMAIS DETECTADOS (USAR COMO ARGUMENTAÇÃO):
${analiseAit.erros_formais.map((e: string) => `• ${e}`).join('\n')}
` : ''}
${analiseAit.inconsistencias?.length > 0 ? `
⚠️ INCONSISTÊNCIAS ENCONTRADAS:
${analiseAit.inconsistencias.map((e: string) => `• ${e}`).join('\n')}
` : ''}
${analiseAit.observacoes_importantes?.length > 0 ? `
📌 OBSERVAÇÕES IMPORTANTES:
${analiseAit.observacoes_importantes.map((e: string) => `• ${e}`).join('\n')}
` : ''}
${analiseAit.resumo_analise ? `
📋 RESUMO DA ANÁLISE:
${analiseAit.resumo_analise}
` : ''}
===

`;
    }

    // Gerar o template base estruturado
    const templateBase = getTemplateBase(dados.tipoRecurso, dados, orgao);

    // Prompt para a IA gerar apenas a argumentação jurídica
    const prompt = `
${template?.prompt_ia || 'Você é um advogado especialista em direito de trânsito brasileiro, com vasta experiência em recursos administrativos.'}

Você deve CONTINUAR o recurso abaixo, adicionando a argumentação jurídica completa.

${legislacaoTexto}

${analiseAitTexto}

${exemplosConhecimento}

RECURSO JÁ ESTRUTURADO:
${templateBase}

DESCRIÇÃO DA SITUAÇÃO PELO CLIENTE:
${dados.descricaoSituacao || 'O recorrente discorda da autuação e solicita sua anulação.'}

FUNDAMENTOS LEGAIS DISPONÍVEIS:
${fundamentosText || 'Utilize os artigos do Código de Trânsito Brasileiro (CTB), resoluções do CONTRAN e jurisprudências aplicáveis conforme a base de legislação acima.'}

INFRAÇÃO EM QUESTÃO:
- Código: ${dados.codigoInfracao}
- Descrição: ${dados.descricaoInfracao}
- Gravidade: ${dados.gravidade}
- Valor: R$ ${dados.valorMulta.toFixed(2)}
- Pontos: ${dados.pontos}

TIPO DE RECURSO: ${dados.tipoRecurso === 'defesa_previa' ? 'Defesa Prévia' : dados.tipoRecurso === 'jari' ? 'Recurso à JARI (1ª Instância)' : 'Recurso ao CETRAN (2ª Instância)'}

${analiseAit ? `
🚨 IMPORTANTE - ANÁLISE DO AIT PELA IA:
Foi realizada uma análise automatizada do Auto de Infração anexado. USE OBRIGATORIAMENTE os erros formais e inconsistências detectados na sua argumentação! Estes são pontos fortes para o recurso.
` : ''}

${recursosDeferidos && recursosDeferidos.length > 0 
  ? `DICA: Utilize os argumentos que funcionaram nos recursos deferidos anteriores como base para sua argumentação.`
  : 'Não há recursos deferidos anteriores para esta infração - seja criativo e use as melhores práticas jurídicas.'}

${legislacaoBase && legislacaoBase.length > 0 
  ? `📚 IMPORTANTE: Utilize TODA a BASE DE LEGISLAÇÃO fornecida acima (CTB, Resoluções CONTRAN e JURISPRUDÊNCIA) para fundamentar juridicamente o recurso. Cite os artigos específicos, resoluções e decisões judiciais aplicáveis!`
  : ''}

Por favor, CONTINUE o recurso acima gerando em FORMATO HTML com formatação profissional:

IMPORTANTE - FORMATAÇÃO OBRIGATÓRIA:
- Use tags HTML: <p> para parágrafos, <strong> para negrito, <br> para quebras de linha
- TODOS os títulos de seção devem estar em <strong>NEGRITO</strong> (ex: <strong>1. DOS FATOS</strong>)
- Subtítulos também devem estar em <strong>negrito</strong> (ex: <strong>2.1. Do Vício Formal</strong>)
- Artigos de lei e referências legais devem estar em <strong>negrito</strong> (ex: <strong>Art. 280 do CTB</strong>)
- Citações de jurisprudência devem estar em <strong>negrito</strong> (ex: <strong>STJ no REsp 1.325.487</strong>)
- Cada parágrafo deve estar envolto em tags <p></p>
- Use <hr> para separadores visuais quando necessário

ESTRUTURA ESPERADA:

<p><strong>1. DOS FATOS</strong></p>
<p>Exposição detalhada dos fatos conforme descrição do cliente...</p>

<p><strong>2. DO DIREITO</strong></p>
<p><strong>2.1. [Subtítulo do argumento]</strong></p>
<p>Fundamentação jurídica robusta com:
   - Artigos do CTB aplicáveis (use a base de legislação fornecida!)
   - Resoluções do CONTRAN relevantes
   - Jurisprudências (se aplicável)
   - Argumentos técnicos sobre possíveis vícios formais ou materiais
   ${analiseAit ? '- ERROS FORMAIS DO AIT (use os erros detectados acima como argumentação central!)' : ''}</p>

<p><strong>3. DOS PEDIDOS</strong></p>
<p>Pedidos claros e específicos (anulação do auto, cancelamento da multa, restituição de pontos)...</p>

<p>Nestes termos, pede deferimento.</p>
<p>[Local], [Data].</p>
<p>__________________________________________<br>
<strong>${dados.nomeRecorrente}</strong><br>
Recorrente</p>

Use linguagem jurídica formal, persuasiva e técnica. Seja detalhista na fundamentação.
NÃO repita o cabeçalho - apenas continue de onde o template parou.
Gere o conteúdo em HTML válido e bem formatado.
`;

    console.log('Using Lovable AI Gateway');

    // Usar Lovable AI Gateway
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Gateway de IA não configurado. Entre em contato com o suporte.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um advogado especialista em direito de trânsito brasileiro, com mais de 15 anos de experiência em recursos administrativos. Sua argumentação é sempre técnica, bem fundamentada e persuasiva. Você conhece profundamente o CTB, resoluções do CONTRAN e jurisprudências dos tribunais.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Créditos insuficientes. Adicione créditos na sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao gerar recurso. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const argumentacao = aiData.choices?.[0]?.message?.content || '';

    if (!argumentacao) {
      return new Response(
        JSON.stringify({ success: false, error: 'IA não retornou conteúdo. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combinar template base + argumentação da IA
    const recursoCompleto = templateBase + argumentacao;

    console.log('Generation successful, content length:', recursoCompleto.length);

    return new Response(
      JSON.stringify({
        success: true,
        content: recursoCompleto,
        templateBase,
        argumentacao,
        orgao,
        fundamentos,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating recurso:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
