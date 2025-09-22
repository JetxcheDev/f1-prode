import React from 'react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageAction, PageHeaderProps } from '@/types';

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions = [],
  badge,
  className,
  children
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {badge && (
              <Badge variant={badge.variant}>
                {badge.label}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center space-x-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                disabled={action.disabled}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Custom children */}
      {children}

      <Separator />
    </div>
  );
}

// Specialized page headers
export function AdminPageHeader({
  title,
  description,
  onAdd,
  addLabel = 'Agregar',
  addIcon: AddIcon = Plus,
  stats,
  ...props
}: Omit<PageHeaderProps, 'actions'> & {
  onAdd?: () => void;
  addLabel?: string;
  addIcon?: React.ComponentType<any>;
  stats?: Array<{ label: string; value: string | number }>;
}) {
  const actions: PageAction[] = [];
  
  if (onAdd) {
    actions.push({
      label: addLabel,
      onClick: onAdd,
      icon: AddIcon
    });
  }

  return (
    <PageHeader
      title={title}
      description={description}
      actions={actions}
      {...props}
    >
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-primary">
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </PageHeader>
  );
}

export function DashboardPageHeader({
  title = 'Panel de Administración',
  description = 'Gestiona usuarios, pilotos, carreras y estadísticas del sistema',
  ...props
}: Partial<PageHeaderProps>) {
  return (
    <PageHeader
      title={title}
      description={description}
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Administración', current: true }
      ]}
      {...props}
    />
  );
}

export function PilotsPageHeader({
  onAddPilot,
  pilotCount = 0,
  ...props
}: Partial<PageHeaderProps> & {
  onAddPilot?: () => void;
  pilotCount?: number;
}) {
  return (
    <AdminPageHeader
      title="Gestión de Pilotos"
      description="Administra la lista de pilotos disponibles para las votaciones"
      onAdd={onAddPilot}
      addLabel="Agregar Piloto"
      addIcon={require('lucide-react').UserCheck}
      stats={[
        { label: 'Total Pilotos', value: pilotCount }
      ]}
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Administración', href: '/admin' },
        { label: 'Pilotos', current: true }
      ]}
      {...props}
    />
  );
}

export function RacesPageHeader({
  onAddRace,
  raceCount = 0,
  ...props
}: Partial<PageHeaderProps> & {
  onAddRace?: () => void;
  raceCount?: number;
}) {
  return (
    <AdminPageHeader
      title="Gestión de Carreras"
      description="Administra el calendario de carreras y fechas de votación"
      onAdd={onAddRace}
      addLabel="Agregar Carrera"
      addIcon={require('lucide-react').Flag}
      stats={[
        { label: 'Total Carreras', value: raceCount }
      ]}
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Administración', href: '/admin' },
        { label: 'Carreras', current: true }
      ]}
      {...props}
    />
  );
}

export function UsersPageHeader({
  userCount = 0,
  adminCount = 0,
  ...props
}: Partial<PageHeaderProps> & {
  userCount?: number;
  adminCount?: number;
}) {
  return (
    <AdminPageHeader
      title="Gestión de Usuarios"
      description="Administra los usuarios registrados y sus permisos"
      stats={[
        { label: 'Total Usuarios', value: userCount },
        { label: 'Administradores', value: adminCount }
      ]}
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Administración', href: '/admin' },
        { label: 'Usuarios', current: true }
      ]}
      {...props}
    />
  );
}

export function ResultsPageHeader({
  onAddResult,
  resultCount = 0,
  ...props
}: Partial<PageHeaderProps> & {
  onAddResult?: () => void;
  resultCount?: number;
}) {
  return (
    <AdminPageHeader
      title="Gestión de Resultados"
      description="Registra y administra los resultados de las carreras"
      onAdd={onAddResult}
      addLabel="Agregar Resultado"
      addIcon={require('lucide-react').Trophy}
      stats={[
        { label: 'Resultados Registrados', value: resultCount }
      ]}
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Administración', href: '/admin' },
        { label: 'Resultados', current: true }
      ]}
      {...props}
    />
  );
}

export function ScoringPageHeader({
  participantCount = 0,
  averageScore = 0,
  ...props
}: Partial<PageHeaderProps> & {
  participantCount?: number;
  averageScore?: number;
}) {
  return (
    <AdminPageHeader
      title="Sistema de Puntuación"
      description="Visualiza y analiza las puntuaciones de los usuarios"
      stats={[
        { label: 'Participantes', value: participantCount },
        { label: 'Promedio', value: averageScore.toFixed(1) }
      ]}
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Administración', href: '/admin' },
        { label: 'Puntuación', current: true }
      ]}
      {...props}
    />
  );
}

export function StatsPageHeader({
  totalUsers = 0,
  totalRaces = 0,
  ...props
}: Partial<PageHeaderProps> & {
  totalUsers?: number;
  totalRaces?: number;
}) {
  return (
    <AdminPageHeader
      title="Estadísticas del Sistema"
      description="Visualiza métricas y estadísticas generales de la aplicación"
      stats={[
        { label: 'Usuarios Totales', value: totalUsers },
        { label: 'Carreras Totales', value: totalRaces }
      ]}
      breadcrumbs={[
        { label: 'Inicio', href: '/' },
        { label: 'Administración', href: '/admin' },
        { label: 'Estadísticas', current: true }
      ]}
      {...props}
    />
  );
}