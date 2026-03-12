import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute }  from './ProtectedRoute';
import { MainLayout }      from '../layout/MainLayout';
import { LoginPage }       from '../pages/LoginPage';
import { DashboardPage }   from '../pages/DashboardPage';
import { CatalogPage }     from '../pages/CatalogPage';
import { CustomersPage }   from '../pages/CustomersPage';
import { SalesPage }       from '../pages/SalesPage';
import { CashPage }        from '../pages/CashPage';
import { ReportsPage }     from '../pages/ReportsPage';
import { TicketPage }      from '../pages/TicketPage';
import { UsersPage }       from '../pages/UsersPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true,           element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard',     element: <DashboardPage /> },
          { path: 'catalogo',      element: <CatalogPage /> },
          { path: 'clientes',      element: <CustomersPage /> },
          { path: 'ventas',        element: <SalesPage /> },
          { path: 'caja',          element: <CashPage /> },
          { path: 'reportes',      element: <ReportsPage /> },
          { path: 'ticket/:id',    element: <TicketPage /> },
          // Solo Administrador puede gestionar usuarios
          {
            element: <ProtectedRoute allowedRoles={['admin']} />,
            children: [
              { path: 'usuarios', element: <UsersPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
