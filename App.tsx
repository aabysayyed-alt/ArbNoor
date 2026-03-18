import React, { useEffect, useState } from 'react';
// @ts-ignore
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Account from './pages/Account';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import { AudioProvider } from './context/AudioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Loader } from 'lucide-react';

// Protected Route Wrapper
const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const { user, loadingSession } = useAuth();
  const location = useLocation();

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0] dark:bg-[#1C1917]">
        <Loader className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, isAdmin, loadingSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  // Force navigation reset on app load (reload/refresh)
  useEffect(() => {
    if (!loadingSession && !isReady) {
      if (!user && location.pathname !== '/auth') {
        // If not logged in and not on auth page, go to Auth
        navigate('/auth', { replace: true, state: { from: location } });
      }
      setIsReady(true);
    }
  }, [loadingSession, user, navigate, isReady, location]);

  // Show loader while session is loading or initial navigation is pending
  if (loadingSession || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0] dark:bg-[#1C1917]">
        <Loader className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Auth Route */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/" replace /> : <Auth />} 
      />

      {/* Admin/Publisher Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <RequireAuth>
             {isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />} 
          </RequireAuth>
        } 
      />

      {/* User Routes (Protected) */}
      <Route element={
        <RequireAuth>
          <Layout />
        </RequireAuth>
      }>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/account" element={<Account />} />
        <Route path="/settings" element={<Navigate to="/account" replace />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AudioProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AudioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;