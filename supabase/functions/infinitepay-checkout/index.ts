import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

      // Buscar InfiniteTag configurada no banco
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

      const payload: Record<string, unknown> = {
        handle,
        order_nsu: finalOrderNsu,
        items: [
          {
            name: descricao || 'Pagamento Central da Multa',
            amount: amountInCents,
            quantity: 1,
          },
        ],
        ...(redirect_url ? { redirect_url } : {}),
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

      return new Response(JSON.stringify({ success: true, status: data.status, paid: data.status === 'paid' || data.status === 'approved', raw: data }), {
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
