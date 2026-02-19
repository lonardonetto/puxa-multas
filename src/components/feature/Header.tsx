import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useNotificationAlerts } from '../../hooks/useNotificationAlerts';
import { useNotificacoesMultas } from '../../hooks/useNotificacoesMultas';
import { useNotificacoesRecarga } from '../../hooks/useNotificacoesRecarga';
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
  const { notificacoes: multasNotif, naoLidas: multasNaoLidas, marcarComoLido: marcarMultaLida, limparNotificacoes: limparMultas } = useNotificacoesMultas();
  const { notificacoes: recargaNotif, naoLidas: recargaNaoLidas, marcarComoLido: marcarRecargaLida, marcarTodasComoLidas: limparRecargas } = useNotificacoesRecarga();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifTab, setNotifTab] = useState<'processos' | 'multas' | 'recargas'>('multas');
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const isSuperAdmin = (user as any)?.role === 'super_admin';
  const totalNaoLidas = alerts.filter(a => !a.lido).length + multasNaoLidas.length + recargaNaoLidas.length;

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
              {totalNaoLidas > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalNaoLidas}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-96 ${dropdownBg} ${borderColor} rounded-lg shadow-xl border py-0 overflow-hidden z-50`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`px-4 py-3 border-b ${borderColor} flex justify-between items-center bg-muted`}>
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${textSecondary}`}>Notificações</h3>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase">{totalNaoLidas} pendentes</span>
                </div>
                
                {/* Tabs */}
                <div className={`flex border-b ${borderColor}`}>
                  <button
                    onClick={() => setNotifTab('multas')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                      notifTab === 'multas' 
                        ? 'text-destructive border-b-2 border-destructive bg-destructive/5' 
                        : `${textSecondary} hover:bg-muted`
                    }`}
                  >
                    <i className="ri-car-line mr-1"></i>
                    Multas {multasNaoLidas.length > 0 && <span className="ml-1 bg-destructive text-white text-[9px] px-1.5 py-0.5 rounded-full">{multasNaoLidas.length}</span>}
                  </button>
                  <button
                    onClick={() => setNotifTab('processos')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                      notifTab === 'processos' 
                        ? 'text-warning border-b-2 border-warning bg-warning/5' 
                        : `${textSecondary} hover:bg-muted`
                    }`}
                  >
                    <i className="ri-file-list-line mr-1"></i>
                    Processos {alerts.filter(a => !a.lido).length > 0 && <span className="ml-1 bg-warning text-black text-[9px] px-1.5 py-0.5 rounded-full">{alerts.filter(a => !a.lido).length}</span>}
                  </button>
                  <button
                    onClick={() => setNotifTab('recargas')}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                      notifTab === 'recargas' 
                        ? 'text-green-600 border-b-2 border-green-500 bg-green-50/50' 
                        : `${textSecondary} hover:bg-muted`
                    }`}
                  >
                    <i className="ri-coin-line mr-1"></i>
                    PIX {recargaNaoLidas.length > 0 && <span className="ml-1 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{recargaNaoLidas.length}</span>}
                  </button>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifTab === 'recargas' ? (
                    recargaNotif.length === 0 ? (
                      <div className={`px-4 py-12 text-center ${textSecondary} text-sm`}>
                        <i className="ri-coin-line text-3xl block mb-2 opacity-10"></i>
                        Nenhuma notificação de recarga
                      </div>
                    ) : (
                      recargaNotif.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 ${hoverBg} border-l-4 ${
                            notif.tipo === 'pix_aprovado' ? 'border-green-500' : notif.tipo === 'pix_rejeitado' ? 'border-destructive' : 'border-amber-400'
                          } border-b border-muted last:border-b-0 group ${notif.lido ? 'opacity-50' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className={`text-xs font-bold ${textPrimary} flex items-center gap-2`}>
                              <i className={`${notif.tipo === 'pix_aprovado' ? 'ri-check-double-line text-green-500' : notif.tipo === 'pix_rejeitado' ? 'ri-close-circle-line text-destructive' : 'ri-time-line text-amber-500'}`}></i>
                              {notif.titulo}
                            </p>
                            {!notif.lido && (
                              <button
                                onClick={() => marcarRecargaLida(notif.id)}
                                className="text-[9px] text-primary hover:text-primary/80 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100"
                              >
                                LER
                              </button>
                            )}
                          </div>
                          <p className={`text-[11px] leading-tight ${textSecondary}`}>{notif.mensagem}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-green-600 font-bold">R$ {notif.valor.toFixed(2).replace('.', ',')}</p>
                            <button
                              onClick={() => { navigate('/checkout'); setShowNotifications(false); }}
                              className={`text-[9px] ${textSecondary} font-bold hover:text-primary uppercase flex items-center gap-1`}
                            >
                              VER <i className="ri-arrow-right-s-line"></i>
                            </button>
                          </div>
                        </div>
                      ))
                    )
                  ) : notifTab === 'multas' ? (
                    /* Notificações de Multas */
                    multasNotif.length === 0 ? (
                      <div className={`px-4 py-12 text-center ${textSecondary} text-sm`}>
                        <i className="ri-car-line text-3xl block mb-2 opacity-10"></i>
                        Nenhuma multa nova encontrada
                      </div>
                    ) : (
                      multasNotif.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 ${hoverBg} border-l-4 border-destructive border-b border-muted last:border-b-0 group ${notif.lido ? 'opacity-50' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className={`text-xs font-bold ${textPrimary} flex items-center gap-2`}>
                              <i className="ri-alarm-warning-line text-destructive"></i>
                              Nova Multa Detectada
                            </p>
                            {!notif.lido && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await marcarMultaLida(notif.id);
                                }}
                                className="text-[9px] text-primary hover:text-primary/80 font-bold uppercase tracking-tighter transition-all opacity-0 group-hover:opacity-100"
                              >
                                MARCAR LIDO
                              </button>
                            )}
                          </div>
                          <p className={`text-[11px] leading-tight ${textSecondary}`}>
                            <strong className="text-foreground">{notif.placa}</strong> • {notif.descricao}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-destructive font-bold flex items-center gap-1">
                              <i className="ri-money-dollar-circle-line"></i>
                              R$ {notif.valor?.toFixed(2) || '0,00'}
                            </p>
                            <button
                              onClick={() => {
                                navigate('/rastreamento');
                                setShowNotifications(false);
                              }}
                              className={`text-[9px] ${textSecondary} font-bold hover:text-primary uppercase flex items-center gap-1`}
                            >
                              VER MULTAS <i className="ri-arrow-right-s-line"></i>
                            </button>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    /* Notificações de Processos */
                    alerts.length === 0 ? (
                      <div className={`px-4 py-12 text-center ${textSecondary} text-sm`}>
                        <i className="ri-notification-off-line text-3xl block mb-2 opacity-10"></i>
                        Nenhuma notificação de processo
                      </div>
                    ) : (
                      alerts.map((alert) => (
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
                      ))
                    )
                  )}
                </div>
                
                <div className={`p-2 border-t ${borderColor} bg-muted`}>
                  <button
                    onClick={async () => {
                      if (notifTab === 'multas') {
                        await limparMultas();
                      } else if (notifTab === 'recargas') {
                        await limparRecargas();
                      } else {
                        await clearNotifications();
                      }
                      setShowNotifications(false);
                    }}
                    className={`w-full py-2 text-[10px] font-bold ${textSecondary} hover:text-destructive hover:bg-destructive/10 rounded-md transition-all uppercase tracking-widest flex items-center justify-center gap-2`}
                  >
                    <i className="ri-delete-bin-line text-xs"></i>
                    Limpar {notifTab === 'multas' ? 'Multas' : notifTab === 'recargas' ? 'PIX' : 'Processos'}
                  </button>
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
