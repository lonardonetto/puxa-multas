import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentPlan } from '../../hooks/useCurrentPlan';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  isCollapsed: boolean;
}


export default function Sidebar({ darkMode, toggleDarkMode, isCollapsed }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { plan: planDetails } = useCurrentPlan();
  const [atendimentoOpen, setAtendimentoOpen] = useState(false);
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
  ];

  const atendimentoItems = [
    { path: '/atendimento/chat-whatsapp', icon: 'ri-whatsapp-line', label: 'Chat WhatsApp' },
    { path: '/atendimento/crm-kanban', icon: 'ri-layout-board-line', label: 'CRM Kanban' },
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
    { path: '/marketing-digital', icon: 'ri-megaphone-line', label: 'Marketing Digital' },
    { path: '/material-apoio', icon: 'ri-folder-download-line', label: 'Material de Apoio' },
    { path: '/checkout', icon: 'ri-wallet-3-line', label: 'Extrato & Conta' },
    { path: '/educacional', icon: 'ri-graduation-cap-line', label: 'Educacional', premium: true },
    { path: '/planos', icon: 'ri-price-tag-3-line', label: 'Planos' },
  ];

  return (
    <aside className={`w-72 ${darkMode ? 'bg-[#0D1B2A]' : 'bg-[#1E3A8A]'} h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-[60] ${isCollapsed ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
      <div className={`py-5 px-4 border-b ${darkMode ? 'border-[#1B2838]' : 'border-blue-700'} flex items-center justify-between`}>
        <img
          src="https://static.readdy.ai/image/c2ffb6ae5c67efb323410a310538f1c7/407ecee98bb0a50e8684ee592ed4bf26.png"
          alt="Logo"
          className="h-8 w-auto"
        />
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg ${darkMode ? 'bg-[#1B2838] text-yellow-400' : 'bg-blue-700 text-white'} hover:opacity-80 transition-all cursor-pointer`}
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
            className={`flex items-center px-4 py-2 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors relative ${location.pathname === item.path ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
              }`}
          >
            <i className={`${item.icon} text-lg mr-3`}></i>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Atendimento Dropdown */}
        <div>
          <button
            onClick={() => setAtendimentoOpen(!atendimentoOpen)}
            className={`w-full flex items-center justify-between px-4 py-2 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname.startsWith('/atendimento') ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
              }`}
          >
            <div className="flex items-center">
              <i className="ri-customer-service-2-line text-lg mr-3"></i>
              <span className="text-sm font-medium">Atendimento</span>
            </div>
            <i className={`ri-arrow-${atendimentoOpen ? 'up' : 'down'}-s-line text-base transition-transform`}></i>
          </button>

          {atendimentoOpen && (
            <div className={darkMode ? 'bg-[#1B2838]/50' : 'bg-blue-800/50'}>
              {atendimentoItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 pl-10 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname === item.path ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
                    }`}
                >
                  <i className={`${item.icon} text-base mr-3`}></i>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Cadastro Dropdown */}
        <div>
          <button
            onClick={() => setCadastroOpen(!cadastroOpen)}
            className={`w-full flex items-center justify-between px-4 py-2 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname.startsWith('/cadastro') ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
              }`}
          >
            <div className="flex items-center">
              <i className="ri-user-settings-line text-lg mr-3"></i>
              <span className="text-sm font-medium">Cadastro de Clientes</span>
            </div>
            <i className={`ri-arrow-${cadastroOpen ? 'up' : 'down'}-s-line text-base transition-transform`}></i>
          </button>

          {cadastroOpen && (
            <div className={darkMode ? 'bg-[#1B2838]/50' : 'bg-blue-800/50'}>
              {cadastroItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 pl-10 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname === item.path ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
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
            className={`w-full flex items-center justify-between px-4 py-2 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname.startsWith('/servicos') ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
              }`}
          >
            <div className="flex items-center">
              <i className="ri-settings-4-line text-lg mr-3"></i>
              <span className="text-sm font-medium">Configurações</span>
            </div>
            <i className={`ri-arrow-${configOpen ? 'up' : 'down'}-s-line text-base transition-transform`}></i>
          </button>

          {configOpen && (
            <div className={darkMode ? 'bg-[#1B2838]/50' : 'bg-blue-800/50'}>
              {configItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 pl-10 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname === item.path ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
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
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Ferramentas Extras</span>
          </div>

          {/* CRM + IA */}
          <div className="relative group">
            <a
              href={hasCRM ? "https://crm.zapmatic.com.br" : "/planos"}
              target={hasCRM ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className={`flex items-center px-4 py-2 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${!hasCRM ? 'opacity-60' : ''}`}
            >
              <i className="ri-robot-line text-lg mr-3"></i>
              <span className="text-sm font-medium text-white">CRM + IA</span>
              {hasCRM ? (
                <i className="ri-external-link-line text-xs ml-auto opacity-50"></i>
              ) : (
                <div className="ml-auto flex items-center space-x-1">
                  <i className="ri-lock-line text-xs"></i>
                  <span className="text-[9px] bg-blue-600 px-1.5 py-0.5 rounded text-white font-bold">CONTRATAR</span>
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
              className={`flex items-center px-4 py-2 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${!hasDisparador ? 'opacity-60' : ''}`}
            >
              <i className="ri-send-plane-line text-lg mr-3"></i>
              <span className="text-sm font-medium text-white">Acesso ao Disparador</span>
              {hasDisparador ? (
                <i className="ri-external-link-line text-xs ml-auto opacity-50"></i>
              ) : (
                <div className="ml-auto flex items-center space-x-1">
                  <i className="ri-lock-line text-xs"></i>
                  <span className="text-[9px] bg-blue-600 px-1.5 py-0.5 rounded text-white font-bold">CONTRATAR</span>
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
              className={`w-full flex items-center justify-between px-4 py-2 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname.startsWith('/super-admin') ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
                }`}
            >
              <div className="flex items-center">
                <i className="ri-shield-star-line text-lg mr-3"></i>
                <span className="text-sm font-medium">Super Admin</span>
              </div>
              <i className={`ri-arrow-${superAdminOpen ? 'up' : 'down'}-s-line text-base transition-transform`}></i>
            </button>

            {superAdminOpen && (
              <div className={darkMode ? 'bg-[#1B2838]/50' : 'bg-blue-800/50'}>
                <Link
                  to="/super-admin/organizations"
                  className={`flex items-center px-4 py-2 pl-10 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname === '/super-admin/organizations' ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
                    }`}
                >
                  <i className="ri-building-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Organizações</span>
                </Link>
                <Link
                  to="/super-admin/users"
                  className={`flex items-center px-4 py-2 pl-10 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname === '/super-admin/users' ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
                    }`}
                >
                  <i className="ri-user-star-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Usuários</span>
                </Link>
                <Link
                  to="/super-admin/settings"
                  className={`flex items-center px-4 py-2 pl-10 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname === '/super-admin/settings' ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
                    }`}
                >
                  <i className="ri-shield-keyhole-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Configurações</span>
                </Link>
                <Link
                  to="/super-admin/plans"
                  className={`flex items-center px-4 py-2 pl-10 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname === '/super-admin/plans' ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
                    }`}
                >
                  <i className="ri-price-tag-3-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Gestão de Planos</span>
                </Link>
                <Link
                  to="/super-admin/editais"
                  className={`flex items-center px-4 py-2 pl-10 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors ${location.pathname === '/super-admin/editais' ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
                    }`}
                >
                  <i className="ri-file-list-3-line text-base mr-3"></i>
                  <span className="text-sm font-medium">Gestão de Editais</span>
                </Link>
              </div>
            )}
          </div>
        )}


        {bottomMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-2 text-white ${darkMode ? 'hover:bg-[#1B2838]' : 'hover:bg-blue-700'} transition-colors relative ${location.pathname === item.path ? (darkMode ? 'bg-[#1B2838]' : 'bg-blue-700') : ''
              }`}
          >
            <i className={`${item.icon} text-lg mr-3`}></i>
            <span className="text-sm font-medium">{item.label}</span>
            {item.premium && (
              <span className="ml-auto bg-[#F59E0B] text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                Premium
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
