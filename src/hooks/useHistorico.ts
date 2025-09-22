import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getAllRaces, getAllPilots, getVotesForRace, getUserVoteForRace, getAllUsers, Race, Pilot, Vote, UserProfile } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface VoteWithUser extends Vote {
  userDisplayName?: string;
  userEmail?: string;
}

interface UseHistoricoReturn {
  races: Race[];
  pilots: Pilot[];
  users: UserProfile[];
  loading: boolean;
  getExistingVote: (raceId: string) => Promise<any>;
  getAllVotesForRace: (raceId: string) => Promise<VoteWithUser[]>;
  canViewVotes: (race: Race) => Promise<boolean>;
  isVotingClosed: (race: Race) => boolean;
  refreshData: () => Promise<void>;
}

export const useHistorico = (): UseHistoricoReturn => {
  const { user } = useAuth();
  const [races, setRaces] = useState<Race[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [racesData, pilotsData, usersData] = await Promise.all([
        getAllRaces(),
        getAllPilots(),
        getAllUsers()
      ]);
      
      // Ordenar carreras por fecha descendente (más recientes primero)
      const sortedRaces = racesData.sort((a, b) => {
        const dateA = a.date.toDate();
        const dateB = b.date.toDate();
        return dateB.getTime() - dateA.getTime();
      });
      
      setRaces(sortedRaces);
      setPilots(pilotsData.filter(pilot => pilot.active));
      setUsers(usersData);
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

  const getAllVotesForRace = useCallback(async (raceId: string): Promise<VoteWithUser[]> => {
    try {
      const votes = await getVotesForRace(raceId);
      
      // Enriquecer los votos con información del usuario
      const votesWithUser = votes.map(vote => {
        const userProfile = users.find(u => u.uid === vote.userId);
        return {
          ...vote,
          userDisplayName: userProfile?.displayName,
          userEmail: userProfile?.email
        };
      });
      
      return votesWithUser;
    } catch (error) {
      console.error('Error getting votes for race:', error);
      toast.error('Error al obtener los votos de la carrera');
      return [];
    }
  }, [users]);

  const canViewVotes = useCallback(async (race: Race): Promise<boolean> => {
    if (!user) return false;
    
    const now = new Date();
    const deadline = race.votingDeadline.toDate();
    
    // Si ya pasó el tiempo de votación, siempre se puede ver
    if (now > deadline) {
      return true;
    }
    
    // Si no ha pasado el tiempo, solo se puede ver si ya se votó
    try {
      const existingVote = await getUserVoteForRace(user.uid, race.id!);
      return existingVote !== null;
    } catch (error) {
      console.error('Error checking existing vote:', error);
      return false;
    }
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
    users,
    loading,
    getExistingVote,
    getAllVotesForRace,
    canViewVotes,
    isVotingClosed,
    refreshData
  };
};

export default useHistorico;