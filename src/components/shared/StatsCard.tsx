import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { StatsCardProps, StatColor } from '@/types';

const colorClasses: Record<StatColor, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  gray: 'bg-gray-100 text-gray-600'
};

const borderClasses: Record<StatColor, string> = {
  blue: 'border-l-blue-500',
  green: 'border-l-green-500',
  red: 'border-l-red-500',
  purple: 'border-l-purple-500',
  yellow: 'border-l-yellow-500',
  gray: 'border-l-gray-500'
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  loading = false,
  className,
  ...props
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)} {...props}>
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
    );
  }

  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-all duration-200 hover:scale-105 border-l-4',
        borderClasses[color],
        className
      )} 
      {...props}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {trend && (
                <span 
                  className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    trend.isPositive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className={cn('p-3 rounded-full', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized stats cards
export function UserStatsCard({ count, loading }: { count: number; loading?: boolean }) {
  return (
    <StatsCard
      title="Total Usuarios"
      value={count}
      icon={require('lucide-react').Users}
      color="blue"
      loading={loading}
    />
  );
}

export function PilotStatsCard({ count, loading }: { count: number; loading?: boolean }) {
  return (
    <StatsCard
      title="Pilotos Activos"
      value={count}
      icon={require('lucide-react').UserCheck}
      color="green"
      loading={loading}
    />
  );
}

export function RaceStatsCard({ count, loading }: { count: number; loading?: boolean }) {
  return (
    <StatsCard
      title="Carreras Programadas"
      value={count}
      icon={require('lucide-react').Flag}
      color="purple"
      loading={loading}
    />
  );
}

export function AdminStatsCard({ count, loading }: { count: number; loading?: boolean }) {
  return (
    <StatsCard
      title="Administradores"
      value={count}
      icon={require('lucide-react').Crown}
      color="red"
      loading={loading}
    />
  );
}

// Stats grid component
interface StatsGridProps {
  stats: Array<{
    title: string;
    value: number | string;
    icon: import('lucide-react').LucideIcon;
    color: StatColor;
    trend?: { value: number; isPositive: boolean };
  }>;
  loading?: boolean;
  className?: string;
}

export function StatsGrid({ stats, loading = false, className }: StatsGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {stats.map((stat, index) => (
        <StatsCard
          key={`${stat.title}-${index}`}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          loading={loading}
        />
      ))}
    </div>
  );
}

// Animated counter component
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1000, className }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {displayValue.toLocaleString()}
    </span>
  );
}

// Stats card with animated counter
export function AnimatedStatsCard(props: StatsCardProps & { animationDuration?: number }) {
  const { value, animationDuration, ...rest } = props;
  
  if (typeof value === 'number') {
    return (
      <StatsCard
        {...rest}
        value={
          <AnimatedCounter 
            value={value} 
            duration={animationDuration}
            className="text-2xl font-bold"
          />
        }
      />
    );
  }
  
  return <StatsCard {...props} />;
}