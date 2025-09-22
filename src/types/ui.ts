import { ReactNode, ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Stats card types
export type StatColor = 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray';

export interface StatsTrend {
  value: number;
  isPositive: boolean;
}

export interface StatsCardProps extends BaseComponentProps {
  title: string;
  value: number | string | ReactNode;
  icon: LucideIcon;
  color: StatColor;
  trend?: StatsTrend;
  loading?: boolean;
}

// Data table types
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  disabled?: (item: T) => boolean;
}

export interface DataTableProps<T> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

// Form dialog types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'datetime-local' | 'select' | 'switch' | 'textarea' | 'select-input';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  pilots?: any[] | ((formData: Record<string, any>) => any[]);
  includeNoneOption?: boolean;
  noneOptionLabel?: string;
  noneOptionValue?: string;
  validation?: (value: any) => string | null;
}

export interface FormDialogProps<T> extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormField[];
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  showSubmitButton?: boolean;
}

// Loading state types
export interface LoadingStateProps extends BaseComponentProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Empty state types
export interface EmptyStateProps extends BaseComponentProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Badge types
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface BadgeProps extends BaseComponentProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
}

// Button types
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}