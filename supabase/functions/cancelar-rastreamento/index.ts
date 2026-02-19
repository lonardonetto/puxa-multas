import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CERTADOC_API_URL = 'https://dev-app-certadoc-api.azurewebsites.net';

// Cache de token
let cachedToken: { token: string; expiresAt: number } | null = null;

function toBase64(str: string): string {
  return btoa(str);
}

async function getCertaDocToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
    return cachedToken.token;
  }

  const email = Deno.env.get('CERTADOC_EMAIL');
  const password = Deno.env.get('CERTADOC_PASSWORD');

  if (!email || !password) {
    throw new Error('Credenciais CertaDoc não configuradas');
  }

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
  const token = data.token || data.Token || data.access_token;

  if (!token) {
    throw new Error('Token não encontrado na resposta');
  }

  cachedToken = {
    token,
    expiresAt: Date.now() + 3600000,
  };

  return token;
}

interface CancelamentoRequest {
  veiculo_id: string;
  placa: string;
  motivo?: 'vencido' | 'excluido' | 'manual';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const certadocEmail = Deno.env.get('CERTADOC_EMAIL')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { veiculo_id, placa, motivo = 'manual' }: CancelamentoRequest = await req.json();

    console.log(`[CANCELAMENTO] Iniciando cancelamento para veículo ${placa} (ID: ${veiculo_id}). Motivo: ${motivo}`);

    // 1. Buscar dados do veículo
    const { data: veiculo, error: veiculoError } = await supabase
      .from('veiculos')
      .select(`
        id,
        placa,
        rastreamento_ativo,
        rastreamento_tipo,
        rastreamento_vencimento,
        cliente_id,
        clientes!inner (
          id,
          nome_completo,
          email,
          organization_id
        )
      `)
      .eq('id', veiculo_id)
      .single();

    if (veiculoError || !veiculo) {
      console.error('[CANCELAMENTO] Veículo não encontrado:', veiculoError);
      return new Response(
        JSON.stringify({ success: false, error: 'Veículo não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Chamar API CertaDoc para desativar placa
    let certadocDesativado = false;
    try {
      const token = await getCertaDocToken();
      const placaNormalizada = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      console.log(`[CANCELAMENTO] Chamando CertaDoc desativar-placa-consultada para ${placaNormalizada}`);
      
      const certadocResponse = await fetch(
        `${CERTADOC_API_URL}/api/vendor/desativar-placa-consultada?placa=${encodeURIComponent(placaNormalizada)}&email=${encodeURIComponent(certadocEmail)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!certadocResponse.ok) {
        const errorText = await certadocResponse.text();
        console.error('[CANCELAMENTO] Erro na API CertaDoc:', certadocResponse.status, errorText);
      } else {
        const resultText = await certadocResponse.text();
        console.log('[CANCELAMENTO] CertaDoc desativação OK:', resultText);
        certadocDesativado = true;
      }
    } catch (apiError) {
      console.error('[CANCELAMENTO] Falha ao chamar CertaDoc:', apiError);
      // Continua mesmo se a API externa falhar
    }

    // 3. Atualizar veículo no banco de dados
    const { error: updateError } = await supabase
      .from('veiculos')
      .update({
        rastreamento_ativo: false,
        rastreamento_vencimento: null,
        rastreamento_notificado: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', veiculo_id);

    if (updateError) {
      console.error('[CANCELAMENTO] Erro ao atualizar veículo:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao atualizar veículo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Registrar no histórico de atividades
    const cliente = veiculo.clientes as any;
    await supabase
      .from('historico_atividades')
      .insert({
        cliente_id: cliente.id,
        organization_id: cliente.organization_id,
        tipo: 'rastreamento_cancelado',
        descricao: `Rastreamento cancelado para veículo ${placa}. Motivo: ${motivo}`,
        metadata: {
          veiculo_id,
          placa,
          motivo,
          tipo_anterior: veiculo.rastreamento_tipo,
          vencimento_anterior: veiculo.rastreamento_vencimento,
          certadoc_desativado: certadocDesativado,
        },
      });

    console.log(`[CANCELAMENTO] Rastreamento cancelado com sucesso para ${placa} (CertaDoc: ${certadocDesativado ? 'OK' : 'FALHOU'})`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Rastreamento cancelado para ${placa}`,
        veiculo_id,
        placa,
        motivo,
        certadoc_desativado: certadocDesativado,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[CANCELAMENTO] Erro inesperado:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
