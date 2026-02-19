import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const APP_URL = 'https://centraldamulta.app.br';
const SENDER_NAME = 'Central da Multa';
const SENDER_EMAIL = 'noreply@centraldamulta.app.br';

interface EmailPayload {
  tipo: 'boas_vindas' | 'confirmacao_email' | 'redefinicao_senha' | 'cliente_adicionado' | 'recurso_gerado' | 'notificacao_blindada' | 'faturamento' | 'rastreamento_vencimento' | 'usuario_adicionado';
  destinatario_email: string;
  destinatario_nome: string;
  dados?: Record<string, string | number | boolean>;
}

// ─── Design System ─────────────────────────────────────────────────────────────
const COLORS = {
  bg:        '#0A0A0A',
  card:      '#111111',
  cardInner: '#1A1A1A',
  border:    '#2A2A2A',
  gold:      '#C8972A',
  goldLight: '#E8B84B',
  white:     '#FFFFFF',
  gray1:     '#E5E5E5',
  gray2:     '#999999',
  gray3:     '#555555',
  green:     '#22C55E',
  red:       '#EF4444',
  amber:     '#F59E0B',
  purple:    '#8B5CF6',
  blue:      '#3B82F6',
  indigo:    '#6366F1',
};

// ─── Layout Base ───────────────────────────────────────────────────────────────
function layoutBase(params: {
  titulo: string;
  subtitulo?: string;
  icone: string;
  conteudo: string;
  corAcento?: string;
}): string {
  const { titulo, subtitulo, icone, conteudo, corAcento = COLORS.gold } = params;

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${titulo} — Recorra Multas</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg};min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <!-- Wrapper -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER TOP BAR -->
          <tr>
            <td style="background:linear-gradient(135deg,${corAcento} 0%,${COLORS.goldLight} 100%);border-radius:16px 16px 0 0;padding:4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${COLORS.card};border-radius:13px 13px 0 0;padding:32px 40px;text-align:center;">
                    <!-- Logo / Brand -->
                    <div style="margin-bottom:20px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                        <tr>
                          <td style="background:linear-gradient(135deg,${corAcento},${COLORS.goldLight});border-radius:10px;padding:1px;">
                            <div style="background:${COLORS.card};border-radius:9px;padding:10px 20px;">
                              <span style="color:${corAcento};font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;">⚖ RECORRA MULTAS</span>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>
                    <!-- Icon -->
                    <div style="width:72px;height:72px;background:linear-gradient(135deg,${corAcento}22,${corAcento}11);border:2px solid ${corAcento}44;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:32px;line-height:72px;text-align:center;">
                      ${icone}
                    </div>
                    <!-- Title -->
                    <h1 style="color:${COLORS.white};font-size:24px;font-weight:800;margin:0 0 6px;letter-spacing:-0.5px;">${titulo}</h1>
                    ${subtitulo ? `<p style="color:${COLORS.gray2};font-size:14px;margin:0;">${subtitulo}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:${COLORS.cardInner};padding:40px;border-left:1px solid ${COLORS.border};border-right:1px solid ${COLORS.border};">
              ${conteudo}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:${COLORS.card};border-radius:0 0 16px 16px;border:1px solid ${COLORS.border};border-top:1px solid ${COLORS.border};padding:28px 40px;text-align:center;">
              <p style="color:${COLORS.gray3};font-size:12px;margin:0 0 6px;line-height:1.6;">
                Este é um e-mail automático. <strong style="color:${COLORS.gray2};">Não responda a este e-mail.</strong>
              </p>
              <p style="color:${COLORS.gray3};font-size:11px;margin:0 0 16px;line-height:1.6;">
                Recorra Multas — Plataforma de Gestão de Recursos de Trânsito<br/>
                Enviado por: <span style="color:${COLORS.gray2};">${SENDER_EMAIL}</span>
              </p>
              <div style="border-top:1px solid ${COLORS.border};padding-top:16px;margin-top:8px;">
                <a href="${APP_URL}" style="color:${corAcento};font-size:11px;text-decoration:none;font-weight:600;">recorramultas.com.br</a>
                <span style="color:${COLORS.border};margin:0 8px;">|</span>
                <a href="${APP_URL}/login" style="color:${COLORS.gray3};font-size:11px;text-decoration:none;">Acessar plataforma</a>
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

// ─── Componentes reutilizáveis ─────────────────────────────────────────────────

function btnPrimario(texto: string, url: string, cor: string = COLORS.gold): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
    <tr>
      <td style="border-radius:10px;background:linear-gradient(135deg,${cor},${COLORS.goldLight});">
        <a href="${url}" target="_blank" style="display:inline-block;padding:15px 36px;color:#000000;text-decoration:none;font-weight:800;font-size:14px;letter-spacing:0.5px;border-radius:10px;font-family:'Helvetica Neue',Arial,sans-serif;">${texto} →</a>
      </td>
    </tr>
  </table>`;
}

function infoCard(linhas: { label: string; valor: string; cor?: string }[]): string {
  const rows = linhas.map((l, i) => `
    <tr style="${i > 0 ? `border-top:1px solid ${COLORS.border};` : ''}">
      <td style="padding:12px 20px;color:${COLORS.gray2};font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;width:40%;vertical-align:top;">${l.label}</td>
      <td style="padding:12px 20px;color:${l.cor || COLORS.gray1};font-size:13px;font-weight:600;vertical-align:top;">${l.valor}</td>
    </tr>`).join('');

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden;margin:20px 0;">
    ${rows}
  </table>`;
}

function alertBox(texto: string, tipo: 'info' | 'success' | 'warning' | 'error' = 'info'): string {
  const map = {
    info:    { bg: `${COLORS.blue}15`,   border: `${COLORS.blue}40`,   color: COLORS.blue,   icon: 'ℹ️' },
    success: { bg: `${COLORS.green}15`,  border: `${COLORS.green}40`,  color: COLORS.green,  icon: '✅' },
    warning: { bg: `${COLORS.amber}15`,  border: `${COLORS.amber}40`,  color: COLORS.amber,  icon: '⚠️' },
    error:   { bg: `${COLORS.red}15`,    border: `${COLORS.red}40`,    color: COLORS.red,    icon: '🚨' },
  };
  const s = map[tipo];
  return `
  <div style="background:${s.bg};border:1px solid ${s.border};border-radius:10px;padding:16px 20px;margin:20px 0;text-align:center;">
    <p style="color:${s.color};font-size:13px;font-weight:700;margin:0;">${s.icon} ${texto}</p>
  </div>`;
}

function divider(): string {
  return `<div style="height:1px;background:${COLORS.border};margin:24px 0;"></div>`;
}

function paragrafo(texto: string): string {
  return `<p style="color:${COLORS.gray1};font-size:15px;line-height:1.8;margin:0 0 16px;">${texto}</p>`;
}

function badge(texto: string, cor: string): string {
  return `<div style="text-align:center;margin-bottom:20px;"><span style="display:inline-block;background:${cor}20;color:${cor};border:1px solid ${cor}50;border-radius:20px;padding:5px 16px;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">${texto}</span></div>`;
}

function listaFeatures(items: string[]): string {
  const rows = items.map(item => `
    <tr>
      <td style="padding:8px 0;vertical-align:top;">
        <span style="color:${COLORS.gold};font-size:16px;line-height:1;">◆</span>
      </td>
      <td style="padding:8px 0 8px 12px;color:${COLORS.gray1};font-size:14px;line-height:1.6;">${item}</td>
    </tr>`).join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;">${rows}</table>`;
}

// ─── Templates ─────────────────────────────────────────────────────────────────

function templateConfirmacaoEmail(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const nome = String(dados.nome || 'Usuário');
  const link = String(dados.link || `${APP_URL}/login`);
  const org = String(dados.organizacao || '');

  const conteudo = `
    ${badge('Confirme seu endereço de e-mail', COLORS.gold)}
    ${paragrafo(`Olá, <strong style="color:${COLORS.white};">${nome}</strong>!`)}
    ${paragrafo(`Obrigado por se cadastrar na <strong style="color:${COLORS.gold};">Recorra Multas</strong>${org ? ` como responsável pela organização <strong style="color:${COLORS.white};">${org}</strong>` : ''}. Para ativar sua conta e garantir a segurança do seu acesso, precisamos confirmar que este endereço de e-mail pertence a você.`)}
    ${divider()}
    <div style="background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <p style="color:${COLORS.gray2};font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Clique no botão abaixo para confirmar</p>
      ${btnPrimario('Confirmar Meu E-mail', link)}
      <p style="color:${COLORS.gray3};font-size:11px;margin:0;">Este link expira em <strong style="color:${COLORS.amber};">24 horas</strong></p>
    </div>
    ${alertBox('Se você não criou uma conta na Recorra Multas, ignore este e-mail com segurança.', 'warning')}
    ${divider()}
    <p style="color:${COLORS.gray3};font-size:12px;text-align:center;margin:0;line-height:1.8;">
      Se o botão não funcionar, copie e cole este link no navegador:<br/>
      <a href="${link}" style="color:${COLORS.gold};word-break:break-all;font-size:11px;">${link}</a>
    </p>
  `;

  return {
    assunto: `✅ Confirme seu e-mail — Recorra Multas`,
    html: layoutBase({
      titulo: 'Confirme seu E-mail',
      subtitulo: 'Um passo para ativar sua conta',
      icone: '✉️',
      conteudo,
      corAcento: COLORS.gold,
    }),
  };
}

function templateBoasVindas(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const nome = String(dados.nome || 'Usuário');
  const org = String(dados.organizacao || '');
  const email = String(dados.email || '');

  const conteudo = `
    ${badge('Conta Ativada com Sucesso', COLORS.green)}
    ${paragrafo(`Seja muito bem-vindo(a), <strong style="color:${COLORS.white};">${nome}</strong>!`)}
    ${paragrafo(`Sua conta na <strong style="color:${COLORS.gold};">Recorra Multas</strong> foi criada e confirmada com sucesso. Agora você tem acesso completo à plataforma mais avançada de gestão de recursos de trânsito do Brasil.`)}
    ${infoCard([
      { label: '👤 Responsável', valor: nome },
      { label: '🏢 Organização', valor: org || '—' },
      { label: '📧 E-mail', valor: email },
      { label: '📅 Cadastrado em', valor: new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'long', year: 'numeric' }) },
    ])}
    ${divider()}
    <p style="color:${COLORS.gray2};font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:0 0 12px;">O que você pode fazer agora:</p>
    ${listaFeatures([
      `<strong style="color:${COLORS.white};">Gerar recursos com IA</strong> — Produza recursos de multas profissionais em segundos com inteligência artificial`,
      `<strong style="color:${COLORS.white};">Cadastrar clientes</strong> — Gerencie sua carteira de clientes com CRM integrado`,
      `<strong style="color:${COLORS.white};">Rastrear veículos</strong> — Monitore frotas e receba alertas de novas infrações automaticamente`,
      `<strong style="color:${COLORS.white};">Gerar contratos</strong> — Assine contratos digitalmente com segurança jurídica`,
      `<strong style="color:${COLORS.white};">Controle financeiro</strong> — Acompanhe faturamento, cobranças e relatórios em tempo real`,
    ])}
    ${btnPrimario('Acessar Minha Conta Agora', `${APP_URL}/login`)}
  `;

  return {
    assunto: `🎉 Bem-vindo(a) à Recorra Multas, ${nome}!`,
    html: layoutBase({
      titulo: 'Bem-vindo(a) ao Recorra Multas!',
      subtitulo: 'Sua conta está pronta para uso',
      icone: '🎉',
      conteudo,
      corAcento: COLORS.green,
    }),
  };
}

function templateRedefinicaoSenha(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const nome = String(dados.nome || 'Usuário');
  const link = String(dados.link || `${APP_URL}/login`);
  const horario = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

  const conteudo = `
    ${badge('Solicitação de Redefinição de Senha', COLORS.amber)}
    ${paragrafo(`Olá, <strong style="color:${COLORS.white};">${nome}</strong>!`)}
    ${paragrafo(`Recebemos uma solicitação para redefinir a senha da sua conta na <strong style="color:${COLORS.gold};">Recorra Multas</strong>.`)}
    ${infoCard([
      { label: '📅 Solicitado em', valor: horario },
      { label: '⏰ Link válido por', valor: '1 hora', cor: COLORS.amber },
    ])}
    <div style="background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:12px;padding:28px;text-align:center;margin:24px 0;">
      <p style="color:${COLORS.gray1};font-size:14px;margin:0 0 4px;">Clique abaixo para criar uma nova senha segura</p>
      <p style="color:${COLORS.gray3};font-size:12px;margin:0 0 20px;">Após o clique, você será redirecionado para a página de nova senha</p>
      ${btnPrimario('Redefinir Minha Senha', link, COLORS.amber)}
    </div>
    ${alertBox('Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha atual permanece inalterada.', 'warning')}
    ${divider()}
    <p style="color:${COLORS.gray3};font-size:12px;text-align:center;margin:0;line-height:1.8;">
      🔒 Por segurança, nunca compartilhe este link com ninguém.<br/>
      Nossa equipe <strong>jamais</strong> solicitará sua senha ou este link.
    </p>
  `;

  return {
    assunto: `🔑 Redefinição de senha — Recorra Multas`,
    html: layoutBase({
      titulo: 'Redefinição de Senha',
      subtitulo: 'Solicitação recebida com segurança',
      icone: '🔑',
      conteudo,
      corAcento: COLORS.amber,
    }),
  };
}

function templateClienteAdicionado(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const adminNome = String(dados.admin_nome || 'Administrador');
  const clienteNome = String(dados.cliente_nome || 'Novo Cliente');
  const clienteDoc = String(dados.cliente_documento || '—');
  const clienteEmail = String(dados.cliente_email || '—');
  const clienteTelefone = String(dados.cliente_telefone || '—');
  const orgNome = String(dados.organizacao || '');
  const operador = String(dados.operador || adminNome);
  const horario = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const conteudo = `
    ${badge('Novo Cliente Cadastrado', COLORS.indigo)}
    ${paragrafo(`Olá, <strong style="color:${COLORS.white};">${adminNome}</strong>!`)}
    ${paragrafo(`Um novo cliente foi adicionado com sucesso à organização <strong style="color:${COLORS.gold};">${orgNome}</strong> na plataforma.`)}
    ${infoCard([
      { label: '👤 Cliente', valor: clienteNome, cor: COLORS.white },
      { label: '📄 CPF / CNPJ', valor: clienteDoc },
      { label: '📧 E-mail', valor: clienteEmail },
      { label: '📞 Telefone', valor: clienteTelefone },
      { label: '👨‍💼 Cadastrado por', valor: operador },
      { label: '🕐 Data / Hora', valor: horario },
    ])}
    ${alertBox('O cliente já está disponível na plataforma e pode ter veículos, contratos e recursos vinculados.', 'success')}
    ${btnPrimario('Ver Ficha do Cliente', `${APP_URL}/cadastro/lista-clientes`, COLORS.indigo)}
  `;

  return {
    assunto: `👤 Novo cliente cadastrado: ${clienteNome}`,
    html: layoutBase({
      titulo: 'Novo Cliente Cadastrado',
      subtitulo: orgNome,
      icone: '👤',
      conteudo,
      corAcento: COLORS.indigo,
    }),
  };
}

function templateRecursoGerado(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const adminNome = String(dados.admin_nome || 'Administrador');
  const clienteNome = String(dados.cliente_nome || '—');
  const instancia = String(dados.instancia || '—');
  const autoInfracao = String(dados.auto_infracao || '—');
  const placa = String(dados.placa || '—');
  const isIa = dados.is_ia === true || dados.is_ia === 'true';
  const horario = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const cor = isIa ? COLORS.purple : COLORS.gold;

  const conteudo = `
    ${badge(isIa ? 'Recurso Gerado com Inteligência Artificial' : 'Novo Recurso Gerado', cor)}
    ${paragrafo(`Olá, <strong style="color:${COLORS.white};">${adminNome}</strong>!`)}
    ${paragrafo(`Um novo recurso foi gerado ${isIa ? `com <strong style="color:${COLORS.purple};">Inteligência Artificial ✨</strong>` : 'manualmente'} na plataforma.`)}
    ${infoCard([
      { label: '👤 Cliente', valor: clienteNome, cor: COLORS.white },
      { label: '⚖️ Instância', valor: instancia },
      { label: '🚗 Placa', valor: placa },
      { label: '📋 Auto de Infração', valor: autoInfracao },
      { label: '🤖 Gerado por', valor: isIa ? 'Inteligência Artificial' : 'Operador Humano', cor: isIa ? COLORS.purple : COLORS.gray1 },
      { label: '🕐 Data / Hora', valor: horario },
    ])}
    ${alertBox('O recurso está disponível na plataforma para revisão, edição e exportação em PDF com qualidade profissional.', 'success')}
    ${btnPrimario('Visualizar Recurso', `${APP_URL}/recursos-ia`, cor)}
  `;

  return {
    assunto: `📝 Recurso gerado${isIa ? ' com IA' : ''}: ${clienteNome}`,
    html: layoutBase({
      titulo: isIa ? 'Recurso Gerado com IA' : 'Recurso Gerado',
      subtitulo: `Para: ${clienteNome}`,
      icone: isIa ? '🤖' : '📝',
      conteudo,
      corAcento: cor,
    }),
  };
}

function templateNotificacaoBlindada(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const adminNome = String(dados.admin_nome || 'Administrador');
  const clienteNome = String(dados.cliente_nome || '—');
  const operador = String(dados.operador || '—');
  const horario = String(dados.horario || new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
  const autoInfracao = String(dados.auto_infracao || '—');
  const hashCompleto = String(dados.hash || '');
  const hash = hashCompleto.length > 16 ? hashCompleto.substring(0, 16) + '...' : hashCompleto;
  const statusRecurso = String(dados.status_recurso || '—');

  const conteudo = `
    ${badge('Registro Blindado — Confirmação Jurídica', COLORS.green)}
    ${paragrafo(`Olá, <strong style="color:${COLORS.white};">${adminNome}</strong>!`)}
    ${paragrafo(`A notificação ao cliente foi registrada no <strong style="color:${COLORS.green};">Registro Blindado</strong> com plena força probatória. Este evento está protegido criptograficamente e não pode ser alterado ou excluído.`)}
    ${infoCard([
      { label: '👤 Cliente Notificado', valor: clienteNome, cor: COLORS.white },
      { label: '👨‍💼 Operador Responsável', valor: operador },
      { label: '🕐 Horário (Brasília)', valor: horario },
      { label: '📋 Auto de Infração', valor: autoInfracao },
      { label: '⚖️ Status do Recurso', valor: statusRecurso },
      { label: '🔐 Hash SHA-256', valor: hash, cor: COLORS.green },
    ])}
    <div style="background:${COLORS.green}10;border:1px solid ${COLORS.green}30;border-radius:12px;padding:20px;margin:20px 0;">
      <p style="color:${COLORS.green};font-size:13px;font-weight:800;margin:0 0 8px;text-align:center;">🔒 REGISTRO IMUTÁVEL</p>
      <p style="color:${COLORS.gray2};font-size:12px;margin:0;text-align:center;line-height:1.6;">
        Este registro possui hash criptográfico SHA-256, data e horário com timezone de Brasília, IP do operador e confirmação explícita do usuário — garantindo total rastreabilidade jurídica.
      </p>
    </div>
    ${btnPrimario('Ver Auditoria Completa', `${APP_URL}/status-recurso`, COLORS.green)}
  `;

  return {
    assunto: `🔒 Notificação Blindada registrada: ${clienteNome} — ${horario}`,
    html: layoutBase({
      titulo: 'Notificação Blindada Registrada',
      subtitulo: 'Registro jurídico imutável confirmado',
      icone: '🔒',
      conteudo,
      corAcento: COLORS.green,
    }),
  };
}

function templateFaturamento(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const adminNome = String(dados.admin_nome || 'Administrador');
  const orgNome = String(dados.organizacao || '');
  const valorNum = parseFloat(String(dados.valor || '0'));
  const valor = valorNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const descricao = String(dados.descricao || 'Assinatura Recorra Multas');
  const vencimento = String(dados.vencimento || '—');
  const status = String(dados.status || 'pending');

  const statusMap: Record<string, { texto: string; cor: string; tipo: 'success' | 'warning' | 'error' }> = {
    paid:    { texto: 'Pagamento Confirmado',    cor: COLORS.green, tipo: 'success' },
    pending: { texto: 'Aguardando Pagamento',    cor: COLORS.amber, tipo: 'warning' },
    overdue: { texto: 'Pagamento em Atraso',     cor: COLORS.red,   tipo: 'error'   },
    cancelled:{ texto: 'Cancelado',              cor: COLORS.red,   tipo: 'error'   },
  };
  const s = statusMap[status] || statusMap.pending;

  const conteudo = `
    ${badge('Informação de Faturamento', COLORS.gold)}
    ${paragrafo(`Olá, <strong style="color:${COLORS.white};">${adminNome}</strong>!`)}
    ${paragrafo(`Há uma movimentação financeira na conta da organização <strong style="color:${COLORS.gold};">${orgNome}</strong>.`)}
    <div style="background:${COLORS.card};border:2px solid ${s.cor}40;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <p style="color:${COLORS.gray2};font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Valor</p>
      <p style="color:${COLORS.white};font-size:36px;font-weight:900;margin:0 0 8px;letter-spacing:-1px;">${valor}</p>
      <span style="display:inline-block;background:${s.cor}20;color:${s.cor};border:1px solid ${s.cor}40;border-radius:20px;padding:4px 14px;font-size:11px;font-weight:800;">${s.texto}</span>
    </div>
    ${infoCard([
      { label: '📋 Descrição', valor: descricao },
      { label: '🏢 Organização', valor: orgNome },
      { label: '📅 Vencimento', valor: vencimento },
      { label: '🏷️ Status', valor: s.texto, cor: s.cor },
    ])}
    ${status === 'pending' ? alertBox('Realize o pagamento até a data de vencimento para manter o acesso à plataforma sem interrupções.', 'warning') : ''}
    ${status === 'paid' ? alertBox('Pagamento confirmado! Seu acesso à plataforma está garantido.', 'success') : ''}
    ${btnPrimario('Ver Detalhes Financeiros', `${APP_URL}/checkout`)}
  `;

  return {
    assunto: status === 'paid'
      ? `✅ Pagamento confirmado: ${valor} — Recorra Multas`
      : `💰 Fatura: ${descricao} — ${valor}`,
    html: layoutBase({
      titulo: 'Informação de Faturamento',
      subtitulo: orgNome,
      icone: status === 'paid' ? '✅' : '💰',
      conteudo,
      corAcento: s.cor,
    }),
  };
}

function templateRastreamentoVencimento(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const adminNome = String(dados.admin_nome || 'Administrador');
  const placa = String(dados.placa || '');
  const modelo = String(dados.modelo || '');
  const vencimento = String(dados.vencimento || '—');
  const diasRestantes = Number(dados.dias_restantes || 0);
  const orgNome = String(dados.organizacao || '');
  const tipo = String(dados.tipo_rastreamento || 'Monitoramento');

  const urgencia = diasRestantes === 0
    ? { cor: COLORS.red,   icon: '🚨', nivel: 'CRÍTICO — Vencimento Hoje!',    tipo: 'error'   as const }
    : diasRestantes <= 3
    ? { cor: COLORS.red,   icon: '🚨', nivel: 'URGENTE — Vence em Breve',     tipo: 'error'   as const }
    : diasRestantes <= 7
    ? { cor: COLORS.amber, icon: '⚠️', nivel: 'ATENÇÃO — Próximo do Vencimento', tipo: 'warning' as const }
    : { cor: COLORS.gold,  icon: '📅', nivel: 'Aviso de Vencimento',           tipo: 'info'    as const };

  const conteudo = `
    ${badge(`${urgencia.nivel}`, urgencia.cor)}
    ${paragrafo(`Olá, <strong style="color:${COLORS.white};">${adminNome}</strong>!`)}
    ${paragrafo(`O rastreamento de um veículo da organização <strong style="color:${COLORS.gold};">${orgNome}</strong> está próximo do vencimento e requer sua atenção.`)}
    <div style="background:${urgencia.cor}15;border:2px solid ${urgencia.cor}40;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
      <p style="color:${urgencia.cor};font-size:48px;font-weight:900;margin:0 0 4px;line-height:1;">${diasRestantes}</p>
      <p style="color:${urgencia.cor};font-size:13px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:1px;">dia${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}</p>
    </div>
    ${infoCard([
      { label: '🚗 Placa', valor: placa, cor: COLORS.white },
      { label: '🚙 Modelo', valor: modelo },
      { label: '📋 Tipo', valor: tipo },
      { label: '📅 Data de Vencimento', valor: vencimento, cor: urgencia.cor },
    ])}
    ${alertBox('Renove o rastreamento agora para garantir o monitoramento contínuo deste veículo e não perder nenhuma infração.', urgencia.tipo)}
    ${btnPrimario('Renovar Rastreamento Agora', `${APP_URL}/rastreamento`, urgencia.cor)}
  `;

  return {
    assunto: `${urgencia.icon} Rastreamento vence em ${diasRestantes} dia(s): ${placa} — ${modelo}`,
    html: layoutBase({
      titulo: `Rastreamento Vencendo — ${placa}`,
      subtitulo: orgNome,
      icone: urgencia.icon,
      conteudo,
      corAcento: urgencia.cor,
    }),
  };
}

function templateUsuarioAdicionado(dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  const nome = String(dados.nome || 'Usuário');
  const email = String(dados.email || '');
  const orgNome = String(dados.organizacao || '');
  const role = String(dados.role || 'user');
  const adminNome = String(dados.admin_nome || 'Administrador');
  const roleLabel = role === 'admin' ? 'Administrador' : 'Usuário Operador';

  const conteudo = `
    ${badge('Você foi adicionado a uma organização', COLORS.indigo)}
    ${paragrafo(`Olá, <strong style="color:${COLORS.white};">${nome}</strong>!`)}
    ${paragrafo(`O administrador <strong style="color:${COLORS.white};">${adminNome}</strong> adicionou você como <strong style="color:${COLORS.gold};">${roleLabel}</strong> na organização <strong style="color:${COLORS.white};">${orgNome}</strong> na plataforma <strong style="color:${COLORS.gold};">Recorra Multas</strong>.`)}
    ${infoCard([
      { label: '👤 Seu nome', valor: nome, cor: COLORS.white },
      { label: '📧 E-mail de acesso', valor: email },
      { label: '🏢 Organização', valor: orgNome },
      { label: '🎭 Sua função', valor: roleLabel, cor: COLORS.gold },
      { label: '📅 Adicionado em', valor: new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: 'long', year: 'numeric' }) },
    ])}
    ${alertBox('Use seu e-mail e sua senha para acessar a plataforma. Se não possui senha, use a opção "Esqueci minha senha" na tela de login.', 'info')}
    ${btnPrimario('Acessar a Plataforma', `${APP_URL}/login`, COLORS.indigo)}
    ${divider()}
    <p style="color:${COLORS.gray3};font-size:12px;text-align:center;margin:0;">
      Ficou com dúvidas? Entre em contato com o administrador da sua organização.
    </p>
  `;

  return {
    assunto: `👥 Você foi adicionado à ${orgNome} — Recorra Multas`,
    html: layoutBase({
      titulo: 'Bem-vindo à sua Organização!',
      subtitulo: orgNome,
      icone: '👥',
      conteudo,
      corAcento: COLORS.indigo,
    }),
  };
}

// ─── Seletor ───────────────────────────────────────────────────────────────────

function gerarEmail(tipo: EmailPayload['tipo'], dados: Record<string, string | number | boolean>): { assunto: string; html: string } {
  switch (tipo) {
    case 'confirmacao_email':      return templateConfirmacaoEmail(dados);
    case 'boas_vindas':            return templateBoasVindas(dados);
    case 'redefinicao_senha':      return templateRedefinicaoSenha(dados);
    case 'cliente_adicionado':     return templateClienteAdicionado(dados);
    case 'recurso_gerado':         return templateRecursoGerado(dados);
    case 'notificacao_blindada':   return templateNotificacaoBlindada(dados);
    case 'faturamento':            return templateFaturamento(dados);
    case 'rastreamento_vencimento':return templateRastreamentoVencimento(dados);
    case 'usuario_adicionado':     return templateUsuarioAdicionado(dados);
    default: throw new Error(`Tipo de email desconhecido: ${tipo}`);
  }
}

// ─── Handler principal ─────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    if (!BREVO_API_KEY) {
      console.error('[enviar-email] BREVO_API_KEY não configurada');
      return new Response(JSON.stringify({ error: 'Configuração de email ausente' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
        name: SENDER_NAME,
        email: SENDER_EMAIL,
      },
      to: [{ email: destinatario_email, name: destinatario_nome }],
      subject: assunto,
      htmlContent: html,
      replyTo: {
        email: SENDER_EMAIL,
        name: SENDER_NAME,
      },
      headers: {
        'X-Mailer': 'Recorra Multas Platform',
      },
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
      console.error('[enviar-email] Erro Brevo API:', response.status, JSON.stringify(result));
      return new Response(JSON.stringify({ error: `Brevo API error [${response.status}]: ${JSON.stringify(result)}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[enviar-email] ✅ Email [${tipo}] → ${destinatario_email} | messageId: ${result.messageId}`);

    return new Response(JSON.stringify({ success: true, messageId: result.messageId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[enviar-email] Erro geral:', err);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
