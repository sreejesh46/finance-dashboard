import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import AuthPanel from '../components/AuthPanel';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);

  const { login, showAuthTransition, hideAuthTransition } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingLocal(true);
    const success = await login(email, password);
    if (success) {
      showAuthTransition('Opening your dashboard...');
      window.setTimeout(() => {
        navigate('/');
        window.setTimeout(() => {
          hideAuthTransition();
        }, 220);
      }, 320);
      return;
    }
    setLoadingLocal(false);
  };

  return (
    <AuthPanel
      mode="login"
      title="Welcome Back"
      subtitle="Welcome Back , Please enter Your details"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/register"
      bottomCopy="Track, analyze, and manage your finances with confidence."
    >
      <form className="space-y-3.5" onSubmit={handleSubmit}>
        <div className="rounded-[22px] border border-slate-300 bg-white px-5 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center border h-9 w-9 rounded-xl border-slate-200 bg-slate-50 text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">Email Address</p>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 w-full border-0 bg-transparent p-0 text-base font-medium text-slate-950 outline-none placeholder:text-[15px] placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-300 bg-white px-5 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center border h-9 w-9 rounded-xl border-slate-200 bg-slate-50 text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">Password</p>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 w-full border-0 bg-transparent p-0 text-base font-medium text-slate-950 outline-none placeholder:text-[15px] placeholder:text-slate-300"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center justify-center transition-colors rounded-full cursor-pointer h-9 w-9 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loadingLocal}
          className="mt-1 flex w-full items-center justify-center rounded-[18px] bg-[#156EF3] px-4 py-4 text-lg font-medium text-white transition-all hover:bg-[#0f62dd] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingLocal ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Log In'}
        </button>
      </form>
    </AuthPanel>
  );
};

export default Login;
