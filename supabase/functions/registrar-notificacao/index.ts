import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userId = claimsData.claims.sub as string;

    // Parse body
    const body = await req.json();
    const { contrato_id, cliente_id, organization_id, cliente_nome, cliente_telefone, auto_infracao, status_recurso, mensagem_enviada, confirmacao_usuario } = body;

    if (!contrato_id || !organization_id || !cliente_nome || !confirmacao_usuario) {
      return new Response(JSON.stringify({ error: 'Dados obrigatórios faltando' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Buscar dados do usuário via service role (imutável)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: userData } = await supabaseAdmin.from('users').select('nome, email').eq('id', userId).single();

    // Gerar horário de Brasília
    const horarioBrasilia = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // Capturar IP
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'N/A';
    const userAgent = req.headers.get('user-agent') || 'N/A';

    // Gerar hash de integridade (SHA-256 dos dados críticos)
    const dadosCriticos = `${userId}|${contrato_id}|${cliente_nome}|${horarioBrasilia}|${confirmacao_usuario}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dadosCriticos));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashIntegridade = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Inserir registro via service role (imutável - sem UPDATE/DELETE policy)
    const { data: registro, error: insertError } = await supabaseAdmin.from('registro_notificacoes').insert({
      contrato_id,
      cliente_id: cliente_id || null,
      organization_id,
      usuario_id: userId,
      usuario_nome: userData?.nome || 'Desconhecido',
      usuario_email: userData?.email || claimsData.claims.email || '',
      cliente_nome,
      cliente_telefone: cliente_telefone || null,
      auto_infracao: auto_infracao || null,
      status_recurso: status_recurso || null,
      mensagem_enviada: mensagem_enviada || null,
      confirmacao_usuario,
      ip_address: ipAddress,
      user_agent: userAgent,
      hash_integridade: hashIntegridade,
      horario_brasilia: horarioBrasilia,
    }).select().single();

    if (insertError) {
      console.error('Erro ao inserir registro:', insertError);
      return new Response(JSON.stringify({ error: 'Erro ao registrar notificação' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Atualizar contrato (próximo lembrete) via service role
    const intervalo = body.intervalo || 7;
    const agoraBrasilia = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const proximoLembrete = new Date(agoraBrasilia.getTime() + intervalo * 24 * 60 * 60 * 1000);

    await supabaseAdmin.from('contratos').update({
      data_ultima_notificacao: new Date().toISOString(),
      data_proximo_lembrete: proximoLembrete.toISOString(),
    }).eq('id', contrato_id);

    return new Response(JSON.stringify({ 
      success: true, 
      registro_id: registro.id,
      hash: hashIntegridade,
      horario: horarioBrasilia 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    console.error('Erro geral:', err);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
