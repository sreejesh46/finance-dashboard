import { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Camera, Save, Lock, User, Mail, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const fileInputRef = useRef(null);

  const accountStatus = user?.status === 'inactive' ? 'Inactive' : 'Active';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'N/A';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const surfaceClass = isDark
    ? 'bg-[#26272E] border border-slate-800 shadow-[0_24px_60px_rgba(2,6,23,0.4)]'
    : 'bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm';
  const headingClass = isDark ? 'text-slate-50' : 'text-slate-900';
  const bodyMutedClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const labelClass = isDark ? 'text-slate-300' : 'text-slate-700';
  const inputWrapClass = isDark
    ? 'bg-[#17191A] border border-slate-800 focus-within:ring-sky-500/20 focus-within:border-sky-500'
    : 'bg-slate-50/50 border border-slate-200 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 focus-within:bg-white';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        avatar,
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await axios.put('/auth/profile', payload);
      setUser(res.data);
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 pl-1">
        <h1 className={`text-3xl font-black tracking-tight ${headingClass}`}>Profile Settings</h1>
        <p className={`mt-1 font-medium ${bodyMutedClass}`}>
          Manage your account details and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        <div className="lg:col-span-4 w-full">
          <div className={`${surfaceClass} rounded-[2rem] p-8 relative overflow-hidden group`}>
            <div
              className={`absolute top-0 inset-x-0 h-2 ${
                isDark ? 'bg-gradient-to-r from-sky-500 to-indigo-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
            />

            <div className="flex flex-col items-center pt-4">
              <div className="relative mb-6">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className={`w-32 h-32 rounded-full object-cover shadow-xl ${
                      isDark ? 'shadow-sky-500/10 border-4 border-[#17191A]' : 'shadow-indigo-500/20 border-4 border-white'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-black shadow-xl ${
                      isDark
                        ? 'bg-gradient-to-tr from-sky-500 to-indigo-500 shadow-sky-500/20 border-4 border-[#17191A]'
                        : 'bg-gradient-to-tr from-indigo-400 to-purple-400 shadow-indigo-500/20 border-4 border-white'
                    }`}
                  >
                    {formData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`absolute bottom-0 right-0 p-3 text-white rounded-full transition-colors shadow-lg group-hover:scale-110 duration-200 ${
                    isDark
                      ? 'bg-[#156EF3] hover:brightness-110 border-4 border-[#17191A]'
                      : 'bg-slate-900 hover:bg-indigo-600 border-4 border-white'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>

              <h3 className={`text-2xl font-bold ${headingClass}`}>{formData.name}</h3>
              <div
                className={`flex items-center gap-1 mt-3 px-4 py-1.5 rounded-full border ${
                  isDark ? 'bg-sky-500/10 border-sky-500/20' : 'bg-indigo-50 border-indigo-100'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-sky-400' : 'text-indigo-600'}`} />
                <p className={`font-bold text-xs tracking-wide uppercase ${isDark ? 'text-sky-300' : 'text-indigo-600'}`}>
                  {user?.role || 'User'}
                </p>
              </div>

              <div className={`w-full mt-8 pt-6 border-t space-y-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-semibold ${bodyMutedClass}`}>Account Status</span>
                  <span className={`font-bold flex items-center gap-2 ${user?.status === 'inactive' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    <span
                      className={`w-2 h-2 rounded-full ${user?.status === 'inactive' ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}
                    />
                    {accountStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-semibold ${bodyMutedClass}`}>Member Since</span>
                  <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{memberSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 w-full space-y-8">
          <div className={`${surfaceClass} rounded-[2rem] p-8 relative overflow-hidden`}>
            <div
              className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none ${
                isDark ? 'bg-sky-500/10' : 'bg-indigo-500/5'
              }`}
            />

            <h3 className={`text-xl font-bold mb-8 flex items-center gap-3 ${headingClass}`}>
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-sky-500/10' : 'bg-indigo-50'}`}>
                <User className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-indigo-600'}`} />
              </div>
              Personal Information
            </h3>

            <form onSubmit={handleSave} className="space-y-6 relative z-10 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div className="space-y-2">
                  <label className={`text-sm font-bold block ${labelClass}`}>Full Name</label>
                  <div className={`flex items-center rounded-xl transition-all overflow-hidden ${inputWrapClass}`}>
                    <div className={`pl-4 flex items-center justify-center pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full py-3.5 pr-4 pl-3 bg-transparent outline-none font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-bold block ${labelClass}`}>Email Address</label>
                  <div className={`flex items-center rounded-xl transition-all overflow-hidden ${inputWrapClass}`}>
                    <div className={`pl-4 flex items-center justify-center pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full py-3.5 pr-4 pl-3 bg-transparent outline-none font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
                    />
                  </div>
                </div>
              </div>

              <div className={`flex justify-end pt-6 mt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto px-8 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:translate-y-0 ${
                    isDark
                      ? 'bg-[#156EF3] shadow-[0_14px_30px_rgba(21,110,243,0.35)] hover:brightness-110'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className={`${surfaceClass} rounded-[2rem] p-8 relative overflow-hidden`}>
            <div
              className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none ${
                isDark ? 'bg-rose-500/10' : 'bg-rose-500/5'
              }`}
            />

            <h3 className={`text-xl font-bold mb-8 flex items-center gap-3 ${headingClass}`}>
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-rose-500/10' : 'bg-rose-50'}`}>
                <Lock className="w-5 h-5 text-rose-500" />
              </div>
              Password & Security
            </h3>

            <form onSubmit={handleSave} className="space-y-6 relative z-10 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div className="space-y-2">
                  <label className={`text-sm font-bold block ${labelClass}`}>Current Password</label>
                  <div
                    className={`flex items-center rounded-xl transition-all overflow-hidden ${
                      isDark
                        ? 'bg-[#17191A] border border-slate-800 focus-within:ring-sky-500/20 focus-within:border-sky-500'
                        : 'bg-slate-50/50 border border-slate-200 focus-within:ring-rose-500/20 focus-within:border-rose-500 focus-within:bg-white'
                    }`}
                  >
                    <div className={`pl-4 flex items-center justify-center pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="********"
                      className={`w-full py-3.5 pr-4 pl-3 bg-transparent outline-none font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`text-sm font-bold block ${labelClass}`}>New Password</label>
                  <div
                    className={`flex items-center mb-2 rounded-xl transition-all overflow-hidden ${
                      isDark
                        ? 'bg-[#17191A] border border-slate-800 focus-within:ring-sky-500/20 focus-within:border-sky-500'
                        : 'bg-slate-50/50 border border-slate-200 focus-within:ring-rose-500/20 focus-within:border-rose-500 focus-within:bg-white'
                    }`}
                  >
                    <div className={`pl-4 flex items-center justify-center pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="********"
                      className={`w-full py-3.5 pr-4 pl-3 bg-transparent outline-none font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
                    />
                  </div>
                  <p className={`text-xs font-semibold flex items-start gap-1 ${bodyMutedClass}`}>
                    <span className="text-rose-500">*</span> Minimum 6 characters.
                  </p>
                </div>
              </div>

              <div className={`flex justify-end pt-6 mt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto px-8 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:translate-y-0 ${
                    isDark
                      ? 'bg-[#156EF3] shadow-[0_14px_30px_rgba(21,110,243,0.35)] hover:brightness-110'
                      : 'bg-slate-900 hover:bg-slate-800 shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5'
                  }`}
                >
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
