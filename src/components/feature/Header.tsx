import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useNotificationAlerts } from '../../hooks/useNotificationAlerts';
import logoCentralMulta from '@/assets/logo-central-multa.png';

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

  // Cores do tema Central da Multa
  const bgHeader = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';
  const borderColor = darkMode ? 'border-[#333]' : 'border-gray-200';
  const textPrimary = darkMode ? 'text-gray-200' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = darkMode ? 'hover:bg-[#2D2D2D]' : 'hover:bg-gray-100';
  const dropdownBg = darkMode ? 'bg-[#1A1A1A]' : 'bg-white';

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
    <header className={`${bgHeader} ${borderColor} border-b fixed top-0 ${isSidebarCollapsed ? 'left-0' : 'left-72'} right-0 z-50 transition-all duration-300 h-20`}>
      <div className="flex items-center justify-between px-8 h-full">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg ${textSecondary} ${hoverBg} transition-all cursor-pointer mr-2`}
            title={isSidebarCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            <i className={`ri-menu-${isSidebarCollapsed ? 'unfold' : 'fold'}-line text-xl`}></i>
          </button>
          <img
            src={logoCentralMulta}
            alt="Central da Multa"
            className="h-10 w-auto"
          />
          <h1 className={`text-xl font-bold text-primary`}>Painel do Parceiro</h1>
        </div>

        <div className="flex items-center space-x-6">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 ${textSecondary} hover:text-primary transition-colors cursor-pointer`}
            >
              <i className="ri-notification-3-line text-xl"></i>
              {alerts.filter(a => !a.lido).length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {alerts.filter(a => !a.lido).length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-80 ${dropdownBg} ${borderColor} rounded-lg shadow-xl border py-0 overflow-hidden z-50`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`px-4 py-3 border-b ${borderColor} flex justify-between items-center bg-muted`}>
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${textSecondary}`}>Notificações</h3>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">{alerts.filter(a => !a.lido).length} pendentes</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className={`px-4 py-12 text-center ${textSecondary} text-sm`}>
                      <i className="ri-notification-off-line text-3xl block mb-2 opacity-10"></i>
                      Nenhuma notificação no momento
                    </div>
                  ) : (
                    <>
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`px-4 py-4 ${hoverBg} border-l-4 ${alert.tipo === 'urgente' ? 'border-destructive' : 'border-warning'} border-b border-muted last:border-b-0 group ${alert.lido ? 'opacity-50' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className={`text-xs font-bold ${textPrimary}`}>Acompanhamento Processual</p>
                            {!alert.lido && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await markAsCheckedIn(alert.contrato_id);
                                }}
                                className="text-[9px] text-primary hover:text-primary/80 font-bold uppercase tracking-tighter transition-all opacity-0 group-hover:opacity-100"
                              >
                                MARCAR LIDO
                              </button>
                            )}
                            {alert.lido && (
                              <span className="text-[9px] text-success font-bold uppercase tracking-tighter">
                                <i className="ri-check-line"></i> CONFERIDO
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] leading-tight ${textSecondary}`}>
                            <strong>{alert.cliente_nome}</strong> • {alert.servico_nome}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className={`text-[10px] ${alert.tipo === 'urgente' ? 'text-destructive' : 'text-warning'} font-bold flex items-center gap-1`}>
                              <i className="ri-error-warning-line"></i>
                              {getStatusLabel(alert.status)} • Atraso: {alert.dias_desde_ultimo_checkin}d
                            </p>
                            <button
                              onClick={() => {
                                navigate(`/cadastro/lista-clientes?clienteId=${alert.cliente_id}`);
                                setShowNotifications(false);
                              }}
                              className={`text-[9px] ${textSecondary} font-bold hover:text-primary uppercase flex items-center gap-1`}
                            >
                              DETALHES <i className="ri-arrow-right-s-line"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className={`p-2 border-t ${borderColor} bg-muted`}>
                        <button
                          onClick={async () => {
                            await clearNotifications();
                            setShowNotifications(false);
                          }}
                          className={`w-full py-2 text-[10px] font-bold ${textSecondary} hover:text-destructive hover:bg-destructive/10 rounded-md transition-all uppercase tracking-widest flex items-center justify-center gap-2`}
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

          <button className={`p-2 ${textSecondary} hover:text-primary transition-colors cursor-pointer`}>
            <i className="ri-customer-service-2-line text-xl"></i>
          </button>

          <button className={`p-2 ${textSecondary} hover:text-primary transition-colors cursor-pointer`}>
            <i className="ri-settings-3-line text-xl"></i>
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="text-right">
                <p className={`text-sm font-semibold ${textPrimary}`}>
                  {user?.nome || 'Usuário'}
                </p>
                {currentOrganization && (
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">
                    Plano {currentOrganization.plano.charAt(0).toUpperCase() + currentOrganization.plano.slice(1)}
                  </p>
                )}
              </div>
              <div className={`w-10 h-10 bg-primary rounded-full flex items-center justify-center overflow-hidden`}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-black font-semibold">
                    {user?.nome?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </button>

            {showProfile && (
              <div className={`absolute right-0 mt-2 w-48 ${dropdownBg} ${borderColor} rounded-lg shadow-lg border py-2 z-50`}>
                <button
                  onClick={() => {
                    navigate('/perfil');
                    setShowProfile(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm ${textPrimary} ${hoverBg} cursor-pointer whitespace-nowrap`}
                >
                  Meu Perfil
                </button>
                <button className={`w-full px-4 py-2 text-left text-sm ${textPrimary} ${hoverBg} cursor-pointer whitespace-nowrap`}>
                  Alterar Plano
                </button>
                <hr className={`my-2 ${borderColor}`} />
                <button
                  onClick={handleLogout}
                  className={`w-full px-4 py-2 text-left text-sm text-destructive ${hoverBg} cursor-pointer whitespace-nowrap`}
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
