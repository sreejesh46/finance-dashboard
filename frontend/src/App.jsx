import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Users from './pages/Users';
import Profile from './pages/Profile';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
     return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Or an unauthorized page
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="records" element={<ProtectedRoute allowedRoles={['Analyst', 'Admin']}><Records /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['Admin']}><Users /></ProtectedRoute>} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AuthTransitionOverlay() {
  const { authTransition } = useAuth();

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm transition-all duration-300 ${
        authTransition.active ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-5 py-3 text-white shadow-2xl">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        <span className="text-sm font-semibold">{authTransition.message || 'Please wait...'}</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <AuthTransitionOverlay />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
