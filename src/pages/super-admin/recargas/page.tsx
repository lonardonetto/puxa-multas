import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Solicitacao {
  id: string;
  organization_id: string;
  user_id: string;
  valor: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  metodo_pagamento: string;
  observacao: string | null;
  created_at: string;
  org_nome?: string;
}

interface SolicitacaoPlano {
  id: string;
  organization_id: string;
  user_id: string;
  plano_id: string;
  plano_slug: string;
  plano_nome: string;
  ciclo: string;
  valor: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  observacao: string | null;
  created_at: string;
  org_nome?: string;
  user_email?: string;
  user_nome?: string;
}

type TabType = 'recargas' | 'planos';

export default function RecargasPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>('recargas');

  // --- RECARGAS ---
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loadingRecargas, setLoadingRecargas] = useState(true);
  const [filtro, setFiltro] = useState<'pendente' | 'aprovado' | 'rejeitado' | 'todos'>('pendente');
  const [processando, setProcessando] = useState<string | null>(null);
  const [observacao, setObservacao] = useState<Record<string, string>>({});

  // --- PLANOS ---
  const [solicitacoesPlano, setSolicitacoesPlano] = useState<SolicitacaoPlano[]>([]);
  const [loadingPlanos, setLoadingPlanos] = useState(true);
  const [filtroPlano, setFiltroPlano] = useState<'pendente' | 'aprovado' | 'rejeitado' | 'todos'>('pendente');
  const [processandoPlano, setProcessandoPlano] = useState<string | null>(null);
  const [observacaoPlano, setObservacaoPlano] = useState<Record<string, string>>({});

  const fetchSolicitacoes = useCallback(async () => {
    setLoadingRecargas(true);
    try {
      const { data, error } = await (supabase as any)
        .from('solicitacoes_recarga')
        .select('*, organizations(nome)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((s: any) => ({
        ...s,
        org_nome: s.organizations?.nome || '—',
      }));
      setSolicitacoes(mapped);
    } catch (err) {
      console.error('Erro ao buscar solicitações:', err);
    } finally {
      setLoadingRecargas(false);
    }
  }, []);

  const fetchSolicitacoesPlano = useCallback(async () => {
    setLoadingPlanos(true);
    try {
      const { data, error } = await (supabase as any)
        .from('solicitacoes_plano')
        .select('*, organizations(nome)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar emails dos usuários
      const userIds = [...new Set((data || []).map((s: any) => s.user_id))];
      let usersMap: Record<string, { email: string; nome: string }> = {};
      if (userIds.length > 0) {
        const { data: usersData } = await (supabase as any)
          .from('users')
          .select('id, email, nome')
          .in('id', userIds);
        (usersData || []).forEach((u: any) => {
          usersMap[u.id] = { email: u.email, nome: u.nome };
        });
      }

      const mapped = (data || []).map((s: any) => ({
        ...s,
        org_nome: s.organizations?.nome || '—',
        user_email: usersMap[s.user_id]?.email || '',
        user_nome: usersMap[s.user_id]?.nome || 'Cliente',
      }));
      setSolicitacoesPlano(mapped);
    } catch (err) {
      console.error('Erro ao buscar solicitações de plano:', err);
    } finally {
      setLoadingPlanos(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitacoes();
    fetchSolicitacoesPlano();
  }, [fetchSolicitacoes, fetchSolicitacoesPlano]);

  // ==================== APROVAR RECARGA ====================
  const aprovar = async (sol: Solicitacao) => {
    setProcessando(sol.id);
    try {
      const [orgResult, userResult] = await Promise.all([
        supabase.from('organizations').select('saldo_sacavel, nome').eq('id', sol.organization_id).limit(1),
        supabase.from('users').select('email, nome').eq('id', sol.user_id).limit(1),
      ]);

      if (orgResult.error) throw orgResult.error;

      const saldoAtual = (orgResult.data?.[0] as any)?.saldo_sacavel || 0;
      const novoSaldo = saldoAtual + sol.valor;
      const userEmail = (userResult.data?.[0] as any)?.email || '';
      const userNome = (userResult.data?.[0] as any)?.nome || 'Cliente';
      const orgNome = (orgResult.data?.[0] as any)?.nome || sol.org_nome || '';

      await supabase.from('organizations').update({ saldo_sacavel: novoSaldo }).eq('id', sol.organization_id);

      await supabase.from('faturamento').insert({
        organization_id: sol.organization_id,
        descricao: `Recarga via PIX aprovada — R$ ${sol.valor.toFixed(2).replace('.', ',')}`,
        valor: sol.valor,
        status: 'paid',
        tipo: 'credit_purchase',
        metodo_pagamento: 'pix',
        data_pagamento: new Date().toISOString().split('T')[0],
      } as any);

      await (supabase as any)
        .from('solicitacoes_recarga')
        .update({
          status: 'aprovado',
          aprovado_por: user?.id,
          aprovado_em: new Date().toISOString(),
          observacao: observacao[sol.id] || null,
        })
        .eq('id', sol.id);

      try {
        await (supabase as any).from('notificacoes_recarga').insert({
          organization_id: sol.organization_id,
          solicitacao_id: sol.id,
          tipo: 'pix_aprovado',
          titulo: 'Recarga PIX aprovada! 🎉',
          mensagem: `R$ ${sol.valor.toFixed(2).replace('.', ',')} já disponível na sua conta.`,
          valor: sol.valor,
          para_super_admin: false,
        });
      } catch (notifErr) {
        console.warn('Notificação de aprovação não criada:', notifErr);
      }

      if (userEmail) {
        try {
          await supabase.functions.invoke('enviar-email', {
            body: {
              tipo: 'pix_recarga',
              destinatario_email: userEmail,
              destinatario_nome: userNome,
              dados: { status: 'aprovado', valor: sol.valor, organizacao: orgNome },
            },
          });
        } catch (_) {}
      }

      toast.success('Recarga aprovada com sucesso!');
      await fetchSolicitacoes();
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      toast.error('Erro ao aprovar solicitação.');
    } finally {
      setProcessando(null);
    }
  };

  const rejeitar = async (sol: Solicitacao) => {
    if (!observacao[sol.id]?.trim()) {
      toast.error('Informe o motivo da rejeição no campo de observação.');
      return;
    }
    setProcessando(sol.id);
    try {
      await (supabase as any)
        .from('solicitacoes_recarga')
        .update({
          status: 'rejeitado',
          aprovado_por: user?.id,
          aprovado_em: new Date().toISOString(),
          observacao: observacao[sol.id],
        })
        .eq('id', sol.id);

      toast.success('Recarga rejeitada.');
      await fetchSolicitacoes();
    } catch (err) {
      console.error('Erro ao rejeitar:', err);
      toast.error('Erro ao rejeitar solicitação.');
    } finally {
      setProcessando(null);
    }
  };

  // ==================== APROVAR PLANO ====================
  const aprovarPlano = async (sol: SolicitacaoPlano) => {
    setProcessandoPlano(sol.id);
    try {
      // 1. Atualiza o plano da organização + data de expiração
      const expiracao = new Date();
      if (sol.ciclo === 'anual') expiracao.setFullYear(expiracao.getFullYear() + 1);
      else expiracao.setMonth(expiracao.getMonth() + 1);

      const { error: updateOrgError } = await supabase
        .from('organizations')
        .update({
          plano: sol.plano_slug,
          plan: sol.plano_slug,
          plano_expiracao_em: expiracao.toISOString(),
          plano_ciclo: sol.ciclo,
        } as any)
        .eq('id', sol.organization_id);

      if (updateOrgError) throw updateOrgError;

      // 2. Registra no faturamento
      await supabase.from('faturamento').insert({
        organization_id: sol.organization_id,
        descricao: `Assinatura plano ${sol.plano_nome} (${sol.ciclo}) — R$ ${sol.valor.toFixed(2).replace('.', ',')}`,
        valor: sol.valor,
        status: 'paid',
        tipo: 'subscription',
        metodo_pagamento: 'pix',
        data_pagamento: new Date().toISOString().split('T')[0],
      } as any);

      // 3. Atualiza solicitação para aprovado
      await (supabase as any)
        .from('solicitacoes_plano')
        .update({
          status: 'aprovado',
          aprovado_por: user?.id,
          aprovado_em: new Date().toISOString(),
          observacao: observacaoPlano[sol.id] || null,
        })
        .eq('id', sol.id);

      // 4. Notificação sino para o cliente
      try {
        await (supabase as any).from('notificacoes_recarga').insert({
          organization_id: sol.organization_id,
          solicitacao_id: sol.id,
          tipo: 'plano_aprovado',
          titulo: `Plano ${sol.plano_nome} ativado! 🎉`,
          mensagem: `Seu plano foi ativado. Agora você tem acesso a todos os benefícios do plano ${sol.plano_nome}.`,
          valor: sol.valor,
          para_super_admin: false,
        });
      } catch (_) {}

      // 5. Email para o cliente
      if (sol.user_email) {
        try {
          await supabase.functions.invoke('enviar-email', {
            body: {
              tipo: 'plano_aprovado',
              destinatario_email: sol.user_email,
              destinatario_nome: sol.user_nome,
              dados: {
                plano_nome: sol.plano_nome,
                ciclo: sol.ciclo,
                valor: sol.valor,
                organizacao: sol.org_nome,
              },
            },
          });
        } catch (_) {}
      }

      toast.success(`Plano ${sol.plano_nome} ativado para ${sol.org_nome}!`);
      await fetchSolicitacoesPlano();
    } catch (err) {
      console.error('Erro ao aprovar plano:', err);
      toast.error('Erro ao aprovar plano.');
    } finally {
      setProcessandoPlano(null);
    }
  };

  const rejeitarPlano = async (sol: SolicitacaoPlano) => {
    if (!observacaoPlano[sol.id]?.trim()) {
      toast.error('Informe o motivo da rejeição.');
      return;
    }
    setProcessandoPlano(sol.id);
    try {
      await (supabase as any)
        .from('solicitacoes_plano')
        .update({
          status: 'rejeitado',
          aprovado_por: user?.id,
          aprovado_em: new Date().toISOString(),
          observacao: observacaoPlano[sol.id],
        })
        .eq('id', sol.id);

      // Notificação sino para o cliente
      try {
        await (supabase as any).from('notificacoes_recarga').insert({
          organization_id: sol.organization_id,
          solicitacao_id: sol.id,
          tipo: 'plano_rejeitado',
          titulo: `Solicitação do plano ${sol.plano_nome} rejeitada`,
          mensagem: `Motivo: ${observacaoPlano[sol.id]}`,
          valor: sol.valor,
          para_super_admin: false,
        });
      } catch (_) {}

      toast.success('Solicitação de plano rejeitada.');
      await fetchSolicitacoesPlano();
    } catch (err) {
      console.error('Erro ao rejeitar plano:', err);
      toast.error('Erro ao rejeitar.');
    } finally {
      setProcessandoPlano(null);
    }
  };

  const filtradas = solicitacoes.filter(s => filtro === 'todos' || s.status === filtro);
  const filtradosPlano = solicitacoesPlano.filter(s => filtroPlano === 'todos' || s.status === filtroPlano);
  const pendentesRecarga = solicitacoes.filter(s => s.status === 'pendente').length;
  const pendentesPlano = solicitacoesPlano.filter(s => s.status === 'pendente').length;

  const statusBadge = (status: string) => {
    if (status === 'pendente') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'aprovado') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const statusLabel = (status: string) => {
    if (status === 'pendente') return '⏳ Pendente';
    if (status === 'aprovado') return '✅ Aprovado';
    return '❌ Rejeitado';
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            Aprovações
            {(pendentesRecarga + pendentesPlano) > 0 && (
              <span className="px-3 py-1 bg-amber-500 text-white text-sm font-black rounded-full animate-pulse">
                {pendentesRecarga + pendentesPlano} pendente{(pendentesRecarga + pendentesPlano) > 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">Gerencie solicitações de recarga e assinatura de planos</p>
        </div>
        <button
          onClick={() => { fetchSolicitacoes(); fetchSolicitacoesPlano(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <i className="ri-refresh-line"></i> Atualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-0">
        <button
          onClick={() => setTab('recargas')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all -mb-px ${
            tab === 'recargas'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="ri-bank-card-line mr-2"></i>
          Recargas PIX
          {pendentesRecarga > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-amber-400 text-white text-[10px] font-black rounded-full">{pendentesRecarga}</span>
          )}
        </button>
        <button
          onClick={() => setTab('planos')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all -mb-px ${
            tab === 'planos'
              ? 'border-[#1E3A8A] text-[#1E3A8A]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="ri-price-tag-3-line mr-2"></i>
          Assinaturas de Plano
          {pendentesPlano > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-amber-400 text-white text-[10px] font-black rounded-full">{pendentesPlano}</span>
          )}
        </button>
      </div>

      {/* ============ TAB RECARGAS ============ */}
      {tab === 'recargas' && (
        <>
          <div className="flex gap-2 mb-6">
            {(['pendente', 'aprovado', 'rejeitado', 'todos'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                  filtro === f
                    ? 'bg-[#1E3A8A] text-white shadow'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pendente' && pendentesRecarga > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-amber-400 text-white text-[10px] rounded-full">{pendentesRecarga}</span>
                )}
              </button>
            ))}
          </div>

          {loadingRecargas ? (
            <div className="flex items-center justify-center py-20">
              <i className="ri-loader-4-line text-4xl text-gray-300 animate-spin"></i>
            </div>
          ) : filtradas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <i className="ri-inbox-line text-5xl text-gray-200 mb-4 block"></i>
              <p className="text-gray-400 font-medium">Nenhuma solicitação {filtro !== 'todos' ? filtro : ''}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtradas.map(sol => (
                <div
                  key={sol.id}
                  className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${
                    sol.status === 'pendente' ? 'border-amber-200 shadow-amber-50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusBadge(sol.status)}`}>
                          {statusLabel(sol.status)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(sol.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-2xl font-black text-[#1E3A8A]">
                            R$ {sol.valor.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            <i className="ri-building-line mr-1"></i>
                            {sol.org_nome}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">
                            PIX · {sol.metodo_pagamento}
                          </p>
                        </div>
                      </div>

                      {sol.observacao && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-100">
                          <strong>Observação:</strong> {sol.observacao}
                        </div>
                      )}
                    </div>

                    {sol.status === 'pendente' && (
                      <div className="flex flex-col gap-2 min-w-[220px]">
                        <textarea
                          placeholder="Observação (obrigatória para rejeitar)"
                          value={observacao[sol.id] || ''}
                          onChange={e => setObservacao(prev => ({ ...prev, [sol.id]: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => aprovar(sol)}
                            disabled={processando === sol.id}
                            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {processando === sol.id ? (
                              <i className="ri-loader-4-line animate-spin"></i>
                            ) : (
                              <><i className="ri-check-line"></i> Aprovar</>
                            )}
                          </button>
                          <button
                            onClick={() => rejeitar(sol)}
                            disabled={processando === sol.id}
                            className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <i className="ri-close-line"></i> Rejeitar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ============ TAB PLANOS ============ */}
      {tab === 'planos' && (
        <>
          <div className="flex gap-2 mb-6">
            {(['pendente', 'aprovado', 'rejeitado', 'todos'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltroPlano(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                  filtroPlano === f
                    ? 'bg-[#1E3A8A] text-white shadow'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pendente' && pendentesPlano > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-amber-400 text-white text-[10px] rounded-full">{pendentesPlano}</span>
                )}
              </button>
            ))}
          </div>

          {loadingPlanos ? (
            <div className="flex items-center justify-center py-20">
              <i className="ri-loader-4-line text-4xl text-gray-300 animate-spin"></i>
            </div>
          ) : filtradosPlano.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <i className="ri-price-tag-3-line text-5xl text-gray-200 mb-4 block"></i>
              <p className="text-gray-400 font-medium">Nenhuma solicitação de plano {filtroPlano !== 'todos' ? filtroPlano : ''}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtradosPlano.map(sol => (
                <div
                  key={sol.id}
                  className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${
                    sol.status === 'pendente' ? 'border-amber-200 shadow-amber-50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusBadge(sol.status)}`}>
                          {statusLabel(sol.status)}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-full">
                          PLANO: {sol.plano_nome.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(sol.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div>
                        <p className="text-2xl font-black text-[#1E3A8A]">
                          R$ {sol.valor.toFixed(2).replace('.', ',')}
                          <span className="text-sm font-normal text-gray-400 ml-1">/{sol.ciclo}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          <i className="ri-building-line mr-1"></i>
                          {sol.org_nome}
                        </p>
                        {sol.user_email && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            <i className="ri-user-line mr-1"></i>
                            {sol.user_nome} · {sol.user_email}
                          </p>
                        )}
                      </div>

                      {sol.observacao && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-100">
                          <strong>Observação:</strong> {sol.observacao}
                        </div>
                      )}
                    </div>

                    {sol.status === 'pendente' && (
                      <div className="flex flex-col gap-2 min-w-[240px]">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                          <i className="ri-information-line mr-1"></i>
                          Ao aprovar, o plano da organização será alterado para <strong>{sol.plano_nome}</strong>.
                        </div>
                        <textarea
                          placeholder="Observação (obrigatória para rejeitar)"
                          value={observacaoPlano[sol.id] || ''}
                          onChange={e => setObservacaoPlano(prev => ({ ...prev, [sol.id]: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => aprovarPlano(sol)}
                            disabled={processandoPlano === sol.id}
                            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {processandoPlano === sol.id ? (
                              <i className="ri-loader-4-line animate-spin"></i>
                            ) : (
                              <><i className="ri-check-line"></i> Ativar Plano</>
                            )}
                          </button>
                          <button
                            onClick={() => rejeitarPlano(sol)}
                            disabled={processandoPlano === sol.id}
                            className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <i className="ri-close-line"></i> Rejeitar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
