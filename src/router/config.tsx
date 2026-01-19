
import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { SuperAdminRoute } from '../components/guards/SuperAdminRoute';

// Add loading fallback component for better UX
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    Loading...
  </div>
);

// Auth pages
const Login = lazy(() => import('../pages/auth/login/page'));
const Register = lazy(() => import('../pages/auth/register/page'));

// Super Admin pages
const SuperAdminDashboard = lazy(() => import('../pages/super-admin/dashboard/page'));
const SuperAdminOrganizations = lazy(() => import('../pages/super-admin/organizations/page'));
const SuperAdminUsers = lazy(() => import('../pages/super-admin/users/page'));
const SuperAdminSettings = lazy(() => import('../pages/super-admin/settings/page'));
const SuperAdminPlans = lazy(() => import('../pages/super-admin/plans/page'));
const SuperAdminEditais = lazy(() => import('../pages/super-admin/editais/page'));

// App pages
const Layout = lazy(() => import('../components/feature/Layout'));
const Home = lazy(() => import('../pages/home/page'));
const Rastreamento = lazy(() => import('../pages/rastreamento/page'));
const StatusRecurso = lazy(() => import('../pages/status-recurso/page'));
const RecursosIA = lazy(() => import('../pages/recursos-ia/page'));
const Planos = lazy(() => import('../pages/planos/page'));
const MarketingDigital = lazy(() => import('../pages/marketing-digital/page'));
const ChatWhatsApp = lazy(() => import('../pages/atendimento/chat-whatsapp/page'));
const CRMKanban = lazy(() => import('../pages/atendimento/crm-kanban/page'));
const NovoCliente = lazy(() => import('../pages/cadastro/novo-cliente/page'));
const ListaClientes = lazy(() => import('../pages/cadastro/lista-clientes/page'));
const ProspeccaoEditais = lazy(() => import('../pages/prospeccao-editais/page'));
const MaterialApoio = lazy(() => import('../pages/material-apoio/page'));
const Checkout = lazy(() => import('../pages/checkout/page'));
const Educacional = lazy(() => import('../pages/educacional/page'));
const Perfil = lazy(() => import('../pages/perfil/page'));
const Servicos = lazy(() => import('../pages/servicos/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Wrap lazy components in Suspense for error boundaries
const routes: RouteObject[] = [
  // Public routes
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Register />
      </Suspense>
    ),
  },
  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoadingFallback />}>
          <Layout />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'rastreamento',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Rastreamento />
          </Suspense>
        ),
      },
      {
        path: 'status-recurso',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <StatusRecurso />
          </Suspense>
        ),
      },
      {
        path: 'recursos-ia',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RecursosIA />
          </Suspense>
        ),
      },
      {
        path: 'planos',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Planos />
          </Suspense>
        ),
      },
      {
        path: 'marketing-digital',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MarketingDigital />
          </Suspense>
        ),
      },
      {
        path: 'atendimento/chat-whatsapp',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ChatWhatsApp />
          </Suspense>
        ),
      },
      {
        path: 'atendimento/crm-kanban',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CRMKanban />
          </Suspense>
        ),
      },
      {
        path: 'cadastro/novo-cliente',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NovoCliente />
          </Suspense>
        ),
      },
      {
        path: 'cadastro/lista-clientes',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ListaClientes />
          </Suspense>
        ),
      },
      {
        path: 'servicos',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Servicos />
          </Suspense>
        ),
      },
      {
        path: 'prospeccao-editais',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProspeccaoEditais />
          </Suspense>
        ),
      },
      {
        path: 'material-apoio',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MaterialApoio />
          </Suspense>
        ),
      },
      {
        path: 'checkout',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Checkout />
          </Suspense>
        ),
      },
      {
        path: 'educacional',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Educacional />
          </Suspense>
        ),
      },
      {
        path: 'perfil',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Perfil />
          </Suspense>
        ),
      },
      {
        path: 'super-admin',
        element: (
          <SuperAdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SuperAdminDashboard />
            </Suspense>
          </SuperAdminRoute>
        ),
      },
      {
        path: 'super-admin/organizations',
        element: (
          <SuperAdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SuperAdminOrganizations />
            </Suspense>
          </SuperAdminRoute>
        ),
      },
      {
        path: 'super-admin/users',
        element: (
          <SuperAdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SuperAdminUsers />
            </Suspense>
          </SuperAdminRoute>
        ),
      },
      {
        path: 'super-admin/settings',
        element: (
          <SuperAdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SuperAdminSettings />
            </Suspense>
          </SuperAdminRoute>
        ),
      },
      {
        path: 'super-admin/plans',
        element: (
          <SuperAdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SuperAdminPlans />
            </Suspense>
          </SuperAdminRoute>
        ),
      },
      {
        path: 'super-admin/editais',
        element: (
          <SuperAdminRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SuperAdminEditais />
            </Suspense>
          </SuperAdminRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    ),
  },
];

export default routes;
