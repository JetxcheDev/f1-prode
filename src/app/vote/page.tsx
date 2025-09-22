'use client';

import React, { useState, useCallback } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import VoteCard from '@/components/VoteCard';
import VoteFormDialog from '@/components/VoteFormDialog';
import VoteDetailsDialog from '@/components/VoteDetailsDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingState } from '@/components/shared';
import { Clock, Trophy, Info } from 'lucide-react';
import { Race } from '@/lib/firestore';
import { useVoting } from '@/hooks';

export default function VotePage() {
  const { races, pilots, loading, getExistingVote, refreshData } = useVoting();
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [existingVote, setExistingVote] = useState<any>(null);
  const [isVoteFormOpen, setIsVoteFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleVoteClick = useCallback(async (race: Race, existingVoteData?: any) => {
    const vote = existingVoteData || await getExistingVote(race.id!);
    setSelectedRace(race);
    setExistingVote(vote || null);
    
    if (vote) {
      setIsDetailsOpen(true);
    } else {
      setIsVoteFormOpen(true);
    }
  }, [getExistingVote]);

  const handleCloseDialogs = useCallback(() => {
    setIsVoteFormOpen(false);
    setIsDetailsOpen(false);
    setSelectedRace(null);
    setExistingVote(null);
  }, []);

  const handleVoteSubmitted = useCallback(async () => {
    handleCloseDialogs();
    await refreshData();
  }, [refreshData]);

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-4 py-8">
          <LoadingState message="Cargando carreras disponibles..." />
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
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Votaciones</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Selecciona tus predicciones para las próximas carreras. Puedes votar hasta la fecha límite de cada carrera.
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="max-w-4xl mx-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Recuerda:</strong> Debes completar la pole position, el top 10 y seleccionar un piloto que podría accidentarse.
            Una vez enviado tu voto, <strong>NO podrás modificarlo.</strong>
          </AlertDescription>
        </Alert>

        {/* Races Grid */}
        {races.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay carreras disponibles</h3>
            <p className="text-muted-foreground">
              No hay carreras abiertas para votación en este momento.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {races.map((race) => (
              <VoteCard
                key={race.id}
                race={race}
                pilots={pilots}
                onVoteClick={(race, existingVote) => handleVoteClick(race, existingVote)}
              />
            ))}
          </div>
        )}

        {/* Vote Form Dialog */}
        {selectedRace && (
          <VoteFormDialog
            race={selectedRace}
            pilots={pilots}
            existingVote={existingVote}
            open={isVoteFormOpen}
            onOpenChange={handleCloseDialogs}
            onVoteSubmitted={handleVoteSubmitted}
          />
        )}

        {/* Vote Details Dialog */}
        {selectedRace && existingVote && (
          <VoteDetailsDialog
            race={selectedRace}
            pilots={pilots}
            existingVote={existingVote}
            open={isDetailsOpen}
            onOpenChange={handleCloseDialogs}
          />
        )}
      </div>
    </ProtectedLayout>
  );
}