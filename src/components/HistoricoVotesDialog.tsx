'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Race, Pilot } from '@/lib/firestore';
import { Loader2, Trophy, Zap, AlertTriangle } from 'lucide-react';

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

interface HistoricoVotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  race: Race | null;
  pilots: Pilot[];
  votes: VoteWithUser[];
  loading: boolean;
}

export default function HistoricoVotesDialog({
  open,
  onOpenChange,
  race,
  pilots,
  votes,
  loading
}: HistoricoVotesDialogProps) {
  const [pilotMap, setPilotMap] = useState<Record<string, Pilot>>({});

  useEffect(() => {
    const map = pilots.reduce((acc, pilot) => {
      if (pilot.id) {
        acc[pilot.id] = pilot;
      }
      return acc;
    }, {} as Record<string, Pilot>);
    setPilotMap(map);
  }, [pilots]);

  const getPilotName = (pilotId: string) => {
    return pilotMap[pilotId]?.name || 'Piloto desconocido';
  };

  const getUserDisplayName = (vote: VoteWithUser) => {
    return vote.userDisplayName || vote.userEmail || 'Usuario desconocido';
  };

  if (!race) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Votos para {race.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Cargando votos...</span>
            </div>
          ) : votes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay votos registrados para esta carrera</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Total de votos: {votes.length}</h3>
                <Badge variant="outline">
                  {race.location} - {race.date.toDate().toLocaleDateString('es-ES')}
                </Badge>
              </div>
              
              {votes.map((vote, index) => (
                <Card key={vote.id || index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{getUserDisplayName(vote)}</span>
                      <Badge variant="secondary">Voto #{index + 1}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Pole Position */}
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Pole Position:</span>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {getPilotName(vote.pole)}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    {/* Top 10 Positions */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Top 10:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {vote.positions.map((pilotId, pos) => (
                          <div key={pos} className="flex items-center gap-2 text-sm">
                            <Badge 
                              variant={pos < 3 ? "default" : "secondary"}
                              className={`w-8 h-6 flex items-center justify-center ${
                                pos === 0 ? 'bg-yellow-500 hover:bg-yellow-600' :
                                pos === 1 ? 'bg-gray-400 hover:bg-gray-500' :
                                pos === 2 ? 'bg-amber-600 hover:bg-amber-700' :
                                'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {pos + 1}
                            </Badge>
                            <span>{getPilotName(pilotId)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Crash Pilot */}
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Piloto que podría accidentarse:</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {getPilotName(vote.crashPilot)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}