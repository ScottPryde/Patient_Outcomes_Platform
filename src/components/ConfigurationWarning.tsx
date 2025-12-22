import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export function ConfigurationWarning() {
  const [dismissed, setDismissed] = useState(false);
  
  // Check if Supabase is configured
  const isConfigured = typeof window !== 'undefined' && 
                       (window as any).__SUPABASE_URL__ && 
                       (window as any).__SUPABASE_ANON_KEY__;
  
  if (isConfigured || dismissed) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-amber-900 dark:text-amber-100">
              Supabase Configuration Required
            </h3>
            <p className="text-amber-800 dark:text-amber-200 text-sm mt-1">
              The application cannot connect to the backend. Please configure your Supabase credentials in <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">/config.tsx</code>.
            </p>
            <div className="flex gap-4 mt-2">
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-900 dark:text-amber-100 hover:underline flex items-center gap-1"
              >
                Open Supabase Dashboard
                <ExternalLink className="size-3" />
              </a>
              <button
                onClick={() => setDismissed(true)}
                className="text-sm text-amber-700 dark:text-amber-300 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
