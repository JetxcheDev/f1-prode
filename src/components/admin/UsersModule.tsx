"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Edit, Users as UsersIcon, UserCheck, Crown, Calendar } from 'lucide-react';
import { 
  StatsGrid, 
  DataTable, 
  FormDialog,
  PageHeader,
  LoadingState,
} from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { UserProfile, UserRole } from '@/lib/firestore';
import { useUsers } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';

const MESSAGES = {
  LOADING: 'Cargando usuarios...',
  SUCCESS: {
    UPDATE: 'Rol actualizado correctamente',
    DELETE: 'Usuario eliminado correctamente'
  },
  ERROR: {
    LOAD: 'Error al cargar los usuarios',
    SAVE: 'Error al actualizar el rol',
    DELETE: 'Error al eliminar el usuario'
  }
} as const;

const SEARCH_PLACEHOLDER = 'Buscar por nombre, email o rol...';
const EMPTY_MESSAGE = 'No hay usuarios registrados';

const UsersModule: React.FC = () => {
  const { users, loading, updateRole } = useUsers();
  const { userProfile } = useAuth();
  
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const userStats = useMemo(() => {
    const adminUsers = users.filter(user => user.role === 'admin');
    const regularUsers = users.filter(user => user.role === 'user');
    const recentUsers = users.filter(user => {
      if (!user.createdAt) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return user.createdAt.toDate() > thirtyDaysAgo;
    });
    
    return {
      total: users.length,
      admin: adminUsers.length,
      regular: regularUsers.length,
      recent: recentUsers.length
    };
  }, [users]);

  const statsData = useMemo(() => [
    {
      title: 'Total Usuarios',
      value: userStats.total,
      icon: UsersIcon,
      color: 'blue' as const
    },
    {
      title: 'Administradores',
      value: userStats.admin,
      icon: Crown,
      color: 'red' as const
    },
    {
      title: 'Usuarios Regulares',
      value: userStats.regular,
      icon: UserCheck,
      color: 'green' as const
    },
    {
      title: 'Nuevos (30d)',
      value: userStats.recent,
      icon: Calendar,
      color: 'purple' as const
    }
  ], [userStats]);

  const handleEdit = useCallback((user: UserProfile) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setEditingUser(null);
  }, []);

  const handleFormSubmit = useCallback(async (data: { role: UserRole }) => {
    if (submitting) return;
    
    if (editingUser) {
      if (editingUser.uid === userProfile?.uid && data.role !== 'admin') {
        toast.error('No puedes cambiar tu propio rol de administrador');
        return;
      }
      
      try {
        setSubmitting(true);
        await updateRole(editingUser.uid, data.role);
        toast.success(MESSAGES.SUCCESS.UPDATE);
        handleDialogClose();
      } catch (error) {
        console.error('Error updating user role:', error);
        toast.error(MESSAGES.ERROR.SAVE);
      } finally {
        setSubmitting(false);
      }
    }
  }, [editingUser, submitting, userProfile?.uid, updateRole, handleDialogClose]);

  const columns = useMemo(() => [
    {
      key: 'displayName',
      header: 'Nombre',
      sorteable: true,
      render: (value: string, item: UserProfile) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
            {value ? value.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div className="font-medium">{value || 'Sin nombre'}</div>
            <div className="text-sm text-muted-foreground">{item.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Rol',
      sorteable: true,
      render: (value: string) => (
        <Badge 
          variant={value === 'admin' ? 'destructive' : 'secondary'}
          className="flex items-center gap-1"
        >
          {value === 'admin' ? <Crown className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
          {value === 'admin' ? 'Administrador' : 'Usuario'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Fecha de Registro',
      render: (value: Timestamp) => (
        <div className="text-sm">
          {value ? value.toDate().toLocaleDateString('es-ES') : 'No disponible'}
        </div>
      )
    }
  ], []);

  const tableActions = useMemo(() => [
    {
      label: 'Editar',
      icon: Edit,
      onClick: handleEdit,
      variant: 'outline' as const
    }
  ], [handleEdit]);

  console.log("Usuarios: ", users)


  if (loading) {
    return <LoadingState message={MESSAGES.LOADING} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra los roles de los usuarios"
      />
      
      <StatsGrid stats={statsData} />
      
      <DataTable
        data={users as any[]}
        columns={columns}
        searchPlaceholder={SEARCH_PLACEHOLDER}
        emptyMessage={EMPTY_MESSAGE}
        actions={tableActions}
      />
      
      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        description={editingUser ? `Modificar el rol de ${editingUser.displayName || editingUser.email}` : 'Crear un nuevo usuario'}
        onSubmit={handleFormSubmit}
        loading={submitting}
        initialData={editingUser ? { role: editingUser.role } : { role: 'user' }}
        fields={[
          {
            name: 'role',
            label: 'Rol',
            type: 'select',
            required: true,
            options: [
              { value: 'user', label: 'Usuario' },
              { value: 'admin', label: 'Administrador' }
            ]
          }
        ]}
      />
    </div>
  );
};

export default UsersModule;