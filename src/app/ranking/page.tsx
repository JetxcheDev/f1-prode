'use client';

import { useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import RankingCard from '@/components/RankingCard';
import RankingStats from '@/components/RankingStats';
import { useRanking } from '@/hooks/useRanking';
import { Button } from '@/components/ui/button';
import { Loader2, Trophy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function RankingPage() {
  const { rankings, loading, error, refreshData } = useRanking();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      toast.success('Rankings actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los rankings');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-3 text-lg">Cargando rankings...</span>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">Error al cargar rankings</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Reintentar
            </Button>
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
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Rankings F1 - 2025</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubre quiénes son los mejores pronosticadores de la temporada. 
            Rankings basados en carreras completadas con resultados oficiales.
          </p>
        </div>

        {/* Stats Overview */}
        <RankingStats rankings={rankings} loading={loading} />

        {/* Rankings Grid */}
        <div className="grid gap-6 lg:grid-cols-2 max-w-7xl mx-auto">
          {/* Ranking General */}
          <RankingCard
            title="🏆 Ranking General"
            users={rankings.topOverall}
            type="overall"
            loading={loading}
          />

          {/* Mejor en Pole Position */}
          <RankingCard
            title="🎯 Mejor en Pole Position"
            users={rankings.topPoleAccuracy}
            type="pole"
            loading={loading}
          />

          {/* Mejor en Piloto Accidentado */}
          <RankingCard
            title="⚡ Mejor en Piloto Accidentado"
            users={rankings.topCrashAccuracy}
            type="crash"
            loading={loading}
          />

          {/* Mejor en Posiciones */}
          <RankingCard
            title="📈 Mejor en Posiciones Top 10"
            users={rankings.topPositionAccuracy}
            type="position"
            loading={loading}
          />
        </div>

        {/* Info Footer */}
        <div className="text-center mt-8 p-4 bg-muted/30 rounded-lg max-w-4xl mx-auto">
          <h3 className="font-semibold mb-2">¿Cómo funcionan los rankings?</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Ranking General:</strong> Suma total de puntos obtenidos en todas las carreras completadas.</p>
            <p><strong>Pole Position:</strong> Porcentaje de aciertos en predicciones de pole position.</p>
            <p><strong>Piloto Accidentado:</strong> Porcentaje de aciertos en predicciones de piloto que se accidenta.</p>
            <p><strong>Posiciones Top 10:</strong> Porcentaje de aciertos en predicciones de posiciones del top 10.</p>
            <p className="mt-2 text-xs">
              * Los rankings de precisión requieren un mínimo de participaciones para aparecer.
            </p>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}