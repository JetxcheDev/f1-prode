import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTableProps, TableColumn, TableAction } from '@/types';
import { EmptyState } from './EmptyState';

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  actions = [],
  loading = false,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
  className,
  ...props
}: DataTableProps<T>) {
  // Extract searchable fields from columns
  const searchFields = useMemo(() => {
    return columns
      .filter(col => typeof col.key === 'string')
      .map(col => col.key as keyof T);
  }, [columns]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortState, setSortState] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const filteredData = useMemo(() => {
    let filtered = data;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Apply sorting
    if (sortState) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortState.key as keyof T];
        const bValue = b[sortState.key as keyof T];
        
        if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [data, searchTerm, sortState]);

  const toggleSort = (key: string) => {
    setSortState(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const hasAnyFilter = searchTerm.length > 0;
  const clearAll = () => {
    setSearchTerm('');
    setSortState(null);
  };

  const renderCell = (column: TableColumn<T>, item: T, index: number) => {
    if (column.render) {
      return column.render(item[column.key as keyof T], item, index);
    }
    
    const value = item[column.key as keyof T];
    
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>;
    }
    
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Sí' : 'No'}
        </Badge>
      );
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString('es-ES');
    }
    
    return String(value);
  };

  const renderActions = (item: T) => {
    if (actions.length === 0) return null;
    
    return (
      <div className="flex items-center space-x-2">
        {actions.map((action, index) => {
          const isDisabled = action.disabled ? action.disabled(item) : false;
          
          return (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={() => action.onClick(item)}
              disabled={isDisabled}
              className="hover:shadow-sm transition-shadow"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label && (
                <span className={action.icon ? 'ml-1' : ''}>
                  {action.label}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    );
  };

  const renderSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;
    
    const isActive = sortState?.key === column.key;
    
    if (!isActive) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    
    return sortState?.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-primary" />
      : <ArrowDown className="h-4 w-4 text-primary" />;
  };

  if (loading) {
    return (
      <Card className={className} {...props}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {searchable && <Skeleton className="h-10 w-full max-w-sm" />}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {columns.map((column, index) => (
                      <TableHead key={index}>
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                    ))}
                    {actions.length > 0 && (
                      <TableHead>
                        <Skeleton className="h-4 w-16" />
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                      {actions.length > 0 && (
                        <TableCell>
                          <Skeleton className="h-8 w-20" />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} {...props}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search and filters */}
          {searchable && (
            <div className="flex items-center justify-between">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {hasAnyFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="text-muted-foreground"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}

          {/* Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {columns.map((column, index) => (
                    <TableHead 
                      key={index}
                      style={{ width: column.width }}
                      className={cn(
                        'font-semibold',
                        column.sortable && 'cursor-pointer hover:bg-muted/70 transition-colors'
                      )}
                      onClick={() => column.sortable && toggleSort(String(column.key))}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{column.header}</span>
                        {renderSortIcon(column)}
                      </div>
                    </TableHead>
                  ))}
                  {actions.length > 0 && (
                    <TableHead className="text-right font-semibold">
                      Acciones
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
                      className="text-center py-12"
                    >
                      <EmptyState
                        title={hasAnyFilter ? 'No se encontraron resultados' : emptyMessage}
                        description={
                          hasAnyFilter 
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow 
                      key={item.id || index}
                      className={cn(
                        'hover:bg-muted/30 transition-colors',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick?.(item)}
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell key={colIndex}>
                          {renderCell(column, item, index)}
                        </TableCell>
                      ))}
                      {actions.length > 0 && (
                        <TableCell className="text-right">
                          {renderActions(item)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer with count */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Mostrando {filteredData.length} de {data.length} elementos
              </span>
              {hasAnyFilter && (
                <span>
                  Filtros activos
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
