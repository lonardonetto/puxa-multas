import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecursos } from '../../hooks/useRecursos';
import { supabase } from '../../lib/supabase';

export default function StatusRecurso() {
  const navigate = useNavigate();
  const { fetchRecursosDetalhados, loading } = useRecursos();
  const [recursosList, setRecursosList] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState<any>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [historicoAberto, setHistoricoAberto] = useState<string | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchRecursosDetalhados();
    setRecursosList(data);
  }, [fetchRecursosDetalhados]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calcularDiasAteProximaRevisao = (dataProximoLembrete: string | null, dataUltimaNotificacao: string | null, dataProtocolo: string | null, intervalo: number) => {
    const hojeBrasilia = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    hojeBrasilia.setHours(0, 0, 0, 0);
    if (dataProximoLembrete) {
      const partes = dataProximoLembrete.split('T')[0].split('-');
      const dataAlvo = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
      dataAlvo.setHours(0, 0, 0, 0);
      return Math.ceil((dataAlvo.getTime() - hojeBrasilia.getTime()) / (1000 * 60 * 60 * 24));
    }
    const referencia = dataUltimaNotificacao || dataProtocolo;
    if (!referencia) return intervalo;
    const partes = referencia.split('T')[0].split('-');
    const dataRef = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    dataRef.setDate(dataRef.getDate() + intervalo);
    dataRef.setHours(0, 0, 0, 0);
    return Math.ceil((dataRef.getTime() - hojeBrasilia.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getNivelAlerta = (diasRestantes: number) => {
    if (diasRestantes <= 0) return { nivel: 'crítico', icone: 'ri-alarm-warning-fill', bgRow: 'bg-red-50/60', badge: 'bg-red-100 text-red-700 border border-red-300 animate-pulse' };
    if (diasRestantes === 1) return { nivel: 'urgente', icone: 'ri-error-warning-fill', bgRow: 'bg-orange-50/40', badge: 'bg-orange-100 text-orange-700 border border-orange-300' };
    if (diasRestantes === 2) return { nivel: 'atenção', icone: 'ri-alert-fill', bgRow: '', badge: 'bg-yellow-100 text-yellow-700 border border-yellow-300' };
    return { nivel: 'normal', icone: 'ri-checkbox-circle-fill', bgRow: '', badge: 'bg-green-100 text-green-700 border border-green-300' };
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = { 'rascunho': 'Rascunho', 'protocolado': 'Protocolado', 'aguardando_julgamento': 'Aguardando Julgamento', 'deferido': 'Deferido', 'indeferido': 'Indeferido' };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === 'deferido') return 'bg-green-100 text-green-700';
    if (status === 'indeferido') return 'bg-red-100 text-red-600';
    if (status === 'aguardando_julgamento') return 'bg-yellow-100 text-orange-600';
    return 'bg-blue-100 text-blue-700';
  };

  // Abre modal de confirmação antes de notificar
  const abrirConfirmacao = (recurso: any) => {
    const cliente = recurso.multas?.veiculos?.clientes;
    if (!cliente) return;
    const telefone = cliente.celular || cliente.telefone;
    const nome = cliente.nome_completo;
    const auto = recurso.multas?.numero_auto || 'N/A';
    const mensagem = `Olá, ${nome}! Gostaríamos de informar que seu recurso (Auto: ${auto}) está com status: ${getStatusLabel(recurso.status)}. Estamos acompanhando o processo.`;
    setConfirmModal({ recurso, cliente, telefone, nome, auto, mensagem });
  };

  // Confirma e registra notificação blindada via edge function
  const confirmarNotificacao = async () => {
    if (!confirmModal) return;
    setConfirmando(true);
    try {
      const { recurso, cliente, telefone, nome, auto, mensagem } = confirmModal;
      
      // Abrir WhatsApp
      window.open(`https://wa.me/55${telefone.replace(/\D/g, '')}?text=${window.encodeURIComponent(mensagem)}`, '_blank');

      // Registrar via edge function blindada
      const { data: sessionData } = await supabase.auth.getSession();
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      
      await fetch(`https://${projectId}.supabase.co/functions/v1/registrar-notificacao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData?.session?.access_token}`,
        },
        body: JSON.stringify({
          contrato_id: recurso.id,
          cliente_id: cliente?.id || null,
          organization_id: recurso.multas?.veiculos?.clientes?.organization_id || null,
          cliente_nome: nome,
          cliente_telefone: telefone,
          auto_infracao: auto,
          status_recurso: recurso.status,
          mensagem_enviada: mensagem,
          confirmacao_usuario: true,
          intervalo: recurso.intervalo_notificacao || 7,
        }),
      });

      setConfirmModal(null);
      loadData();
    } catch (err) {
      console.error('Erro ao registrar notificação:', err);
    } finally {
      setConfirmando(false);
    }
  };

  // Carregar histórico de notificações de um contrato
  const toggleHistorico = async (contratoId: string) => {
    if (historicoAberto === contratoId) {
      setHistoricoAberto(null);
      return;
    }
    setHistoricoAberto(contratoId);
    setLoadingHistorico(true);
    try {
      const { data } = await supabase
        .from('registro_notificacoes' as any)
        .select('*')
        .eq('contrato_id', contratoId)
        .order('created_at', { ascending: false })
        .limit(20);
      setHistorico(data || []);
    } catch {
      setHistorico([]);
    } finally {
      setLoadingHistorico(false);
    }
  };

  const formatarData = (data: string | null) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const recursosFiltrados = recursosList.filter(r =>
    r.status === 'aguardando_julgamento' || r.status === 'indeferido' || r.status === 'deferido'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Status do Recurso</h2>
          <p className="text-sm text-gray-600 mt-2">Acompanhe o andamento de todos os recursos em tempo real</p>
        </div>
        <button onClick={loadData} disabled={loading} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Recarregar dados">
          <i className={`ri-refresh-line text-lg ${loading ? 'animate-spin' : ''}`}></i>
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="sticky top-[80px] z-20 bg-[#F3F4F6] pb-4 mb-2 -mx-4 px-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: recursosFiltrados.length, icon: 'ri-file-list-3-line', color: 'text-[#1E3A8A]', bg: 'bg-blue-50', hover: 'hover:border-blue-300' },
            { label: 'Aguardando', value: recursosFiltrados.filter(r => r.status === 'aguardando_julgamento').length, icon: 'ri-time-line', color: 'text-yellow-600', bg: 'bg-yellow-50', hover: 'hover:border-yellow-300', textColor: 'text-yellow-600' },
            { label: 'Deferidos', value: recursosFiltrados.filter(r => r.status === 'deferido').length, icon: 'ri-checkbox-circle-line', color: 'text-green-600', bg: 'bg-green-50', hover: 'hover:border-green-300', textColor: 'text-green-600' },
            { label: 'Indeferidos', value: recursosFiltrados.filter(r => r.status === 'indeferido').length, icon: 'ri-close-circle-line', color: 'text-red-600', bg: 'bg-red-50', hover: 'hover:border-red-300', textColor: 'text-red-600' },
            { label: 'Atrasados', value: recursosFiltrados.filter(r => calcularDiasAteProximaRevisao(r.data_proximo_lembrete, r.data_ultima_notificacao, r.data_protocolo, r.intervalo_notificacao || 7) <= 0).length, icon: 'ri-alarm-warning-line', color: 'text-red-600', bg: 'bg-red-50', hover: 'hover:border-red-300', textColor: 'text-red-600' },
          ].map((card) => (
            <div key={card.label} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${card.hover} transition-colors`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{card.label}</p>
                  <p className={`text-xl font-bold ${card.textColor || 'text-gray-900'}`}>{card.value}</p>
                </div>
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                  <i className={`${card.icon} text-xl ${card.color}`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Condutor / Cliente', 'Auto / Placa', 'Infração', 'Instância', 'Status', 'Data Protocolo', 'Alerta Notif.', 'Ações'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && recursosList.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm"><i className="ri-loader-4-line animate-spin mr-2"></i>Carregando recursos...</td></tr>
              ) : recursosFiltrados.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm">Nenhum recurso encontrado nestas condições.</td></tr>
              ) : (
                recursosFiltrados.map((recurso) => {
                  const diasRestantes = calcularDiasAteProximaRevisao(recurso.data_proximo_lembrete, recurso.data_ultima_notificacao, recurso.data_protocolo, recurso.intervalo_notificacao || 7);
                  const alerta = getNivelAlerta(diasRestantes);
                  const cliente = recurso.multas?.veiculos?.clientes;

                  return (
                    <>
                      <tr key={recurso.id} className={`hover:bg-gray-50 transition-colors ${alerta.bgRow}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center cursor-pointer group" onClick={() => navigate(`/cadastro/lista-clientes?clienteId=${cliente?.id}`)}>
                            <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-semibold text-xs mr-2.5 group-hover:bg-blue-600 transition-colors">
                              {cliente?.nome_completo?.substring(0, 2).toUpperCase() || '??'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-xs group-hover:text-blue-600 transition-colors">{cliente?.nome_completo || 'Cliente não vinculado'}</div>
                              <div className="text-[10px] text-gray-500">{cliente?.celular || cliente?.telefone || 'Sem contato'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs font-semibold text-gray-700">{recurso.multas?.numero_auto || 'N/A'}</div>
                          <div className="text-[10px] text-gray-500 uppercase">{recurso.multas?.veiculos?.placa || 'Sem placa'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600 max-w-xs">{recurso.tipo}</div>
                          <div className="text-[10px] text-gray-400 line-clamp-1">{recurso.multas?.descricao || ''}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-[#1E3A8A] rounded text-xs font-medium uppercase">{recurso.instancia}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap uppercase ${getStatusColor(recurso.status)}`}>{getStatusLabel(recurso.status)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600">{formatarData(recurso.data_protocolo)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${alerta.badge}`}>
                            <i className={`${alerta.icone} text-sm`}></i>
                            {diasRestantes <= 0
                              ? <span>{Math.abs(diasRestantes)} {Math.abs(diasRestantes) === 1 ? 'dia' : 'dias'} atrasado</span>
                              : diasRestantes <= 2
                                ? <span>Vence em {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}</span>
                                : <span>{diasRestantes} dias restantes</span>
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => abrirConfirmacao(recurso)} className="bg-[#10B981] text-white px-2 py-1 rounded text-xs font-medium hover:bg-green-600 transition-colors cursor-pointer flex items-center" title="Notificar via WhatsApp">
                              <i className="ri-whatsapp-line"></i>
                            </button>
                            <button onClick={() => toggleHistorico(recurso.id)} className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center ${historicoAberto === recurso.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title="Histórico de notificações">
                              <i className="ri-history-line"></i>
                            </button>
                            {recurso.status === 'deferido' && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium flex items-center" title="Recurso enviado automaticamente para análise">
                                <i className="ri-brain-line"></i>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {/* Histórico inline */}
                      {historicoAberto === recurso.id && (
                        <tr key={`hist-${recurso.id}`}>
                          <td colSpan={8} className="px-4 py-0">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg my-2 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <i className="ri-shield-check-line text-blue-600"></i>
                                <h4 className="text-xs font-bold text-gray-700 uppercase">Registro de Notificações (Auditoria)</h4>
                              </div>
                              {loadingHistorico ? (
                                <p className="text-xs text-gray-400"><i className="ri-loader-4-line animate-spin mr-1"></i>Carregando...</p>
                              ) : historico.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">Nenhuma notificação registrada para este recurso.</p>
                              ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {historico.map((reg: any) => (
                                    <div key={reg.id} className="flex items-start gap-3 bg-white rounded-lg border border-gray-100 p-3">
                                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <i className="ri-check-double-line text-green-600 text-sm"></i>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-xs font-bold text-gray-800">{reg.usuario_nome}</span>
                                          <span className="text-[10px] text-gray-400">({reg.usuario_email})</span>
                                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                            <i className="ri-shield-check-line mr-0.5"></i>Confirmado
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                          Notificou <span className="font-semibold">{reg.cliente_nome}</span> • {reg.horario_brasilia}
                                        </p>
                                        <p className="text-[9px] text-gray-400 mt-0.5 font-mono truncate" title={`Hash: ${reg.hash_integridade}`}>
                                          <i className="ri-lock-line mr-0.5"></i>Hash: {reg.hash_integridade?.substring(0, 16)}...
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !confirmando && setConfirmModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <i className="ri-shield-star-line text-2xl text-orange-600"></i>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Confirmar Notificação</h3>
                <p className="text-xs text-gray-500">Este registro é <span className="font-bold text-red-600">imutável</span> e servirá como prova</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Cliente:</span>
                <span className="font-bold text-gray-800">{confirmModal.nome}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Telefone:</span>
                <span className="font-mono text-gray-800">{confirmModal.telefone}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Auto de Infração:</span>
                <span className="font-mono font-bold text-gray-800">{confirmModal.auto}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold">{getStatusLabel(confirmModal.recurso.status)}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <i className="ri-error-warning-line text-yellow-600 mt-0.5"></i>
                <div>
                  <p className="text-xs font-bold text-yellow-800">Atenção</p>
                  <p className="text-[10px] text-yellow-700 mt-0.5">
                    Ao confirmar, você declara que notificou o cliente via WhatsApp. 
                    Este registro não pode ser alterado ou excluído e inclui seu nome, horário e hash de integridade.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                disabled={confirmando}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarNotificacao}
                disabled={confirmando}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#10B981] text-white text-sm font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                {confirmando ? (
                  <><i className="ri-loader-4-line animate-spin"></i>Registrando...</>
                ) : (
                  <><i className="ri-shield-check-line"></i>Confirmo que notifiquei</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
