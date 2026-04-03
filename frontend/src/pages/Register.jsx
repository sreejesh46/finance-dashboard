import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, UserPlus, Loader2, Mail, Lock, User, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoadingLocal(true);
    const success = await register(name, email, password);
    setLoadingLocal(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen relative flex bg-slate-950 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute -top-[20%] right-[10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full"></div>
         <div className="absolute top-[40%] left-[-10%] w-[40%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
         <div className="absolute bottom-[-20%] right-[20%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Main Authentication Card */}
        <div className="w-full max-w-md animate-in zoom-in-95 duration-700 fade-in fill-mode-both">
           
           <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-blue-500/10 border border-white/5 relative overflow-hidden">
              
              {/* Top Glass Highlight */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

              {/* Logo & Header */}
              <div className="flex flex-col items-center mb-10">
                 <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30 mb-5 relative group">
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    <TrendingUp className="w-8 h-8 text-white relative z-10" strokeWidth={2.5} />
                 </div>
                 <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                    Create Account
                 </h2>
                 <p className="text-slate-400 font-medium text-center">
                    Begin tracking your financial infrastructure today.
                 </p>
              </div>

              {/* Form Element */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                
                <div className="space-y-4">
                  {/* Name Input */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="appearance-none block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-white/10 text-white rounded-2xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Business Email"
                      className="appearance-none block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-white/10 text-white rounded-2xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Secure Password (min 6 chars)"
                      className="appearance-none block w-full pl-11 pr-12 py-3.5 bg-slate-950/50 border border-white/10 text-white rounded-2xl shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-blue-400 focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Sub-Actions */}
                <div className="flex items-center">
                   <input
                     id="terms"
                     name="terms"
                     type="checkbox"
                     required
                     className="h-4 w-4 bg-slate-950 border-white/10 rounded focus:ring-blue-500 text-blue-500 cursor-pointer accent-blue-500"
                   />
                   <label htmlFor="terms" className="ml-3 block text-sm text-slate-400 font-medium">
                     I agree to the {' '}
                     <a href="#" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                       Terms of Service
                     </a>
                     {' '}and{' '}
                     <a href="#" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                       Privacy Policy
                     </a>.
                   </label>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loadingLocal}
                    className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    {loadingLocal ? (
                       <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                    ) : (
                       <div className="flex items-center gap-2 relative z-10 transition-transform group-hover:gap-3">
                           Sign Up
                           <UserPlus className="w-4 h-4" />
                       </div>
                    )}
                  </button>
                </div>
              </form>

           </div>

           {/* Switch to Login Link */}
           <p className="mt-8 text-center text-sm font-medium text-slate-400">
             Already have an account?{' '}
             <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors underline decoration-blue-400/30 underline-offset-4 hover:decoration-blue-300">
               Login
             </Link>
           </p>

           {/* Value Prop Features */}
           <div className="mt-12 flex justify-center gap-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 Enterprise Grade
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                 Zero Trust Setup
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
