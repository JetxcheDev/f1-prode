import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, updateUserRole, UserProfile, UserRole } from '@/lib/firestore';
import { toast } from 'sonner';

interface UseUsersReturn {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  updating: string | null;
  loadUsers: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  updateRole: (uid: string, newRole: UserRole) => Promise<void>;
}

/**
 * Custom hook for managing users data
 * Provides users state, loading state, error handling, and data management functions
 */
export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (err) {
      const errorMessage = 'Error al cargar los usuarios';
      console.error('Error loading users:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    await loadUsers();
  }, [loadUsers]);

  const updateRole = useCallback(async (uid: string, newRole: UserRole) => {
    try {
      setUpdating(uid);
      await updateUserRole(uid, newRole);
      toast.success('Rol actualizado correctamente');
      await loadUsers();
    } catch (err) {
      const errorMessage = 'Error al actualizar el rol del usuario';
      console.error('Error updating user role:', err);
      toast.error(errorMessage);
    } finally {
      setUpdating(null);
    }
  }, [loadUsers]);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    updating,
    loadUsers,
    refreshUsers,
    updateRole
  };
};