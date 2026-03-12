import logo from '../assets/logo_tallercastillo.jpg';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ShoppingCart,
  Landmark,
  BarChart3,
  UserCog,
  X,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  to:    string;
  label: string;
  icon:  React.ReactNode;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard',  icon: <LayoutDashboard size={18} /> },
  { to: '/ventas',    label: 'Ventas',      icon: <ShoppingCart size={18} />,   roles: ['admin','cajero'] },
  { to: '/catalogo',  label: 'Catálogo',    icon: <BookOpen size={18} />,       roles: ['admin','cajero'] },
  { to: '/clientes',  label: 'Clientes',    icon: <Users size={18} />,          roles: ['admin','cajero'] },
  { to: '/caja',      label: 'Caja',        icon: <Landmark size={18} />,       roles: ['admin','cajero'] },
  { to: '/reportes',  label: 'Reportes',    icon: <BarChart3 size={18} />,      roles: ['admin','consulta'] },
  { to: '/usuarios',  label: 'Usuarios',    icon: <UserCog size={18} />,        roles: ['admin'] },
];

interface Props {
  open:      boolean;
  onClose:   () => void;
}

export function Sidebar({ open, onClose }: Props) {
  const { session } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return session && item.roles.includes(session.role);
  });

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-30',
          'flex flex-col transition-transform duration-200',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Logo" className="w-10 h-10" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-900">Taller Castillo</p>
              <p className="text-xs text-gray-400 font-medium">POS v1.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                ['nav-link', isActive ? 'nav-link-active' : ''].join(' ')
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer info */}
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Demo estático · Sin backend</p>
        </div>
      </aside>
    </>
  );
}
