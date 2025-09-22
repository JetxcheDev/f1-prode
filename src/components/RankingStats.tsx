'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, Target, Zap } from 'lucide-react';
import { RankingStats as RankingStatsType } from '@/types/common';

interface RankingStatsProps {
  rankings: RankingStatsType;
  loading?: boolean;
}

export default function RankingStats({ rankings, loading = false }: RankingStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardTitle>
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  console.log("TODOS LOS USUARIOS: ", rankings)

  const totalParticipants = rankings.allUsers.filter(user => user.hasVoted).length;

  const topOverallUser = rankings.topOverall[0];
  const topPoleUser = rankings.topPoleAccuracy[0];
  const topCrashUser = rankings.topCrashAccuracy[0];

  const stats = [
    {
      title: "Participantes Activos",
      value: totalParticipants,
      description: "usuarios con votos",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Líder General",
      value: topOverallUser?.totalPoints || 0,
      description: topOverallUser?.displayName || "Sin datos",
      icon: Trophy,
      color: "text-yellow-600"
    },
    {
      title: "Mejor en Pole",
      value: topPoleUser ? `${topPoleUser.poleAccuracy.toFixed(1)}%` : "0%",
      description: topPoleUser?.displayName || "Sin datos",
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Mejor en Crashes",
      value: topCrashUser ? `${topCrashUser.crashAccuracy.toFixed(1)}%` : "0%",
      description: topCrashUser?.displayName || "Sin datos",
      icon: Zap,
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground truncate">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}