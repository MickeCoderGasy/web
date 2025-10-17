// Composant pour afficher les statistiques du cache Grok
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Trash2, Database, Zap } from 'lucide-react';

interface CacheStats {
  totalEntries: number;
  totalTokensSaved: number;
  hitRate: number;
  lastCleanup: number;
}

interface CacheEntry {
  id: string;
  content: string;
  hash: string;
  timestamp: number;
  tokenCount?: number;
  type: 'analysis' | 'ohlc' | 'context' | 'conversation' | 'system_prompt';
}

interface GrokCacheStatsProps {
  grokService: any; // Type du service Grok
}

const GrokCacheStats: React.FC<GrokCacheStatsProps> = ({ grokService }) => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les statistiques du cache
  const loadCacheStats = async () => {
    try {
      setLoading(true);
      const cacheStats = grokService.getCacheStats();
      const cacheEntries = grokService.getAllCacheEntries();
      
      setStats(cacheStats);
      setEntries(cacheEntries);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques du cache:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nettoyer le cache
  const clearCache = () => {
    grokService.clearCache();
    loadCacheStats(); // Recharger les statistiques
  };

  // Formater la date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  // Formater la taille
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtenir la couleur du badge selon le type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'analysis': return 'bg-blue-500';
      case 'ohlc': return 'bg-green-500';
      case 'context': return 'bg-purple-500';
      case 'conversation': return 'bg-orange-500';
      case 'system_prompt': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculer la taille totale du cache
  const totalCacheSize = entries.reduce((total, entry) => {
    return total + (entry.content.length * 2); // Approximation en bytes
  }, 0);

  useEffect(() => {
    loadCacheStats();
  }, []);

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Chargement des statistiques du cache...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistiques principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Statistiques du Cache Grok
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
              <div className="text-sm text-gray-600">Entrées en cache</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalTokensSaved.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Tokens économisés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.hitRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Taux de réussite</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatSize(totalCacheSize)}</div>
              <div className="text-sm text-gray-600">Taille du cache</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={loadCacheStats} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button onClick={clearCache} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Vider le cache
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            Dernier nettoyage: {formatDate(stats.lastCleanup)}
          </div>
        </CardContent>
      </Card>

      {/* Détails des entrées du cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Entrées du Cache ({entries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Aucune entrée en cache
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {entries.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getTypeColor(entry.type)}>
                        {entry.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {entry.content.substring(0, 100)}...
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {entry.tokenCount?.toLocaleString() || 'N/A'} tokens
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatSize(entry.content.length * 2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GrokCacheStats;
