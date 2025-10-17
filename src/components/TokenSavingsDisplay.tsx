// Composant pour afficher les économies de tokens réalisées
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Zap, Database } from 'lucide-react';

interface TokenSavingsDisplayProps {
  grokService: any; // Type du service Grok
}

const TokenSavingsDisplay: React.FC<TokenSavingsDisplayProps> = ({ grokService }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Charger les statistiques
  const loadStats = async () => {
    try {
      setLoading(true);
      const cacheStats = grokService.getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les économies estimées
  const calculateSavings = () => {
    if (!stats) return { tokens: 0, cost: 0, percentage: 0 };
    
    // Estimation du coût par token (exemple: $0.0001 par token)
    const costPerToken = 0.0001;
    const estimatedCost = stats.totalTokensSaved * costPerToken;
    const percentage = stats.totalEntries > 0 ? (stats.totalTokensSaved / (stats.totalTokensSaved + 1000)) * 100 : 0;
    
    return {
      tokens: stats.totalTokensSaved,
      cost: estimatedCost,
      percentage: Math.min(percentage, 100)
    };
  };

  // Formater la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  // Formater les nombres
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  useEffect(() => {
    loadStats();
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Database className="h-4 w-4 animate-spin mr-2" />
            Chargement des économies...
          </div>
        </CardContent>
      </Card>
    );
  }

  const savings = calculateSavings();

  return (
    <div className="space-y-4">
      {/* Économies principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Économies de Tokens Réalisées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {formatNumber(savings.tokens)}
              </div>
              <div className="text-sm text-gray-600">Tokens économisés</div>
              <Badge variant="secondary" className="mt-2">
                <Zap className="h-3 w-3 mr-1" />
                {savings.percentage.toFixed(1)}% d'économie
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(savings.cost)}
              </div>
              <div className="text-sm text-gray-600">Coût économisé</div>
              <Badge variant="secondary" className="mt-2">
                <DollarSign className="h-3 w-3 mr-1" />
                Estimation
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalEntries}
              </div>
              <div className="text-sm text-gray-600">Entrées en cache</div>
              <Badge variant="secondary" className="mt-2">
                <Database className="h-3 w-3 mr-1" />
                Actives
              </Badge>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Efficacité du cache</span>
              <span>{savings.percentage.toFixed(1)}%</span>
            </div>
            <Progress value={savings.percentage} className="h-2" />
          </div>

          {/* Détails des économies */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-gray-700">Taux de réussite</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.hitRate.toFixed(1)}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-gray-700">Dernier nettoyage</div>
              <div className="text-sm text-gray-600">
                {new Date(stats.lastCleanup).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projections d'économies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Projections d'Économies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(savings.cost * 7)}
              </div>
              <div className="text-sm text-gray-600">Par semaine</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(savings.cost * 30)}
              </div>
              <div className="text-sm text-gray-600">Par mois</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(savings.cost * 365)}
              </div>
              <div className="text-sm text-gray-600">Par an</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenSavingsDisplay;
