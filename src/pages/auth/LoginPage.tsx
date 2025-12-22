import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { BackendConfigBanner } from '../../components/BackendConfigBanner';
import { RedeployHint } from '../../components/RedeployHint';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showFirstTimeHelper, setShowFirstTimeHelper] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is first visit
    const hasVisited = localStorage.getItem('care-pro-visited');
    if (!hasVisited) {
      setShowFirstTimeHelper(true);
      localStorage.setItem('care-pro-visited', 'true');
    }
  }, []);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const response = await fetch('https://wjubqrmiomuxkcnaztdh.supabase.co/functions/v1/make-server-e8005093/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        toast.success('Demo users created! You can now login with any demo account.');
      } else {
        const error = await response.json();
        toast.error(`Seed failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to create demo users. Please try creating an account manually.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Trigger error event for banner
      if (error.message.includes('401')) {
        window.dispatchEvent(new CustomEvent('auth-error', { 
          detail: { error: error.message } 
        }));
        localStorage.setItem('last-auth-error', error.message);
        localStorage.setItem('last-auth-error-time', Date.now().toString());
      }
      
      // Provide specific error messages
      if (error.message.includes('401')) {
        toast.error('❌ Backend Configuration Error', {
          description: 'SUPABASE_SERVICE_ROLE_KEY not set correctly. See the red banner above for instructions.',
          duration: 8000,
        });
      } else if (error.message.includes('Invalid')) {
        toast.error('Invalid email or password. Please check your credentials or create an account.');
      } else {
        toast.error(error.message || 'Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Demo accounts that are actually seeded by the backend (see seed.tsx)
  const demoUsers = [
    { email: 'patient@carepro.com', role: 'Patient' },
    { email: 'caregiver@carepro.com', role: 'Caregiver' },
    { email: 'clinician@carepro.com', role: 'Clinician' },
    { email: 'researcher@carepro.com', role: 'Researcher' },
    { email: 'admin@carepro.com', role: 'Administrator' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <BackendConfigBanner />
      <RedeployHint />
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
              <span className="text-white text-2xl font-bold">P</span>
            </div>
            <h1 className="text-gray-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access your PRO Platform account
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              💡 Demo Accounts Available
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-300 mb-3">
              Click any email below, then use password:{' '}
              <code className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">
                CarePRO2024!
              </code>
            </p>
            <div className="space-y-1">
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  onClick={() => {
                    setEmail(user.email);
                    setPassword('CarePRO2024!');
                  }}
                  className="block w-full text-left text-sm text-blue-700 dark:text-blue-300 hover:underline px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800/30"
                >
                  <span className="font-medium">{user.role}:</span> {user.email}
                </button>
              ))}
            </div>
          </div>

          {/* Register link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                Create Account
              </Link>
            </p>
          </div>

          {/* Diagnostics link */}
          <div className="mt-2 text-center">
            <Link 
              to="/diagnostics" 
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 underline"
            >
              Having trouble? Run system diagnostics
            </Link>
          </div>
        </div>

        {/* WCAG compliance note */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          This platform is WCAG 2.2 AA compliant
        </p>
      </div>
    </div>
  );
}