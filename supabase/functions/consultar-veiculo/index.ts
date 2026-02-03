import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CERTADOC_API_URL = 'https://dev-app-certadoc-api.azurewebsites.net';

// Cache de token para evitar autenticar a cada requisição
let cachedToken: { token: string; expiresAt: number } | null = null;

// Função para converter string para Base64
function toBase64(str: string): string {
  return btoa(str);
}

async function getCertaDocToken(): Promise<string> {
  // Verificar se existe token válido em cache (com margem de 5 min)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
    console.log('Usando token em cache');
    return cachedToken.token;
  }

  const email = Deno.env.get('CERTADOC_EMAIL');
  const password = Deno.env.get('CERTADOC_PASSWORD');

  if (!email || !password) {
    throw new Error('Credenciais CertaDoc não configuradas');
  }

  console.log('Autenticando na CertaDoc...');

  const response = await fetch(`${CERTADOC_API_URL}/api/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      EmailBase64: toBase64(email),
      PasswordBase64: toBase64(password),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro na autenticação CertaDoc:', response.status, errorText);
    throw new Error('Falha na autenticação CertaDoc');
  }

  const data = await response.json();
  const token = data.accessToken || data.token;

  if (!token) {
    console.error('Token não encontrado na resposta:', data);
    throw new Error('Token não retornado pela CertaDoc');
  }

  // Cache do token por 12 horas
  cachedToken = {
    token,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  };

  console.log('Token CertaDoc obtido com sucesso');
  return token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { placa, veiculo_id, organization_id, cliente_nome, cliente_documento, valor_cobrado } = await req.json();

    if (!placa || placa.length < 7) {
      return new Response(
        JSON.stringify({ success: false, error: 'Placa inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const placaNormalizada = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    console.log('Consultando veículo na CertaDoc:', placaNormalizada);

    // Obter token de autenticação
    const token = await getCertaDocToken();
    const emailParam = Deno.env.get('CERTADOC_EMAIL') || '';

    // 1. Consultar dados do veículo via POST /api/vendor/consultar-placa
    const consultaUrl = `${CERTADOC_API_URL}/api/vendor/consultar-placa?placa=${placaNormalizada}&email=${encodeURIComponent(emailParam)}`;
    console.log('Chamando consultar-placa...');
    
    let dadosVeiculoRaw: Record<string, unknown> = {};
    
    const consultaResponse = await fetch(consultaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (consultaResponse.ok) {
      const consultaData = await consultaResponse.json();
      console.log('Resposta consultar-placa:', JSON.stringify(consultaData).substring(0, 800));
      
      // A resposta pode vir em 'result' ou diretamente
      dadosVeiculoRaw = consultaData.result || consultaData;
    } else {
      const errText = await consultaResponse.text();
      console.error('Erro ao consultar placa:', consultaResponse.status, errText);
    }

    // 2. Buscar multas via GET /api/vendor/multa-por-placa
    const multasUrl = `${CERTADOC_API_URL}/api/vendor/multa-por-placa?placa=${placaNormalizada}&email=${encodeURIComponent(emailParam)}`;
    console.log('Chamando multa-por-placa...');
    
    let dadosMultas: unknown[] | Record<string, unknown> = [];
    
    const multasResponse = await fetch(multasUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (multasResponse.ok) {
      const multasData = await multasResponse.json();
      console.log('Resposta multa-por-placa:', JSON.stringify(multasData).substring(0, 500));
      
      // A API retorna array, pegar primeiro item se existir
      if (Array.isArray(multasData) && multasData.length > 0) {
        dadosMultas = multasData[0];
      } else {
        dadosMultas = multasData;
      }
    } else {
      console.error('Erro ao buscar multas:', multasResponse.status);
    }

    // Extrair dados estruturados
    const dadosVeiculo = dadosVeiculoRaw.dados_do_veiculo || dadosVeiculoRaw;
    const infoTecnicas = dadosVeiculoRaw.informacoes_tecnicas_e_adicionais || {};
    const restricoes = dadosVeiculoRaw.restricoes_e_impedimentos || {};

    // Montar resposta no formato esperado pelo AnimacaoRastreamento
    const result = {
      dados_do_veiculo: dadosVeiculo,
      informacoes_tecnicas_e_adicionais: infoTecnicas,
      restricoes_e_impedimentos: restricoes,
      multas: dadosMultas,
    };

    // Contar multas encontradas
    let multasCount = 0;
    if (dadosMultas && typeof dadosMultas === 'object' && !Array.isArray(dadosMultas)) {
      const m = dadosMultas as Record<string, unknown[]>;
      multasCount = (m.aPagar?.length || 0) + (m.notificacoes?.length || 0) + (m.pagas?.length || 0);
    }

    console.log('Modelo do veículo:', (dadosVeiculo as Record<string, unknown>)?.modelo || 'não encontrado');
    console.log('Chassi:', (dadosVeiculo as Record<string, unknown>)?.chassi || 'não encontrado');
    console.log('Total de multas encontradas:', multasCount);

    // Salvar no histórico de consultas se tiver veiculo_id e organization_id
    if (veiculo_id && organization_id) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const consultaRecord = {
          veiculo_id,
          organization_id,
          placa: placaNormalizada,
          multas_encontradas: multasCount,
          valor_cobrado: valor_cobrado || 0,
          status: 'sucesso',
          cliente_nome: cliente_nome || null,
          cliente_documento: cliente_documento || null,
          modelo_veiculo: (dadosVeiculo as Record<string, unknown>)?.modelo || null,
          ano_veiculo: (dadosVeiculo as Record<string, unknown>)?.anofabricacao || null,
          resposta_api: result,
        };

        const { error: insertError } = await supabase
          .from('consultas_rastreamento')
          .insert(consultaRecord);

        if (insertError) {
          console.error('Erro ao salvar histórico de consulta:', insertError);
        } else {
          console.log('✅ Consulta salva no histórico');
        }
      } catch (dbError) {
        console.error('Erro ao conectar ao banco:', dbError);
      }
    } else {
      console.log('⚠️ veiculo_id ou organization_id não fornecidos, consulta não será salva no histórico');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        multas_count: multasCount,
        source: 'certadoc'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao consultar veículo';
    console.error('Erro ao consultar veículo:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
