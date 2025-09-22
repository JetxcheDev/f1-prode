"use client"
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedLayout from "@/components/ProtectedLayout";
import Link from "next/link";

export default function Home() {
  const { user, userProfile, logout, isAdmin } = useAuth();
  

  return (
    <ProtectedLayout>
      <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Bienvenido a tu panel de control</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  userProfile?.role === 'admin' 
                    ? 'bg-red-100 text-red-800 border border-red-200' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {userProfile?.role === 'admin' ? '👑 Administrador' : '👤 Usuario'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin() && (
                <Link href="/admin">
                  <Button variant="default">
                    🛠️ Panel Admin
                  </Button>
                </Link>
              )}
              <Button onClick={logout} variant="outline">
                Cerrar Sesión
              </Button>
            </div>
          </div>
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

        {isAdmin() && (
          <div className="mt-8">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">🛠️ Panel de Administración</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-4">
                  Como administrador, tienes acceso a funciones especiales del sistema.
                </p>
                <div className="flex gap-2">
                  <Link href="/admin">
                    <Button className="bg-red-600 hover:bg-red-700">
                      Gestionar Usuarios
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Información para usuarios estándar */}
        {userProfile?.role === 'user' && (
          <div className="mt-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">👤 Usuario Estándar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700">
                  Bienvenido al sistema. Puedes acceder a todas las funciones disponibles para usuarios.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Contenido Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Este es tu dashboard principal. Solo los usuarios autenticados pueden ver este contenido.
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
    </ProtectedLayout>
  );
}
