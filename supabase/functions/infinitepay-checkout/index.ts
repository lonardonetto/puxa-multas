import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calcula a data de expiração do plano baseado no ciclo
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
    const { action } = body;

    // ─── GERAR LINK DE CHECKOUT ─────────────────────────────────────────────
    if (action === 'create_link') {
      const { valor, descricao, order_nsu, redirect_url } = body;

      const { data: tagSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'infinitepay_tag')
        .single();

      const handle = tagSetting?.value;
      if (!handle) {
        return new Response(JSON.stringify({ error: 'InfiniteTag não configurada no sistema.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const finalOrderNsu = order_nsu || `CDM${Date.now().toString(36).toUpperCase()}`;
      const amountInCents = Math.round(Number(valor) * 100);

      const baseUrl = Deno.env.get('VITE_APP_URL') || 'https://app.centraldamulta.app.br';
      const solId = body.solicitacao_id || '';
      const tipo = body.tipo || 'recarga';
      const returnUrl = `${baseUrl}/pagamento-confirmado?order_nsu=${finalOrderNsu}&sol_id=${solId}&tipo=${tipo}`;

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const webhookUrl = `${supabaseUrl}/functions/v1/infinitepay-webhook`;

      const payload: Record<string, unknown> = {
        handle,
        order_nsu: finalOrderNsu,
        redirect_url: redirect_url || returnUrl,
        webhook_url: webhookUrl,
        items: [
          {
            description: descricao || 'Pagamento Central da Multa',
            price: amountInCents,
            quantity: 1,
          },
        ],
      };

      const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('InfinitePay error:', data);
        return new Response(JSON.stringify({ error: 'Erro ao gerar link InfinitePay', details: data }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, link: data.url || data.checkout_url || data.link, order_nsu: finalOrderNsu, raw: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── VERIFICAR STATUS DO PAGAMENTO ──────────────────────────────────────
    if (action === 'check_payment') {
      const { order_nsu, transaction_nsu } = body;

      const { data: tagSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'infinitepay_tag')
        .single();

      const handle = tagSetting?.value;
      if (!handle) {
        return new Response(JSON.stringify({ error: 'InfiniteTag não configurada.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const response = await fetch('https://api.infinitepay.io/invoices/public/checkout/payment_check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, order_nsu, transaction_nsu }),
      });

      const data = await response.json();
      const paid = data.status === 'paid' || data.status === 'approved';

      return new Response(JSON.stringify({ success: true, status: data.status, paid, raw: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── VERIFICAR + APROVAR AUTOMATICAMENTE ────────────────────────────────
    if (action === 'check_and_approve') {
      const { order_nsu, solicitacao_id, tipo } = body;

      const { data: tagSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'infinitepay_tag')
        .single();

      const handle = tagSetting?.value;
      if (!handle) {
        return new Response(JSON.stringify({ error: 'InfiniteTag não configurada.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 1. Verificar status na InfinitePay
      const ipRes = await fetch('https://api.infinitepay.io/invoices/public/checkout/payment_check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, order_nsu }),
      });

      const ipData = await ipRes.json();
      const paid = ipData.status === 'paid' || ipData.status === 'approved';

      if (!paid) {
        return new Response(JSON.stringify({ success: true, paid: false, status: ipData.status }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 2. Pagamento confirmado → processar aprovação automática
      if (tipo === 'recarga') {
        const { data: sol } = await supabase
          .from('solicitacoes_recarga' as any)
          .select('*')
          .eq('id', solicitacao_id)
          .eq('status', 'pendente')
          .single();

        if (sol) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('saldo_sacavel')
            .eq('id', (sol as any).organization_id)
            .single();

          const saldoAtual = (orgData as any)?.saldo_sacavel || 0;
          const novoSaldo = saldoAtual + (sol as any).valor;

          await supabase
            .from('organizations')
            .update({ saldo_sacavel: novoSaldo })
            .eq('id', (sol as any).organization_id);

          await supabase.from('faturamento' as any).insert({
            organization_id: (sol as any).organization_id,
            descricao: `Recarga via InfinitePay aprovada automaticamente — R$ ${Number((sol as any).valor).toFixed(2)}`,
            valor: (sol as any).valor,
            status: 'paid',
            tipo: 'credit_purchase',
            metodo_pagamento: 'cartao_infinitepay',
            data_pagamento: new Date().toISOString().split('T')[0],
          });

          await supabase
            .from('solicitacoes_recarga' as any)
            .update({
              status: 'aprovado',
              aprovado_em: new Date().toISOString(),
              observacao: `Aprovado automaticamente via InfinitePay — order_nsu: ${order_nsu}`,
            })
            .eq('id', solicitacao_id);

          await supabase.from('notificacoes_recarga' as any).insert({
            organization_id: (sol as any).organization_id,
            solicitacao_id: solicitacao_id,
            tipo: 'pix_aprovado',
            titulo: 'Recarga aprovada automaticamente! 🎉',
            mensagem: `R$ ${Number((sol as any).valor).toFixed(2).replace('.', ',')} disponível na sua conta.`,
            valor: (sol as any).valor,
            para_super_admin: false,
          });
        }
      } else if (tipo === 'plano') {
        const { data: sol } = await supabase
          .from('solicitacoes_plano' as any)
          .select('*')
          .eq('id', solicitacao_id)
          .eq('status', 'pendente')
          .single();

        if (sol) {
          const expiracao = calcularExpiracao((sol as any).ciclo);

          await supabase
            .from('organizations')
            .update({
              plano: (sol as any).plano_slug,
              plan: (sol as any).plano_slug,
              plano_expiracao_em: expiracao,
              plano_ciclo: (sol as any).ciclo,
            } as any)
            .eq('id', (sol as any).organization_id);

          await supabase.from('faturamento' as any).insert({
            organization_id: (sol as any).organization_id,
            descricao: `Assinatura plano ${(sol as any).plano_nome} (${(sol as any).ciclo}) via InfinitePay — aprovado automaticamente`,
            valor: (sol as any).valor,
            status: 'paid',
            tipo: 'subscription',
            metodo_pagamento: 'cartao_infinitepay',
            data_pagamento: new Date().toISOString().split('T')[0],
          });

          await supabase
            .from('solicitacoes_plano' as any)
            .update({
              status: 'aprovado',
              aprovado_em: new Date().toISOString(),
              observacao: `Aprovado automaticamente via InfinitePay — order_nsu: ${order_nsu}`,
            })
            .eq('id', solicitacao_id);

          await supabase.from('notificacoes_recarga' as any).insert({
            organization_id: (sol as any).organization_id,
            solicitacao_id: solicitacao_id,
            tipo: 'plano_aprovado',
            titulo: `Plano ${(sol as any).plano_nome} ativado! 🎉`,
            mensagem: `Seu plano foi ativado automaticamente. Válido até ${new Date(expiracao).toLocaleDateString('pt-BR')}.`,
            valor: (sol as any).valor,
            para_super_admin: false,
          });
        }
      }

      return new Response(JSON.stringify({ success: true, paid: true, approved: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── PAGAR PLANO COM CRÉDITOS INTERNOS ───────────────────────────────────
    if (action === 'pagar_plano_creditos') {
      const { organization_id, plano_id, plano_slug, plano_nome, ciclo, valor, user_id } = body;

      // Buscar saldo atual
      const { data: org } = await supabase
        .from('organizations')
        .select('saldo_sacavel, saldo_bonus')
        .eq('id', organization_id)
        .single();

      const saldoTotal = ((org as any)?.saldo_sacavel || 0) + ((org as any)?.saldo_bonus || 0);

      if (saldoTotal < valor) {
        return new Response(JSON.stringify({ error: 'Saldo insuficiente para contratar o plano.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const expiracao = calcularExpiracao(ciclo);

      // Debitar do saldo sacável primeiro, depois do bônus
      let novoSacavel = (org as any)?.saldo_sacavel || 0;
      let novoBonus = (org as any)?.saldo_bonus || 0;
      let restante = valor;

      if (novoSacavel >= restante) {
        novoSacavel -= restante;
        restante = 0;
      } else {
        restante -= novoSacavel;
        novoSacavel = 0;
        novoBonus -= restante;
        restante = 0;
      }

      // Ativar plano e debitar saldo
      await supabase
        .from('organizations')
        .update({
          plano: plano_slug,
          plan: plano_slug,
          plano_expiracao_em: expiracao,
          plano_ciclo: ciclo,
          saldo_sacavel: novoSacavel,
          saldo_bonus: novoBonus,
        } as any)
        .eq('id', organization_id);

      // Criar solicitação já aprovada
      const { data: solData } = await supabase
        .from('solicitacoes_plano' as any)
        .insert({
          organization_id,
          user_id,
          plano_id,
          plano_slug,
          plano_nome,
          ciclo,
          valor,
          status: 'aprovado',
          observacao: `Pago com créditos internos — debitado automaticamente`,
          aprovado_em: new Date().toISOString(),
        })
        .select()
        .limit(1);

      const solId = (solData as any)?.[0]?.id;

      // Registrar no faturamento
      await supabase.from('faturamento' as any).insert({
        organization_id,
        descricao: `Assinatura plano ${plano_nome} (${ciclo}) — pago com créditos internos`,
        valor: -valor, // negativo = consumo de crédito
        status: 'paid',
        tipo: 'subscription',
        metodo_pagamento: 'creditos_internos',
        data_pagamento: new Date().toISOString().split('T')[0],
      });

      // Notificação
      if (solId) {
        await supabase.from('notificacoes_recarga' as any).insert({
          organization_id,
          solicitacao_id: solId,
          tipo: 'plano_aprovado',
          titulo: `Plano ${plano_nome} ativado! 🎉`,
          mensagem: `Seu plano foi ativado usando seus créditos. Válido até ${new Date(expiracao).toLocaleDateString('pt-BR')}.`,
          valor,
          para_super_admin: false,
        });
      }

      return new Response(JSON.stringify({ success: true, expiracao }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('infinitepay-checkout error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
