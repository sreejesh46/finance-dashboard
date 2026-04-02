import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, Lock, User, Mail, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 pl-1">
         <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
         <p className="text-slate-500 mt-1 font-medium">Manage your account details and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* Left Side: Avatar & Summary (4 columns on lg) */}
        <div className="lg:col-span-4 w-full">
           <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-slate-200/60 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              
              <div className="flex flex-col items-center pt-4">
                 <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 flex items-center justify-center text-white text-5xl font-black shadow-xl shadow-indigo-500/20 border-4 border-white">
                        {formData.name.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute bottom-0 right-0 p-3 bg-slate-900 text-white rounded-full hover:bg-indigo-600 transition-colors shadow-lg border-4 border-white group-hover:scale-110 duration-200">
                       <Camera className="w-5 h-5" />
                    </button>
                 </div>
                 
                 <h3 className="text-2xl font-bold text-slate-900">{formData.name}</h3>
                 <div className="flex items-center gap-1 mt-3 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <p className="text-indigo-600 font-bold text-xs tracking-wide uppercase">{user?.role || 'User'}</p>
                 </div>
                 
                 <div className="w-full mt-8 pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500 font-semibold">Account Status</span>
                       <span className="text-emerald-500 font-bold flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500 font-semibold">Member Since</span>
                       <span className="text-slate-700 font-bold">Jan 2026</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Forms (8 columns on lg) */}
        <div className="lg:col-span-8 w-full space-y-8">
           
           {/* Personal Info Form */}
           <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                 <div className="p-2.5 bg-indigo-50 rounded-xl">
                    <User className="w-5 h-5 text-indigo-600" />
                 </div>
                 Personal Information
              </h3>
              
              <form onSubmit={handleSave} className="space-y-6 relative z-10 w-full">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 block">Full Name</label>
                       <div className="flex items-center bg-slate-50/50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 focus-within:bg-white transition-all overflow-hidden">
                          <div className="pl-4 flex items-center justify-center text-slate-400 pointer-events-none">
                             <User className="w-5 h-5" />
                          </div>
                          <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full py-3.5 pr-4 pl-3 bg-transparent outline-none text-slate-900 font-semibold" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 block">Email Address</label>
                       <div className="flex items-center bg-slate-50/50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 focus-within:bg-white transition-all overflow-hidden">
                          <div className="pl-4 flex items-center justify-center text-slate-400 pointer-events-none">
                             <Mail className="w-5 h-5" />
                          </div>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full py-3.5 pr-4 pl-3 bg-transparent outline-none text-slate-900 font-semibold" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
                    <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                       Save Changes
                    </button>
                 </div>
              </form>
           </div>

           {/* Security Form */}
           <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                 <div className="p-2.5 bg-rose-50 rounded-xl">
                    <Lock className="w-5 h-5 text-rose-500" />
                 </div>
                 Password & Security
              </h3>
              
              <form onSubmit={handleSave} className="space-y-6 relative z-10 w-full">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 block">Current Password</label>
                       <div className="flex items-center bg-slate-50/50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 focus-within:bg-white transition-all overflow-hidden">
                          <div className="pl-4 flex items-center justify-center text-slate-400 pointer-events-none">
                             <Lock className="w-5 h-5" />
                          </div>
                          <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="••••••••" className="w-full py-3.5 pr-4 pl-3 bg-transparent outline-none font-semibold text-slate-900" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700 block">New Password</label>
                       <div className="flex items-center mb-2 bg-slate-50/50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 focus-within:bg-white transition-all overflow-hidden">
                          <div className="pl-4 flex items-center justify-center text-slate-400 pointer-events-none">
                             <Lock className="w-5 h-5" />
                          </div>
                          <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="••••••••" className="w-full py-3.5 pr-4 pl-3 bg-transparent outline-none font-semibold text-slate-900" />
                       </div>
                       <p className="text-xs text-slate-500 font-semibold flex items-start gap-1">
                          <span className="text-rose-500">*</span> Minimum 8 characters.
                       </p>
                    </div>
                 </div>
                 
                 <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
                    <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
                       Update Password
                    </button>
                 </div>
              </form>
           </div>
           
        </div>
      </div>
    </div>
  );
};

export default Profile;
