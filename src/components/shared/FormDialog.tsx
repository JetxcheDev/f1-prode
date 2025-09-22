import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar24 } from '@/components/ui/date-time-picker';
import { PilotSearchCombobox } from '@/components/PilotSearchCombobox';
import { cn } from '@/lib/utils';
import { FormDialogProps, FormField } from '@/types';
import { LoadingState } from './LoadingState';
import { useState, useCallback } from 'react';

export function FormDialog<T extends Record<string, any>>({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialData,
  onSubmit,
  submitLabel = 'Guardar',
  loading = false,
  showSubmitButton = true,
  className,
  ...props
}: FormDialogProps<T>) {
  const [values, setValues] = useState<T>((initialData || {}) as T);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const validateField = (field: FormField, value: any) => {
    if (field.required && (!value || value === '')) {
      return 'Este campo es requerido';
    }
    if (field.validation) {
      return field.validation(value);
    }
    return null;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name as string] = error;
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, fields, onSubmit, onOpenChange]);

  const hasFieldError = (name: string) => !!errors[name];
  const getFieldError = (name: string) => errors[name] || '';
  const canSubmit = fields.every(field => {
    const value = values[field.name];
    return !field.required || (value !== undefined && value !== '' && value !== null);
  }) && !isSubmitting;

  useEffect(() => {
    if (initialData) {
      setValues(initialData as T);
    } else {
      setValues({} as T);
    }
    setErrors({});
  }, [initialData]);

  const renderField = (field: FormField) => {
    const fieldError = getFieldError(field.name);
    const hasError = hasFieldError(field.name);

    const commonProps = {
      id: String(field.name),
      value: values[field.name] || '',
      onChange: (value: any) => handleChange(field.name, value),
      className: cn(hasError && 'border-red-500')
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
            disabled={field.disabled}
            onChange={(e) => {
              const value = field.type === 'number' 
                ? parseFloat(e.target.value) || 0
                : e.target.value;
              handleChange(field.name, value);
            }}
          />
        );

      case 'datetime-local':
        return (
          <Calendar24
            value={values[field.name] || ''}
            onChange={(value) => handleChange(field.name, value)}
            placeholder={field.placeholder || 'Seleccionar'}
            className={cn(hasError && 'border-red-500')}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            placeholder={field.placeholder}
            disabled={field.disabled}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select
            value={String(values[field.name] || '')}
            onValueChange={(value) => handleChange(field.name, value)}
            disabled={field.disabled}
          >
            <SelectTrigger className={cn(hasError && 'border-red-500')}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'switch':
        return (
          <Switch
            checked={Boolean(values[field.name])}
            onCheckedChange={(checked) => handleChange(field.name, checked)}
            disabled={field.disabled}
          />
        );

      case 'select-input':
        const pilots = typeof field.pilots === 'function' 
          ? field.pilots(values) 
          : field.pilots || [];
        return (
          <PilotSearchCombobox
            pilots={pilots}
            value={values[field.name] || ''}
            onValueChange={(value) => handleChange(field.name, value)}
            placeholder={field.placeholder || 'Seleccionar piloto...'}
            includeNoneOption={field.includeNoneOption}
            noneOptionLabel={field.noneOptionLabel}
            noneOptionValue={field.noneOptionValue}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-[425px]', className)} {...props}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <LoadingState message="Cargando formulario..." />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {fields.map((field) => {
                const fieldError = getFieldError(field.name);
                
                return (
                  <div key={String(field.name)} className="grid grid-cols-4 items-center gap-4">
                    <Label 
                      htmlFor={String(field.name)} 
                      className="text-right"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <div className="col-span-3 space-y-1">
                      {renderField(field)}
                      {fieldError && (
                        <p className="text-sm text-red-500">{fieldError}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {showSubmitButton && (
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={!canSubmit}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    submitLabel
                  )}
                </Button>
              </DialogFooter>
            )}
            {!showSubmitButton && (
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cerrar
                </Button>
              </DialogFooter>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}



// Generic confirmation dialog
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  variant?: 'default' | 'destructive';
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
  variant = 'default'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <LoadingState message="Cargando..." />
        ) : (
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
            <Button 
              type="button" 
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Procesando...</span>
                </div>
              ) : (
                confirmLabel
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}