import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GenerateRequest {
  orgao_id: string;
  tipo_recurso: 'defesa_previa' | 'jari' | 'cetran';
  codigo_infracao?: string;
  dados_cliente: {
    nome: string;
    cpf: string;
    endereco?: string;
  };
  dados_infracao: {
    auto_infracao: string;
    data_infracao?: string;
    local?: string;
    descricao_fatos: string;
    placa?: string;
    modelo_veiculo?: string;
  };
}

async function getAiApiKey(supabase: any): Promise<{ provider: string; apiKey: string } | null> {
  // Get AI provider setting
  const { data: providerSetting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'ai_provider')
    .single();

  const provider = providerSetting?.value || 'google';

  // Get corresponding API key
  let keyName = '';
  switch (provider) {
    case 'google':
      keyName = 'google_ai_api_key';
      break;
    case 'openai':
      keyName = 'openai_api_key';
      break;
    case 'anthropic':
      keyName = 'anthropic_api_key';
      break;
    default:
      keyName = 'google_ai_api_key';
  }

  const { data: keySetting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', keyName)
    .single();

  if (!keySetting?.value) {
    return null;
  }

  return { provider, apiKey: keySetting.value };
}

async function generateWithGoogle(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Google AI error:', error);
    throw new Error(`Google AI error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function generateWithOpenAI(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um advogado especialista em direito de trânsito brasileiro.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI error:', error);
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function generateWithAnthropic(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic error:', error);
    throw new Error(`Anthropic error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: GenerateRequest = await req.json();
    const { orgao_id, tipo_recurso, codigo_infracao, dados_cliente, dados_infracao } = body;

    console.log('Generating recurso for orgao:', orgao_id, 'tipo:', tipo_recurso);

    // Get AI configuration
    const aiConfig = await getAiApiKey(supabase);
    if (!aiConfig) {
      return new Response(
        JSON.stringify({ success: false, error: 'API Key de IA não configurada. Configure em Super Admin > Configurações.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get orgao data
    const { data: orgao, error: orgaoError } = await supabase
      .from('orgaos_transito')
      .select('*')
      .eq('id', orgao_id)
      .single();

    if (orgaoError || !orgao) {
      return new Response(
        JSON.stringify({ success: false, error: 'Órgão não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get template
    let templateQuery = supabase
      .from('templates_recursos')
      .select('*')
      .eq('orgao_id', orgao_id)
      .eq('tipo_recurso', tipo_recurso)
      .eq('ativo', true);

    if (codigo_infracao) {
      templateQuery = templateQuery.or(`codigo_infracao.eq.${codigo_infracao},codigo_infracao.is.null`);
    } else {
      templateQuery = templateQuery.is('codigo_infracao', null);
    }

    const { data: templates } = await templateQuery.order('codigo_infracao', { ascending: false, nullsFirst: false }).limit(1);
    const template = templates?.[0];

    // Get fundamentos legais
    const { data: fundamentos } = await supabase
      .from('fundamentos_legais')
      .select('*')
      .eq('orgao_id', orgao_id)
      .eq('tipo_recurso', tipo_recurso)
      .eq('ativo', true)
      .order('ordem');

    // Build prompt
    const fundamentosText = fundamentos?.map(f => `${f.titulo}:\n${f.conteudo}`).join('\n\n') || '';

    const prompt = `
${template?.prompt_ia || 'Você é um advogado especialista em direito de trânsito brasileiro. Gere uma defesa/recurso completo e fundamentado.'}

DADOS DO ÓRGÃO:
- Nome: ${orgao.nome}
- Estado: ${orgao.estado} (${orgao.sigla_estado})
- Tipo: ${orgao.tipo.toUpperCase()}

DADOS DO CLIENTE:
- Nome: ${dados_cliente.nome}
- CPF: ${dados_cliente.cpf}
${dados_cliente.endereco ? `- Endereço: ${dados_cliente.endereco}` : ''}

DADOS DA INFRAÇÃO:
- Auto de Infração: ${dados_infracao.auto_infracao}
${dados_infracao.data_infracao ? `- Data: ${dados_infracao.data_infracao}` : ''}
${dados_infracao.local ? `- Local: ${dados_infracao.local}` : ''}
${dados_infracao.placa ? `- Placa: ${dados_infracao.placa}` : ''}
${dados_infracao.modelo_veiculo ? `- Veículo: ${dados_infracao.modelo_veiculo}` : ''}
${codigo_infracao ? `- Código da Infração: ${codigo_infracao}` : ''}

DESCRIÇÃO DOS FATOS:
${dados_infracao.descricao_fatos}

FUNDAMENTOS LEGAIS DISPONÍVEIS:
${fundamentosText}

TIPO DE RECURSO: ${tipo_recurso.replace('_', ' ').toUpperCase()}

Por favor, gere um ${tipo_recurso === 'defesa_previa' ? 'recurso de Defesa Prévia' : tipo_recurso === 'jari' ? 'recurso para JARI' : 'recurso para CETRAN'} completo, com:
1. Cabeçalho formal adequado ao órgão
2. Qualificação completa do recorrente
3. Exposição detalhada dos fatos
4. Fundamentação jurídica robusta (cite artigos do CTB, resoluções do CONTRAN, jurisprudências)
5. Pedidos claros e específicos
6. Fechamento formal

Use linguagem jurídica formal e persuasiva.
`;

    console.log('Using AI provider:', aiConfig.provider);

    let generatedContent = '';
    switch (aiConfig.provider) {
      case 'google':
        generatedContent = await generateWithGoogle(aiConfig.apiKey, prompt);
        break;
      case 'openai':
        generatedContent = await generateWithOpenAI(aiConfig.apiKey, prompt);
        break;
      case 'anthropic':
        generatedContent = await generateWithAnthropic(aiConfig.apiKey, prompt);
        break;
      default:
        generatedContent = await generateWithGoogle(aiConfig.apiKey, prompt);
    }

    console.log('Generation successful, content length:', generatedContent.length);

    return new Response(
      JSON.stringify({
        success: true,
        content: generatedContent,
        orgao,
        template,
        fundamentos,
        provider: aiConfig.provider,
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
