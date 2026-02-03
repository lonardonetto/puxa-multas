import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ExtrairAITRequest {
  imageBase64?: string;
  imageUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Chave de API não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ExtrairAITRequest = await req.json();
    const { imageBase64, imageUrl } = body;

    if (!imageBase64 && !imageUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Imagem não fornecida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extraindo dados do AIT via IA...');

    // Preparar a imagem para envio (formato base64 ou URL)
    const imageContent = imageBase64 
      ? { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      : { type: 'image_url', image_url: { url: imageUrl } };

    const prompt = `Você é um especialista em análise de documentos de trânsito brasileiro. Analise esta imagem de um Auto de Infração de Trânsito (AIT) e extraia TODOS os dados visíveis.

IMPORTANTE: Retorne APENAS um JSON válido, sem nenhum texto adicional, com a seguinte estrutura:

{
  "numero_auto": "número do auto de infração",
  "data_infracao": "YYYY-MM-DD",
  "hora_infracao": "HH:MM",
  "codigo_infracao": "código da infração (apenas números)",
  "descricao_infracao": "descrição completa da infração",
  "enquadramento": "artigo do CTB",
  "gravidade": "leve/média/grave/gravíssima",
  "pontos": número de pontos,
  "valor": valor da multa em número,
  "placa": "placa do veículo",
  "modelo": "modelo do veículo",
  "cor": "cor do veículo",
  "renavam": "número RENAVAM",
  "chassi": "número do chassi",
  "local_infracao": "endereço/local da infração",
  "municipio": "município",
  "uf": "UF",
  "orgao_autuador": "órgão responsável",
  "agente_autuador": "nome/matrícula do agente",
  "nome_proprietario": "nome do proprietário",
  "cpf_cnpj_proprietario": "CPF ou CNPJ",
  "endereco_proprietario": "endereço do proprietário",
  "cidade_proprietario": "cidade",
  "uf_proprietario": "UF",
  "cep_proprietario": "CEP",
  "observacoes": "qualquer irregularidade ou erro visível no preenchimento",
  "erros_detectados": ["lista de possíveis erros de preenchimento que podem ser usados no recurso"]
}

Se algum campo não estiver visível ou legível, use null. Seja extremamente preciso na leitura.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              imageContent
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Erro na API de IA:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Créditos insuficientes.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao processar imagem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    console.log('Resposta da IA:', content);

    // Tentar parsear o JSON da resposta
    let dadosExtraidos;
    try {
      // Remover possíveis marcadores de código markdown
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      dadosExtraidos = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError);
      // Tentar extrair JSON de dentro do texto
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          dadosExtraidos = JSON.parse(jsonMatch[0]);
        } catch {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Não foi possível extrair dados estruturados da imagem',
              rawContent: content 
            }),
            { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Não foi possível extrair dados estruturados da imagem',
            rawContent: content 
          }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Dados extraídos com sucesso:', dadosExtraidos);

    return new Response(
      JSON.stringify({
        success: true,
        dados: dadosExtraidos,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao extrair AIT:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
