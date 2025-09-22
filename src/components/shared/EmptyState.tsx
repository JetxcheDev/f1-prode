import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { EmptyStateProps } from '@/types';
import { 
  Users, 
  Flag, 
  UserCheck, 
  Trophy, 
  Search, 
  FileX, 
  Database,
  Inbox,
  AlertCircle
} from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  const DefaultIcon = Icon || Inbox;

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center text-center space-y-4 py-12',
        className
      )}
      {...props}
    >
      <div className="p-4 bg-muted/50 rounded-full">
        <DefaultIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Card wrapper for empty state
export function EmptyStateCard({
  title: cardTitle,
  emptyTitle = 'Sin datos',
  ...emptyStateProps
}: Omit<EmptyStateProps, 'title'> & { title?: string; emptyTitle?: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      {cardTitle && (
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold">{cardTitle}</h3>
        </div>
      )}
      <CardContent className="p-6">
        <EmptyState title={emptyTitle} {...emptyStateProps} />
      </CardContent>
    </Card>
  );
}

// Specialized empty states
export function NoPilotsState({ onAddPilot }: { onAddPilot?: () => void }) {
  return (
    <EmptyState
      icon={UserCheck}
      title="No hay pilotos registrados"
      description="Comienza agregando pilotos para poder crear carreras y votaciones."
      action={onAddPilot ? {
        label: 'Agregar Piloto',
        onClick: onAddPilot
      } : undefined}
    />
  );
}

export function NoRacesState({ onAddRace }: { onAddRace?: () => void }) {
  return (
    <EmptyState
      icon={Flag}
      title="No hay carreras programadas"
      description="Crea tu primera carrera para comenzar a recibir votaciones de los usuarios."
      action={onAddRace ? {
        label: 'Crear Carrera',
        onClick: onAddRace
      } : undefined}
    />
  );
}

export function NoUsersState() {
  return (
    <EmptyState
      icon={Users}
      title="No hay usuarios registrados"
      description="Los usuarios aparecerán aquí cuando se registren en la aplicación."
    />
  );
}

export function NoResultsState({ onAddResult }: { onAddResult?: () => void }) {
  return (
    <EmptyState
      icon={Trophy}
      title="No hay resultados disponibles"
      description="Agrega los resultados de las carreras para calcular las puntuaciones."
      action={onAddResult ? {
        label: 'Agregar Resultado',
        onClick: onAddResult
      } : undefined}
    />
  );
}

export function NoSearchResultsState({ 
  searchTerm, 
  onClearSearch 
}: { 
  searchTerm?: string;
  onClearSearch?: () => void;
}) {
  return (
    <EmptyState
      icon={Search}
      title="No se encontraron resultados"
      description={
        searchTerm 
          ? `No hay elementos que coincidan con "${searchTerm}"`
          : "Intenta ajustar los filtros de búsqueda"
      }
      action={onClearSearch ? {
        label: 'Limpiar búsqueda',
        onClick: onClearSearch
      } : undefined}
    />
  );
}

export function NoDataState({ 
  entityName = 'datos',
  onRefresh 
}: { 
  entityName?: string;
  onRefresh?: () => void;
}) {
  return (
    <EmptyState
      icon={Database}
      title={`No hay ${entityName} disponibles`}
      description="No se encontraron datos para mostrar en este momento."
      action={onRefresh ? {
        label: 'Actualizar',
        onClick: onRefresh
      } : undefined}
    />
  );
}

export function ErrorState({ 
  title = 'Algo salió mal',
  description = 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
  onRetry 
}: { 
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={description}
      action={onRetry ? {
        label: 'Reintentar',
        onClick: onRetry
      } : undefined}
    />
  );
}

export function NotFoundState({ 
  entityName = 'página',
  onGoBack 
}: { 
  entityName?: string;
  onGoBack?: () => void;
}) {
  return (
    <EmptyState
      icon={FileX}
      title={`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} no encontrada`}
      description={`La ${entityName} que buscas no existe o ha sido eliminada.`}
      action={onGoBack ? {
        label: 'Volver',
        onClick: onGoBack
      } : undefined}
    />
  );
}

// Maintenance state
export function MaintenanceState() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Mantenimiento en progreso"
      description="El sistema está temporalmente fuera de servicio por mantenimiento. Volveremos pronto."
    />
  );
}

// Coming soon state
export function ComingSoonState({ featureName }: { featureName?: string }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={featureName ? `${featureName} próximamente` : 'Próximamente'}
      description="Esta funcionalidad estará disponible en una próxima actualización."
    />
  );
}

// Permission denied state
export function PermissionDeniedState() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Acceso denegado"
      description="No tienes permisos para acceder a esta sección."
    />
  );
}

// Offline state
export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Sin conexión"
      description="Verifica tu conexión a internet e intenta nuevamente."
      action={onRetry ? {
        label: 'Reintentar',
        onClick: onRetry
      } : undefined}
    />
  );
}

// Generic empty list state
export function EmptyListState({
  itemName = 'elementos',
  onAdd
}: {
  itemName?: string;
  onAdd?: () => void;
}) {
  return (
    <EmptyState
      icon={Inbox}
      title={`No hay ${itemName}`}
      description={`Aún no se han agregado ${itemName} a esta lista.`}
      action={onAdd ? {
        label: `Agregar ${itemName.slice(0, -1)}`,
        onClick: onAdd
      } : undefined}
    />
  );
}

// Loading failed state
export function LoadingFailedState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Error al cargar"
      description="No se pudieron cargar los datos. Por favor, intenta nuevamente."
      action={onRetry ? {
        label: 'Reintentar',
        onClick: onRetry
      } : undefined}
    />
  );
}