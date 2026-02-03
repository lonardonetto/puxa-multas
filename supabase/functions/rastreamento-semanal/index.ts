import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VeiculoRastreado {
  id: string;
  placa: string;
  modelo: string;
  ano: string | null;
  cliente_id: string;
  rastreamento_tipo: string | null;
  rastreamento_vencimento: string | null;
  organization_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Iniciando job de rastreamento semanal...');

    // Buscar todos os veículos com rastreamento ativo
    const { data: veiculos, error: veiculosError } = await supabase
      .from('veiculos')
      .select(`
        id,
        placa,
        modelo,
        ano,
        cliente_id,
        rastreamento_tipo,
        rastreamento_vencimento,
        clientes!inner(organization_id)
      `)
      .eq('rastreamento_ativo', true)
      .eq('ativo', true);

    if (veiculosError) {
      console.error('Erro ao buscar veículos:', veiculosError);
      throw new Error(`Erro ao buscar veículos: ${veiculosError.message}`);
    }

    console.log(`Encontrados ${veiculos?.length || 0} veículos com rastreamento ativo`);

    if (!veiculos || veiculos.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum veículo com rastreamento ativo encontrado',
          processados: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processados = 0;
    let erros = 0;
    const resultados: { placa: string; status: string; multas?: number }[] = [];

    for (const veiculo of veiculos) {
      try {
        // Extrair organization_id do join
        const clienteData = veiculo.clientes as unknown as { organization_id: string } | { organization_id: string }[];
        const organizationId = Array.isArray(clienteData) 
          ? clienteData[0]?.organization_id 
          : clienteData?.organization_id;
        
        if (!organizationId) {
          console.log(`Veículo ${veiculo.placa} sem organização, pulando...`);
          continue;
        }

        console.log(`Consultando placa ${veiculo.placa}...`);

        // Chamar a edge function certadoc para consultar multas
        const { data: response, error: funcError } = await supabase.functions.invoke('certadoc', {
          body: {
            action: 'consultar-placa',
            placa: veiculo.placa,
          },
        });

        if (funcError) {
          console.error(`Erro ao consultar ${veiculo.placa}:`, funcError);
          erros++;
          resultados.push({ placa: veiculo.placa, status: 'erro' });
          continue;
        }

        const dados = response?.data;
        let multasEncontradas = 0;

        // Processar multas se existirem
        if (dados?.multas && Array.isArray(dados.multas)) {
          const multasParaSalvar = dados.multas.map((multa: Record<string, unknown>) => ({
            veiculo_id: veiculo.id,
            placa_autuada: veiculo.placa,
            codigo_infracao: multa.codigoInfracao || multa.codigo || '',
            descricao: multa.descricao || multa.descricaoInfracao || '',
            valor: parseFloat(String(multa.valor)) || 0,
            pontos: parseInt(String(multa.pontos)) || 0,
            gravidade: multa.gravidade || '',
            data_multa: multa.dataInfracao || multa.dataMulta || null,
            hora_infracao: multa.horaInfracao || null,
            numero_auto: multa.numeroAuto || multa.auto || '',
            local_infracao: multa.local || multa.localInfracao || '',
            orgao_autuador: multa.orgao || multa.orgaoAutuador || '',
            municipio: multa.municipio || '',
            uf_infracao: multa.uf || multa.estado || '',
            data_vencimento: multa.dataVencimento || null,
            status: 'pendente',
          }));

          multasEncontradas = multasParaSalvar.length;

          if (multasParaSalvar.length > 0) {
            // Verificar se já existem essas multas (pelo numero_auto)
            for (const multa of multasParaSalvar) {
              if (multa.numero_auto) {
                const { data: existente } = await supabase
                  .from('multas')
                  .select('id')
                  .eq('numero_auto', multa.numero_auto)
                  .eq('veiculo_id', veiculo.id)
                  .maybeSingle();

                if (!existente) {
                  await supabase.from('multas').insert(multa);
                }
              } else {
                await supabase.from('multas').insert(multa);
              }
            }
          }
        }

        // Atualizar dados do veículo se retornados
        if (dados?.result?.dados_do_veiculo) {
          const dadosVeiculo = dados.result.dados_do_veiculo;
          const infoTecnicas = dados.result.informacoes_tecnicas_e_adicionais || {};
          const restricoes = dados.result.restricoes_e_impedimentos || {};

          await supabase
            .from('veiculos')
            .update({
              modelo: `${dadosVeiculo.marca || ''} ${dadosVeiculo.modelo || ''}`.trim() || veiculo.modelo,
              ano: dadosVeiculo.anofabricacao || veiculo.ano,
              renavam: dadosVeiculo.renavam,
              chassi: dadosVeiculo.chassi,
              cor: dadosVeiculo.cor,
              municipio: dadosVeiculo.municipio,
              uf: dadosVeiculo.uf,
              motor: infoTecnicas.motor,
              potencia: infoTecnicas.potencia,
              cilindradas: infoTecnicas.cilindradas,
              especie: infoTecnicas.especie,
              capacidade_passageiros: infoTecnicas.capacidadedepassageiros,
              quantidade_eixos: infoTecnicas.quantidadedeeixos,
              caixa_cambio: infoTecnicas.caixadecambio,
              situacao_veiculo: restricoes.situacao_veiculo,
              ultima_sincronizacao: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', veiculo.id);
        }

        // Salvar histórico da consulta (sem cobrança - é automática)
        await supabase.from('consultas_rastreamento').insert({
          veiculo_id: veiculo.id,
          organization_id: organizationId,
          placa: veiculo.placa,
          modelo_veiculo: veiculo.modelo,
          ano_veiculo: veiculo.ano,
          valor_cobrado: 0, // Consulta automática - sem cobrança
          resposta_api: dados,
          multas_encontradas: multasEncontradas,
          status: 'sucesso_automatico',
        });

        processados++;
        resultados.push({ 
          placa: veiculo.placa, 
          status: 'sucesso', 
          multas: multasEncontradas 
        });

        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Erro ao processar veículo ${veiculo.placa}:`, error);
        erros++;
        resultados.push({ placa: veiculo.placa, status: 'erro' });
      }
    }

    console.log(`Job concluído. Processados: ${processados}, Erros: ${erros}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Rastreamento semanal concluído`,
        processados,
        erros,
        total: veiculos.length,
        resultados,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no job de rastreamento:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
