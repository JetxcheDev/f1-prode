"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bienvenido a tu panel de control</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">UID:</span> {user?.uid}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Verificado:</span> {user?.emailVerified ? 'Sí' : 'No'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Sesiones activas:</span> 1
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Último acceso:</span> Ahora
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Actualizar Dashboard
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={logout}
                >
                  Cerrar Sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Contenido Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Este es tu dashboard protegido. Solo los usuarios autenticados pueden ver este contenido.
              </p>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm">
                  ✅ Autenticación exitosa - Tienes acceso completo al sistema
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}