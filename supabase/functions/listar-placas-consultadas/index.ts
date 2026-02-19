import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CERTADOC_API_URL = 'https://dev-app-certadoc-api.azurewebsites.net';

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

  cachedToken = { token, expiresAt: Date.now() + 3600000 };
  return token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const certadocEmail = Deno.env.get('CERTADOC_EMAIL');
    if (!certadocEmail) {
      throw new Error('CERTADOC_EMAIL não configurado');
    }

    const token = await getCertaDocToken();

    console.log('[LISTAGEM] Buscando placas consultadas na CertaDoc...');

    const response = await fetch(
      `${CERTADOC_API_URL}/api/vendor/lisagem-placas-consultadas?email=${encodeURIComponent(certadocEmail)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LISTAGEM] Erro na API CertaDoc:', response.status, errorText);
      throw new Error(`Erro ao consultar CertaDoc: ${response.status}`);
    }

    const data = await response.json();
    console.log('[LISTAGEM] Placas retornadas:', Array.isArray(data) ? data.length : 'N/A');

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[LISTAGEM] Erro:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
