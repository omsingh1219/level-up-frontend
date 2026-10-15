import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole, StaffPermission } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: StaffPermission;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
}) => {
  const { profile, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-zinc-400 text-sm font-medium tracking-wide">Loading GymOS...</p>
      </div>
    );
  }

  // Not authenticated
  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is Admin but hasn't created a gym yet, send to onboarding (unless already on /onboarding)
  if (profile.role === 'ADMIN' && !profile.gymId && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'MEMBER') {
      return <Navigate to="/member" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  // Granular staff permission check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 text-2xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-zinc-400 max-w-md text-sm">
          You do not have permission to view or manage this section. Please contact your gym administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
