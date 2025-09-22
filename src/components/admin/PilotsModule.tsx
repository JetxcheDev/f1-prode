"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Edit, Trash2, Users, UserCheck } from 'lucide-react';
import { 
  StatsGrid, 
  DataTable, 
  FormDialog, 
  ConfirmDialog,
  PageHeader,
  LoadingState,
} from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Pilot, PilotFormData } from '@/types';
import { usePilots } from '@/hooks';

// Constants
const MESSAGES = {
  LOADING: 'Cargando pilotos...',
  SUCCESS: {
    CREATE: 'Piloto creado correctamente',
    UPDATE: 'Piloto actualizado correctamente',
    DELETE: 'Piloto eliminado correctamente'
  },
  ERROR: {
    LOAD: 'Error al cargar los pilotos',
    SAVE: 'Error al guardar el piloto',
    DELETE: 'Error al eliminar el piloto'
  }
} as const;

const SEARCH_PLACEHOLDER = 'Buscar por nombre, equipo, país o número...';
const EMPTY_MESSAGE = 'No hay pilotos registrados';

const PilotsModule: React.FC = () => {
  const { pilots, loading, loadPilots } = usePilots();
  
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPilot, setEditingPilot] = useState<Pilot | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pilotToDelete, setPilotToDelete] = useState<Pilot | null>(null);

  const pilotStats = useMemo(() => {
    const activePilots = pilots.filter(pilot => pilot.active);
    return {
      total: pilots.length,
      active: activePilots.length,
      inactive: pilots.length - activePilots.length
    };
  }, [pilots]);

  const statsData = useMemo(() => [
    {
      title: 'Total Pilotos',
      value: pilotStats.total,
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Activos',
      value: pilotStats.active,
      icon: UserCheck,
      color: 'green' as const
    },
    {
      title: 'Inactivos',
      value: pilotStats.inactive,
      icon: Users,
      color: 'gray' as const
    }
  ], [pilotStats]);

  const handleAdd = useCallback(() => {
    setEditingPilot(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((pilot: Pilot) => {
    setEditingPilot(pilot);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((pilot: Pilot) => {
    setPilotToDelete(pilot);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setEditingPilot(null);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteConfirmOpen(false);
    setPilotToDelete(null);
  }, []);

  const handleFormSubmit = useCallback(async (data: PilotFormData) => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      const { createPilot, updatePilot } = await import('@/lib/firestore');
      
      if (editingPilot) {
        await updatePilot(editingPilot.id!, data);
        toast.success(MESSAGES.SUCCESS.UPDATE);
      } else {
        await createPilot(data);
        toast.success(MESSAGES.SUCCESS.CREATE);
      }
      
      handleDialogClose();
      await loadPilots();
    } catch (error) {
      console.error('Error saving pilot:', error);
      toast.error(MESSAGES.ERROR.SAVE);
    } finally {
      setSubmitting(false);
    }
  }, [editingPilot, submitting, handleDialogClose, loadPilots]);

  const confirmDelete = useCallback(async () => {
    if (!pilotToDelete || submitting) return;
    
    try {
      setSubmitting(true);
      const { deletePilot } = await import('@/lib/firestore');
      await deletePilot(pilotToDelete.id!);
      toast.success(MESSAGES.SUCCESS.DELETE);
      handleDeleteDialogClose();
      await loadPilots();
    } catch (error) {
      console.error('Error deleting pilot:', error);
      toast.error(MESSAGES.ERROR.DELETE);
    } finally {
      setSubmitting(false);
    }
  }, [pilotToDelete, submitting, handleDeleteDialogClose, loadPilots]);
  
  const tableColumns = useMemo(() => [
    {
      key: 'number',
      header: '#',
      width: '80px',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
          {value}
        </div>
      )
    },
    { key: 'name', header: 'Nombre', sortable: true },
    { key: 'team', header: 'Escudería', sortable: true },
    { key: 'country', header: 'País', sortable: true },
    {
      key: 'active',
      header: 'Estado',
      sortable: true,
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    }
  ], []);

  const tableActions = useMemo(() => [
    {
      label: 'Editar',
      icon: Edit,
      onClick: handleEdit,
      variant: 'outline' as const
    },
    {
      label: 'Eliminar',
      icon: Trash2,
      onClick: handleDelete,
      variant: 'outline' as const
    }
  ], [handleEdit, handleDelete]);

  const headerActions = useMemo(() => [{
    label: 'Agregar Piloto',
    onClick: handleAdd,
    icon: Users
  }], [handleAdd]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Gestión de Pilotos"
          description="Administra la lista de pilotos disponibles para las votaciones"
        />
        <LoadingState message={MESSAGES.LOADING} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Pilotos"
        description="Administra la lista de pilotos disponibles para las votaciones"
        actions={headerActions}
      />
      
      <StatsGrid stats={statsData} loading={loading} />
      
      <DataTable
        data={pilots}
        columns={tableColumns}
        actions={tableActions}
        loading={loading}
        searchPlaceholder={SEARCH_PLACEHOLDER}
        emptyMessage={EMPTY_MESSAGE}
      />
      
      <FormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        title={editingPilot ? 'Editar Piloto' : 'Agregar Nuevo Piloto'}
        description={editingPilot 
          ? 'Modifica los datos del piloto seleccionado.'
          : 'Completa los datos del nuevo piloto.'
        }
        fields={[
          {
            name: 'name',
            label: 'Nombre',
            type: 'text',
            placeholder: 'Ej: Lewis Hamilton',
            required: true
          },
          {
            name: 'team',
            label: 'Escudería',
            type: 'text',
            placeholder: 'Ej: Mercedes',
            required: true
          },
          {
            name: 'number',
            label: 'Número',
            type: 'number',
            placeholder: 'Ej: 44',
            required: true
          },
          {
            name: 'country',
            label: 'País',
            type: 'text',
            placeholder: 'Ej: Reino Unido',
            required: true
          },
          {
            name: 'active',
            label: 'Activo',
            type: 'switch'
          }
        ]}
        initialData={editingPilot || undefined}
        onSubmit={handleFormSubmit}
        loading={submitting}
        submitLabel={editingPilot ? 'Actualizar' : 'Crear'}
      />
      
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={handleDeleteDialogClose}
        title="Confirmar Eliminación"
        description={`¿Estás seguro de que deseas eliminar al piloto "${pilotToDelete?.name || 'piloto'}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        loading={submitting}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="destructive"
      />
    </div>
  );
};
 
 export default PilotsModule;