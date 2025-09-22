"use client";

import React, { useState, useEffect } from 'react';
import { AdminOnly } from '@/components/RoleGuard';
import StatsModule from '@/components/admin/StatsModule';
import UsersModule from '@/components/admin/UsersModule';
import PilotsModule from '@/components/admin/PilotsModule';
import RacesModule from '@/components/admin/RacesModule';
import ResultsModule from '@/components/admin/ResultsModule';
import ScoringModule from '@/components/admin/ScoringModule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Flag, UserCheck, Trophy, Calculator } from 'lucide-react';
import { UserProfile, UserRole, getAllUsers, updateUserRole } from '@/lib/firestore';
import { toast } from 'sonner';

const AdminPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      setUpdating(uid);
      await updateUserRole(uid, newRole);
      await loadUsers(); // Reload users to get updated data
      toast.success('Rol actualizado correctamente');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol');
    } finally {
      setUpdating(null);
    }
  };
  return (
    <AdminOnly>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona usuarios, pilotos, carreras y estadísticas del sistema
          </p>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Estadísticas</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="pilots" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Pilotos</span>
            </TabsTrigger>
            <TabsTrigger value="races" className="flex items-center space-x-2">
              <Flag className="h-4 w-4" />
              <span>Carreras</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Resultados</span>
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Puntuación</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <StatsModule users={users} loading={loading} />
          </TabsContent>

          <TabsContent value="users">
            <UsersModule />
          </TabsContent>

          <TabsContent value="pilots">
            <PilotsModule />
          </TabsContent>

          <TabsContent value="races">
            <RacesModule />
          </TabsContent>

          <TabsContent value="results">
            <ResultsModule />
          </TabsContent>

          <TabsContent value="scoring">
            <ScoringModule />
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  );
};

export default AdminPage;