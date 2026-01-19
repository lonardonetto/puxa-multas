import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecursos } from '../../hooks/useRecursos';

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
  const calcularDiasUltimaNotificacao = (dataUltimaNotificacao: string | null) => {
    if (!dataUltimaNotificacao) return 999; // Se nunca foi notificado, trata como muito urgente

    // Suporta formato ISO (YYYY-MM-DD) ou data simples
    const dataNotif = new Date(dataUltimaNotificacao);
    const hoje = new Date();

    // Zerar as horas para comparar apenas dias
    hoje.setHours(0, 0, 0, 0);
    dataNotif.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(hoje.getTime() - dataNotif.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Função para determinar o nível de alerta
  const getNivelAlerta = (dias: number, intervalo: number = 7) => {
    if (dias >= intervalo) return { nivel: 'crítico', cor: 'bg-red-100 border-red-500', icone: 'ri-alarm-warning-fill', textoCor: 'text-red-700' };
    if (dias >= Math.max(1, intervalo - 2)) return { nivel: 'alto', cor: 'bg-orange-100 border-orange-500', icone: 'ri-error-warning-fill', textoCor: 'text-orange-700' };
    if (dias >= Math.max(1, intervalo - 4)) return { nivel: 'médio', cor: 'bg-yellow-100 border-yellow-500', icone: 'ri-alert-fill', textoCor: 'text-yellow-700' };
    return { nivel: 'normal', cor: 'bg-blue-100 border-blue-500', icone: 'ri-information-fill', textoCor: 'text-blue-700' };
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

    // Abre WhatsApp
    window.open(`https://wa.me/55${telefone.replace(/\D/g, '')}?text=${mensagem}`, '_blank');

    // Atualiza data de última notificação no banco
    await atualizarNotificacao(recurso.id);
    loadData();
  };

  const formatarData = (data: string | null) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  // Filtrar recursos que precisam de acompanhamento ou notificação
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

      {/* Dashboard Cards - Fixo no topo ao rolar */}
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
                <p className="text-xl font-bold text-red-600">
                  {recursosFiltrados.filter(r =>
                    calcularDiasUltimaNotificacao(r.data_ultima_notificacao) >= (r.intervalo_notificacao || 7)
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
                  Ação
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
                recursosFiltrados.map((recurso, index) => {
                  const diasUltimaNotificacao = calcularDiasUltimaNotificacao(recurso.data_ultima_notificacao);
                  const alerta = getNivelAlerta(diasUltimaNotificacao, recurso.intervalo_notificacao);
                  const cliente = recurso.multas?.veiculos?.clientes;

                  return (
                    <tr key={recurso.id} className="hover:bg-gray-50 transition-colors">
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
                        <div className="flex items-center space-x-1.5">
                          <i className={`${alerta.icone} ${alerta.textoCor} text-xs`}></i>
                          <span className={`text-xs font-semibold ${alerta.textoCor}`}>
                            {diasUltimaNotificacao >= 30 ? 'Pendente' : `${diasUltimaNotificacao} dias`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleNotificar(recurso)}
                          className="bg-[#10B981] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600 transition-colors whitespace-nowrap cursor-pointer flex items-center"
                        >
                          <i className="ri-whatsapp-line mr-1"></i>
                          Notificar
                        </button>
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
