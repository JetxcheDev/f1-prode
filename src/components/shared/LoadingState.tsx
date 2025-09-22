import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LoadingStateProps } from '@/types';

export function LoadingState({
  message = 'Cargando...',
  size = 'md',
  className,
  ...props
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12'
  };

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center space-y-4',
        containerClasses[size],
        className
      )}
      {...props}
    >
      <div 
        className={cn(
          'animate-spin rounded-full border-b-2 border-blue-600',
          sizeClasses[size]
        )}
      />
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  );
}

// Card wrapper for loading state
export function LoadingCard({
  title,
  message = 'Cargando...',
  size = 'md',
  className
}: LoadingStateProps & { title?: string }) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      {title && (
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <CardContent className="p-6">
        <LoadingState message={message} size={size} />
      </CardContent>
    </Card>
  );
}

// Skeleton components for different layouts
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="rounded-lg border overflow-hidden">
        <div className="bg-muted/50 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-20" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: cards }).map((_, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

// Loading overlay component
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  visible, 
  message = 'Cargando...', 
  className 
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div 
      className={cn(
        'absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center',
        className
      )}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="text-muted-foreground font-medium">{message}</p>
      </div>
    </div>
  );
}

// Pulse loading animation
export function PulseLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-2', className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
}

// Spinner variants
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
    />
  );
}

export function DotsSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}

// Progress bar component
interface ProgressBarProps {
  progress: number;
  message?: string;
  className?: string;
}

export function ProgressBar({ progress, message, className }: ProgressBarProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-right">
        {Math.round(progress)}%
      </p>
    </div>
  );
}