import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    // 2. Chamar API externa de cancelamento (quando fornecida)
    // TODO: Substituir pelo endpoint real fornecido pelo usuário
    const endpointCancelamento = Deno.env.get('CERTADOC_CANCELAMENTO_URL');
    
    if (endpointCancelamento) {
      try {
        console.log(`[CANCELAMENTO] Chamando API externa para placa ${placa}`);
        
        const response = await fetch(endpointCancelamento, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Adicionar autenticação se necessário
          },
          body: JSON.stringify({
            placa: placa,
            motivo: motivo,
          }),
        });

        if (!response.ok) {
          console.error('[CANCELAMENTO] Erro na API externa:', await response.text());
          // Continua mesmo se a API externa falhar para garantir atualização local
        } else {
          console.log('[CANCELAMENTO] API externa respondeu com sucesso');
        }
      } catch (apiError) {
        console.error('[CANCELAMENTO] Falha ao chamar API externa:', apiError);
        // Continua mesmo se a API externa falhar
      }
    } else {
      console.log('[CANCELAMENTO] Endpoint de cancelamento não configurado, pulando chamada externa');
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
        },
      });

    console.log(`[CANCELAMENTO] Rastreamento cancelado com sucesso para ${placa}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Rastreamento cancelado para ${placa}`,
        veiculo_id,
        placa,
        motivo,
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
