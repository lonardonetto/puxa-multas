import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const agora = new Date();
  const em3Dias = new Date(agora);
  em3Dias.setDate(em3Dias.getDate() + 3);

  console.log(`Verificando vencimentos de plano. Agora: ${agora.toISOString()}`);

  try {
    // Buscar organizações com plano pago que tem data de expiração
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('id, nome, email, plano, plano_ciclo, plano_expiracao_em')
      .not('plano_expiracao_em', 'is', null)
      .not('plano', 'in', '("gratuito","free")') as any;

    if (error) throw error;

    let vencidos = 0;
    let notificados = 0;

    for (const org of (orgs || [])) {
      const expiracao = new Date(org.plano_expiracao_em);

      // 1. Plano vencido → rebaixar para gratuito
      if (expiracao <= agora) {
        await supabase
          .from('organizations')
          .update({
            plano: 'gratuito',
            plan: 'free',
            plano_expiracao_em: null,
          } as any)
          .eq('id', org.id);

        // Notificação de vencimento
        const { data: solFake } = await supabase
          .from('solicitacoes_recarga' as any)
          .select('id')
          .eq('organization_id', org.id)
          .limit(1);

        // Buscar usuários da organização para notificar
        const { data: userOrgs } = await supabase
          .from('user_organizations' as any)
          .select('user_id')
          .eq('organization_id', org.id)
          .limit(5);

        if (userOrgs && userOrgs.length > 0) {
          // Criar notificação (usa um solicitacao_id dummy se não houver)
          try {
            const dummySolId = (solFake as any)?.[0]?.id || org.id;
            await supabase.from('notificacoes_recarga' as any).insert({
              organization_id: org.id,
              solicitacao_id: dummySolId,
              tipo: 'plano_expirado',
              titulo: '⚠️ Seu plano expirou',
              mensagem: `Seu plano foi revertido para o plano Gratuito. Renove para continuar usando todos os recursos.`,
              valor: 0,
              para_super_admin: false,
            });
          } catch (e) {
            console.warn('Erro ao criar notificação de expiração:', e);
          }
        }

        console.log(`Org ${org.nome} (${org.id}): plano expirado → gratuito`);
        vencidos++;
      }
      // 2. Plano vencendo em até 3 dias → notificar
      else if (expiracao <= em3Dias) {
        const diasRestantes = Math.ceil((expiracao.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));

        // Verificar se já notificamos hoje (evitar spam)
        const hoje = agora.toISOString().split('T')[0];
        const { data: notifExistente } = await supabase
          .from('notificacoes_recarga' as any)
          .select('id')
          .eq('organization_id', org.id)
          .eq('tipo', 'plano_vencendo')
          .gte('created_at', `${hoje}T00:00:00Z`)
          .limit(1);

        if (!notifExistente || (notifExistente as any[]).length === 0) {
          try {
            const { data: solFake } = await supabase
              .from('solicitacoes_recarga' as any)
              .select('id')
              .eq('organization_id', org.id)
              .limit(1);

            const dummySolId = (solFake as any)?.[0]?.id || org.id;

            await supabase.from('notificacoes_recarga' as any).insert({
              organization_id: org.id,
              solicitacao_id: dummySolId,
              tipo: 'plano_vencendo',
              titulo: `⏰ Seu plano vence em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`,
              mensagem: `Renove seu plano antes de ${expiracao.toLocaleDateString('pt-BR')} para não perder acesso aos recursos.`,
              valor: 0,
              para_super_admin: false,
            });

            console.log(`Org ${org.nome}: notificação de vencimento em ${diasRestantes} dias enviada`);
            notificados++;
          } catch (e) {
            console.warn('Erro ao criar notificação de aviso:', e);
          }
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processados: (orgs || []).length,
      vencidos,
      notificados,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Erro ao verificar vencimentos de plano:', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
