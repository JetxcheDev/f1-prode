import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, RotateCcw, TrendingUp, AlertCircle } from 'lucide-react';
import { ScoringConfig } from '@/hooks/useScoringConfig';
import { cn } from '@/lib/utils';

interface ScoringPanelProps {
  config: ScoringConfig;
  loading: boolean;
  hasChanges: boolean;
  totalMaxPoints: number;
  onSave: () => void;
  onReset: () => void;
  className?: string;
}

export function ScoringPanel({
  config,
  loading,
  hasChanges,
  totalMaxPoints,
  onSave,
  onReset,
  className
}: ScoringPanelProps) {
  const getPointsBreakdown = () => [
    { label: 'Pole Position', value: config.polePoints, color: 'bg-yellow-500' },
    { label: '1er Lugar', value: config.position1Points, color: 'bg-green-500' },
    { label: '2do Lugar', value: config.position2Points, color: 'bg-blue-500' },
    { label: '3er Lugar', value: config.position3Points, color: 'bg-orange-500' },
    { label: '4to-10mo', value: config.position4to10Points, color: 'bg-gray-500' },
    { label: 'Accidente', value: config.crashPoints, color: 'bg-red-500' }
  ];

  return (
    <Card className={cn('sticky top-4', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          Panel de Control
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalMaxPoints}</div>
            <div className="text-xs text-muted-foreground">Puntos Máximos</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(config).reduce((sum, val) => sum + val, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Configurado</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Desglose de Puntos</h4>
          <div className="space-y-1">
            {getPointsBreakdown().map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', item.color)} />
                  <span>{item.label}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.value}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {hasChanges && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-700">Cambios sin guardar</span>
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={onSave} 
            disabled={loading || !hasChanges}
            className="w-full"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
          
          <Button 
            onClick={onReset} 
            variant="outline" 
            disabled={loading}
            className="w-full"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Los cambios se guardan localmente</p>
          <p>• Los valores no pueden ser negativos</p>
          <p>• Máximo 100 puntos por categoría</p>
        </div>
      </CardContent>
    </Card>
  );
}