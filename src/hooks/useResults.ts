import { useState, useEffect, useCallback } from 'react';
import { getAllRaces, getAllPilots, getRaceResult, getAllResults } from '@/lib/firestore';
import { toast } from 'sonner';
import { Race, Pilot } from '@/types';

interface ResultData {
  raceId: string;
  pole: string;
  positions: string[];
  crashPilot: string;
}

interface UseResultsReturn {
  races: Race[];
  pilots: Pilot[];
  results: any[];
  selectedRace: Race | null;
  existingResult: any;
  loading: boolean;
  submitting: boolean;
  resultData: ResultData;
  error: string | null;
  loadData: () => Promise<void>;
  checkExistingResult: (raceId: string) => Promise<void>;
  setSelectedRace: (race: Race | null) => void;
  setSubmitting: (submitting: boolean) => void;
  setResultData: (data: ResultData) => void;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing results data
 * Provides races, pilots, and result management functionality
 */
export const useResults = (): UseResultsReturn => {
  const [races, setRaces] = useState<Race[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [existingResult, setExistingResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<ResultData>({
    raceId: '',
    pole: '',
    positions: Array(20).fill(''),
    crashPilot: ''
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [racesData, pilotsData, resultsData] = await Promise.all([
        getAllRaces(),
        getAllPilots(),
        getAllResults()
      ]);
      
      setRaces(racesData);
      setPilots(pilotsData);
      setResults(resultsData);
    } catch (err) {
      const errorMessage = 'Error al cargar los datos';
      console.error('Error loading data:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkExistingResult = useCallback(async (raceId: string) => {
    try {
      const result = await getRaceResult(raceId);
      setExistingResult(result);
      
      if (result) {
        setResultData({
          raceId,
          pole: result.pole || '',
          positions: result.positions || Array(20).fill(''),
          crashPilot: result.crashPilot || ''
        });
      } else {
        setResultData({
          raceId,
          pole: '',
          positions: Array(20).fill(''),
          crashPilot: ''
        });
      }
    } catch (error) {
      console.error('Error checking existing result:', error);
      setExistingResult(null);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    races,
    pilots,
    results,
    selectedRace,
    existingResult,
    loading,
    submitting,
    resultData,
    error,
    loadData,
    checkExistingResult,
    setSelectedRace,
    setSubmitting,
    setResultData,
    refreshData
  };
};