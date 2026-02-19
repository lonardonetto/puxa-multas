import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentPlan } from '../../hooks/useCurrentPlan';
import { supabase } from '../../lib/supabase';
import logoCentralMulta from '@/assets/logo-central-multa.png';

interface SidebarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  isCollapsed: boolean;
}


export default function Sidebar({ darkMode, toggleDarkMode, isCollapsed }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { plan: planDetails } = useCurrentPlan();
  const [cadastroOpen, setCadastroOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [superAdminOpen, setSuperAdminOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;

      try {
        // Verificar Super Admin
        const { data: userData } = await supabase
          .from('users' as any)
          .select('role')
          .eq('id', user.id)
          .single();

        setIsSuperAdmin(!!userData && (userData as any).role === 'super_admin');
      } catch (err) {
        console.error('Erro ao verificar status no Sidebar:', err);
      }
    };

    checkStatus();
  }, [user]);

  // Lógica de acesso
  const hasCRM = planDetails?.acesso_crm;
  const hasDisparador = planDetails?.acesso_disparador;

  const menuItems = [
    { path: '/', icon: 'ri-dashboard-line', label: 'Dashboard' },
    { path: '/rastreamento', icon: 'ri-car-line', label: 'Rastreamento de Multas' },
    { path: '/status-recurso', icon: 'ri-file-list-3-line', label: 'Acompanhamento Recursos' },
    { path: '/recursos-ia', icon: 'ri-file-text-line', label: 'Recursos por IA' },
    { path: '/crm-kanban', icon: 'ri-kanban-view-2', label: 'CRM Kanban' },
  ];

  const cadastroItems = [
    { path: '/cadastro/novo-cliente', icon: 'ri-user-add-line', label: 'Novo Cliente' },
    { path: '/cadastro/lista-clientes', icon: 'ri-team-line', label: 'Lista de Clientes' },
  ];

  const configItems = [
    { path: '/servicos', icon: 'ri-settings-4-line', label: 'Serviços e Contratos' },
  ];

  const bottomMenuItems = [
    { path: '/prospeccao-editais', icon: 'ri-folder-line', label: 'Prospecção de Editais' },
    { path: '/checkout', icon: 'ri-wallet-3-line', label: 'Extrato & Conta' },
    { path: '/planos', icon: 'ri-price-tag-3-line', label: 'Planos' },
  ];

  // Cores do tema Central da Multa
  const bgPrimary = darkMode ? 'bg-[#1A1A1A]' : 'bg-[#1F1F1F]';
  const bgHover = darkMode ? 'hover:bg-[#2D2D2D]' : 'hover:bg-[#2D2D2D]';
  const bgActive = darkMode ? 'bg-[#2D2D2D]' : 'bg-[#2D2D2D]';
  const borderColor = darkMode ? 'border-[#333]' : 'border-[#333]';
  const subMenuBg = darkMode ? 'bg-[#252525]' : 'bg-[#252525]';

  return (
    <aside className={`w-72 ${bgPrimary} h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-[60] ${isCollapsed ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
      <div className={`py-5 px-4 border-b ${borderColor} flex items-center justify-between`}>
        <img
          src={logoCentralMulta}
          alt="Central da Multa"
          className="h-12 w-auto"
        />
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg bg-[#2D2D2D] text-primary hover:bg-[#3D3D3D] transition-all cursor-pointer`}
          title={darkMode ? 'Modo Claro' : 'Modo Noturno'}
        >
          <i className={`${darkMode ? 'ri-sun-line' : 'ri-moon-line'} text-lg`}></i>
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-2.5 text-gray-200 ${bgHover} transition-colors relative ${location.pathname === item.path ? `${bgActive} border-l-4 border-primary` : 'border-l-4 border-transparent'
              }`}
          >
            <i className={`${item.icon} text-lg mr-3 ${location.pathname === item.path ? 'text-primary' : ''}`}></i>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}


        {/* Cadastro Dropdown */}
        <div>
          <button
            onClick={() => setCadastroOpen(!cadastroOpen)}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-gray-200 ${bgHover} transition-colors ${location.pathname.startsWith('/cadastro') ? `${bgActive} border-l-4 border-primary` : 'border-l-4 border-transparent'
              }`}
          >
            <div className="flex items-center">
              <i className={`ri-user-settings-line text-lg mr-3 ${location.pathname.startsWith('/cadastro') ? 'text-primary' : ''}`}></i>
              <span className="text-sm font-medium">Cadastro de Clientes</span>
            </div>
            <i className={`ri-arrow-${cadastroOpen ? 'up' : 'down'}-s-line text-base transition-transform`}></i>
          </button>

          {cadastroOpen && (
            <div className={subMenuBg}>
              {cadastroItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 pl-10 text-gray-300 ${bgHover} transition-colors ${location.pathname === item.path ? `${bgActive} text-primary` : ''
                    }`}
                >
                  <i className={`${item.icon} text-base mr-3`}></i>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Configurações Dropdown */}
        <div>
          <button
            onClick={() => setConfigOpen(!configOpen)}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-gray-200 ${bgHover} transition-colors ${location.pathname.startsWith('/servicos') ? `${bgActive} border-l-4 border-primary` : 'border-l-4 border-transparent'
              }`}
          >
            <div className="flex items-center">
              <i className={`ri-settings-4-line text-lg mr-3 ${location.pathname.startsWith('/servicos') ? 'text-primary' : ''}`}></i>
              <span className="text-sm font-medium">Configurações</span>
            </div>
            <i className={`ri-arrow-${configOpen ? 'up' : 'down'}-s-line text-base transition-transform`}></i>
          </button>

          {configOpen && (
            <div className={subMenuBg}>
              {configItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 pl-10 text-gray-300 ${bgHover} transition-colors ${location.pathname === item.path ? `${bgActive} text-primary` : ''
                    }`}
                >
                  <i className={`${item.icon} text-base mr-3`}></i>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Links Externos CRM e Disparador */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className={`px-4 py-1 flex items-center justify-between`}>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Ferramentas Extras</span>
          </div>

          {/* CRM + IA */}
          <div className="relative group">
            <a
              href={hasCRM ? "https://crm.zapmatic.com.br" : "/planos"}
              target={hasCRM ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className={`flex items-center px-4 py-2.5 text-gray-200 ${bgHover} transition-colors ${!hasCRM ? 'opacity-60' : ''}`}
            >
              <i className="ri-robot-line text-lg mr-3"></i>
              <span className="text-sm font-medium">CRM + IA</span>
              {hasCRM ? (
                <i className="ri-external-link-line text-xs ml-auto opacity-50"></i>
              ) : (
                <div className="ml-auto flex items-center space-x-1">
                  <i className="ri-lock-line text-xs"></i>
                  <span className="text-[9px] bg-primary text-black px-1.5 py-0.5 rounded font-bold">CONTRATAR</span>
                </div>
              )}
            </a>
          </div>

          {/* Disparador */}
          <div className="relative group">
            <a
              href={hasDisparador ? "https://disparador.zapmatic.com.br" : "/planos"}
              target={hasDisparador ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className={`flex items-center px-4 py-2.5 text-gray-200 ${bgHover} transition-colors ${!hasDisparador ? 'opacity-60' : ''}`}
            >
              <i className="ri-send-plane-line text-lg mr-3"></i>
              <span className="text-sm font-medium">Acesso ao Disparador</span>
              {hasDisparador ? (
                <i className="ri-external-link-line text-xs ml-auto opacity-50"></i>
              ) : (
                <div className="ml-auto flex items-center space-x-1">
                  <i className="ri-lock-line text-xs"></i>
                  <span className="text-[9px] bg-primary text-black px-1.5 py-0.5 rounded font-bold">CONTRATAR</span>
                </div>
              )}
            </a>
          </div>
        </div>

        {/* Super Admin Dropdown */}
        {isSuperAdmin && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <button
              onClick={() => setSuperAdminOpen(!superAdminOpen)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-gray-200 ${bgHover} transition-colors ${location.pathname.startsWith('/super-admin') ? `${bgActive} border-l-4 border-primary` : 'border-l-4 border-transparent'
                }`}
            >
              <div className="flex items-center">
                <i className={`ri-shield-star-line text-lg mr-3 ${location.pathname.startsWith('/super-admin') ? 'text-primary' : ''}`}></i>
                <span className="text-sm font-medium">Super Admin</span>
              </div>
              <i className={`ri-arrow-${superAdminOpen ? 'up' : 'down'}-s-line text-base transition-transform`}></i>
            </button>

          {superAdminOpen && (
            <div className={subMenuBg}>
              <Link
                to="/super-admin/dashboard"
                className={`flex items-center px-4 py-2 pl-10 text-gray-300 ${bgHover} transition-colors ${location.pathname.startsWith('/super-admin/dashboard') ? `${bgActive} text-primary` : ''
                  }`}
              >
                <i className="ri-dashboard-3-line text-base mr-3"></i>
                <span className="text-sm font-medium">Dashboard Comercial</span>
              </Link>
              <Link
                to="/super-admin/organizations"
                className={`flex items-center px-4 py-2 pl-10 text-gray-300 ${bgHover} transition-colors ${location.pathname === '/super-admin/organizations' ? `${bgActive} text-primary` : ''
                  }`}
              >
                <i className="ri-building-line text-base mr-3"></i>
                <span className="text-sm font-medium">Organizações</span>
              </Link>
                <Link
                  to="/super-admin/users"
                  className={`flex items-center px-4 py-2 pl-10 text-gray-300 ${bgHover} transition-colors ${location.pathname === '/super-admin/users' ? `${bgActive} text-primary` : ''
                    }`}
                >
                  <i className="ri-user-star-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Usuários</span>
                </Link>
                <Link
                  to="/super-admin/settings"
                  className={`flex items-center px-4 py-2 pl-10 text-gray-300 ${bgHover} transition-colors ${location.pathname === '/super-admin/settings' ? `${bgActive} text-primary` : ''
                    }`}
                >
                  <i className="ri-shield-keyhole-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Configurações</span>
                </Link>
                <Link
                  to="/super-admin/plans"
                  className={`flex items-center px-4 py-2 pl-10 text-gray-300 ${bgHover} transition-colors ${location.pathname === '/super-admin/plans' ? `${bgActive} text-primary` : ''
                    }`}
                >
                  <i className="ri-price-tag-3-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Gestão de Planos</span>
                </Link>
                <Link
                  to="/super-admin/editais"
                  className={`flex items-center px-4 py-2 pl-10 text-gray-300 ${bgHover} transition-colors ${location.pathname === '/super-admin/editais' ? `${bgActive} text-primary` : ''
                    }`}
                >
                  <i className="ri-file-list-3-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Gestão de Editais</span>
                </Link>
                <Link
                  to="/super-admin/knowledge-base"
                  className={`flex items-center px-4 py-2 pl-10 text-gray-300 ${bgHover} transition-colors ${location.pathname === '/super-admin/knowledge-base' ? `${bgActive} text-primary` : ''
                    }`}
                >
                  <i className="ri-brain-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Base de Conhecimento IA</span>
                </Link>
                <Link
                  to="/super-admin/auditoria"
                  className={`flex items-center px-4 py-2 pl-10 text-gray-300 ${bgHover} transition-colors ${location.pathname === '/super-admin/auditoria' ? `${bgActive} text-primary` : ''
                    }`}
                >
                  <i className="ri-shield-check-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Auditoria Notificações</span>
                </Link>
                <Link
                  to="/super-admin/recargas"
                  className={`flex items-center px-4 py-2 pl-10 text-gray-300 ${bgHover} transition-colors ${location.pathname === '/super-admin/recargas' ? `${bgActive} text-primary` : ''
                    }`}
                >
                  <i className="ri-bank-card-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Recargas PIX</span>
                </Link>
              </div>
            )}
          </div>
        )}


        {bottomMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-2.5 text-gray-200 ${bgHover} transition-colors relative ${location.pathname === item.path ? `${bgActive} border-l-4 border-primary` : 'border-l-4 border-transparent'
              }`}
          >
            <i className={`${item.icon} text-lg mr-3 ${location.pathname === item.path ? 'text-primary' : ''}`}></i>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
