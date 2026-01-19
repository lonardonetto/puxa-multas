import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import { useNotificationAlerts } from '../../hooks/useNotificationAlerts';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const chartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Recursos Criados',
        data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Multas Rastreadas',
        data: [8, 15, 12, 20, 18, 25, 23, 30, 28, 35, 33, 40],
        borderColor: '#1E3A8A',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const { alerts, markAsCheckedIn } = useNotificationAlerts();
  const navigate = useNavigate();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'aguardando_julgamento': 'Aguardando Julgamento',
      'deferido': 'Deferido',
      'indeferido': 'Indeferido',
      'assinado': 'Assinado',
      'pendente': 'Pendente'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-calendar-line mr-1.5"></i>
            Últimos 30 dias
          </button>
          <button className="px-3 py-1.5 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-download-line mr-1.5"></i>
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#1E3A8A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Multas Rastreadas</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">1.247</p>
              <p className="text-xs text-[#10B981] mt-1">
                <i className="ri-arrow-up-line"></i> +12% este mês
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-car-line text-xl text-[#1E3A8A]"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#10B981]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Recursos Criados</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">456</p>
              <p className="text-xs text-[#10B981] mt-1">
                <i className="ri-arrow-up-line"></i> +18% este mês
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-file-text-line text-xl text-[#10B981]"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#F59E0B]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Leads Captados</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">89</p>
              <p className="text-xs text-[#F59E0B] mt-1">
                <i className="ri-arrow-right-line"></i> 15 novos hoje
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="ri-user-add-line text-xl text-[#F59E0B]"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#10B981]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Saldo em Conta</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">R$ 8.450</p>
              <p className="text-xs text-gray-500 mt-1">
                Disponível para uso
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-wallet-3-line text-xl text-[#10B981]"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Evolução Mensal</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800">Acompanhamento Recursos</h3>
            <div className="flex items-center space-x-1">
              <i className="ri-alarm-warning-line text-red-500 text-sm"></i>
              <span className="text-xs font-medium text-red-600">Notificar a cada 7 dias</span>
            </div>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1" style={{ maxHeight: '260px' }}>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 italic text-sm">
                <i className="ri-notification-off-line text-2xl mb-2 opacity-20"></i>
                Nenhum alerta pendente
              </div>
            ) : (
              alerts.filter(a => !a.lido).map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${alert.tipo === 'urgente' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'} hover:shadow-md transition-all`}>
                  {/* Header com Nome e Status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5 flex-1">
                      <i className="ri-user-line text-[#1E3A8A] text-xs"></i>
                      <p className="text-xs font-semibold text-gray-800">{alert.cliente_nome}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${alert.status === 'indeferido' ? 'bg-red-100 text-red-600' :
                      alert.status === 'aguardando_julgamento' ? 'bg-yellow-100 text-orange-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                      {getStatusLabel(alert.status)}
                    </span>
                  </div>

                  {/* Informações do Recurso */}
                  <div className="space-y-1 mb-2">
                    <p className="text-[10px] text-gray-600 font-medium">
                      {alert.servico_nome}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <i className="ri-history-line"></i>
                        Atraso: {alert.dias_desde_ultimo_checkin}d
                      </span>
                      <span className="font-bold flex items-center gap-1 text-blue-600">
                        <i className="ri-calendar-event-line"></i>
                        Revisão: {alert.data_proximo_lembrete ? new Date(alert.data_proximo_lembrete).toLocaleDateString() : 'Não agendada'}
                      </span>
                    </div>
                  </div>

                  {/* Alerta de Prazo */}
                  <div className={`flex items-center space-x-1.5 p-1.5 rounded mb-2 ${alert.tipo === 'urgente' ? 'bg-red-100' : 'bg-orange-100'}`}>
                    <i className={`${alert.tipo === 'urgente' ? 'ri-alarm-warning-line text-red-600' : 'ri-error-warning-line text-orange-600'} text-xs`}></i>
                    <p className={`text-[10px] font-bold ${alert.tipo === 'urgente' ? 'text-red-700' : 'text-orange-700'} flex-1`}>
                      {alert.tipo === 'urgente' ? 'NOTIFICAR AGORA!' : 'Atenção necessária'}
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const text = `Olá ${alert.cliente_nome}! Estamos acompanhando seu processo de ${alert.servico_nome}. Ainda estamos aguardando uma decisão oficial. Assim que tivermos novidades, te avisaremos!`;
                        window.open(`https://wa.me/${alert.cliente_celular?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                        markAsCheckedIn(alert.contrato_id);
                      }}
                      className="flex-1 px-2 py-1.5 bg-[#10B981] text-white rounded-lg text-[10px] font-bold hover:bg-green-600 transition-colors"
                    >
                      <i className="ri-whatsapp-line mr-1"></i>
                      WHATSAPP
                    </button>
                    <button
                      onClick={() => navigate(`/cadastro/lista-clientes?clienteId=${alert.cliente_id}`)}
                      className="px-2 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-200"
                    >
                      DETALHES
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800">Gestão de Rastreamento</h3>
            <button className="text-xs text-[#1E3A8A] font-medium hover:underline cursor-pointer whitespace-nowrap">
              Ver todos
            </button>
          </div>
          <div className="space-y-2">
            {[
              { nome: 'Transportadora Rápida Ltda', tipo: 'Empresa', veiculos: 45, status: 'ativo' },
              { nome: 'João Silva Santos', tipo: 'Pessoa Física', veiculos: 2, status: 'ativo' },
              { nome: 'Logística Express S.A.', tipo: 'Empresa', veiculos: 128, status: 'ativo' },
              { nome: 'Maria Oliveira Costa', tipo: 'Pessoa Física', veiculos: 1, status: 'ativo' },
              { nome: 'Frota Urbana Transportes', tipo: 'Empresa', veiculos: 67, status: 'ativo' },
              { nome: 'Carlos Eduardo Pereira', tipo: 'Pessoa Física', veiculos: 3, status: 'ativo' },
              { nome: 'Distribuidora Nacional', tipo: 'Empresa', veiculos: 89, status: 'ativo' },
            ].map((cliente, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cliente.tipo === 'Empresa' ? 'bg-[#1E3A8A]' : 'bg-[#10B981]'
                    }`}>
                    <i className={`${cliente.tipo === 'Empresa' ? 'ri-building-line' : 'ri-user-line'
                      } text-white text-base`}></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{cliente.nome}</p>
                    <p className="text-xs text-gray-600">{cliente.tipo}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="text-right">
                    <p className="text-base font-bold text-[#1E3A8A]">{cliente.veiculos}</p>
                    <p className="text-xs text-gray-600">veículos</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-green-100 text-[#10B981]">
                    Ativo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800">Atividades Recentes</h3>
            <button className="text-xs text-[#1E3A8A] font-medium hover:underline cursor-pointer whitespace-nowrap">
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {[
              { acao: 'Recurso criado para multa #MT-2024-0234', tempo: 'Há 15 minutos', icone: 'ri-file-add-line', cor: 'green' },
              { acao: 'Nova multa rastreada - Veículo XYZ-9876', tempo: 'Há 1 hora', icone: 'ri-car-line', cor: 'blue' },
              { acao: 'Lead convertido em cliente', tempo: 'Há 2 horas', icone: 'ri-user-star-line', cor: 'yellow' },
              { acao: 'Campanha digital iniciada', tempo: 'Há 3 horas', icone: 'ri-megaphone-line', cor: 'blue' },
              { acao: 'Pagamento recebido - R$ 299,00', tempo: 'Há 5 horas', icone: 'ri-money-dollar-circle-line', cor: 'green' },
              { acao: 'Novo cliente cadastrado - Transportadora ABC', tempo: 'Há 6 horas', icone: 'ri-user-add-line', cor: 'green' },
              { acao: 'Recurso deferido - Multa #MT-2024-0189', tempo: 'Há 8 horas', icone: 'ri-checkbox-circle-line', cor: 'green' },
            ].map((atividade, index) => (
              <div key={index} className="flex items-start space-x-2.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${atividade.cor === 'green' ? 'bg-green-100' :
                  atividade.cor === 'yellow' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                  <i className={`${atividade.icone} text-sm ${atividade.cor === 'green' ? 'text-[#10B981]' :
                    atividade.cor === 'yellow' ? 'text-[#F59E0B]' :
                      'text-[#1E3A8A]'
                    }`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-800">{atividade.acao}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{atividade.tempo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}