import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecursos } from '../../hooks/useRecursos';

// Status Recurso Page - v2

export default function StatusRecurso() {
  const navigate = useNavigate();
  const { fetchRecursosDetalhados, atualizarNotificacao, loading } = useRecursos();
  const [recursosList, setRecursosList] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    const data = await fetchRecursosDetalhados();
    setRecursosList(data);
  }, [fetchRecursosDetalhados]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Função para calcular dias desde a última notificação
  const calcularDiasUltimaNotificacao = (dataUltimaNotificacao: string | null, dataProtocolo: string | null) => {
    const referencia = dataUltimaNotificacao || dataProtocolo;
    if (!referencia) return 0; // Sem data de referência, considerar como "em dia"
    
    // Parse manual para evitar problemas de timezone com "YYYY-MM-DD"
    const partes = referencia.split('T')[0].split('-');
    const dataRef = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataRef.setHours(0, 0, 0, 0);
    
    const diffTime = hoje.getTime() - dataRef.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getNivelAlerta = (dias: number, intervalo: number = 7) => {
    const diasRestantes = intervalo - dias;
    // Vencido (0 ou menos dias restantes)
    if (diasRestantes <= 0) return { nivel: 'crítico', cor: 'bg-red-100 border-red-500', icone: 'ri-alarm-warning-fill', textoCor: 'text-red-700', bgRow: 'bg-red-50/60', badge: 'bg-red-100 text-red-700 border border-red-300 animate-pulse' };
    // Faltando 1 dia
    if (diasRestantes === 1) return { nivel: 'urgente', cor: 'bg-orange-100 border-orange-500', icone: 'ri-error-warning-fill', textoCor: 'text-orange-700', bgRow: 'bg-orange-50/40', badge: 'bg-orange-100 text-orange-700 border border-orange-300' };
    // Faltando 2 dias
    if (diasRestantes === 2) return { nivel: 'atenção', cor: 'bg-yellow-100 border-yellow-500', icone: 'ri-alert-fill', textoCor: 'text-yellow-700', bgRow: '', badge: 'bg-yellow-100 text-yellow-700 border border-yellow-300' };
    // Dentro do prazo
    return { nivel: 'normal', cor: 'bg-green-100 border-green-500', icone: 'ri-checkbox-circle-fill', textoCor: 'text-green-700', bgRow: '', badge: 'bg-green-100 text-green-700 border border-green-300' };
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'rascunho': 'Rascunho',
      'protocolado': 'Protocolado',
      'aguardando_julgamento': 'Aguardando Julgamento',
      'deferido': 'Deferido',
      'indeferido': 'Indeferido'
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === 'deferido') return 'bg-green-100 text-green-700';
    if (status === 'indeferido') return 'bg-red-100 text-red-600';
    if (status === 'aguardando_julgamento') return 'bg-yellow-100 text-orange-600';
    return 'bg-blue-100 text-blue-700';
  };

  const handleNotificar = async (recurso: any) => {
    const cliente = recurso.multas?.veiculos?.clientes;
    if (!cliente) return;

    const telefone = cliente.celular || cliente.telefone;
    const nome = cliente.nome_completo;
    const auto = recurso.multas?.numero_auto || 'N/A';

    const mensagem = window.encodeURIComponent(
      `Olá, ${nome}! Gostaríamos de informar que seu recurso (Auto: ${auto}) está com status: ${getStatusLabel(recurso.status)}. Estamos acompanhando o processo.`
    );

    window.open(`https://wa.me/55${telefone.replace(/\D/g, '')}?text=${mensagem}`, '_blank');
    await atualizarNotificacao(recurso.id);
    loadData();
  };

  const formatarData = (data: string | null) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const recursosFiltrados = recursosList.filter(r =>
    r.status === 'aguardando_julgamento' ||
    r.status === 'indeferido' ||
    r.status === 'deferido'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Status do Recurso</h2>
          <p className="text-sm text-gray-600 mt-2">Acompanhe o andamento de todos os recursos em tempo real</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          title="Recarregar dados"
        >
          <i className={`ri-refresh-line text-lg ${loading ? 'animate-spin' : ''}`}></i>
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="sticky top-[80px] z-20 bg-[#F3F4F6] pb-4 mb-2 -mx-4 px-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total</p>
                <p className="text-xl font-bold text-gray-900">{recursosFiltrados.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <i className="ri-file-list-3-line text-xl text-[#1E3A8A]"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-yellow-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Aguardando</p>
                <p className="text-xl font-bold text-yellow-600">
                  {recursosFiltrados.filter(r => r.status === 'aguardando_julgamento').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-xl text-yellow-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-green-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Deferidos</p>
                <p className="text-xl font-bold text-green-600">
                  {recursosFiltrados.filter(r => r.status === 'deferido').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-red-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Indeferidos</p>
                <p className="text-xl font-bold text-red-600">
                  {recursosFiltrados.filter(r => r.status === 'indeferido').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <i className="ri-close-circle-line text-xl text-red-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:border-red-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Atrasados</p>
                <p className="text-xl font-bold text-red-600">
                  {recursosFiltrados.filter(r =>
                    calcularDiasUltimaNotificacao(r.data_ultima_notificacao, r.data_protocolo) >= (r.intervalo_notificacao || 7)
                  ).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <i className="ri-alarm-warning-line text-xl text-red-600"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Condutor / Cliente
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Auto / Placa
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Infração
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Instância
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Data Protocolo
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Alerta Notif.
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && recursosList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm">
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Carregando recursos...
                  </td>
                </tr>
              ) : recursosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm">
                    Nenhum recurso encontrado nestas condições.
                  </td>
                </tr>
              ) : (
                recursosFiltrados.map((recurso) => {
                  const diasUltimaNotificacao = calcularDiasUltimaNotificacao(recurso.data_ultima_notificacao, recurso.data_protocolo);
                  const alerta = getNivelAlerta(diasUltimaNotificacao, recurso.intervalo_notificacao);
                  const cliente = recurso.multas?.veiculos?.clientes;

                  return (
                    <tr key={recurso.id} className={`hover:bg-gray-50 transition-colors ${alerta.bgRow}`}>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center cursor-pointer group"
                          onClick={() => navigate(`/cadastro/lista-clientes?clienteId=${cliente?.id}`)}
                        >
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
                        <span className="px-1.5 py-0.5 bg-blue-100 text-[#1E3A8A] rounded text-xs font-medium uppercase">
                          {recurso.instancia}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap uppercase ${getStatusColor(recurso.status)}`}>
                          {getStatusLabel(recurso.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">{formatarData(recurso.data_protocolo)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const diasRestantes = (recurso.intervalo_notificacao || 7) - diasUltimaNotificacao;
                          return (
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${alerta.badge}`}>
                              <i className={`${alerta.icone} text-sm`}></i>
                              {diasRestantes <= 0
                                ? <span>{Math.abs(diasRestantes)} {Math.abs(diasRestantes) === 1 ? 'dia' : 'dias'} atrasado</span>
                                : diasRestantes <= 2
                                  ? <span>Vence em {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}</span>
                                  : <span>{diasRestantes} dias restantes</span>
                              }
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleNotificar(recurso)}
                            className="bg-[#10B981] text-white px-2 py-1 rounded text-xs font-medium hover:bg-green-600 transition-colors cursor-pointer flex items-center"
                            title="Notificar via WhatsApp"
                          >
                            <i className="ri-whatsapp-line"></i>
                          </button>
                          
                          {/* Info: recursos deferidos são enviados automaticamente para análise */}
                          {recurso.status === 'deferido' && (
                            <span 
                              className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium flex items-center"
                              title="Recurso enviado automaticamente para análise do administrador"
                            >
                              <i className="ri-brain-line mr-1"></i>
                              Enviado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
