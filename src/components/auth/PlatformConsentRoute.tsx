import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConsent } from '../../contexts/ConsentContext';

export function PlatformConsentRoute({ children }: { children: ReactNode }) {
  const { isLoading: authLoading } = useAuth();
  const { isLoading: consentLoading, hasRequiredConsents } = useConsent();

  if (authLoading || consentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--border-token)] border-t-[var(--teal)]"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!hasRequiredConsents()) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
