import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useNotificationAlerts } from '../../hooks/useNotificationAlerts';

interface HeaderProps {
  darkMode: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}


export default function Header({ darkMode, isSidebarCollapsed, toggleSidebar }: HeaderProps) {
  const { signOut, user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { alerts, markAsCheckedIn, clearNotifications } = useNotificationAlerts();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns on navigation
  useEffect(() => {
    setShowNotifications(false);
    setShowProfile(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'aguardando_julgamento': 'Aguardando Julgamento',
      'deferido': 'Deferido',
      'indeferido': 'Indeferido',
      'assinado': 'Assinado',
      'pendente': 'Pendente'
    };
    return map[status] || status;
  };

  return (
    <header className={`${darkMode ? 'bg-[#0D1B2A] border-[#1B2838]' : 'bg-white border-gray-200'} border-b fixed top-0 ${isSidebarCollapsed ? 'left-0' : 'left-72'} right-0 z-50 transition-all duration-300 h-20`}>
      <div className="flex items-center justify-between px-8 h-full">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-[#1B2838] text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-all cursor-pointer mr-2`}
            title={isSidebarCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            <i className={`ri-menu-${isSidebarCollapsed ? 'unfold' : 'fold'}-line text-xl`}></i>
          </button>
          <img
            src="https://static.readdy.ai/image/c2ffb6ae5c67efb323410a310538f1c7/a12851fd628f4b9737fa91b725a39cf0.png"
            alt="Logo"
            className="h-8 w-auto"
          />
          <h1 className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-[#1E3A8A]'}`}>Painel do Parceiro</h1>
        </div>

        <div className="flex items-center space-x-6">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-[#1E3A8A]'} transition-colors cursor-pointer`}
            >
              <i className="ri-notification-3-line text-xl"></i>
              {alerts.filter(a => !a.lido).length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {alerts.filter(a => !a.lido).length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-[#0D1B2A] border-[#1B2838]' : 'bg-white border-gray-200'} rounded-lg shadow-xl border py-0 overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`px-4 py-3 border-b ${darkMode ? 'border-[#1B2838]' : 'border-gray-100'} flex justify-between items-center bg-gray-50/50`}>
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${darkMode ? 'text-gray-200' : 'text-gray-500'}`}>Notificações</h3>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">{alerts.filter(a => !a.lido).length} pendentes</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="px-4 py-12 text-center text-gray-500 text-sm">
                      <i className="ri-notification-off-line text-3xl block mb-2 opacity-10"></i>
                      Nenhuma notificação no momento
                    </div>
                  ) : (
                    <>
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`px-4 py-4 ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-gray-50'} border-l-4 ${alert.tipo === 'urgente' ? 'border-[#EF4444]' : 'border-[#F59E0B]'} border-b border-gray-50 last:border-b-0 group ${alert.lido ? 'opacity-50' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Acompanhamento Processual</p>
                            {!alert.lido && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await markAsCheckedIn(alert.contrato_id);
                                }}
                                className="text-[9px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-tighter transition-all opacity-0 group-hover:opacity-100"
                              >
                                MARCAR LIDO
                              </button>
                            )}
                            {alert.lido && (
                              <span className="text-[9px] text-green-600 font-bold uppercase tracking-tighter">
                                <i className="ri-check-line"></i> CONFERIDO
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] leading-tight ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <strong>{alert.cliente_nome}</strong> • {alert.servico_nome}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className={`text-[10px] ${alert.tipo === 'urgente' ? 'text-red-500' : 'text-orange-500'} font-bold flex items-center gap-1`}>
                              <i className="ri-error-warning-line"></i>
                              {getStatusLabel(alert.status)} • Atraso: {alert.dias_desde_ultimo_checkin}d
                            </p>
                            <button
                              onClick={() => {
                                navigate(`/cadastro/lista-clientes?clienteId=${alert.cliente_id}`);
                                setShowNotifications(false);
                              }}
                              className="text-[9px] text-gray-400 font-bold hover:text-blue-500 uppercase flex items-center gap-1"
                            >
                              DETALHES <i className="ri-arrow-right-s-line"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className={`p-2 border-t ${darkMode ? 'border-[#1B2838]' : 'border-gray-100'} bg-gray-50/50`}>
                        <button
                          onClick={async () => {
                            await clearNotifications();
                            setShowNotifications(false);
                          }}
                          className="w-full py-2 text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <i className="ri-delete-bin-line text-xs"></i>
                          Limpar Notificações
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <button className={`p-2 ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-[#1E3A8A]'} transition-colors cursor-pointer`}>
            <i className="ri-customer-service-2-line text-xl"></i>
          </button>

          <button className={`p-2 ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-[#1E3A8A]'} transition-colors cursor-pointer`}>
            <i className="ri-settings-3-line text-xl"></i>
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="text-right">
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {user?.nome || 'Usuário'}
                </p>
                {currentOrganization && (
                  <p className="text-xs text-[#10B981] font-bold uppercase tracking-wider">
                    Plano {currentOrganization.plano.charAt(0).toUpperCase() + currentOrganization.plano.slice(1)}
                  </p>
                )}
              </div>
              <div className={`w-10 h-10 ${darkMode ? 'bg-blue-600' : 'bg-[#1E3A8A]'} rounded-full flex items-center justify-center overflow-hidden`}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-semibold">
                    {user?.nome?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </button>

            {showProfile && (
              <div className={`absolute right-0 mt-2 w-48 ${darkMode ? 'bg-[#0D1B2A] border-[#1B2838]' : 'bg-white border-gray-200'} rounded-lg shadow-lg border py-2`}>
                <button
                  onClick={() => {
                    navigate('/perfil');
                    setShowProfile(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm ${darkMode ? 'text-gray-300 hover:bg-[#1B2838]' : 'text-gray-700 hover:bg-gray-50'} cursor-pointer whitespace-nowrap`}
                >
                  Meu Perfil
                </button>
                <button className={`w-full px-4 py-2 text-left text-sm ${darkMode ? 'text-gray-300 hover:bg-[#1B2838]' : 'text-gray-700 hover:bg-gray-50'} cursor-pointer whitespace-nowrap`}>
                  Alterar Plano
                </button>
                <hr className={`my-2 ${darkMode ? 'border-[#1B2838]' : ''}`} />
                <button
                  onClick={handleLogout}
                  className={`w-full px-4 py-2 text-left text-sm text-[#EF4444] ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-gray-50'} cursor-pointer whitespace-nowrap`}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header >
  );
}
