'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flag, Trophy, AlertTriangle, Clock, Vote, Calendar, MapPin } from 'lucide-react';
import { Race, Pilot } from '@/lib/firestore';
import { useVoting } from '@/hooks';

interface VoteCardProps {
  race: Race;
  pilots: Pilot[];
  onVoteClick: (race: Race, existingVote?: any) => void;
}

const VoteCard: React.FC<VoteCardProps> = ({ race, pilots, onVoteClick }) => {
  const { getExistingVote, canVoteForRace, isVotingClosed } = useVoting();
  const [existingVote, setExistingVote] = useState<any>(null);
  const [canVote, setCanVote] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [race.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vote, canVoteResult] = await Promise.all([
        getExistingVote(race.id!),
        canVoteForRace(race)
      ]);
      setExistingVote(vote);
      setCanVote(canVoteResult);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPilotName = (pilotId: string) => {
    const pilot = pilots.find(p => p.id === pilotId);
    return pilot ? pilot.name : 'Piloto no encontrado';
  };

  const formatDate = (date: any) => {
    return date.toDate().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeadline = (date: any) => {
    return date.toDate().toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasVoted = !!existingVote;
  const votingClosed = isVotingClosed(race);

  const getStatusBadge = () => {
    if (votingClosed) {
      return <Badge variant="destructive" className="flex items-center gap-1"><Clock className="h-3 w-3" />Cerrado</Badge>;
    }
    if (hasVoted) {
      return <Badge variant="default" className="flex items-center gap-1"><Vote className="h-3 w-3" />Votado</Badge>;
    }
    if (canVote) {
      return <Badge variant="secondary" className="flex items-center gap-1"><Trophy className="h-3 w-3" />Disponible</Badge>;
    }
    return <Badge variant="outline">Pendiente</Badge>;
  };

  const getButtonText = () => {
    if (votingClosed || hasVoted) return 'Ver Voto';
    return 'Votar';
  };

  const getButtonVariant = () => {
    if (votingClosed || hasVoted) return 'outline' as const;
    return 'default' as const;
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flag className="h-5 w-5 text-blue-500" />
              {race.name}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {race.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(race.date)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            <div className="text-xs text-muted-foreground">
              Límite: {formatDeadline(race.votingDeadline)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {existingVote ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 font-medium text-yellow-600">
                      <Trophy className="h-4 w-4" />
                      Pole Position
                    </div>
                    <div className="text-muted-foreground">
                      {getPilotName(existingVote.pole)}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 font-medium text-green-600">
                      <Flag className="h-4 w-4" />
                      Top 3
                    </div>
                    <div className="text-muted-foreground">
                      {existingVote.positions.slice(0, 3).map((pilotId: string, index: number) => (
                        <div key={index} className="text-xs">
                          {index + 1}° {getPilotName(pilotId)}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 font-medium text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      Accidente
                    </div>
                    <div className="text-muted-foreground">
                      {getPilotName(existingVote.crashPilot)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {votingClosed ? 'No votaste en esta carrera' : 'Aún no has votado'}
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                onClick={() => onVoteClick(race, existingVote)}
                variant={getButtonVariant()}
                disabled={votingClosed && !hasVoted}
                className="min-w-[100px]"
              >
                {getButtonText()}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoteCard;