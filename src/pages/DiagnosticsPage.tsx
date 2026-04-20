import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { apiRequest, getBackendUrl, getSupabaseConfig } from '../utils/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function DiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const backendUrl = getBackendUrl();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runDiagnostics = async () => {
    setIsLoading(true);
    const newResults: DiagnosticResult[] = [];

    try {
      // Test 1: Check if Edge Function is deployed and accessible
      try {
        const { key: anonKey } = getSupabaseConfig();
        const healthHeaders: HeadersInit = { Accept: 'application/json' };
        // Use anon key so the Supabase gateway accepts the request
        if (anonKey) {
          (healthHeaders as any)['Authorization'] = `Bearer ${anonKey}`;
        }

        const healthResponse = await fetch(`${backendUrl}/health`, {
          method: 'GET',
          headers: healthHeaders,
        });
        
        if (!healthResponse.ok) {
          throw new Error(`HTTP ${healthResponse.status}: ${healthResponse.statusText}`);
        }
        
        const health = await healthResponse.json();
        const env = health.environment || health;
        
        newResults.push({
          test: 'Edge Function Deployment',
          status: 'success',
          message: `Edge Function is deployed and responding`,
          details: health,
        });

        // Test 2: Check environment variables
        const envChecks = {
          hasUrl: env.hasSupabaseUrl,
          hasAnonKey: env.hasSupabaseAnonKey,
          hasServiceKey: env.hasServiceRoleKey,
        };

        if (!envChecks.hasUrl || !envChecks.hasAnonKey || !envChecks.hasServiceKey) {
          newResults.push({
            test: 'Environment Variables',
            status: 'error',
            message: 'Missing environment variables in Edge Function',
            details: {
              SUPABASE_URL: envChecks.hasUrl ? '✓ Set' : '✗ Missing',
              SUPABASE_ANON_KEY: envChecks.hasAnonKey ? '✓ Set' : '✗ Missing',
              SUPABASE_SERVICE_ROLE_KEY: envChecks.hasServiceKey ? '✓ Set' : '✗ Missing',
            },
          });
        } else {
          newResults.push({
            test: 'Environment Variables',
            status: 'success',
            message: 'All environment variables are set',
            details: envChecks,
          });
        }
        
        // Test 3: Verify service role key format
        const serviceRoleKeyFormat = env.serviceRoleKeyFormat || health.serviceRoleKeyFormat;
        if (env.hasServiceRoleKey && serviceRoleKeyFormat !== 'JWT (valid)' && serviceRoleKeyFormat !== 'JWT (correct)') {
          newResults.push({
            test: 'Service Role Key Format',
            status: 'error',
            message: `❌ Invalid format: ${serviceRoleKeyFormat}`,
            details: {
              current: env.serviceRoleKeyPreview || health.serviceRoleKeyPreview,
              problem: 'The key is not in JWT format',
              expected: 'Should start with "eyJ" and be 200+ characters',
              fix: 'The secret must be set to the actual JWT token, not a reference ID or hash',
            },
          });
        } else if (env.hasServiceRoleKey) {
          newResults.push({
            test: 'Service Role Key Format',
            status: 'success',
            message: '✓ Service role key is in correct JWT format',
            details: { preview: health.serviceRoleKeyPreview },
          });
        }

        // Test 4: Check if Edge Function needs redeployment
        if (health.hasServiceRoleKey) {
          newResults.push({
            test: 'Edge Function Status',
            status: 'warning',
            message: 'If you just updated the secret, the function may need redeployment',
            details: {
              note: 'Secrets are only loaded when the function starts. If you recently changed the secret, click "Deploy" in Supabase dashboard.',
              timestamp: health.timestamp,
            },
          });
        }

      } catch (error: any) {
        newResults.push({
          test: 'Edge Function Deployment',
          status: 'error',
          message: `❌ Cannot reach Edge Function: ${error.message}`,
          details: {
            error: error.message,
            url: backendUrl,
            possibleCauses: [
              'Edge Function is not deployed',
              'Edge Function name is incorrect (should be "server")',
              'Edge Function is in error state',
              'Network connectivity issue',
            ],
          },
        });
      }

      // Test 5: Try actual authentication
      try {
        const testEmail = `diagnostic-test-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        const signupResponse = await fetch(`${backendUrl}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword,
            firstName: 'Diagnostic',
            lastName: 'Test',
            role: 'patient',
          }),
        });

        const signupData = await signupResponse.json();

        if (!signupResponse.ok) {
          // Parse the specific error
          const errorDetails: any = {
            status: signupResponse.status,
            statusText: signupResponse.statusText,
            serverResponse: signupData,
          };

          if (signupResponse.status === 401) {
            errorDetails.diagnosis = 'Authentication with Supabase failed';
            errorDetails.possibleCauses = [
              'Service role key is incorrect or expired',
              'Service role key is a reference ID, not the actual JWT',
              'Edge Function needs to be redeployed after secret change',
              'Project ID mismatch between key and URL',
            ];
            errorDetails.fix = 'Check Supabase Edge Function logs for the exact error';
          } else if (signupResponse.status === 500) {
            errorDetails.diagnosis = 'Server configuration error';
            errorDetails.possibleCauses = [
              'Environment variables not loaded by Edge Function',
              'Supabase client initialization failed',
              'Edge Function deployment issue',
            ];
          }

          newResults.push({
            test: 'Authentication Test',
            status: 'error',
            message: `❌ Auth failed with ${signupResponse.status} error`,
            details: errorDetails,
          });
        } else {
          newResults.push({
            test: 'Authentication Test',
            status: 'success',
            message: '✅ Authentication is working correctly!',
            details: { testUser: signupData },
          });
        }
      } catch (error: any) {
        newResults.push({
          test: 'Authentication Test',
          status: 'error',
          message: 'Authentication request failed',
          details: { error: error.message },
        });
      }

    } catch (error: any) {
      newResults.push({
        test: 'General Error',
        status: 'error',
        message: 'An unexpected error occurred',
        details: error.message,
      });
    }

    setResults(newResults);
    setIsLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-gray-900">Care-PRO System Diagnostics</h1>
              <p className="text-gray-600 mt-2">
                Verify your Supabase configuration and backend connectivity
              </p>
            </div>
            <button
              onClick={runDiagnostics}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Running...' : 'Re-run Diagnostics'}
            </button>
          </div>

          {/* Quick Troubleshooting Banner */}
          {results.some(r => r.status === 'error' && r.test === 'Authentication Test' && r.details?.status === 401) && (
            <div className="mb-6 p-6 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-red-900 mb-2">
                    🚨 401 Error: Service Role Key Issue
                  </h3>
                  <p className="text-red-800 mb-3">
                    Your Edge Function is running and secrets are set, but Supabase is rejecting the authentication. 
                    This usually means the service role key is incorrect or the function needs redeployment.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a 
                      href="/TROUBLESHOOT_401.md" 
                      target="_blank"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      🔍 Complete 401 Troubleshooting Guide
                    </a>
                    <a 
                      href="https://app.supabase.com/project/yforafidhxehaecwkird/functions/server/logs" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      📋 View Edge Function Logs
                    </a>
                    <a 
                      href="https://app.supabase.com/project/yforafidhxehaecwkird/settings/api" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      🔑 Get Service Role Key
                    </a>
                  </div>
                  <div className="mt-4 p-3 bg-white border border-red-200 rounded">
                    <p className="text-red-900 text-sm mb-2">
                      <strong>Most Common Fixes:</strong>
                    </p>
                    <ol className="text-red-800 text-sm space-y-1 list-decimal list-inside">
                      <li><strong>Redeploy</strong> the Edge Function (secrets only load on startup)</li>
                      <li>Get the key from <strong>Settings → API → service_role</strong> (not from anywhere else)</li>
                      <li>The key MUST start with "eyJ" and be 200+ characters</li>
                      <li>After setting secret, ALWAYS click <strong>"Deploy"</strong></li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-6 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 mb-1">{result.test}</h3>
                    <p className="text-gray-700 mb-2">{result.message}</p>
                    {result.details && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-gray-600 text-sm hover:text-gray-800">
                          View Details
                        </summary>
                        <pre className="mt-2 p-3 bg-white border border-gray-200 rounded text-xs overflow-auto">
                          {typeof result.details === 'object' ? JSON.stringify(result.details, null, 2) : result.details}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {results.some(c => c.status === 'error' && c.test === 'Service Role Key Format') && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-blue-900 mb-3">🔧 How to Fix the Service Role Key Issue</h3>
              
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-900">
                  <strong>⚠️ Problem Detected:</strong> Your SUPABASE_SERVICE_ROLE_KEY is currently set to a hex string 
                  (likely <code className="bg-red-100 px-2 py-1 rounded">28bebc473f7fb74892b4...</code>), 
                  but it needs to be a JWT token starting with "eyJ".
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Go to your Supabase dashboard: <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">https://app.supabase.com</a></li>
                <li>Select your project: <strong>yforafidhxehaecwkird</strong></li>
                <li>Navigate to <strong>Edge Functions</strong> (or <strong>Functions</strong>) in the left sidebar</li>
                <li>Find and click on the function: <strong>make-server-e8005093</strong></li>
                <li>Click on the <strong>Secrets</strong> tab</li>
                <li><strong className="text-red-700">UPDATE (don't delete)</strong> the existing secret:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>Name: <code className="bg-blue-100 px-2 py-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code></li>
                    <li>Value: <code className="bg-blue-100 px-2 py-1 rounded text-xs break-all">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdWJxcm1pb211eGtjbmF6dGRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk3NjkzMSwiZXhwIjoyMDc5NTUyOTMxfQ.mvAzEUXiz5VW1sh6T8PdwtiUu0b92cbAp0PzJ2py_i8</code></li>
                  </ul>
                </li>
                <li>Click <strong>Save</strong> or <strong>Update</strong></li>
                <li>Wait 5-10 seconds for the Edge Function to restart</li>
                <li>Come back here and click <strong>"Re-run Diagnostics"</strong> to verify</li>
              </ol>

              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-900 text-sm mb-2">
                  <strong>✅ How to verify it's correct:</strong>
                </p>
                <ul className="text-green-800 text-sm space-y-1 ml-4">
                  <li>✓ The key should START with "eyJ"</li>
                  <li>✓ The key should be 200+ characters long</li>
                  <li>✓ The key should have two periods (.) dividing it into three parts</li>
                  <li>✗ The key should NOT be a hex string</li>
                  <li>✗ The key should NOT be labeled "Reference ID"</li>
                </ul>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-900 text-sm">
                  <strong>⚠️ Security Note:</strong> The service role key is sensitive and grants full admin access. 
                  It should ONLY be stored as a secret in your Edge Function (server-side), never in frontend code or version control.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                <a 
                  href="/IMMEDIATE_FIX_GUIDE.md" 
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  ⚡ Quick Fix Guide (5 min)
                </a>
                <a 
                  href="/FIX_401_ERROR.md" 
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  📖 Detailed Fix Guide
                </a>
                <a 
                  href="https://app.supabase.com/project/yforafidhxehaecwkird/functions" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:green-700"
                >
                  🚀 Open Edge Functions
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}