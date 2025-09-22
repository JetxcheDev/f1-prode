import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getAllRaces,
  getAllUsers,
  getAllResults,
  getVotesForRace,
  getScoringConfig,
  getAllVotes
} from '@/lib/firestore';
import { UserScore, RankingStats, UseRankingReturn } from '@/types/common';

export const useRanking = (): UseRankingReturn => {
  const [rankings, setRankings] = useState<RankingStats>({
    topOverall: [],
    topPoleAccuracy: [],
    topCrashAccuracy: [],
    topPositionAccuracy: [],
    allUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateUserScores = useCallback(async (): Promise<UserScore[]> => {
    try {
      // Obtener todos los datos necesarios
      const [races, users, results, votes, scoringConfig] = await Promise.all([
        getAllRaces(),
        getAllUsers(),
        getAllResults(),
        getAllVotes(),
        getScoringConfig()
      ]);


      const scoring = {
        polePoints: scoringConfig?.polePoints || 0,
        position1Points: scoringConfig?.position1Points || 0,
        position2Points: scoringConfig?.position2Points || 0,
        position3Points: scoringConfig?.position3Points || 0,
        position4to10Points: scoringConfig?.position4to10Points || 0,
        crashPoints: scoringConfig?.crashPoints || 0
      }

      // Filtrar carreras completadas que tienen resultados
      const completedRaces = races.filter(race => {
        const now = new Date();
        const deadline = race.votingDeadline.toDate();
        return now > deadline && results.some(result => result.raceId === race.id);
      });

      // Obtener todas las carreras para contar participantes activos
      const allRaces = races;

      // Inicializar scores de usuarios
      const userScores: Map<string, UserScore> = new Map();

      users.forEach(user => {
        userScores.set(user.uid, {
          userId: user.uid,
          displayName: user.displayName || 'Usuario',
          totalPoints: 0,
          poleAccuracy: 0,
          crashAccuracy: 0,
          positionAccuracy: 0,
          racesParticipated: 0,
          poleHits: 0,
          crashHits: 0,
          positionHits: 0,
          totalPoleVotes: 0,
          totalCrashVotes: 0,
          totalPositionVotes: 0,
          hasVoted: false // Agregar flag para saber si ha votado en alguna carrera
        });
      });

      // Primero, contar participantes activos (usuarios que han votado en cualquier carrera)
      for (const race of allRaces) {
        const votes = await getVotesForRace(race.id!);

        votes.forEach(vote => {
          const userScore = userScores.get(vote.userId);
          if (userScore) {
            userScore.hasVoted = true;
          }
        });
      }

      // Calcular puntos para cada carrera completada
      for (const race of completedRaces) {
        const raceResult = results.find(result => result.raceId === race.id);
        if (!raceResult) continue;

        const votes = await getVotesForRace(race.id!);

        votes.forEach(vote => {
          const userScore = userScores.get(vote.userId);
          if (!userScore) return;

          userScore.racesParticipated++;
          userScore.totalPoleVotes++;
          userScore.totalCrashVotes++;
          userScore.totalPositionVotes += 10;

          // Calcular puntos por pole position
          if (vote.pole === raceResult.pole) {
            userScore.poleHits++;
            userScore.totalPoints += scoring.polePoints;
          }

          // Calcular puntos por piloto accidentado
          if (vote.crashPilot === raceResult.crashPilot) {
            userScore.crashHits++;
            userScore.totalPoints += scoring.crashPoints;
          }

          // Calcular puntos por posiciones
          vote.positions.forEach((votedPilot, votedPosition) => {
            if (!votedPilot) return;

            const actualPosition = raceResult.positions.indexOf(votedPilot);


            // Solo dar puntos si el piloto terminó exactamente en la posición votada
            if (actualPosition === votedPosition) {
              userScore.positionHits++;

              // Asignar puntos según la posición acertada
              if (actualPosition === 0) {
                userScore.totalPoints += scoring.position1Points;
              } else if (actualPosition === 1) {
                userScore.totalPoints += scoring.position2Points;
              } else if (actualPosition === 2) {
                userScore.totalPoints += scoring.position3Points;
              } else if (actualPosition >= 3 && actualPosition <= 9) {
                userScore.totalPoints += scoring.position4to10Points;
              }
            }
          });
        });
      }

      // Calcular porcentajes de acierto
      userScores.forEach(score => {
        score.poleAccuracy = score.totalPoleVotes > 0 ? (score.poleHits / score.totalPoleVotes) * 100 : 0;
        score.crashAccuracy = score.totalCrashVotes > 0 ? (score.crashHits / score.totalCrashVotes) * 100 : 0;
        score.positionAccuracy = score.totalPositionVotes > 0 ? (score.positionHits / score.totalPositionVotes) * 100 : 0;
      });

      const allUserScores = Array.from(userScores.values());
      const filteredUserScores = allUserScores.filter(score => score.hasVoted);

      return filteredUserScores;
    } catch (error) {
      console.error('Error calculating user scores:', error);
      throw error;
    }
  }, []);

  const loadRankings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userScores = await calculateUserScores();

      // Crear diferentes rankings
      const topOverall = [...userScores]
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 10);

      const topPoleAccuracy = [...userScores]
        .filter(score => score.totalPoleVotes >= 1) // Mínimo 1 votos para aparecer en ranking
        .sort((a, b) => b.poleAccuracy - a.poleAccuracy)
        .slice(0, 10);

      const topCrashAccuracy = [...userScores]
        .filter(score => score.totalCrashVotes >= 1) // Mínimo 1 votos para aparecer en ranking
        .sort((a, b) => b.crashAccuracy - a.crashAccuracy)
        .slice(0, 10);

      const topPositionAccuracy = [...userScores]
        .filter(score => score.totalPositionVotes >= 1) // Mínimo 30 votos de posición para aparecer en ranking
        .sort((a, b) => b.positionAccuracy - a.positionAccuracy)
        .slice(0, 10);

      setRankings({
        topOverall,
        topPoleAccuracy,
        topCrashAccuracy,
        topPositionAccuracy,
        allUsers: userScores // Agregar todos los usuarios calculados
      });
    } catch (err) {
      const errorMessage = 'Error al cargar los rankings';
      console.error('Error loading rankings:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [calculateUserScores]);

  const refreshData = useCallback(async () => {
    await loadRankings();
  }, [loadRankings]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  return {
    rankings,
    loading,
    error,
    refreshData
  };
};