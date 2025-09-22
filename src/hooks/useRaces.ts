import { useState, useEffect, useCallback } from 'react';
import { Race } from '@/types';
import { getAllRaces } from '@/lib/firestore';
import { toast } from 'sonner';

export const useRaces = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const racesData = await getAllRaces();
      setRaces(racesData.sort((a, b) => a.date.toMillis() - b.date.toMillis()));
    } catch (error) {
      console.error('Error loading races:', error);
      setError('Error al cargar las carreras');
      toast.error('Error al cargar las carreras');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRaces = useCallback(() => {
    return loadRaces();
  }, [loadRaces]);

  useEffect(() => {
    loadRaces();
  }, [loadRaces]);

  return {
    races,
    loading,
    error,
    loadRaces,
    refreshRaces
  };
};