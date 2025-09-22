import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  variant?: 'default' | 'destructive' | 'warning';
  icon?: React.ComponentType<any>;
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  loading = false,
  variant = 'default',
  icon: Icon,
  className
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          buttonVariant: 'destructive' as const
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          buttonVariant: 'default' as const
        };
      default:
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          buttonVariant: 'default' as const
        };
    }
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'destructive':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const styles = getVariantStyles();
  const DefaultIcon = Icon || getDefaultIcon();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-[425px]', className)}>
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-full', styles.iconBg)}>
              <DefaultIcon className={cn('h-5 w-5', styles.iconColor)} />
            </div>
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || loading}
          >
            {cancelLabel}
          </Button>
          <Button 
            type="button" 
            variant={styles.buttonVariant}
            onClick={handleConfirm}
            disabled={isSubmitting || loading}
            className="min-w-[100px]"
          >
            {isSubmitting || loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Procesando...</span>
              </div>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Specialized confirm dialogs
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName = 'elemento',
  loading = false
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  itemName?: string;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Eliminar ${itemName}`}
      description={`¿Estás seguro de que quieres eliminar este ${itemName}? Esta acción no se puede deshacer.`}
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      onConfirm={onConfirm}
      loading={loading}
      variant="destructive"
      icon={Trash2}
    />
  );
}

export function SaveConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Guardar cambios',
  description = '¿Estás seguro de que quieres guardar estos cambios?',
  loading = false
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel="Guardar"
      cancelLabel="Cancelar"
      onConfirm={onConfirm}
      loading={loading}
      variant="default"
      icon={Save}
    />
  );
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onSave,
  onDiscard,
  loading = false
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  loading?: boolean;
}) {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    onDiscard();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-yellow-100">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <DialogTitle>Cambios sin guardar</DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-2">
            Tienes cambios sin guardar. ¿Qué te gustaría hacer?
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving || loading}
            className="w-full sm:w-auto"
          >
            Continuar editando
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDiscard}
            disabled={isSaving || loading}
            className="w-full sm:w-auto"
          >
            Descartar cambios
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={isSaving || loading}
            className="w-full sm:w-auto min-w-[120px]"
          >
            {isSaving || loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Guardando...</span>
              </div>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cerrar sesión"
      description="¿Estás seguro de que quieres cerrar tu sesión?"
      confirmLabel="Cerrar sesión"
      cancelLabel="Cancelar"
      onConfirm={onConfirm}
      loading={loading}
      variant="warning"
    />
  );
}

export function ResetConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Restablecer datos',
  description = 'Esta acción restablecerá todos los datos a su estado inicial. ¿Estás seguro?',
  loading = false
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel="Restablecer"
      cancelLabel="Cancelar"
      onConfirm={onConfirm}
      loading={loading}
      variant="warning"
    />
  );
}