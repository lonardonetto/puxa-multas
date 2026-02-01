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
  
  // Dados do DETRAN
  detranId?: string | null;
  detranNome?: string | null;
  estadoDetran?: string | null;
}

interface GenerateRequest {
  dados: DadosRecurso;
  organizationId: string;
}

// Template base estruturado para o recurso
function getTemplateBase(tipo: string, dados: DadosRecurso, orgao: any): string {
  const tipoFormatado = tipo === 'defesa_previa' ? 'DEFESA PRÉVIA' : 
                        tipo === 'jari' ? 'RECURSO À JARI' : 
                        'RECURSO AO CETRAN';
  
  const destinatario = tipo === 'defesa_previa' ? 'À AUTORIDADE DE TRÂNSITO' :
                       tipo === 'jari' ? 'EXCELENTÍSSIMO(A) SENHOR(A) PRESIDENTE DA JUNTA ADMINISTRATIVA DE RECURSOS DE INFRAÇÕES' :
                       'EXCELENTÍSSIMO(A) SENHOR(A) PRESIDENTE DO CONSELHO ESTADUAL DE TRÂNSITO';

  const dataFormatada = dados.dataInfracao ? new Date(dados.dataInfracao).toLocaleDateString('pt-BR') : '[DATA]';
  
  return `
${tipoFormatado}

${destinatario}
${orgao?.nome || dados.detranNome || 'DETRAN'}
${orgao?.estado || dados.estadoDetran || ''}

RECORRENTE: ${dados.nomeRecorrente}
CPF/CNPJ: ${dados.cpfCnpj}
${dados.endereco ? `ENDEREÇO: ${dados.endereco}${dados.cidade ? `, ${dados.cidade}` : ''}${dados.estado ? ` - ${dados.estado}` : ''}${dados.cep ? ` CEP: ${dados.cep}` : ''}` : ''}
${dados.telefone ? `TELEFONE: ${dados.telefone}` : ''}
${dados.email ? `E-MAIL: ${dados.email}` : ''}

VEÍCULO: ${dados.modelo || ''} - Placa ${dados.placa}
${dados.renavam ? `RENAVAM: ${dados.renavam}` : ''}

AUTO DE INFRAÇÃO Nº: ${dados.numeroAuto}
DATA DA INFRAÇÃO: ${dataFormatada}${dados.horaInfracao ? ` às ${dados.horaInfracao}` : ''}
${dados.localInfracao ? `LOCAL: ${dados.localInfracao}` : ''}

CÓDIGO DA INFRAÇÃO: ${dados.codigoInfracao}
DESCRIÇÃO: ${dados.descricaoInfracao}
VALOR DA MULTA: R$ ${dados.valorMulta.toFixed(2)}
PONTUAÇÃO: ${dados.pontos} pontos
GRAVIDADE: ${dados.gravidade}

---

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

    const template = templates?.[0];
    const fundamentosText = fundamentos?.map(f => `• ${f.titulo}: ${f.conteudo}`).join('\n\n') || '';

    // Gerar o template base estruturado
    const templateBase = getTemplateBase(dados.tipoRecurso, dados, orgao);

    // Prompt para a IA gerar apenas a argumentação jurídica
    const prompt = `
${template?.prompt_ia || 'Você é um advogado especialista em direito de trânsito brasileiro, com vasta experiência em recursos administrativos.'}

Você deve CONTINUAR o recurso abaixo, adicionando a argumentação jurídica completa.

RECURSO JÁ ESTRUTURADO:
${templateBase}

DESCRIÇÃO DA SITUAÇÃO PELO CLIENTE:
${dados.descricaoSituacao || 'O recorrente discorda da autuação e solicita sua anulação.'}

FUNDAMENTOS LEGAIS DISPONÍVEIS:
${fundamentosText || 'Utilize os artigos do Código de Trânsito Brasileiro (CTB), resoluções do CONTRAN e jurisprudências aplicáveis.'}

INFRAÇÃO EM QUESTÃO:
- Código: ${dados.codigoInfracao}
- Descrição: ${dados.descricaoInfracao}
- Gravidade: ${dados.gravidade}
- Valor: R$ ${dados.valorMulta.toFixed(2)}
- Pontos: ${dados.pontos}

TIPO DE RECURSO: ${dados.tipoRecurso === 'defesa_previa' ? 'Defesa Prévia' : dados.tipoRecurso === 'jari' ? 'Recurso à JARI (1ª Instância)' : 'Recurso ao CETRAN (2ª Instância)'}

Por favor, CONTINUE o recurso acima gerando:

1. **DOS FATOS** - Exposição detalhada dos fatos conforme descrição do cliente
2. **DO DIREITO** - Fundamentação jurídica robusta com:
   - Artigos do CTB aplicáveis
   - Resoluções do CONTRAN relevantes
   - Jurisprudências (se aplicável)
   - Argumentos técnicos sobre possíveis vícios formais ou materiais
3. **DOS PEDIDOS** - Pedidos claros e específicos (anulação do auto, cancelamento da multa, restituição de pontos)
4. **FECHAMENTO** - Fechamento formal com "Nestes termos, pede deferimento" e espaço para assinatura

Use linguagem jurídica formal, persuasiva e técnica. Seja detalhista na fundamentação.
NÃO repita o cabeçalho - apenas continue de onde o template parou.
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
