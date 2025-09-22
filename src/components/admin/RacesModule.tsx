"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Edit, Trash2, Flag, Calendar, MapPin, Clock } from 'lucide-react';
import { 
  StatsGrid, 
  DataTable, 
  FormDialog, 
  ConfirmDialog,
  PageHeader,
  LoadingState,
} from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Race } from '@/types';
import { useRaces } from '@/hooks';
import { Timestamp } from 'firebase/firestore';

interface RaceFormData {
  name: string;
  location: string;
  date: string;
  votingDeadline: string;
  status: 'upcoming' | 'active' | 'completed';
}

// Constants
const MESSAGES = {
  LOADING: 'Cargando carreras...',
  SUCCESS: {
    CREATE: 'Carrera creada correctamente',
    UPDATE: 'Carrera actualizada correctamente',
    DELETE: 'Carrera eliminada correctamente'
  },
  ERROR: {
    LOAD: 'Error al cargar las carreras',
    SAVE: 'Error al guardar la carrera',
    DELETE: 'Error al eliminar la carrera'
  }
} as const;

const SEARCH_PLACEHOLDER = 'Buscar por nombre, ubicación o estado...';
const EMPTY_MESSAGE = 'No hay carreras registradas';

const RacesModule: React.FC = () => {
  const { races, loading, loadRaces } = useRaces();
  
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [raceToDelete, setRaceToDelete] = useState<Race | null>(null);

  const raceStats = useMemo(() => {
    return {
      total: races.length,
      upcoming: races.filter(race => race.status === 'upcoming').length,
      active: races.filter(race => race.status === 'active').length,
      completed: races.filter(race => race.status === 'completed').length
    };
  }, [races]);

  const statsData = useMemo(() => [
    {
      title: 'Total Carreras',
      value: raceStats.total,
      icon: Flag,
      color: 'blue' as const
    },
    {
      title: 'Próximas',
      value: raceStats.upcoming,
      icon: Clock,
      color: 'yellow' as const
    },
    {
      title: 'Activas',
      value: raceStats.active,
      icon: Calendar,
      color: 'green' as const
    },
    {
      title: 'Completadas',
      value: raceStats.completed,
      icon: Flag,
      color: 'gray' as const
    }
  ], [raceStats]);

  const handleAdd = useCallback(() => {
    setEditingRace(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((race: Race) => {
    setEditingRace(race);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((race: Race) => {
    setRaceToDelete(race);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setEditingRace(null);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteConfirmOpen(false);
    setRaceToDelete(null);
  }, []);

  const handleFormSubmit = useCallback(async (data: Record<string, any>) => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      const { createRace, updateRace } = await import('@/lib/firestore');
      
      const formData = data as RaceFormData;
      const raceDate = new Date(formData.date);
      const votingDeadlineDate = new Date(formData.votingDeadline);

      if (votingDeadlineDate >= raceDate) {
        toast.error('La fecha límite de votación debe ser anterior a la fecha de la carrera');
        return;
      }

      const raceData = {
        name: formData.name,
        location: formData.location,
        date: Timestamp.fromDate(raceDate),
        votingDeadline: Timestamp.fromDate(votingDeadlineDate),
        status: formData.status
      };
      
      if (editingRace) {
        await updateRace(editingRace.id!, raceData);
        toast.success(MESSAGES.SUCCESS.UPDATE);
      } else {
        await createRace(raceData);
        toast.success(MESSAGES.SUCCESS.CREATE);
      }
      
      handleDialogClose();
      await loadRaces();
    } catch (error) {
      console.error('Error saving race:', error);
      toast.error(MESSAGES.ERROR.SAVE);
    } finally {
      setSubmitting(false);
    }
  }, [editingRace, submitting, handleDialogClose, loadRaces]);

  const confirmDelete = useCallback(async () => {
    if (!raceToDelete || submitting) return;
    
    try {
      setSubmitting(true);
      const { deleteRace } = await import('@/lib/firestore');
      await deleteRace(raceToDelete.id!);
      toast.success(MESSAGES.SUCCESS.DELETE);
      handleDeleteDialogClose();
      await loadRaces();
    } catch (error) {
      console.error('Error deleting race:', error);
      toast.error(MESSAGES.ERROR.DELETE);
    } finally {
      setSubmitting(false);
    }
  }, [raceToDelete, submitting, handleDeleteDialogClose, loadRaces]);

  const formatDate = useCallback((timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Próxima</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Activa</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Completada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }, []);

  const tableColumns = useMemo(() => [
    {
      key: 'name',
      header: 'Carrera',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-blue-100 rounded">
            <Flag className="h-3 w-3 text-blue-600" />
          </div>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Ubicación',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Fecha',
      sortable: true,
      render: (value: Timestamp) => (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(value)}</span>
        </div>
      )
    },
    {
      key: 'votingDeadline',
      header: 'Límite Votación',
      sortable: true,
      render: (value: Timestamp) => (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDate(value)}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      render: (value: string) => getStatusBadge(value)
    }
  ], [formatDate, getStatusBadge]);

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
    label: 'Agregar Carrera',
    onClick: handleAdd,
    icon: Flag
  }], [handleAdd]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Gestión de Carreras"
          description="Administra el calendario de carreras y fechas de votación"
        />
        <LoadingState message={MESSAGES.LOADING} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Carreras"
        description="Administra el calendario de carreras y fechas de votación"
        actions={headerActions}
      />
      
      <StatsGrid stats={statsData} loading={loading} />
      
      <DataTable
        data={races}
        columns={tableColumns}
        actions={tableActions}
        loading={loading}
        searchPlaceholder={SEARCH_PLACEHOLDER}
        emptyMessage={EMPTY_MESSAGE}
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        title={editingRace ? 'Editar Carrera' : 'Nueva Carrera'}
        description={editingRace ? 'Modifica los datos de la carrera.' : 'Completa los datos para crear una nueva carrera.'}
        fields={[
          {
            name: 'name',
            label: 'Nombre',
            type: 'text',
            placeholder: 'Ej: Gran Premio de España',
            required: true
          },
          {
            name: 'location',
            label: 'Ubicación',
            type: 'text',
            placeholder: 'Ej: Circuit de Barcelona-Catalunya',
            required: true
          },
          {
            name: 'date',
            label: 'Fecha',
            type: 'datetime-local',
            required: true
          },
          {
            name: 'votingDeadline',
            label: 'Límite de Votación',
            type: 'datetime-local',
            required: true
          },
          {
            name: 'status',
            label: 'Estado',
            type: 'select',
            required: true,
            options: [
              { value: 'upcoming', label: 'Próxima' },
              { value: 'active', label: 'Activa' },
              { value: 'completed', label: 'Completada' }
            ]
          }
        ]}
        initialData={editingRace ? {
          name: editingRace.name,
          location: editingRace.location,
          date: editingRace.date?.toDate().toISOString().slice(0, 16),
          votingDeadline: editingRace.votingDeadline?.toDate().toISOString().slice(0, 16),
          status: editingRace.status
        } : undefined}
        onSubmit={handleFormSubmit}
        loading={submitting}
        submitLabel={editingRace ? 'Actualizar' : 'Crear'}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={handleDeleteDialogClose}
        title="¿Estás seguro?"
        description={`Esta acción no se puede deshacer. Se eliminará permanentemente la carrera "${raceToDelete?.name}".`}
        onConfirm={confirmDelete}
        confirmLabel="Eliminar"
        variant="destructive"
      />

    </div>
  );
};

export default RacesModule;