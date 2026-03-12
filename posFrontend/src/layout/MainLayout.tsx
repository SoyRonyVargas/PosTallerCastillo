import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar }  from './Topbar';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/catalogo':  'Catálogo',
  '/clientes':  'Clientes',
  '/ventas':    'Nueva Venta',
  '/caja':      'Caja',
  '/reportes':  'Reportes',
  '/usuarios':  'Usuarios',
};

function getTitleFromPath(pathname: string): string {
  if (pathname.startsWith('/ticket/')) return 'Ticket de Venta';
  return ROUTE_TITLES[pathname] ?? 'Taller Castillo POS';
}

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location   = useLocation();
  const title      = getTitleFromPath(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
