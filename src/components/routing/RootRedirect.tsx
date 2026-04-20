import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--border-token)] border-t-[var(--teal)]"
          aria-label="Loading"
        />
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}
