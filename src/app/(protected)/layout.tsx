"use client";

import React from 'react';
import { AuthGuard } from '@/components/AuthGuard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </AuthGuard>
  );
}