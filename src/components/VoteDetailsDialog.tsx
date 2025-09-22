'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trophy, Flag, AlertTriangle, Calendar, MapPin, Clock } from 'lucide-react';
import { Race, Pilot } from '@/lib/firestore';

interface VoteDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  race: Race | null;
  pilots: Pilot[];
  existingVote: any;
}

const VoteDetailsDialog: React.FC<VoteDetailsDialogProps> = ({
  open,
  onOpenChange,
  race,
  pilots,
  existingVote
}) => {
  if (!race || !existingVote) return null;

  const getPilotName = (pilotId: string) => {
    const pilot = pilots.find(p => p.id === pilotId);
    return pilot ? pilot.name : 'Piloto no encontrado';
  };

  const formatDate = (date: any) => {
    return date.toDate().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeadline = (date: any) => {
    return date.toDate().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-blue-500" />
            {race.name}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {race.location}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(race.date)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Límite: {formatDeadline(race.votingDeadline)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pole Position */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Pole Position</h3>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  P1
                </Badge>
                <span className="font-medium">{getPilotName(existingVote.pole)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Top 10 Positions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Top 10</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {existingVote.positions.map((pilotId: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Badge 
                    variant="secondary" 
                    className={`min-w-[2.5rem] justify-center ${
                      index < 3 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}
                  >
                    P{index + 1}
                  </Badge>
                  <span className="font-medium">{getPilotName(pilotId)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Crash Pilot */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold">Piloto que podría accidentarse</h3>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Accidente
                </Badge>
                <span className="font-medium">{getPilotName(existingVote.crashPilot)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoteDetailsDialog;