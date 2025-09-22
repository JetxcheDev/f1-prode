'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Race } from '@/lib/firestore';
import { Calendar, MapPin, Eye, EyeOff, Clock, CheckCircle, Flag } from 'lucide-react';

interface HistoricoCardProps {
  race: Race;
  canViewVotes: boolean;
  hasUserVoted: boolean;
  isVotingClosed: boolean;
  onViewVotes: (race: Race) => void;
  loading?: boolean;
}

export default function HistoricoCard({
  race,
  canViewVotes,
  hasUserVoted,
  isVotingClosed,
  onViewVotes,
  loading = false
}: HistoricoCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const raceDate = race.date.toDate();
  const votingDeadline = race.votingDeadline.toDate();
  const now = new Date();

  const getStatusBadge = () => {
    if (isVotingClosed) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Votación cerrada
        </Badge>
      );
    }
    
    if (hasUserVoted) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Ya votaste
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Votación abierta
      </Badge>
    );
  };

  const getViewVotesButtonText = () => {
    if (!canViewVotes) {
      return "No disponible";
    }
    return "Visualizar votos";
  };

  const getViewVotesButtonIcon = () => {
    return canViewVotes ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />;
  };

  const getAccessibilityMessage = () => {
    if (isVotingClosed) {
      return "Votación cerrada - Votos visibles para todos";
    }
    if (hasUserVoted) {
      return "Ya votaste - Puedes ver los votos";
    }
    return "Votación abierta - Vota primero para ver los demás votos";
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
                {raceDate.toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            <div className="text-xs text-muted-foreground">
              Límite: {votingDeadline.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {!canViewVotes ? (
            <div className="text-center py-4 text-muted-foreground">
              {getAccessibilityMessage()}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Votación completa - Votos disponibles
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              onClick={() => onViewVotes(race)}
              disabled={!canViewVotes || loading}
              variant={canViewVotes ? "default" : "outline"}
              className="min-w-[140px]"
            >
              {getViewVotesButtonIcon()}
              <span className="ml-2">{getViewVotesButtonText()}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}