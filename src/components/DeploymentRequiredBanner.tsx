import { AlertTriangle, ExternalLink, Rocket, Terminal } from 'lucide-react';
import { Button } from './ui/button';

export function DeploymentRequiredBanner() {
  return (
    <div className="bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-300 dark:border-orange-800 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <Rocket className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-orange-900 dark:text-orange-100 mb-2">
            🚀 Edge Function Not Deployed Yet
          </h3>
          <p className="text-orange-800 dark:text-orange-200 mb-4">
            Your Care-PRO backend code exists in <code className="bg-orange-100 dark:bg-orange-900 px-2 py-0.5 rounded text-sm">/supabase/functions/server/</code> but needs to be deployed to Supabase before the app will work.
          </p>
          
          <div className="bg-orange-100 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-800 rounded p-4 mb-4">
            <div className="flex items-start gap-2 mb-2">
              <Terminal className="w-4 h-4 text-orange-700 dark:text-orange-300 flex-shrink-0 mt-0.5" />
              <p className="text-orange-900 dark:text-orange-100 text-sm">
                <strong>Quick Deploy Commands:</strong>
              </p>
            </div>
            <pre className="bg-orange-50 dark:bg-orange-950/50 p-3 rounded text-xs overflow-x-auto">
              <code className="text-orange-900 dark:text-orange-100">{`# 1. Install Supabase CLI
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Deploy the function
supabase functions deploy server --project-ref yforafidhxehaecwkird

# 4. Set secrets (get keys from Supabase Settings → API)
supabase secrets set SUPABASE_URL="https://yforafidhxehaecwkird.supabase.co" --project-ref yforafidhxehaecwkird
supabase secrets set SUPABASE_ANON_KEY="your-anon-key" --project-ref yforafidhxehaecwkird
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" --project-ref yforafidhxehaecwkird`}</code>
            </pre>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              onClick={() => window.open('/DEPLOY_EDGE_FUNCTION.md', '_blank')}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Complete Deployment Guide
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://app.supabase.com/project/yforafidhxehaecwkird/functions', '_blank')}
              className="border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Supabase Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://app.supabase.com/project/yforafidhxehaecwkird/settings/api', '_blank')}
              className="border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get API Keys
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-blue-900 dark:text-blue-100 text-sm">
              💡 <strong>After deployment:</strong> Visit <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-xs">/diagnostics</code> to verify everything is working correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
