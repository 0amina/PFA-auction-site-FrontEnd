import type { ReactNode } from 'react';
import { Navigate }       from 'react-router-dom';
import { useRole }        from '../hooks/useRole';
import type { Role }      from '../types/role';
import { useAuth } from '../context/AuthContext';
interface Props {
  children:    ReactNode;
  roles?:      Role[];          // optional — leave empty for "any logged-in user"
  redirectTo?: string;          // optional — where to send unauthenticated users
}

export default function ProtectedRoute({
  children,
  roles,
  redirectTo = '/auth/login',
}: Props) {
  const { user, isLoading } = useAuth();
  const { hasRole }         = useRole();

  // Wait for localStorage rehydration before making any redirect decision.
  // Without this, a page refresh always briefly redirects to /auth.
  if (isLoading) return null;

  // Not logged in → send to auth
  if (!user) return <Navigate to={redirectTo} replace />;

  // Logged in but wrong role → send to home (not to auth)
  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}