import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const CERTADOC_API_URL = 'https://dev-app-certadoc-api.azurewebsites.net';

interface AuthResponse {
  token?: string;
  accessToken?: string;
  authenticated?: boolean;
  message?: string;
  success?: boolean;
  user?: { email: string };
}

// Cache do token para evitar múltiplas autenticações
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// Função para converter string para Base64
function toBase64(str: string): string {
  return btoa(str);
}

// Autenticar na API CertaDoc
async function authenticate(): Promise<string> {
  // Verificar se o token ainda é válido (com margem de 5 minutos)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    console.log('Usando token em cache');
    return cachedToken;
  }

  const email = Deno.env.get('CERTADOC_EMAIL');
  const password = Deno.env.get('CERTADOC_PASSWORD');

  if (!email || !password) {
    throw new Error('Credenciais CertaDoc não configuradas');
  }

  console.log('Autenticando na API CertaDoc...');

  const response = await fetch(`${CERTADOC_API_URL}/api/Login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      EmailBase64: toBase64(email),
      PasswordBase64: toBase64(password),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro na autenticação CertaDoc:', response.status, errorText);
    throw new Error(`Falha na autenticação CertaDoc: ${response.status}`);
  }

  const data: AuthResponse = await response.json();
  
  // O token pode vir como 'token' ou 'accessToken'
  const authToken = data.accessToken || data.token;
  
  if (!authToken) {
    console.error('Token não recebido:', data);
    throw new Error('Token não recebido da API CertaDoc');
  }

  // Cache do token por 12 horas (o token expira em ~12h segundo JWT padrão)
  cachedToken = authToken;
  tokenExpiry = Date.now() + 12 * 60 * 60 * 1000;

  console.log('Autenticação CertaDoc bem-sucedida');
  return authToken;
}

// Consultar todas as multas
async function todasMultas(token: string, email: string) {
  console.log('Consultando todas as multas...');
  
  const response = await fetch(
    `${CERTADOC_API_URL}/api/vendor/todas-multas?email=${encodeURIComponent(email)}`,
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
    console.error('Erro ao consultar todas multas:', response.status, errorText);
    throw new Error(`Erro ao consultar multas: ${response.status}`);
  }

  return await response.json();
}

// Consultar multas por placa
async function multaPorPlaca(token: string, placa: string, email: string) {
  console.log('Consultando multas por placa:', placa);
  
  const response = await fetch(
    `${CERTADOC_API_URL}/api/vendor/multa-por-placa?placa=${encodeURIComponent(placa)}&email=${encodeURIComponent(email)}`,
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
    console.error('Erro ao consultar multa por placa:', response.status, errorText);
    throw new Error(`Erro ao consultar multa por placa: ${response.status}`);
  }

  return await response.json();
}

// Consultar placa - retorna dados do veículo + multas
async function consultarPlaca(token: string, placa: string, email: string) {
  console.log('=== INICIANDO CONSULTA COMPLETA PARA PLACA:', placa, '===');
  
  // PASSO 1: Buscar dados do veículo via consultar-placa
  let dadosVeiculo = null;
  try {
    console.log('PASSO 1: Buscando dados do veículo...');
    const veiculoResponse = await fetch(
      `${CERTADOC_API_URL}/api/vendor/consultar-placa?placa=${encodeURIComponent(placa)}&email=${encodeURIComponent(email)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (veiculoResponse.ok) {
      const veiculoData = await veiculoResponse.json();
      dadosVeiculo = veiculoData.result?.dados_do_veiculo || veiculoData.dados_do_veiculo || null;
      console.log('Dados do veículo obtidos:', JSON.stringify(dadosVeiculo).substring(0, 300));
    } else {
      console.log('Consulta de veículo retornou status:', veiculoResponse.status);
    }
  } catch (err) {
    console.log('Erro ao buscar dados do veículo (não crítico):', err);
  }
  
  // PASSO 2: Buscar MULTAS via multa-por-placa (endpoint correto para multas!)
  let multasData = null;
  try {
    console.log('PASSO 2: Buscando MULTAS via multa-por-placa...');
    const multasResponse = await fetch(
      `${CERTADOC_API_URL}/api/vendor/multa-por-placa?placa=${encodeURIComponent(placa)}&email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (multasResponse.ok) {
      const rawMultas = await multasResponse.json();
      console.log('Resposta bruta de multas:', JSON.stringify(rawMultas).substring(0, 500));
      
      // A API retorna array, pegar primeiro item
      if (Array.isArray(rawMultas) && rawMultas.length > 0) {
        multasData = rawMultas[0];
      } else {
        multasData = rawMultas;
      }
    } else {
      console.log('Consulta de multas retornou status:', multasResponse.status);
    }
  } catch (err) {
    console.log('Erro ao buscar multas:', err);
  }

  // PASSO 3: Consolidar todas as multas em uma lista única
  const todasMultas: any[] = [];
  
  if (multasData) {
    // Multas a pagar (PRIORIDADE MÁXIMA)
    if (multasData.aPagar && Array.isArray(multasData.aPagar)) {
      multasData.aPagar.forEach((m: any) => {
        todasMultas.push({ ...m, categoria: 'a_pagar', status: 'pendente' });
      });
      console.log('Multas a pagar encontradas:', multasData.aPagar.length);
    }
    
    // Notificações (podem virar multas)
    if (multasData.notificacoes && Array.isArray(multasData.notificacoes)) {
      multasData.notificacoes.forEach((m: any) => {
        todasMultas.push({ ...m, categoria: 'notificacao', status: 'notificacao' });
      });
      console.log('Notificações encontradas:', multasData.notificacoes.length);
    }
    
    // Multas NIC
    if (multasData.multasNic && Array.isArray(multasData.multasNic)) {
      multasData.multasNic.forEach((m: any) => {
        todasMultas.push({ ...m, categoria: 'nic', status: 'nic' });
      });
      console.log('Multas NIC encontradas:', multasData.multasNic.length);
    }
    
    // Multas pagas (histórico)
    if (multasData.pagas && Array.isArray(multasData.pagas)) {
      multasData.pagas.forEach((m: any) => {
        todasMultas.push({ ...m, categoria: 'paga', status: 'pago' });
      });
      console.log('Multas pagas encontradas:', multasData.pagas.length);
    }
    
    // Outros
    if (multasData.outros && Array.isArray(multasData.outros)) {
      multasData.outros.forEach((m: any) => {
        todasMultas.push({ ...m, categoria: 'outro', status: 'outro' });
      });
      console.log('Outras multas encontradas:', multasData.outros.length);
    }
  }

  console.log('=== TOTAL DE MULTAS CONSOLIDADAS:', todasMultas.length, '===');

  // Retornar estrutura completa
  return {
    success: true,
    placa: placa,
    dados_veiculo: dadosVeiculo,
    multas: todasMultas,
    multas_detalhadas: multasData, // Dados brutos categorizados
    total_multas: todasMultas.length,
    multas_a_pagar: todasMultas.filter(m => m.categoria === 'a_pagar').length,
    multas_pagas: todasMultas.filter(m => m.categoria === 'paga').length,
    notificacoes: todasMultas.filter(m => m.categoria === 'notificacao').length,
  };
}

// Listar CNHs
async function listagemCnh(token: string, email: string) {
  console.log('Listando CNHs...');
  
  const response = await fetch(
    `${CERTADOC_API_URL}/api/vendor/listagem-cnh?email=${encodeURIComponent(email)}`,
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
    console.error('Erro ao listar CNHs:', response.status, errorText);
    throw new Error(`Erro ao listar CNHs: ${response.status}`);
  }

  return await response.json();
}

// Consultar CNH por CPF
async function consultarCnh(token: string, cpf: string, email: string) {
  console.log('Consultando CNH por CPF:', cpf);
  
  const response = await fetch(
    `${CERTADOC_API_URL}/api/vendor/consultar-cnh?cpf=${encodeURIComponent(cpf)}&email=${encodeURIComponent(email)}`,
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
    console.error('Erro ao consultar CNH:', response.status, errorText);
    throw new Error(`Erro ao consultar CNH: ${response.status}`);
  }

  return await response.json();
}

// Listar documentos
async function listagemDocumentos(token: string, email: string) {
  console.log('Listando documentos...');
  
  const response = await fetch(
    `${CERTADOC_API_URL}/api/vendor/listagem-documentos?email=${encodeURIComponent(email)}`,
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
    console.error('Erro ao listar documentos:', response.status, errorText);
    throw new Error(`Erro ao listar documentos: ${response.status}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, placa, cpf } = await req.json();
    
    // Obter email das credenciais
    const email = Deno.env.get('CERTADOC_EMAIL');
    if (!email) {
      throw new Error('Email CertaDoc não configurado');
    }

    // Autenticar
    const token = await authenticate();

    let result;

    switch (action) {
      case 'todas-multas':
        result = await todasMultas(token, email);
        break;

      case 'multa-por-placa':
        if (!placa) {
          throw new Error('Placa é obrigatória para esta ação');
        }
        result = await multaPorPlaca(token, placa, email);
        break;

      case 'consultar-placa':
        if (!placa) {
          throw new Error('Placa é obrigatória para esta ação');
        }
        result = await consultarPlaca(token, placa, email);
        break;

      case 'listagem-cnh':
        result = await listagemCnh(token, email);
        break;

      case 'consultar-cnh':
        if (!cpf) {
          throw new Error('CPF é obrigatório para esta ação');
        }
        result = await consultarCnh(token, cpf, email);
        break;

      case 'listagem-documentos':
        result = await listagemDocumentos(token, email);
        break;

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    console.log(`Ação ${action} executada com sucesso`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro na edge function certadoc:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
