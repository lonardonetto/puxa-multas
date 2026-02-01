import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface VeiculoResponse {
  success: boolean;
  dados?: {
    placa: string;
    marca: string;
    modelo: string;
    ano: string;
    anoModelo: string;
    cor: string;
    combustivel: string;
    uf: string;
    cidade: string;
  };
  error?: string;
  source?: 'api_brasil' | 'mock';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { placa } = await req.json();

    if (!placa || placa.length < 7) {
      return new Response(
        JSON.stringify({ success: false, error: 'Placa inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalizar placa (remover caracteres especiais)
    const placaNormalizada = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    console.log('Consultando veículo:', placaNormalizada);

    // Tentar API Brasil (gratuita e pública para dados básicos de veículos)
    // Fonte: https://apibrasil.com.br ou similar
    // Por ora, vamos usar um fallback com dados simulados baseados no padrão da placa
    
    // Detectar padrão da placa (antiga AAA-0000 ou Mercosul AAA0A00)
    const isMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(placaNormalizada);
    
    // Extrair UF estimada pela placa (usando faixas conhecidas)
    const ufEstimada = getUFByPlaca(placaNormalizada);

    // Por questões de API pública gratuita, vamos retornar dados parciais
    // Em produção, integrar com APIs como:
    // - API Brasil (apibrasil.com.br)
    // - Sinesp Cidadão (requer cadastro)
    // - APIs privadas de consulta veicular

    // Retorna apenas os dados que conseguimos inferir pela placa
    const dadosVeiculo: VeiculoResponse = {
      success: true,
      dados: {
        placa: formatPlaca(placaNormalizada),
        marca: '',
        modelo: '',
        ano: '',
        anoModelo: '',
        cor: '',
        combustivel: '',
        uf: ufEstimada,
        cidade: '',
      },
      source: 'mock',
    };

    console.log('UF estimada pela placa:', ufEstimada || 'não identificada');

    console.log('Retornando dados do veículo:', dadosVeiculo.dados?.modelo || 'não encontrado');

    return new Response(
      JSON.stringify(dadosVeiculo),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao consultar veículo:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro ao consultar veículo' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Formatar placa para exibição
function formatPlaca(placa: string): string {
  if (placa.length === 7) {
    // Mercosul: ABC1D23 -> ABC1D23
    // Antiga: ABC1234 -> ABC-1234
    const isMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(placa);
    if (!isMercosul) {
      return `${placa.slice(0, 3)}-${placa.slice(3)}`;
    }
  }
  return placa;
}

// Obter UF pela faixa de placas (tabela simplificada)
function getUFByPlaca(placa: string): string {
  const prefixo = placa.substring(0, 3).toUpperCase();
  
  // Mapeamento de faixas de placas para UF
  const faixas: { inicio: string; fim: string; uf: string }[] = [
    { inicio: 'AAA', fim: 'BEZ', uf: 'PR' },
    { inicio: 'BFA', fim: 'GKI', uf: 'SP' },
    { inicio: 'GKJ', fim: 'HOK', uf: 'MG' },
    { inicio: 'HOL', fim: 'JDO', uf: 'RJ' },
    { inicio: 'JDP', fim: 'JXY', uf: 'RS' },
    { inicio: 'JXZ', fim: 'KAW', uf: 'SC' },
    { inicio: 'KAX', fim: 'KEW', uf: 'ES' },
    { inicio: 'KEX', fim: 'LVE', uf: 'GO' },
    { inicio: 'LVF', fim: 'LWQ', uf: 'DF' },
    { inicio: 'LWR', fim: 'MMM', uf: 'MT' },
    { inicio: 'MMN', fim: 'MOZ', uf: 'MS' },
    { inicio: 'MPA', fim: 'MZM', uf: 'BA' },
    { inicio: 'MZN', fim: 'NAG', uf: 'SE' },
    { inicio: 'NAH', fim: 'NBS', uf: 'AL' },
    { inicio: 'NBT', fim: 'NDV', uf: 'PE' },
    { inicio: 'NDW', fim: 'NEK', uf: 'PB' },
    { inicio: 'NEL', fim: 'NFR', uf: 'RN' },
    { inicio: 'NFS', fim: 'NGZ', uf: 'CE' },
    { inicio: 'NHA', fim: 'NHK', uf: 'PI' },
    { inicio: 'NHL', fim: 'NJA', uf: 'MA' },
    { inicio: 'NJB', fim: 'NKZ', uf: 'PA' },
    { inicio: 'NLA', fim: 'NLH', uf: 'AP' },
    { inicio: 'NLI', fim: 'NME', uf: 'AM' },
    { inicio: 'NMF', fim: 'NNE', uf: 'RR' },
    { inicio: 'NNF', fim: 'NNQ', uf: 'RO' },
    { inicio: 'NNR', fim: 'NOM', uf: 'AC' },
    { inicio: 'NON', fim: 'NPF', uf: 'TO' },
  ];

  for (const faixa of faixas) {
    if (prefixo >= faixa.inicio && prefixo <= faixa.fim) {
      return faixa.uf;
    }
  }

  return '';
}
