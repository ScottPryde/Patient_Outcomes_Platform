import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Play, Globe, Users, FlaskConical, ShieldCheck } from 'lucide-react';

const DEMO_EMAIL = 'anna.thompson@demo.interactium.io';
const DEMO_PASSWORD = 'Carepro1234!';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
      toast.success('Welcome, Anna! You\'re exploring the demo.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Demo sign-in failed. Please check that the demo account exists in Supabase Auth.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,#0f172a_0%,#1e3a5f_60%,#0b4d43_100%)]">
      {/* Trust stats bar */}
      <div className="w-full border-b border-white/10 py-4 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-6 md:gap-12">
          <TrustStat icon={<Users className="w-4 h-4" />} value="65,750+" label="patients enrolled" />
          <TrustStat icon={<FlaskConical className="w-4 h-4" />} value="44" label="active studies" />
          <TrustStat icon={<Globe className="w-4 h-4" />} value="40+" label="countries" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero copy */}
        <div className="text-center mb-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-medium px-3 py-1 rounded-full mb-5">
            TREAT-NMD Partner Platform
          </div>
          <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-3">
            Your condition.<br />Your voice. Your data.
          </h1>
          <p className="text-slate-300 text-base">
            The Interactium / PaLaDín platform for neuromuscular disease patients — tracking outcomes, contributing to research, and shaping the treatments of tomorrow.
          </p>
        </div>

        {/* Login card */}
        <div className="w-full max-w-md bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 shadow-2xl">

          {/* Demo button — primary CTA */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/50 text-teal-200 font-semibold py-3 rounded-lg transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDemoLoading ? (
              <span className="w-4 h-4 border-2 border-teal-300/60 border-t-teal-200 rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Demo — sign in as Anna Thompson
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or sign in with your account</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400/60 focus:border-transparent text-sm"
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400/60 focus:border-transparent text-sm pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white/90 hover:bg-white text-slate-900 font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-white/40 text-xs">
              New patient?{' '}
              <Link to="/register" className="text-teal-400 hover:text-teal-300">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Legal footer */}
        <div className="mt-8 max-w-md text-center">
          <div className="flex items-center justify-center gap-1.5 text-white/30 text-xs mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GDPR Article 9 · NHS DSPT · AES-256-GCM encrypted · Vault-secured</span>
          </div>
          <p className="text-white/20 text-xs">
            © 2026 Interactium Ltd · Registered in England · ICO registration ZB812043
          </p>
          <Link to="/diagnostics" className="text-white/20 hover:text-white/40 text-xs underline mt-1 inline-block">
            System diagnostics
          </Link>
        </div>
      </div>
    </div>
  );
}

function TrustStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-white/70">
      <span className="text-teal-400">{icon}</span>
      <span className="font-bold text-white text-sm">{value}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}
