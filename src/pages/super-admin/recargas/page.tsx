import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export default function RecargasPage() {
  const { user } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'pendente' | 'aprovado' | 'rejeitado' | 'todos'>('pendente');
  const [processando, setProcessando] = useState<string | null>(null);
  const [observacao, setObservacao] = useState<Record<string, string>>({});

  const fetchSolicitacoes = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  const aprovar = async (sol: Solicitacao) => {
    setProcessando(sol.id);
    try {
      // 1. Busca saldo atual
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('saldo_sacavel')
        .eq('id', sol.organization_id)
        .limit(1);

      if (orgError) throw orgError;

      const saldoAtual = (orgData?.[0] as any)?.saldo_sacavel || 0;
      const novoSaldo = saldoAtual + sol.valor;

      // 2. Atualiza saldo
      await supabase
        .from('organizations')
        .update({ saldo_sacavel: novoSaldo })
        .eq('id', sol.organization_id);

      // 3. Registra no faturamento
      await supabase.from('faturamento').insert({
        organization_id: sol.organization_id,
        descricao: `Recarga via PIX aprovada — R$ ${sol.valor.toFixed(2).replace('.', ',')}`,
        valor: sol.valor,
        status: 'paid',
        tipo: 'credit_purchase',
        metodo_pagamento: 'pix',
        data_pagamento: new Date().toISOString().split('T')[0],
      } as any);

      // 4. Atualiza status da solicitação
      await (supabase as any)
        .from('solicitacoes_recarga')
        .update({
          status: 'aprovado',
          aprovado_por: user?.id,
          aprovado_em: new Date().toISOString(),
          observacao: observacao[sol.id] || null,
        })
        .eq('id', sol.id);

      await fetchSolicitacoes();
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      alert('Erro ao aprovar solicitação.');
    } finally {
      setProcessando(null);
    }
  };

  const rejeitar = async (sol: Solicitacao) => {
    if (!observacao[sol.id]?.trim()) {
      alert('Informe o motivo da rejeição no campo de observação.');
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

      await fetchSolicitacoes();
    } catch (err) {
      console.error('Erro ao rejeitar:', err);
      alert('Erro ao rejeitar solicitação.');
    } finally {
      setProcessando(null);
    }
  };

  const filtradas = solicitacoes.filter(s => filtro === 'todos' || s.status === filtro);
  const pendentes = solicitacoes.filter(s => s.status === 'pendente').length;

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
            Solicitações de Recarga
            {pendentes > 0 && (
              <span className="px-3 py-1 bg-amber-500 text-white text-sm font-black rounded-full animate-pulse">
                {pendentes} pendente{pendentes > 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">Aprove ou rejeite solicitações de recarga via PIX</p>
        </div>
        <button
          onClick={fetchSolicitacoes}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <i className="ri-refresh-line"></i> Atualizar
        </button>
      </div>

      {/* Filtros */}
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
            {f === 'pendente' && pendentes > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-amber-400 text-white text-[10px] rounded-full">{pendentes}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
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

                {/* Ações — só para pendentes */}
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
    </div>
  );
}
