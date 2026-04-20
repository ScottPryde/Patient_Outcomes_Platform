import { useState, useEffect } from 'react';
import { Rocket, ExternalLink, X } from 'lucide-react';

export function RedeployHint() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has seen 401 error recently
    const lastAuthError = localStorage.getItem('last-auth-error');
    const lastErrorTime = localStorage.getItem('last-auth-error-time');
    const hasBeenDismissed = localStorage.getItem('redeploy-hint-dismissed');
    
    if (hasBeenDismissed === 'true') {
      return;
    }
    
    if (lastAuthError && lastErrorTime) {
      const errorTime = parseInt(lastErrorTime);
      const now = Date.now();
      
      // Show hint if error was within last 10 minutes
      if (now - errorTime < 10 * 60 * 1000 && lastAuthError.includes('401')) {
        setShow(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('redeploy-hint-dismissed', 'true');
  };

  if (!show || dismissed) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-800 rounded-lg relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </button>
      
      <div className="flex items-start gap-3 pr-8">
        <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-blue-900 dark:text-blue-100 mb-2">
            💡 Did you just set the service role key?
          </h4>
          <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
            If you just configured <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-xs">SUPABASE_SERVICE_ROLE_KEY</code>,
            you need to <strong>redeploy the Edge Function</strong> for it to take effect.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/HOW_TO_REDEPLOY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 text-sm transition-colors"
            >
              <Rocket className="w-4 h-4" />
              How to Redeploy (2 min)
            </a>
            <a
              href="https://app.supabase.com/project/yforafidhxehaecwkird/functions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900 text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Edge Functions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
