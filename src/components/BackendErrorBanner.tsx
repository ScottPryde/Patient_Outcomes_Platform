import { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

export function BackendErrorBanner() {
  const [show, setShow] = useState(false);
  const [errorType, setErrorType] = useState<'401' | 'other' | null>(null);

  useEffect(() => {
    // Check localStorage for recent auth errors
    const lastAuthError = localStorage.getItem('last-auth-error');
    const lastErrorTime = localStorage.getItem('last-auth-error-time');
    
    if (lastAuthError && lastErrorTime) {
      const errorTime = parseInt(lastErrorTime);
      const now = Date.now();
      
      // Show banner if error was within last 5 minutes
      if (now - errorTime < 5 * 60 * 1000) {
        if (lastAuthError.includes('401')) {
          setErrorType('401');
          setShow(true);
        } else {
          setErrorType('other');
          setShow(true);
        }
      }
    }

    // Listen for auth errors
    const handleAuthError = (event: CustomEvent) => {
      const error = event.detail?.error || '';
      
      if (error.includes('401')) {
        setErrorType('401');
        setShow(true);
        localStorage.setItem('last-auth-error', error);
        localStorage.setItem('last-auth-error-time', Date.now().toString());
      }
    };

    window.addEventListener('auth-error' as any, handleAuthError as any);
    return () => {
      window.removeEventListener('auth-error' as any, handleAuthError as any);
    };
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.removeItem('last-auth-error');
    localStorage.removeItem('last-auth-error-time');
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert variant="destructive" className="max-w-4xl mx-auto border-2 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div className="flex-1">
            <AlertTitle className="mb-2">Backend Configuration Error</AlertTitle>
            <AlertDescription className="space-y-3">
              {errorType === '401' ? (
                <>
                  <p>
                    <strong>Registration/Login is failing with 401 error.</strong> This means the{' '}
                    <code className="bg-red-900/20 px-2 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code>{' '}
                    is not set correctly in your Edge Function.
                  </p>
                  
                  <div className="bg-red-900/10 rounded p-3 space-y-2 text-sm">
                    <p className="font-semibold">Quick Fix:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to Supabase Dashboard → Edge Functions → <strong>server</strong> → Secrets</li>
                      <li>Get your <strong>service_role</strong> key from Settings → API (starts with "eyJ")</li>
                      <li>Set it as <code className="bg-red-900/20 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code></li>
                      <li>Click <strong>"Deploy"</strong> button to restart the Edge Function</li>
                    </ol>
                    <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded">
                      <p className="text-yellow-200 text-xs">
                        ⚠️ <strong>Important:</strong> After setting the secret, you MUST click "Deploy" to restart the function. 
                        Secrets only load on startup! <a href="/HOW_TO_REDEPLOY.md" target="_blank" className="underline font-medium">How to redeploy →</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('/HOW_TO_REDEPLOY.md', '_blank')}
                      className="bg-red-900/10 border-red-700/50 hover:bg-red-900/20"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      🚀 How to Redeploy
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('/TROUBLESHOOT_401.md', '_blank')}
                      className="bg-red-900/10 border-red-700/50 hover:bg-red-900/20"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      🔍 Advanced Troubleshooting
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('https://app.supabase.com/project/yforafidhxehaecwkird/settings/api', '_blank')}
                      className="bg-red-900/10 border-red-700/50 hover:bg-red-900/20"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Supabase Settings
                    </Button>
                  </div>
                </>
              ) : (
                <p>
                  There was an error communicating with the backend. Please check the diagnostics page
                  for more information.
                </p>
              )}
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}