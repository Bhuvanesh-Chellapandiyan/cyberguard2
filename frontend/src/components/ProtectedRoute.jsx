import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-cyan-400">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 animate-pulse text-cyan-400" />
          <p className="text-sm font-mono tracking-widest text-slate-400">VERIFYING CYBERGUARD TOKEN...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
