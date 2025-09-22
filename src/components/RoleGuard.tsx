"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/firestore';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback 
}) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!userProfile || !allowedRoles.includes(userProfile.role)) {
    return fallback || (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
        <p className="text-gray-600">
          No tienes permisos para acceder a esta sección.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Rol requerido: {allowedRoles.join(', ')} | Tu rol: {userProfile?.role || 'Sin rol'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

export const useRole = () => {
  const { userProfile, isAdmin, hasRole } = useAuth();
  
  return {
    userProfile,
    isAdmin,
    hasRole,
    role: userProfile?.role
  };
};