'use client';

import React from 'react';
import { Trophy, Target, Zap, AlertTriangle, Medal, Award } from 'lucide-react';
import { useScoringConfig } from '@/hooks/useScoringConfig';
import { ScoringField } from './scoring/ScoringField';
import { ScoringPanel } from './scoring/ScoringPanel';

export default function ScoringModule() {
  const {
    config,
    loading,
    hasChanges,
    saveConfig,
    updateConfig,
    resetToDefaults,
    getTotalMaxPoints
  } = useScoringConfig();

  const scoringFields = [
    {
      key: 'polePoints' as const,
      label: 'Pole Position',
      description: 'Puntos otorgados por conseguir la pole position en clasificación',
      icon: <Trophy className="h-4 w-4" />,
      variant: 'highlight' as const
    },
    {
      key: 'position1Points' as const,
      label: 'Primer Lugar',
      description: 'Puntos por ganar la carrera (1er lugar)',
      icon: <Medal className="h-4 w-4" />,
      variant: 'highlight' as const
    },
    {
      key: 'position2Points' as const,
      label: 'Segundo Lugar',
      description: 'Puntos por terminar en 2do lugar',
      icon: <Award className="h-4 w-4" />,
      variant: 'default' as const
    },
    {
      key: 'position3Points' as const,
      label: 'Tercer Lugar',
      description: 'Puntos por terminar en 3er lugar',
      icon: <Target className="h-4 w-4" />,
      variant: 'default' as const
    },
    {
      key: 'position4to10Points' as const,
      label: 'Posiciones 4-10',
      description: 'Puntos por terminar entre el 4to y 10mo lugar',
      icon: <Zap className="h-4 w-4" />,
      variant: 'default' as const
    },
    {
      key: 'crashPoints' as const,
      label: 'Accidente/DNF',
      description: 'Puntos por no terminar la carrera (accidente, falla mecánica, etc.)',
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: 'warning' as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuración de Puntuación</h2>
          <p className="text-muted-foreground">
            Configura los puntos otorgados por cada posición y evento en las carreras
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scoringFields.map((field) => (
              <ScoringField
                key={field.key}
                label={field.label}
                value={config[field.key]}
                onChange={(value) => updateConfig(field.key, value)}
                description={field.description}
                icon={field.icon}
                variant={field.variant}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        <div>
          <ScoringPanel
            config={config}
            loading={loading}
            hasChanges={hasChanges}
            totalMaxPoints={getTotalMaxPoints()}
            onSave={saveConfig}
            onReset={resetToDefaults}
          />
        </div>
      </div>
    </div>
  );
}