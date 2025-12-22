import { useEffect, useState } from 'react';
import { AlertCircle, ExternalLink, CheckCircle, Rocket, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { getBackendUrl, getSupabaseConfig } from '../utils/supabase/client';
import { DeploymentRequiredBanner } from './DeploymentRequiredBanner';

export function BackendConfigBanner() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ok' | 'not-deployed' | 'missing-config' | 'error'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');
  
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const { key: anonKey } = getSupabaseConfig();
      const headers: HeadersInit = { Accept: 'application/json' };
      // Supabase Edge Functions require a Bearer token; use anon key for public health check
      if (anonKey) {
        (headers as any)['Authorization'] = `Bearer ${anonKey}`;
      }

      const response = await fetch(`${getBackendUrl()}/health`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          setBackendStatus('not-deployed');
          setErrorDetails('Edge Function not found - needs deployment');
        } else {
          setBackendStatus('error');
          setErrorDetails(`HTTP ${response.status}: ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      
      if (!data.hasSupabaseUrl || !data.hasSupabaseAnonKey || !data.hasServiceRoleKey) {
        setBackendStatus('missing-config');
        setErrorDetails('Environment variables not configured');
      } else {
        setBackendStatus('ok');
      }
    } catch (error: any) {
      // Network error or function doesn't exist
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setBackendStatus('not-deployed');
        setErrorDetails('Cannot reach Edge Function - likely not deployed');
      } else {
        setBackendStatus('error');
        setErrorDetails(error.message);
      }
    }
  };

  if (backendStatus === 'checking') {
    return (
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-blue-900 dark:text-blue-100 text-sm">Checking backend status...</p>
        </div>
      </div>
    );
  }

  if (backendStatus === 'ok') {
    return null; // Don't show banner if everything is working
  }

  if (backendStatus === 'not-deployed') {
    return <DeploymentRequiredBanner />;
  }

  // Missing config or error
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-red-900 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            <strong>Backend Configuration Required:</strong> {errorDetails}{' '}
            <Link 
              to="/diagnostics" 
              className="underline font-medium hover:text-red-950"
            >
              View Setup Instructions
            </Link>
          </p>
        </div>
        <button
          onClick={() => setBackendStatus('ok')}
          className="flex-shrink-0 p-1 hover:bg-red-600 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}