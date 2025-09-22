import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoringFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'warning';
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const variantStyles = {
  default: 'border-border',
  highlight: 'border-primary/50 bg-primary/5',
  warning: 'border-red-200 text-red-300'
};

export function ScoringField({
  label,
  value,
  onChange,
  description,
  icon,
  variant = 'default',
  disabled = false,
  min = 0,
  max = 100,
  step = 1,
  className
}: ScoringFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon && (
                <div className="flex-shrink-0 text-muted-foreground">
                  {icon}
                </div>
              )}
              <Label htmlFor={`scoring-${label.toLowerCase().replace(/\s+/g, '-')}`} className="font-medium">
                {label}
              </Label>
            </div>
            <Badge variant="outline" className="text-xs">
              {value} pts
            </Badge>
          </div>
          
          <Input
            id={`scoring-${label.toLowerCase().replace(/\s+/g, '-')}`}
            type="number"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className="text-center font-mono text-lg"
            placeholder="0"
          />
          
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}