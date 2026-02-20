import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function calcularExpiracao(ciclo: string): string {
  const agora = new Date();
  if (ciclo === 'anual') {
    agora.setFullYear(agora.getFullYear() + 1);
  } else {
    agora.setMonth(agora.getMonth() + 1);
  }
  return agora.toISOString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    console.log('InfinitePay Webhook received:', JSON.stringify(body));

    const { order_nsu, transaction_nsu, capture_method } = body;

    if (!order_nsu) {
      return new Response(JSON.stringify({ success: false, message: 'order_nsu ausente' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Extrair solicitacao_id dos items do body (salvo na descrição) ou do campo direto
    const solicitacaoIdFromItems = (() => {
      try {
        // Tenta extrair o ID da solicitação que foi embutido na descrição do item pelo checkout
        const items = body.items || [];
        for (const item of items) {
          const match = (item.description || '').match(/sol:([a-f0-9-]{36})/i);
          if (match) return match[1];
        }
      } catch (_) {}
      return null;
    })();

    // ── Buscar solicitação de recarga: primeiro por solicitacao_id, depois por order_nsu no payload_pix
    let recargaSol: any = null;

    if (solicitacaoIdFromItems) {
      const { data } = await supabase
        .from('solicitacoes_recarga' as any)
        .select('*')
        .eq('id', solicitacaoIdFromItems)
        .eq('status', 'pendente')
        .limit(1);
      recargaSol = data?.[0] || null;
    }

    if (!recargaSol) {
      // Fallback: buscar pelo order_nsu no campo payload_pix ou observacao
      const { data } = await supabase
        .from('solicitacoes_recarga' as any)
        .select('*')
        .or(`payload_pix.like.%${order_nsu}%,observacao.like.%${order_nsu}%`)
        .eq('status', 'pendente')
        .limit(1);
      recargaSol = data?.[0] || null;
    }

    if (!recargaSol) {
      // Último fallback: buscar por metodo_pagamento=cartao_infinitepay e status pendente mais recente
      const { data } = await supabase
        .from('solicitacoes_recarga' as any)
        .select('*')
        .eq('metodo_pagamento', 'credit_card')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false })
        .limit(1);
      recargaSol = data?.[0] || null;
    }

    if (recargaSol) {
      const sol = recargaSol;

      const { data: orgData } = await supabase
        .from('organizations')
        .select('saldo_sacavel')
        .eq('id', sol.organization_id)
        .single();

      const saldoAtual = (orgData as any)?.saldo_sacavel || 0;
      await supabase
        .from('organizations')
        .update({ saldo_sacavel: saldoAtual + sol.valor })
        .eq('id', sol.organization_id);

      await supabase.from('faturamento' as any).insert({
        organization_id: sol.organization_id,
        descricao: `Recarga InfinitePay aprovada via webhook — ${capture_method || 'auto'}`,
        valor: sol.valor,
        status: 'paid',
        tipo: 'credit_purchase',
        metodo_pagamento: capture_method === 'pix' ? 'pix' : 'credit_card',
        data_pagamento: new Date().toISOString().split('T')[0],
      });

      await supabase
        .from('solicitacoes_recarga' as any)
        .update({
          status: 'aprovado',
          aprovado_em: new Date().toISOString(),
          observacao: `Aprovado via webhook InfinitePay — order_nsu: ${order_nsu} | transaction_nsu: ${transaction_nsu}`,
        })
        .eq('id', sol.id);

      await supabase.from('notificacoes_recarga' as any).insert({
        organization_id: sol.organization_id,
        solicitacao_id: sol.id,
        tipo: 'pix_aprovado',
        titulo: 'Recarga aprovada automaticamente! 🎉',
        mensagem: `R$ ${Number(sol.valor).toFixed(2).replace('.', ',')} disponível na sua conta.`,
        valor: sol.valor,
        para_super_admin: false,
      });

      console.log(`Recarga ${sol.id} aprovada via webhook`);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Buscar solicitação de plano
    let planoBusca: any[] = [];

    if (solicitacaoIdFromItems) {
      const { data } = await supabase
        .from('solicitacoes_plano' as any)
        .select('*')
        .eq('id', solicitacaoIdFromItems)
        .eq('status', 'pendente')
        .limit(1);
      planoBusca = data || [];
    }

    if (!planoBusca.length) {
      const { data } = await supabase
        .from('solicitacoes_plano' as any)
        .select('*')
        .or(`observacao.like.%${order_nsu}%`)
        .eq('status', 'pendente')
        .limit(1);
      planoBusca = data || [];
    }

    if (!planoBusca.length) {
      const { data } = await supabase
        .from('solicitacoes_plano' as any)
        .select('*')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false })
        .limit(1);
      planoBusca = data || [];
    }

    const planos = planoBusca;

    if (planos && planos.length > 0) {
      const sol = planos[0] as any;
      const expiracao = calcularExpiracao(sol.ciclo || 'mensal');

      await supabase
        .from('organizations')
        .update({
          plano: sol.plano_slug,
          plan: sol.plano_slug,
          plano_expiracao_em: expiracao,
          plano_ciclo: sol.ciclo || 'mensal',
        } as any)
        .eq('id', sol.organization_id);

      await supabase.from('faturamento' as any).insert({
        organization_id: sol.organization_id,
        descricao: `Plano ${sol.plano_nome} (${sol.ciclo}) via webhook InfinitePay`,
        valor: sol.valor,
        status: 'paid',
        tipo: 'subscription',
        metodo_pagamento: capture_method === 'pix' ? 'pix' : 'credit_card',
        data_pagamento: new Date().toISOString().split('T')[0],
      });

      await supabase
        .from('solicitacoes_plano' as any)
        .update({
          status: 'aprovado',
          aprovado_em: new Date().toISOString(),
          observacao: `Aprovado via webhook InfinitePay — order_nsu: ${order_nsu}`,
        })
        .eq('id', sol.id);

      await supabase.from('notificacoes_recarga' as any).insert({
        organization_id: sol.organization_id,
        solicitacao_id: sol.id,
        tipo: 'plano_aprovado',
        titulo: `Plano ${sol.plano_nome} ativado! 🎉`,
        mensagem: `Seu plano foi ativado automaticamente. Válido até ${new Date(expiracao).toLocaleDateString('pt-BR')}.`,
        valor: sol.valor,
        para_super_admin: false,
      });

      console.log(`Plano ${sol.id} aprovado via webhook`);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.warn(`Nenhuma solicitação pendente encontrada para order_nsu: ${order_nsu}`);
    return new Response(JSON.stringify({ success: false, message: 'Pedido não encontrado' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ success: false, message: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
