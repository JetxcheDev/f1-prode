'use client';

import { useState, useCallback, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import HistoricoCard from '@/components/HistoricoCard';
import HistoricoVotesDialog from '@/components/HistoricoVotesDialog';
import { useHistorico } from '@/hooks/useHistorico';
import { Race } from '@/lib/firestore';
import { Loader2, History } from 'lucide-react';

interface VoteWithUser {
  id?: string;
  userId: string;
  raceId: string;
  pole: string;
  positions: string[];
  crashPilot: string;
  userDisplayName?: string;
  userEmail?: string;
}

export default function HistoricoPage() {
  const {
    races,
    pilots,
    loading,
    getExistingVote,
    getAllVotesForRace,
    canViewVotes,
    isVotingClosed
  } = useHistorico();

  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogVotes, setDialogVotes] = useState<VoteWithUser[]>([]);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [raceVoteStatus, setRaceVoteStatus] = useState<Record<string, { canView: boolean; hasVoted: boolean }>>({});

  const handleViewVotes = useCallback(async (race: Race) => {
    if (!race.id) return;
    
    setSelectedRace(race);
    setDialogOpen(true);
    setDialogLoading(true);
    
    try {
      const votes = await getAllVotesForRace(race.id);
      setDialogVotes(votes);
    } catch (error) {
      console.error('Error loading votes:', error);
      setDialogVotes([]);
    } finally {
      setDialogLoading(false);
    }
  }, [getAllVotesForRace]);

  // Cargar el estado de votación para cada carrera
  const loadRaceVoteStatus = useCallback(async () => {
    const statusMap: Record<string, { canView: boolean; hasVoted: boolean }> = {};
    
    for (const race of races) {
      if (race.id) {
        const [canView, existingVote] = await Promise.all([
          canViewVotes(race),
          getExistingVote(race.id)
        ]);
        
        statusMap[race.id] = {
          canView,
          hasVoted: existingVote !== null
        };
      }
    }
    
    setRaceVoteStatus(statusMap);
  }, [races, canViewVotes, getExistingVote]);

  // Cargar estado cuando cambien las carreras
  useEffect(() => {
    if (races.length > 0) {
      loadRaceVoteStatus();
    }
  }, [races.length, loadRaceVoteStatus]);

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-3 text-lg">Cargando histórico...</span>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Histórico de Carreras</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Consulta el historial completo de carreras y visualiza los votos de todos los usuarios.
          </p>
        </div>

        {/* Races Grid */}
        {races.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay carreras disponibles</h3>
            <p className="text-muted-foreground">
              Cuando se agreguen carreras al sistema, aparecerán aquí.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">
                Mostrando {races.length} carrera{races.length !== 1 ? 's' : ''} • 
                Ordenadas por fecha (más recientes primero)
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {races.map((race) => {
                const raceStatus = race.id ? raceVoteStatus[race.id] : { canView: false, hasVoted: false };
                
                return (
                  <HistoricoCard
                    key={race.id}
                    race={race}
                    canViewVotes={raceStatus?.canView || false}
                    hasUserVoted={raceStatus?.hasVoted || false}
                    isVotingClosed={isVotingClosed(race)}
                    onViewVotes={handleViewVotes}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Dialog */}
        <HistoricoVotesDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          race={selectedRace}
          pilots={pilots}
          votes={dialogVotes}
          loading={dialogLoading}
        />
      </div>
    </ProtectedLayout>
  );
}