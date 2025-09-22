import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getAllRaces, getAllPilots, getUserVoteForRace, createVote, Race, Pilot } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface VoteData {
  pole: string;
  positions: string[];
  crashPilot: string;
}

interface UseVotingReturn {
  races: Race[];
  pilots: Pilot[];
  loading: boolean;
  submitting: boolean;
  getExistingVote: (raceId: string) => Promise<any>;
  submitVote: (raceId: string, voteData: VoteData) => Promise<boolean>;
  validateVote: (voteData: VoteData) => boolean;
  getAvailablePilotsForPositions: (currentSelection?: string, voteData?: VoteData) => Pilot[];
  canVoteForRace: (race: Race) => Promise<boolean>;
  isVotingClosed: (race: Race) => boolean;
  refreshData: () => Promise<void>;
}

export const useVoting = (): UseVotingReturn => {
  const { user } = useAuth();
  const [races, setRaces] = useState<Race[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [racesData, pilotsData] = await Promise.all([
        getAllRaces(),
        getAllPilots()
      ]);
      
      const sortedRaces = racesData.sort((a, b) => {
        const dateA = a.date.toDate();
        const dateB = b.date.toDate();
        return dateB.getTime() - dateA.getTime();
      });
      
      setRaces(sortedRaces);
      setPilots(pilotsData.filter(pilot => pilot.active));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  const getExistingVote = useCallback(async (raceId: string) => {
    if (!user) return null;
    
    try {
      return await getUserVoteForRace(user.uid, raceId);
    } catch (error) {
      console.error('Error checking existing vote:', error);
      return null;
    }
  }, [user]);

  const validateVote = useCallback((voteData: VoteData) => {
    if (!voteData.pole) {
      toast.error('Debes seleccionar un piloto para la pole position');
      return false;
    }

    const filledPositions = voteData.positions.filter(p => p !== '');
    if (filledPositions.length !== 10) {
      toast.error('Debes completar las 10 posiciones');
      return false;
    }

    const uniquePositions = new Set(filledPositions);
    if (uniquePositions.size !== filledPositions.length) {
      toast.error('No puedes seleccionar el mismo piloto en múltiples posiciones del top 10');
      return false;
    }

    if (!voteData.crashPilot) {
      toast.error('Debes seleccionar un piloto que podría accidentarse');
      return false;
    }

    return true;
  }, []);

  const submitVote = useCallback(async (raceId: string, voteData: VoteData): Promise<boolean> => {
    if (!user || !validateVote(voteData)) return false;

    const race = races.find(r => r.id === raceId);
    if (!race) {
      toast.error('Carrera no encontrada');
      return false;
    }

    const now = new Date();
    const deadline = race.votingDeadline.toDate();
    
    if (now > deadline) {
      toast.error('El tiempo de votación para esta carrera ha expirado');
      return false;
    }

    setSubmitting(true);
    try {
      await createVote({
        userId: user.uid,
        raceId,
        pole: voteData.pole,
        positions: voteData.positions,
        crashPilot: voteData.crashPilot
      });
      
      toast.success('¡Voto registrado exitosamente!');
      return true;
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Error al registrar el voto');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [user, races, validateVote]);

  const getAvailablePilotsForPositions = useCallback((currentSelection?: string, voteData?: VoteData) => {
    if (!voteData) return pilots;
    
    const usedInPositions = new Set(
      voteData.positions.filter(p => p !== '' && p !== currentSelection)
    );
    
    return pilots.filter(pilot => !usedInPositions.has(pilot.id!));
  }, [pilots]);

  const canVoteForRace = useCallback(async (race: Race) => {
    const now = new Date();
    const deadline = race.votingDeadline.toDate();
    if (now > deadline) {
      return false;
    }

    if (user) {
      try {
        const existingVote = await getUserVoteForRace(user.uid, race.id!);
        if (existingVote) {
          return false; 
        }
      } catch (error) {
        console.error('Error checking existing vote:', error);
        return false; 
      }
    }

    return true;
  }, [user]);

  const isVotingClosed = useCallback((race: Race) => {
    const now = new Date();
    const deadline = race.votingDeadline.toDate();
    return now > deadline;
  }, []);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    races,
    pilots,
    loading,
    submitting,
    getExistingVote,
    submitVote,
    validateVote,
    getAvailablePilotsForPositions,
    canVoteForRace,
    isVotingClosed,
    refreshData
  };
};

export default useVoting;