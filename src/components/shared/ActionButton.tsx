import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Copy, 
  Download,
  Share,
  Settings,
  Archive,
  Star,
  Heart,
  Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonProps } from '@/types';

interface ActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: () => void;
  tooltip?: string;
  icon?: React.ComponentType<any>;
  label?: string;
}

export function ActionButton({
  onClick,
  tooltip,
  icon: Icon,
  label,
  variant = 'outline',
  size = 'sm',
  disabled = false,
  loading = false,
  className,
  ...props
}: ActionButtonProps) {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('hover:shadow-sm transition-shadow', className)}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          {label && (
            <span className={Icon ? 'ml-1' : ''}>
              {label}
            </span>
          )}
        </>
      )}
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

// Specialized action buttons
export function EditButton({
  onClick,
  disabled = false,
  loading = false,
  tooltip = 'Editar',
  ...props
}: Omit<ActionButtonProps, 'icon' | 'tooltip'> & { tooltip?: string }) {
  return (
    <ActionButton
      icon={Edit}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      tooltip={tooltip}
      variant="outline"
      {...props}
    />
  );
}

export function DeleteButton({
  onClick,
  disabled = false,
  loading = false,
  tooltip = 'Eliminar',
  ...props
}: Omit<ActionButtonProps, 'icon' | 'tooltip'> & { tooltip?: string }) {
  return (
    <ActionButton
      icon={Trash2}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      tooltip={tooltip}
      variant="outline"
      className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
      {...props}
    />
  );
}

export function ViewButton({
  onClick,
  disabled = false,
  loading = false,
  tooltip = 'Ver detalles',
  ...props
}: Omit<ActionButtonProps, 'icon' | 'tooltip'> & { tooltip?: string }) {
  return (
    <ActionButton
      icon={Eye}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      tooltip={tooltip}
      variant="outline"
      {...props}
    />
  );
}

export function CopyButton({
  onClick,
  disabled = false,
  loading = false,
  tooltip = 'Copiar',
  ...props
}: Omit<ActionButtonProps, 'icon' | 'tooltip'> & { tooltip?: string }) {
  return (
    <ActionButton
      icon={Copy}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      tooltip={tooltip}
      variant="outline"
      {...props}
    />
  );
}

export function DownloadButton({
  onClick,
  disabled = false,
  loading = false,
  tooltip = 'Descargar',
  ...props
}: Omit<ActionButtonProps, 'icon' | 'tooltip'> & { tooltip?: string }) {
  return (
    <ActionButton
      icon={Download}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      tooltip={tooltip}
      variant="outline"
      {...props}
    />
  );
}

export function ShareButton({
  onClick,
  disabled = false,
  loading = false,
  tooltip = 'Compartir',
  ...props
}: Omit<ActionButtonProps, 'icon' | 'tooltip'> & { tooltip?: string }) {
  return (
    <ActionButton
      icon={Share}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      tooltip={tooltip}
      variant="outline"
      {...props}
    />
  );
}

export function SettingsButton({
  onClick,
  disabled = false,
  loading = false,
  tooltip = 'Configuración',
  ...props
}: Omit<ActionButtonProps, 'icon' | 'tooltip'> & { tooltip?: string }) {
  return (
    <ActionButton
      icon={Settings}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      tooltip={tooltip}
      variant="outline"
      {...props}
    />
  );
}

// Action menu component
interface ActionMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<any>;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  disabled?: boolean;
  className?: string;
}

export function ActionMenu({ items, disabled = false, className }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn('hover:shadow-sm transition-shadow', className)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                'cursor-pointer',
                item.destructive && 'text-red-600 focus:text-red-600'
              )}
            >
              {item.icon && <item.icon className="h-4 w-4 mr-2" />}
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Specialized action menus
export function TableRowActionMenu({
  onEdit,
  onDelete,
  onView,
  onCopy,
  disabled = false
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onCopy?: () => void;
  disabled?: boolean;
}) {
  const items: ActionMenuItem[] = [];

  if (onView) {
    items.push({
      label: 'Ver detalles',
      onClick: onView,
      icon: Eye
    });
  }

  if (onEdit) {
    items.push({
      label: 'Editar',
      onClick: onEdit,
      icon: Edit
    });
  }

  if (onCopy) {
    items.push({
      label: 'Copiar',
      onClick: onCopy,
      icon: Copy
    });
  }

  if (onDelete) {
    items.push({
      label: 'Eliminar',
      onClick: onDelete,
      icon: Trash2,
      destructive: true,
      separator: true
    });
  }

  return <ActionMenu items={items} disabled={disabled} />;
}

export function CardActionMenu({
  onEdit,
  onDelete,
  onArchive,
  onShare,
  disabled = false
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onShare?: () => void;
  disabled?: boolean;
}) {
  const items: ActionMenuItem[] = [];

  if (onEdit) {
    items.push({
      label: 'Editar',
      onClick: onEdit,
      icon: Edit
    });
  }

  if (onShare) {
    items.push({
      label: 'Compartir',
      onClick: onShare,
      icon: Share
    });
  }

  if (onArchive) {
    items.push({
      label: 'Archivar',
      onClick: onArchive,
      icon: Archive,
      separator: true
    });
  }

  if (onDelete) {
    items.push({
      label: 'Eliminar',
      onClick: onDelete,
      icon: Trash2,
      destructive: true,
      separator: !onArchive
    });
  }

  return <ActionMenu items={items} disabled={disabled} />;
}

// Favorite/Like buttons
export function FavoriteButton({
  isFavorite,
  onToggle,
  disabled = false,
  loading = false
}: {
  isFavorite: boolean;
  onToggle: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <ActionButton
      icon={Star}
      onClick={onToggle}
      disabled={disabled}
      loading={loading}
      tooltip={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      variant={isFavorite ? 'default' : 'outline'}
      className={isFavorite ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : ''}
    />
  );
}

export function LikeButton({
  isLiked,
  onToggle,
  disabled = false,
  loading = false
}: {
  isLiked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <ActionButton
      icon={Heart}
      onClick={onToggle}
      disabled={disabled}
      loading={loading}
      tooltip={isLiked ? 'Quitar me gusta' : 'Me gusta'}
      variant={isLiked ? 'default' : 'outline'}
      className={isLiked ? 'text-red-600 bg-red-50 border-red-200' : ''}
    />
  );
}

export function BookmarkButton({
  isBookmarked,
  onToggle,
  disabled = false,
  loading = false
}: {
  isBookmarked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <ActionButton
      icon={Bookmark}
      onClick={onToggle}
      disabled={disabled}
      loading={loading}
      tooltip={isBookmarked ? 'Quitar marcador' : 'Agregar marcador'}
      variant={isBookmarked ? 'default' : 'outline'}
      className={isBookmarked ? 'text-blue-600 bg-blue-50 border-blue-200' : ''}
    />
  );
}