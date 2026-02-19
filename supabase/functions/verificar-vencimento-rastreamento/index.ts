import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const hoje = new Date();
    const em3Dias = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    console.log('[VENCIMENTO] Verificando vencimentos...');
    console.log('[VENCIMENTO] Data atual:', hoje.toISOString().split('T')[0]);
    console.log('[VENCIMENTO] Data limite notificação:', em3Dias.toISOString().split('T')[0]);

    // 1. Buscar veículos que vencem em até 3 dias e não foram notificados
    const { data: veiculosParaNotificar, error: notificarError } = await supabase
      .from('veiculos')
      .select(`
        id,
        placa,
        modelo,
        rastreamento_tipo,
        rastreamento_vencimento,
        rastreamento_valor,
        cliente_id,
        clientes!inner (
          id,
          nome_completo,
          email,
          celular,
          organization_id,
          organizations!inner (
            id,
            nome,
            email_contato
          )
        )
      `)
      .eq('rastreamento_ativo', true)
      .eq('rastreamento_notificado', false)
      .lte('rastreamento_vencimento', em3Dias.toISOString().split('T')[0])
      .gt('rastreamento_vencimento', hoje.toISOString().split('T')[0]);

    if (notificarError) {
      console.error('[VENCIMENTO] Erro ao buscar veículos para notificar:', notificarError);
    } else if (veiculosParaNotificar && veiculosParaNotificar.length > 0) {
      console.log(`[VENCIMENTO] ${veiculosParaNotificar.length} veículos para notificar`);

      for (const veiculo of veiculosParaNotificar) {
        const cliente = veiculo.clientes as any;
        
        // Marcar como notificado
        await supabase
          .from('veiculos')
          .update({ rastreamento_notificado: true, updated_at: new Date().toISOString() })
          .eq('id', veiculo.id);

        // Registrar no histórico
        await supabase
          .from('historico_atividades')
          .insert({
            cliente_id: cliente.id,
            organization_id: cliente.organization_id,
            tipo: 'rastreamento_vencendo',
            descricao: `Rastreamento do veículo ${veiculo.placa} vence em ${new Date(veiculo.rastreamento_vencimento).toLocaleDateString('pt-BR')}`,
            metadata: {
              veiculo_id: veiculo.id,
              placa: veiculo.placa,
              tipo: veiculo.rastreamento_tipo,
              vencimento: veiculo.rastreamento_vencimento,
              valor_renovacao: veiculo.rastreamento_valor,
            },
          });

        console.log(`[VENCIMENTO] Notificação registrada para ${veiculo.placa}`);

        // Enviar e-mail de alerta de vencimento ao admin/contato da organização
        const emailDestino = (cliente.organizations as any)?.email_contato || cliente.email;
        if (emailDestino) {
          const diasRestantes = Math.ceil(
            (new Date(veiculo.rastreamento_vencimento).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
          );
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/enviar-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              tipo: 'rastreamento_vencimento',
              destinatario_email: emailDestino,
              destinatario_nome: emailDestino,
              dados: {
                admin_nome: emailDestino,
                placa: veiculo.placa,
                modelo: veiculo.modelo || 'Veículo',
                vencimento: new Date(veiculo.rastreamento_vencimento).toLocaleDateString('pt-BR'),
                dias_restantes: diasRestantes,
                organizacao: (cliente.organizations as any)?.nome || '',
              },
            }),
          }).catch(e => console.error('[VENCIMENTO] Erro ao enviar email:', e));
        }
      }
    } else {
      console.log('[VENCIMENTO] Nenhum veículo para notificar');
    }

    // 2. Buscar veículos vencidos para cancelar automaticamente
    const { data: veiculosVencidos, error: vencidosError } = await supabase
      .from('veiculos')
      .select(`
        id,
        placa,
        modelo,
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
      .eq('rastreamento_ativo', true)
      .lt('rastreamento_vencimento', hoje.toISOString().split('T')[0]);

    if (vencidosError) {
      console.error('[VENCIMENTO] Erro ao buscar veículos vencidos:', vencidosError);
    } else if (veiculosVencidos && veiculosVencidos.length > 0) {
      console.log(`[VENCIMENTO] ${veiculosVencidos.length} veículos vencidos para cancelar`);

      for (const veiculo of veiculosVencidos) {
        const cliente = veiculo.clientes as any;

        // Chamar função de cancelamento
        try {
          await supabase.functions.invoke('cancelar-rastreamento', {
            body: {
              veiculo_id: veiculo.id,
              placa: veiculo.placa,
              motivo: 'vencido',
            },
          });
          console.log(`[VENCIMENTO] Cancelamento processado para ${veiculo.placa}`);
        } catch (cancelError) {
          console.error(`[VENCIMENTO] Erro ao cancelar ${veiculo.placa}:`, cancelError);
          
          // Fallback: atualizar diretamente se a função falhar
          await supabase
            .from('veiculos')
            .update({
              rastreamento_ativo: false,
              rastreamento_notificado: false,
              updated_at: new Date().toISOString(),
            })
            .eq('id', veiculo.id);
        }
      }
    } else {
      console.log('[VENCIMENTO] Nenhum veículo vencido');
    }

    const resumo = {
      notificados: veiculosParaNotificar?.length || 0,
      cancelados: veiculosVencidos?.length || 0,
      data_verificacao: hoje.toISOString(),
    };

    console.log('[VENCIMENTO] Resumo:', resumo);

    return new Response(
      JSON.stringify({ success: true, ...resumo }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[VENCIMENTO] Erro inesperado:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
