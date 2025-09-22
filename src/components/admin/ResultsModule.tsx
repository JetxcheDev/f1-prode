'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Trophy, Flag, Users, AlertTriangle, Save, Edit } from 'lucide-react';
import { 
  StatsGrid, 
  DataTable, 
  FormDialog, 
  PageHeader,
  LoadingState,
} from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { createRaceResult, updateRaceResult } from '@/lib/firestore';
import { Race } from '@/types';
import { useResults } from '@/hooks';

const MESSAGES = {
  LOADING: 'Cargando resultados...',
  SUCCESS: {
    CREATE: 'Resultado creado correctamente',
    UPDATE: 'Resultado actualizado correctamente',
    DELETE: 'Resultado eliminado correctamente'
  },
  ERROR: {
    LOAD: 'Error al cargar los resultados',
    SAVE: 'Error al guardar el resultado',
    DELETE: 'Error al eliminar el resultado',
    VALIDATION: 'Por favor completa todos los campos requeridos'
  }
} as const;

const SEARCH_PLACEHOLDER = 'Buscar por carrera, circuito o fecha...';
const EMPTY_MESSAGE = 'No hay resultados registrados';

const ResultsModule: React.FC = () => {
  const {
    races,
    pilots,
    results,
    loading,
    submitting,
    setSubmitting,
    refreshData
  } = useResults();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  const handleOpenDialog = useCallback((race: Race, existingResult?: any) => {
    setSelectedRace(race);
    setEditingResult(existingResult || null);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingResult(null);
    setSelectedRace(null);
  }, []);

  const getAvailablePilots = useCallback((currentField: string, formData: Record<string, any>) => {
    const activePilots = pilots.filter(p => p.active);
    
    const positionFields = [
      'position1', 'position2', 'position3', 'position4', 'position5',
      'position6', 'position7', 'position8', 'position9', 'position10'
    ];
    
    if (!positionFields.includes(currentField)) {
      return activePilots;
    }
    
    const selectedPilots = positionFields
      .filter(field => field !== currentField)
      .map(field => formData[field])
      .filter(Boolean); 
    
    return activePilots.filter(pilot => !selectedPilots.includes(pilot.id));
  }, [pilots]);

  const validateNoDuplicatePilots = useCallback((data: Record<string, any>) => {
    const positionFields = [
      'position1', 'position2', 'position3', 'position4', 'position5',
      'position6', 'position7', 'position8', 'position9', 'position10'
    ];
    
    const selectedPilots = positionFields
      .map(field => data[field])
      .filter(Boolean); 
    
    const uniquePilots = new Set(selectedPilots);
    
    if (selectedPilots.length !== uniquePilots.size) {
      toast.error('No se puede seleccionar el mismo piloto en múltiples posiciones');
      return false;
    }
    
    return true;
  }, []);

  const handleSave = useCallback(async (data: Record<string, any>) => {
    try {
      if (!validateNoDuplicatePilots(data)) {
        return;
      }
      
      setSubmitting(true);
      
      const positions = [
        data.position1,
        data.position2,
        data.position3,
        data.position4,
        data.position5,
        data.position6,
        data.position7,
        data.position8,
        data.position9,
        data.position10
      ];
      
      const resultData = {
        raceId: data.raceId,
        pole: data.pole,
        positions,
        crashPilot: data.crashPilot || ''
      };
      
      if (editingResult) {
        await updateRaceResult(editingResult.id, resultData);
        toast.success(MESSAGES.SUCCESS.UPDATE);
      } else {
        await createRaceResult(resultData);
        toast.success(MESSAGES.SUCCESS.CREATE);
      }
      
      refreshData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error(MESSAGES.ERROR.SAVE);
    } finally {
      setSubmitting(false);
    }
  }, [editingResult, refreshData, handleCloseDialog, setSubmitting, validateNoDuplicatePilots]);

  const tableColumns = useMemo(() => [
     {
       key: 'name',
       header: 'Carrera',
       sortable: true,
       render: (value: string, race: Race) => (
         <div className="flex items-center space-x-2">
           <Flag className="h-4 w-4 text-blue-500" />
           <span className="font-medium">{value}</span>
         </div>
       )
     },
     {
       key: 'location',
       header: 'Circuito',
       sortable: true
     },
     {
       key: 'date',
       header: 'Fecha',
       sortable: true,
       render: (value: any) => (
         <span className="text-sm text-gray-600">
           {value.toDate().toLocaleDateString('es-ES')}
         </span>
       )
     },
     {
       key: 'status',
       header: 'Estado',
       sortable: true,
       render: (value: string) => (
         <Badge variant={value === 'completed' ? 'default' : 'secondary'}>
           {value === 'completed' ? 'Completada' : 'Pendiente'}
         </Badge>
       )
     }
   ], []);

  const tableActions = useMemo(() => {
    return [
      {
        label: 'Cargar',
        icon: Edit,
        onClick: (race: Race) => {
          handleOpenDialog(race);
        },
        variant: 'outline' as const,
        disabled: (race: Race) => {
          const hasResult = results.some(result => result.raceId === race.id);
          
          const raceDate = race.date.toDate();
          const now = new Date();
          const raceHasPassed = raceDate < now;
          
          return hasResult || !raceHasPassed;
        }
      },
      {
        label: 'Editar',
        icon: Edit,
        onClick: (race: Race) => {
          const existingResult = results.find(result => result.raceId === race.id);
          handleOpenDialog(race, existingResult);
        },
        variant: 'outline' as const,
        disabled: (race: Race) => {
          return !results.some(result => result.raceId === race.id);
        }
      }
    ];
  }, [handleOpenDialog, results]);

   const statsData = useMemo(() => [
     {
       title: 'Total Resultados',
       value: results.length,
       icon: Flag,
       color: 'blue' as const
     },
     {
       title: 'Carreras con Resultados',
       value: results.length,
       icon: Trophy,
       color: 'green' as const
     },
     {
       title: 'Pilotos Activos',
       value: pilots.filter(pilot => pilot.active).length,
       icon: Users,
       color: 'purple' as const
     },
     {
       title: 'Carreras sin Resultados',
       value: races.length - results.length,
       icon: AlertTriangle,
       color: 'red' as const
     }
   ], [races, pilots, results]);

  if (loading) {
    return <LoadingState message={MESSAGES.LOADING} />;
  }

  return (
    <div className="space-y-6">
       <PageHeader
         title="Gestión de Resultados"
         description="Administra los resultados de las carreras"
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
         onOpenChange={handleCloseDialog}
         title={editingResult ? 'Editar Resultado' : 'Nuevo Resultado'}
         description={editingResult 
           ? 'Modifica los datos del resultado seleccionado.'
           : 'Completa los datos del nuevo resultado.'
         }
         onSubmit={handleSave}
         initialData={{
           ...editingResult,
           raceId: selectedRace?.id || editingResult?.raceId,
           pole: editingResult?.pole,
           position1: editingResult?.positions?.[0] || '',
           position2: editingResult?.positions?.[1] || '',
           position3: editingResult?.positions?.[2] || '',
           position4: editingResult?.positions?.[3] || '',
           position5: editingResult?.positions?.[4] || '',
           position6: editingResult?.positions?.[5] || '',
           position7: editingResult?.positions?.[6] || '',
           position8: editingResult?.positions?.[7] || '',
           position9: editingResult?.positions?.[8] || '',
           position10: editingResult?.positions?.[9] || '',
           crashPilot: editingResult?.crashPilot || ''
         }}
         loading={submitting}
         submitLabel={editingResult ? 'Actualizar' : 'Crear'}
         fields={[
           {
             name: 'raceId',
             label: 'Carrera',
             type: 'select',
             required: true,
             disabled: !!selectedRace,
             options: races.map(race => ({
               value: race.id!,
               label: `${race.name} - ${new Date(race.date.toDate()).toLocaleDateString('es-ES')}`
             }))
           },
           {
             name: 'pole',
             label: 'Pole Position',
             type: 'select-input',
             required: true,
             pilots: pilots.filter(p => p.active),
             placeholder: 'Seleccionar piloto para pole position...'
           },
           {
             name: 'position1',
             label: 'Posición 1',
             type: 'select-input',
             required: true,
             pilots: (formData: Record<string, any>) => getAvailablePilots('position1', formData),
             placeholder: 'Seleccionar piloto para posición 1...'
           },
           {
             name: 'position2',
             label: 'Posición 2',
             type: 'select-input',
             required: true,
             pilots: (formData: Record<string, any>) => getAvailablePilots('position2', formData),
             placeholder: 'Seleccionar piloto para posición 2...'
           },
           {
             name: 'position3',
             label: 'Posición 3',
             type: 'select-input',
             required: true,
             pilots: (formData: Record<string, any>) => getAvailablePilots('position3', formData),
             placeholder: 'Seleccionar piloto para posición 3...'
           },
           {
             name: 'position4',
             label: 'Posición 4',
             type: 'select-input',
             required: true,
             pilots: (formData: Record<string, any>) => getAvailablePilots('position4', formData),
             placeholder: 'Seleccionar piloto para posición 4...'
           },
           {
             name: 'position5',
             label: 'Posición 5',
             type: 'select-input',
             required: true,
             pilots: (formData: Record<string, any>) => getAvailablePilots('position5', formData),
             placeholder: 'Seleccionar piloto para posición 5...'
           },
           {
             name: 'position6',
             label: 'Posición 6',
             type: 'select-input',
             required: true,
             pilots: (formData: Record<string, any>) => getAvailablePilots('position6', formData),
             placeholder: 'Seleccionar piloto para posición 6...'
           },
           {
             name: 'position7',
             label: 'Posición 7',
             type: 'select-input',
             required: true,
             pilots: (formData: Record<string, any>) => getAvailablePilots('position7', formData),
             placeholder: 'Seleccionar piloto para posición 7...'
           },
           {
             name: 'position8',
             label: 'Posición 8',
             type: 'select-input',
             required: true,
             pilots: (formData: Record<string, any>) => getAvailablePilots('position8', formData),
             placeholder: 'Seleccionar piloto para posición 8...'
           },
           {
             name: 'position9',
             label: 'Posición 9',
             type: 'select-input',
             required: true,
             pilots: (formData: Record<string, any>) => getAvailablePilots('position9', formData),
             placeholder: 'Seleccionar piloto para posición 9...'
           },
           {
             name: 'position10',
             label: 'Posición 10',
             type: 'select-input',
             required: true,
             pilots: (formData: Record<string, any>) => getAvailablePilots('position10', formData),
             placeholder: 'Seleccionar piloto para posición 10...'
           },
           {
             name: 'crashPilot',
             label: 'Piloto Accidentado',
             type: 'select-input',
             required: false,
             pilots: pilots.filter(p => p.active),
             placeholder: 'Seleccionar piloto accidentado...',
             includeNoneOption: true,
             noneOptionLabel: 'Ninguno',
             noneOptionValue: ''
           }
         ]}
       />
    </div>
  );
};

export default ResultsModule;