'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile } from '@/lib/firestore';
import { Users, Crown, UserCheck, Calendar, TrendingUp, Activity, BarChart3 } from 'lucide-react';

interface StatsModuleProps {
  users: UserProfile[];
  loading: boolean;
}

export default function StatsModule({ users, loading }: StatsModuleProps) {
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
        recentUsers: 0,
        usersThisMonth: 0,
        growthRate: 0
      };
    }

    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const recentUsers = users.filter(user => {
      if (!user.createdAt) return false;
      return user.createdAt.toDate() > thirtyDaysAgo;
    }).length;
    
    const usersThisMonth = users.filter(user => {
      if (!user.createdAt) return false;
      return user.createdAt.toDate() >= thisMonth;
    }).length;
    
    const usersLastMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const createdDate = user.createdAt.toDate();
      return createdDate >= lastMonth && createdDate < thisMonth;
    }).length;
    
    const growthRate = usersLastMonth > 0 
      ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100)
      : usersThisMonth > 0 ? 100 : 0;

    return {
      totalUsers,
      adminUsers,
      regularUsers,
      recentUsers,
      usersThisMonth,
      growthRate
    };
  }, [users]);

  if (loading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Estadísticas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Estadísticas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                    <p className="text-3xl font-bold text-red-600">{stats.adminUsers}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Crown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Usuarios Regulares</p>
                    <p className="text-3xl font-bold text-green-600">{stats.regularUsers}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nuevos (30d)</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.recentUsers}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Crecimiento Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Usuarios este mes</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.usersThisMonth}</p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Activity className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-sm font-medium text-blue-700">Tasa de crecimiento</p>
                  <p className={`text-2xl font-bold ${
                    stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${
                  stats.growthRate >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <TrendingUp className={`h-5 w-5 ${
                    stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Distribución de Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Administradores</span>
                  <span className="text-red-600 font-semibold">
                    {stats.totalUsers > 0 ? ((stats.adminUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.adminUsers / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Usuarios Regulares</span>
                  <span className="text-green-600 font-semibold">
                    {stats.totalUsers > 0 ? ((stats.regularUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.regularUsers / stats.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}