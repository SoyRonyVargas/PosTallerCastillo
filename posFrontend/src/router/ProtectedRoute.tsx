import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  allowedRoles?: UserRole[];
}

/**
 * Protege rutas verificando que exista una sesión activa.
 * Si se especifican allowedRoles, verifica también que el rol sea válido.
 * Si no hay sesión redirige al login.
 */
export function ProtectedRoute({ allowedRoles }: Props) {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
