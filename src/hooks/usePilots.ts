import { useState, useEffect, useCallback } from 'react';
import { getAllPilots } from '@/lib/firestore';
import { toast } from 'sonner';
import { Pilot } from '@/types';

interface UsePilotsReturn {
  pilots: Pilot[];
  loading: boolean;
  error: string | null;
  loadPilots: () => Promise<void>;
  refreshPilots: () => Promise<void>;
}

/**
 * Custom hook for managing pilots data
 * Provides pilots state, loading state, error handling, and data fetching functions
 */
export const usePilots = (): UsePilotsReturn => {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPilots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const pilotsData = await getAllPilots();
      setPilots(pilotsData);
    } catch (err) {
      const errorMessage = 'Error al cargar los pilotos';
      console.error('Error loading pilots:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPilots = useCallback(async () => {
    await loadPilots();
  }, [loadPilots]);

  // Load pilots on mount
  useEffect(() => {
    loadPilots();
  }, [loadPilots]);

  return {
    pilots,
    loading,
    error,
    loadPilots,
    refreshPilots
  };
};