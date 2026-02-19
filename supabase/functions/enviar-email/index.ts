import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface EmailPayload {
  tipo: 'boas_vindas' | 'redefinicao_senha' | 'cliente_adicionado' | 'recurso_gerado' | 'notificacao_blindada' | 'faturamento' | 'rastreamento_vencimento' | 'usuario_adicionado';
  destinatario_email: string;
  destinatario_nome: string;
  dados?: Record<string, string | number | boolean>;
}

// ─── Templates HTML profissionais ───────────────────────────────────────────

function layoutBase(titulo: string, conteudo: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background-color:#111111;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border-bottom:3px solid #D4A017;">
              <div style="display:inline-block;background:linear-gradient(135deg,#D4A017,#F5C842);padding:2px;border-radius:8px;margin-bottom:16px;">
                <div style="background:#1a1a1a;border-radius:6px;padding:8px 16px;">
                  <span style="color:#D4A017;font-size:18px;font-weight:900;letter-spacing:2px;">⚖ RECORRA MULTAS</span>
                </div>
              </div>
              <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;letter-spacing:0.5px;">${titulo}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#1e1e1e;padding:40px;border-radius:0 0 16px 16px;">
              ${conteudo}
              <!-- Footer -->
              <div style="margin-top:40px;padding-top:24px;border-top:1px solid #333333;text-align:center;">
                <p style="color:#666666;font-size:12px;margin:0 0 8px;">Recorra Multas — Sua plataforma de recursos de trânsito</p>
                <p style="color:#555555;font-size:11px;margin:0;">Este é um e-mail automático. Por favor, não responda diretamente.</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btnPrimario(texto: string, url: string): string {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#D4A017,#F5C842);color:#111111;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;letter-spacing:0.5px;">${texto}</a>
  </div>`;
}

function infoBox(linhas: { label: string; valor: string }[]): string {
  const rows = linhas.map(l => `
    <tr>
      <td style="padding:10px 16px;color:#999999;font-size:13px;width:45%;">${l.label}</td>
      <td style="padding:10px 16px;color:#ffffff;font-size:13px;font-weight:600;">${l.valor}</td>
    </tr>
  `).join('<tr><td colspan="2" style="padding:0 16px;"><div style="height:1px;background:#2a2a2a;"></div></td></tr>');
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#252525;border-radius:10px;margin:20px 0;overflow:hidden;">${rows}</table>`;
}

function paragraph(texto: string): string {
  return `<p style="color:#cccccc;font-size:15px;line-height:1.7;margin:0 0 16px;">${texto}</p>`;
}

function badge(texto: string, cor: string = '#D4A017'): string {
  return `<span style="display:inline-block;background:${cor}22;color:${cor};border:1px solid ${cor}55;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;">${texto}</span>`;
}

// ─── Templates específicos ───────────────────────────────────────────────────

function templateBoasVindas(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const nome = String(dados.nome || 'Usuário');
  const org = String(dados.organizacao || '');
  const email = String(dados.email || '');

  const conteudo = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      ${badge('Conta Criada com Sucesso', '#10B981')}
    </div>
    ${paragraph(`Olá, <strong style="color:#ffffff;">${nome}</strong>!`)}
    ${paragraph('Seja muito bem-vindo(a) à <strong style="color:#D4A017;">Recorra Multas</strong>! Sua conta foi criada com sucesso e você já pode começar a usar nossa plataforma.')}
    ${infoBox([
      { label: '👤 Responsável', valor: nome },
      { label: '🏢 Organização', valor: org || '—' },
      { label: '📧 E-mail de acesso', valor: email },
      { label: '📅 Data de cadastro', valor: new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) },
    ])}
    ${paragraph('Com a Recorra Multas você pode:')}
    <ul style="color:#aaaaaa;font-size:14px;line-height:2;padding-left:20px;">
      <li><strong style="color:#D4A017;">Gerar recursos de multas</strong> com inteligência artificial</li>
      <li><strong style="color:#D4A017;">Gerenciar clientes</strong> e seus processos em um só lugar</li>
      <li><strong style="color:#D4A017;">Rastrear veículos</strong> e receber alertas de novas infrações</li>
      <li><strong style="color:#D4A017;">Assinar contratos</strong> digitalmente com segurança jurídica</li>
    </ul>
    ${btnPrimario('Acessar Minha Conta →', 'https://edita-multas.lovable.app/login')}
    ${paragraph('<span style="color:#666666;font-size:13px;">Qualquer dúvida, entre em contato com nossa equipe de suporte.</span>')}
  `;

  return {
    assunto: `🎉 Bem-vindo(a) à Recorra Multas, ${nome}!`,
    html: layoutBase('Bem-vindo(a) ao Recorra Multas!', conteudo),
  };
}

function templateRedefinicaoSenha(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const nome = String(dados.nome || 'Usuário');
  const link = String(dados.link || 'https://edita-multas.lovable.app/login');

  const conteudo = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:12px;">🔑</div>
      ${badge('Solicitação de Redefinição de Senha', '#F59E0B')}
    </div>
    ${paragraph(`Olá, <strong style="color:#ffffff;">${nome}</strong>!`)}
    ${paragraph('Recebemos uma solicitação para redefinir a senha da sua conta na <strong style="color:#D4A017;">Recorra Multas</strong>.')}
    <div style="background:#1a1a1a;border:1px solid #F59E0B33;border-radius:10px;padding:20px;margin:20px 0;text-align:center;">
      <p style="color:#F59E0B;font-size:13px;margin:0 0 4px;">⚠️ Este link é válido por <strong>1 hora</strong></p>
      <p style="color:#888888;font-size:12px;margin:0;">Se você não solicitou, ignore este e-mail. Sua senha não será alterada.</p>
    </div>
    ${btnPrimario('Redefinir Minha Senha →', link)}
    ${paragraph('<span style="color:#666666;font-size:13px;">Por segurança, nunca compartilhe este link com ninguém. Nossa equipe jamais solicitará sua senha.</span>')}
  `;

  return {
    assunto: '🔑 Redefinição de senha — Recorra Multas',
    html: layoutBase('Redefinição de Senha', conteudo),
  };
}

function templateClienteAdicionado(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const adminNome = String(dados.admin_nome || 'Administrador');
  const clienteNome = String(dados.cliente_nome || '');
  const clienteDoc = String(dados.cliente_documento || '—');
  const clienteTelefone = String(dados.cliente_telefone || '—');
  const orgNome = String(dados.organizacao || '');
  const operador = String(dados.operador || adminNome);

  const conteudo = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:12px;">👤</div>
      ${badge('Novo Cliente Cadastrado', '#6366F1')}
    </div>
    ${paragraph(`Olá, <strong style="color:#ffffff;">${adminNome}</strong>!`)}
    ${paragraph(`Um novo cliente foi adicionado à organização <strong style="color:#D4A017;">${orgNome}</strong>.`)}
    ${infoBox([
      { label: '👤 Nome do Cliente', valor: clienteNome },
      { label: '📄 CPF/CNPJ', valor: clienteDoc },
      { label: '📞 Telefone', valor: clienteTelefone },
      { label: '👨‍💼 Operador', valor: operador },
      { label: '📅 Data/Hora', valor: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) },
    ])}
    ${btnPrimario('Ver Ficha do Cliente →', 'https://edita-multas.lovable.app/cadastro/lista-clientes')}
  `;

  return {
    assunto: `👤 Novo cliente cadastrado: ${clienteNome}`,
    html: layoutBase('Novo Cliente Cadastrado', conteudo),
  };
}

function templateRecursoGerado(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const adminNome = String(dados.admin_nome || 'Administrador');
  const clienteNome = String(dados.cliente_nome || '');
  const instancia = String(dados.instancia || '');
  const autoInfracao = String(dados.auto_infracao || '—');
  const placa = String(dados.placa || '—');
  const isIa = dados.is_ia === true || dados.is_ia === 'true';

  const conteudo = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:12px;">📝</div>
      ${badge(isIa ? 'Recurso Gerado com IA ✨' : 'Recurso Gerado', isIa ? '#8B5CF6' : '#D4A017')}
    </div>
    ${paragraph(`Olá, <strong style="color:#ffffff;">${adminNome}</strong>!`)}
    ${paragraph(`Um novo recurso foi gerado ${isIa ? '<strong style="color:#8B5CF6;">com Inteligência Artificial</strong>' : ''} na plataforma.`)}
    ${infoBox([
      { label: '👤 Cliente', valor: clienteNome },
      { label: '⚖️ Instância', valor: instancia },
      { label: '🚗 Placa', valor: placa },
      { label: '📋 Auto de Infração', valor: autoInfracao },
      { label: '📅 Data/Hora', valor: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) },
    ])}
    ${paragraph('O recurso está disponível na plataforma e pode ser revisado, editado e exportado em PDF.')}
    ${btnPrimario('Ver Recurso na Plataforma →', 'https://edita-multas.lovable.app/recursos-ia')}
  `;

  return {
    assunto: `📝 Novo recurso gerado para ${clienteNome}`,
    html: layoutBase('Recurso Gerado com Sucesso', conteudo),
  };
}

function templateNotificacaoBlindada(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const adminNome = String(dados.admin_nome || 'Administrador');
  const clienteNome = String(dados.cliente_nome || '');
  const operador = String(dados.operador || '');
  const horario = String(dados.horario || new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
  const autoInfracao = String(dados.auto_infracao || '—');
  const hash = String(dados.hash || '').substring(0, 16) + '...';

  const conteudo = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:12px;">🔒</div>
      ${badge('Registro Blindado — Notificação Confirmada', '#10B981')}
    </div>
    ${paragraph(`Olá, <strong style="color:#ffffff;">${adminNome}</strong>!`)}
    ${paragraph('Uma notificação ao cliente foi registrada no <strong style="color:#10B981;">Registro Blindado</strong> da plataforma com força probatória.')}
    ${infoBox([
      { label: '👤 Cliente Notificado', valor: clienteNome },
      { label: '👨‍💼 Operador', valor: operador },
      { label: '🕐 Horário (Brasília)', valor: horario },
      { label: '📋 Auto de Infração', valor: autoInfracao },
      { label: '🔐 Hash de Integridade', valor: hash },
    ])}
    <div style="background:#10B98111;border:1px solid #10B98133;border-radius:10px;padding:16px;margin:20px 0;text-align:center;">
      <p style="color:#10B981;font-size:13px;margin:0;font-weight:600;">✅ Registro imutável — Este evento não pode ser alterado ou excluído</p>
    </div>
    ${btnPrimario('Ver Auditoria Completa →', 'https://edita-multas.lovable.app/status-recurso')}
  `;

  return {
    assunto: `🔒 Notificação registrada: ${clienteNome} — ${horario}`,
    html: layoutBase('Notificação Registrada com Sucesso', conteudo),
  };
}

function templateFaturamento(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const adminNome = String(dados.admin_nome || 'Administrador');
  const orgNome = String(dados.organizacao || '');
  const valor = parseFloat(String(dados.valor || '0')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const descricao = String(dados.descricao || 'Assinatura');
  const vencimento = String(dados.vencimento || '—');
  const status = String(dados.status || 'pending');

  const statusLabel = status === 'paid' ? { texto: '✅ Pago', cor: '#10B981' }
    : status === 'pending' ? { texto: '⏳ Aguardando Pagamento', cor: '#F59E0B' }
    : { texto: '❌ Cancelado', cor: '#EF4444' };

  const conteudo = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:12px;">💰</div>
      ${badge('Informação de Faturamento', '#D4A017')}
    </div>
    ${paragraph(`Olá, <strong style="color:#ffffff;">${adminNome}</strong>!`)}
    ${paragraph(`Informamos uma movimentação financeira na conta da organização <strong style="color:#D4A017;">${orgNome}</strong>.`)}
    ${infoBox([
      { label: '📋 Descrição', valor: descricao },
      { label: '💵 Valor', valor: valor },
      { label: '📅 Vencimento', valor: vencimento },
      { label: '🏷️ Status', valor: statusLabel.texto },
    ])}
    ${btnPrimario('Ver Detalhes Financeiros →', 'https://edita-multas.lovable.app/checkout')}
    ${paragraph('<span style="color:#666666;font-size:13px;">Em caso de dúvidas sobre este lançamento, entre em contato com nossa equipe.</span>')}
  `;

  return {
    assunto: `💰 Faturamento: ${descricao} — ${valor}`,
    html: layoutBase('Informação de Faturamento', conteudo),
  };
}

function templateRastreamentoVencimento(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const adminNome = String(dados.admin_nome || 'Administrador');
  const placa = String(dados.placa || '');
  const modelo = String(dados.modelo || '');
  const vencimento = String(dados.vencimento || '—');
  const diasRestantes = Number(dados.dias_restantes || 0);
  const orgNome = String(dados.organizacao || '');

  const urgencia = diasRestantes <= 3
    ? { cor: '#EF4444', icon: '🚨', texto: 'URGENTE' }
    : diasRestantes <= 7
    ? { cor: '#F59E0B', icon: '⚠️', texto: 'ATENÇÃO' }
    : { cor: '#D4A017', icon: '📅', texto: 'AVISO' };

  const conteudo = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:12px;">${urgencia.icon}</div>
      ${badge(`${urgencia.texto} — Rastreamento Vencendo`, urgencia.cor)}
    </div>
    ${paragraph(`Olá, <strong style="color:#ffffff;">${adminNome}</strong>!`)}
    ${paragraph(`O rastreamento de um veículo da organização <strong style="color:#D4A017;">${orgNome}</strong> está próximo do vencimento.`)}
    ${infoBox([
      { label: '🚗 Placa', valor: placa },
      { label: '🚙 Modelo', valor: modelo },
      { label: '📅 Vencimento', valor: vencimento },
      { label: '⏰ Dias restantes', valor: `${diasRestantes} dia(s)` },
    ])}
    <div style="background:${urgencia.cor}11;border:1px solid ${urgencia.cor}33;border-radius:10px;padding:16px;margin:20px 0;text-align:center;">
      <p style="color:${urgencia.cor};font-size:14px;margin:0;font-weight:700;">Renove agora para não perder o monitoramento deste veículo!</p>
    </div>
    ${btnPrimario('Gerenciar Rastreamento →', 'https://edita-multas.lovable.app/rastreamento')}
  `;

  return {
    assunto: `${urgencia.icon} Rastreamento vencendo em ${diasRestantes} dia(s): ${placa} — ${modelo}`,
    html: layoutBase(`Rastreamento Vencendo — ${placa}`, conteudo),
  };
}

function templateUsuarioAdicionado(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const nome = String(dados.nome || 'Usuário');
  const email = String(dados.email || '');
  const orgNome = String(dados.organizacao || '');
  const role = String(dados.role || 'user');

  const roleLabel = role === 'admin' ? 'Administrador' : 'Usuário';

  const conteudo = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:12px;">👥</div>
      ${badge('Você foi adicionado a uma organização', '#6366F1')}
    </div>
    ${paragraph(`Olá, <strong style="color:#ffffff;">${nome}</strong>!`)}
    ${paragraph(`Você foi adicionado como <strong style="color:#D4A017;">${roleLabel}</strong> na organização <strong style="color:#ffffff;">${orgNome}</strong> na plataforma <strong style="color:#D4A017;">Recorra Multas</strong>.`)}
    ${infoBox([
      { label: '👤 Seu nome', valor: nome },
      { label: '📧 E-mail de acesso', valor: email },
      { label: '🏢 Organização', valor: orgNome },
      { label: '🎭 Função', valor: roleLabel },
    ])}
    ${paragraph('Use seu e-mail e a senha que você definiu para acessar a plataforma.')}
    ${btnPrimario('Acessar a Plataforma →', 'https://edita-multas.lovable.app/login')}
  `;

  return {
    assunto: `👥 Você foi adicionado à ${orgNome} — Recorra Multas`,
    html: layoutBase('Bem-vindo à sua organização!', conteudo),
  };
}

// ─── Seletor de template ─────────────────────────────────────────────────────

function gerarEmail(tipo: EmailPayload['tipo'], dados: Record<string, string | number | boolean>) {
  switch (tipo) {
    case 'boas_vindas': return templateBoasVindas(dados);
    case 'redefinicao_senha': return templateRedefinicaoSenha(dados);
    case 'cliente_adicionado': return templateClienteAdicionado(dados);
    case 'recurso_gerado': return templateRecursoGerado(dados);
    case 'notificacao_blindada': return templateNotificacaoBlindada(dados);
    case 'faturamento': return templateFaturamento(dados);
    case 'rastreamento_vencimento': return templateRastreamentoVencimento(dados);
    case 'usuario_adicionado': return templateUsuarioAdicionado(dados);
    default: throw new Error(`Tipo de email desconhecido: ${tipo}`);
  }
}

// ─── Handler principal ───────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    if (!BREVO_API_KEY) {
      console.error('BREVO_API_KEY não configurada');
      return new Response(JSON.stringify({ error: 'Configuração de email ausente' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Suporte a chamada autenticada OU via service role (crons)
    const authHeader = req.headers.get('Authorization');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const isServiceCall = authHeader?.includes(serviceKey || '__never__');

    // Para chamadas de usuário, valida JWT
    if (!isServiceCall && authHeader?.startsWith('Bearer ')) {
      const supabaseAuth = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const token = authHeader.replace('Bearer ', '');
      const { data, error } = await supabaseAuth.auth.getClaims(token);
      if (error || !data?.claims) {
        return new Response(JSON.stringify({ error: 'Não autorizado' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const body: EmailPayload = await req.json();
    const { tipo, destinatario_email, destinatario_nome, dados = {} } = body;

    if (!tipo || !destinatario_email || !destinatario_nome) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios: tipo, destinatario_email, destinatario_nome' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { assunto, html } = gerarEmail(tipo, dados);

    const brevoPayload = {
      sender: {
        name: 'Recorra Multas',
        email: 'noreply@rekorramultas.com.br',
      },
      to: [{ email: destinatario_email, name: destinatario_nome }],
      subject: assunto,
      htmlContent: html,
    };

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro Brevo API:', response.status, JSON.stringify(result));
      return new Response(JSON.stringify({ error: `Brevo API error [${response.status}]: ${JSON.stringify(result)}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Email [${tipo}] enviado para ${destinatario_email} — messageId: ${result.messageId}`);

    return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Erro geral enviar-email:', err);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
