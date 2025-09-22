'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Zap, TrendingUp } from 'lucide-react';
import { UserScore } from '@/types/common';

interface RankingCardProps {
  title: string;
  users: UserScore[];
  type: 'overall' | 'pole' | 'crash' | 'position';
  loading?: boolean;
}

const getRankingIcon = (type: string) => {
  switch (type) {
    case 'overall':
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 'pole':
      return <Target className="h-5 w-5 text-blue-500" />;
    case 'crash':
      return <Zap className="h-5 w-5 text-red-500" />;
    case 'position':
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    default:
      return <Trophy className="h-5 w-5" />;
  }
};

const getValueDisplay = (user: UserScore, type: string) => {
  switch (type) {
    case 'overall':
      return `${user.totalPoints} pts`;
    case 'pole':
      return `${user.poleAccuracy.toFixed(1)}%`;
    case 'crash':
      return `${user.crashAccuracy.toFixed(1)}%`;
    case 'position':
      return `${user.positionAccuracy.toFixed(1)}%`;
    default:
      return '';
  }
};

const getPositionBadge = (position: number) => {
  if (position === 1) {
    return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white">🥇 1°</Badge>;
  } else if (position === 2) {
    return <Badge variant="secondary" className="bg-gray-400 hover:bg-gray-500 text-white">🥈 2°</Badge>;
  } else if (position === 3) {
    return <Badge variant="secondary" className="bg-amber-600 hover:bg-amber-700 text-white">🥉 3°</Badge>;
  } else {
    return <Badge variant="outline">{position}°</Badge>;
  }
};

export default function RankingCard({ title, users, type, loading = false }: RankingCardProps) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getRankingIcon(type)}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 bg-gray-200 rounded"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getRankingIcon(type)}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay datos suficientes para mostrar este ranking</p>
            <p className="text-sm mt-1">Se necesitan más carreras completadas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getRankingIcon(type)}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user, index) => (
            <div
              key={user.userId}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                index < 3 ? 'bg-muted/30' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {getPositionBadge(index + 1)}
                <div className="flex flex-col">
                  <span className="font-medium text-sm">
                    {user.displayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.racesParticipated} carrera{user.racesParticipated !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">
                  {getValueDisplay(user, type)}
                </div>
                {type !== 'overall' && (
                  <div className="text-xs text-muted-foreground">
                    {type === 'pole' && `${user.poleHits}/${user.totalPoleVotes}`}
                    {type === 'crash' && `${user.crashHits}/${user.totalCrashVotes}`}
                    {type === 'position' && `${user.positionHits}/${user.totalPositionVotes}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}