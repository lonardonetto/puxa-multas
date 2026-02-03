import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileType } = await req.json();
    
    if (!fileUrl) {
      return new Response(
        JSON.stringify({ error: "URL do arquivo é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Determinar o prompt baseado no tipo de arquivo
    let systemPrompt = "";
    if (fileType === "ait") {
      systemPrompt = `Você é um especialista em análise de Autos de Infração de Trânsito (AIT).
Analise a imagem do AIT e extraia as seguintes informações em formato estruturado:
- Número do Auto de Infração
- Código da Infração
- Descrição da Infração
- Data da Infração
- Hora da Infração
- Local da Infração
- Placa do Veículo
- Órgão Autuador
- Agente Autuador
- Valor da Multa
- Pontos
- Erros formais identificados (lista de possíveis irregularidades no preenchimento)

Seja preciso e identifique todos os erros formais que possam ser usados como argumentação em um recurso.`;
    } else {
      systemPrompt = `Você é um especialista em análise de decisões de recursos de trânsito.
Analise o documento de deferimento/indeferimento e extraia:
- Tipo de decisão (Deferido/Indeferido)
- Número do Processo
- Código da Infração
- Órgão Julgador
- Data da Decisão
- Argumentos aceitos pelo órgão (lista)
- Fundamentação legal utilizada
- Pontos-chave da decisão
- Resumo da argumentação vencedora

Identifique os principais argumentos que levaram ao deferimento para que possam ser replicados em outros recursos similares.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise este documento e extraia as informações solicitadas. Retorne em formato JSON estruturado.`
              },
              {
                type: "image_url",
                image_url: { url: fileUrl }
              }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Erro na API:", response.status, errorText);
      throw new Error(`Erro na análise: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Tentar extrair JSON da resposta
    let dadosExtraidos = {};
    try {
      // Procurar por JSON na resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        dadosExtraidos = JSON.parse(jsonMatch[0]);
      } else {
        dadosExtraidos = { texto_bruto: content };
      }
    } catch {
      dadosExtraidos = { texto_bruto: content };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        dados: dadosExtraidos,
        texto_completo: content 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
