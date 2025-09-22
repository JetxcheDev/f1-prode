import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getScoringConfig, saveOrUpdateScoringConfig } from '../lib/firestore';

export interface ScoringConfig {
  polePoints: number;
  position1Points: number;
  position2Points: number;
  position3Points: number;
  position4to10Points: number;
  crashPoints: number;
}

const DEFAULT_SCORING: ScoringConfig = {
  polePoints: 5,
  position1Points: 5,
  position2Points: 3,
  position3Points: 2,
  position4to10Points: 1,
  crashPoints: 1
};

export function useScoringConfig() {
  const [config, setConfig] = useState<ScoringConfig>(DEFAULT_SCORING);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const savedConfig = await getScoringConfig();
      if (savedConfig) {
        const { id, createdAt, updatedAt, ...configData } = savedConfig;
        setConfig({ ...DEFAULT_SCORING, ...configData });
      }
    } catch (error) {
      console.error('Error loading scoring config:', error);
      toast.error('Error al cargar la configuración de puntuación');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setLoading(true);
      await saveOrUpdateScoringConfig(config);
      setHasChanges(false);
      toast.success('Configuración de puntuación guardada correctamente');
    } catch (error) {
      console.error('Error saving scoring config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (field: keyof ScoringConfig, value: number) => {
    if (value < 0) return;
    
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_SCORING);
    setHasChanges(true);
    toast.info('Configuración restablecida a valores por defecto');
  };

  const getTotalMaxPoints = () => {
    return config.polePoints + config.position1Points + config.crashPoints;
  };

  return {
    config,
    loading,
    hasChanges,
    loadConfig,
    saveConfig,
    updateConfig,
    resetToDefaults,
    getTotalMaxPoints,
    defaultScoring: DEFAULT_SCORING
  };
}