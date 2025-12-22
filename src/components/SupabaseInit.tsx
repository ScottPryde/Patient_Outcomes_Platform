import { useEffect, useState } from 'react';
import { config } from '../config';

async function fetchConfigFromBackend(): Promise<{ supabaseUrl: string; supabaseAnonKey: string } | null> {
  // Try different URL patterns to find the backend
  const patterns = [
    // If we're on supabase.co domain
    () => {
      if (typeof window !== 'undefined' && window.location.hostname.includes('.supabase.co')) {
        const projectId = window.location.hostname.split('.')[0];
        return `https://${projectId}.supabase.co/functions/v1/make-server-e8005093/config`;
      }
      return null;
    },
    // Relative paths
    () => '/functions/v1/make-server-e8005093/config',
    () => '/make-server-e8005093/config',
  ];

  for (const patternFn of patterns) {
    const url = patternFn();
    if (!url) continue;

    try {
      console.log(`Trying to fetch config from: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.supabaseUrl && data.supabaseAnonKey) {
          console.log(`✅ Config fetched successfully from: ${url}`);
          return data;
        }
      }
      console.log(`Failed: ${url} - Status ${response.status}`);
    } catch (error) {
      console.log(`Failed: ${url} - ${error}`);
    }
  }

  return null;
}

export function SupabaseInit({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    async function initialize() {
      console.log('=== Initializing Supabase Configuration ===');
      console.log('Config object:', config);
      console.log('Config URL:', config?.supabaseUrl);
      console.log('Config Key:', config?.supabaseAnonKey ? 'Present (hidden)' : 'Missing');

      // Check manual config first
      const hasManualConfig = 
        config?.supabaseUrl && 
        config.supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' &&
        config?.supabaseAnonKey && 
        config.supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE';

      console.log('Has manual config:', hasManualConfig);

      if (hasManualConfig) {
        console.log('✅ Using manual config from /config.tsx');
        (window as any).__SUPABASE_URL__ = config.supabaseUrl;
        (window as any).__SUPABASE_ANON_KEY__ = config.supabaseAnonKey;
        setState('ready');
        return;
      }

      // Try auto-discovery
      console.log('Attempting auto-discovery from backend...');
      const discovered = await fetchConfigFromBackend();

      if (discovered) {
        console.log('✅ Auto-discovered config');
        (window as any).__SUPABASE_URL__ = discovered.supabaseUrl;
        (window as any).__SUPABASE_ANON_KEY__ = discovered.supabaseAnonKey;
        setState('ready');
        return;
      }

      console.error('❌ Configuration not found');
      setState('error');
    }

    initialize();
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl bg-white rounded-lg shadow-lg p-6 border border-yellow-300">
          <h2 className="text-xl mb-4 text-gray-900">⚠️ Configuration Required</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Could not find Supabase configuration.</strong>
            </p>
            <p className="text-sm text-gray-600">
              Please add your Supabase credentials to <code className="bg-gray-200 px-2 py-1 rounded">/config.tsx</code>
            </p>
          </div>

          <div className="bg-gray-50 rounded p-4 mb-4">
            <p className="font-medium text-gray-900 mb-2">Steps to configure:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Go to <a href="https://app.supabase.com" className="text-blue-600 underline" target="_blank" rel="noopener">app.supabase.com</a></li>
              <li>Open your project</li>
              <li>Go to Settings → API</li>
              <li>Copy "Project URL" and "anon public" key</li>
              <li>Paste into <code className="bg-gray-200 px-1 rounded">/config.tsx</code></li>
            </ol>
          </div>

          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}