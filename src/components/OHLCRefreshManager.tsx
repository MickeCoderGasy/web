// Composant pour gérer le rafraîchissement des données OHLC
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Trash2, Database, AlertCircle } from 'lucide-react';

interface OHLCRefreshManagerProps {
  grokService: any; // Type du service Grok
}

const OHLCRefreshManager: React.FC<OHLCRefreshManagerProps> = ({ grokService }) => {
  const [pair, setPair] = useState('XAU/USD');
  const [analysisDateTime, setAnalysisDateTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [cacheEntries, setCacheEntries] = useState<any[]>([]);

  // Charger les entrées du cache OHLC
  const loadCacheEntries = () => {
    const entries = grokService.getAllCacheEntries();
    const ohlcEntries = entries.filter(entry => entry.type === 'ohlc');
    setCacheEntries(ohlcEntries);
  };

  // Rafraîchir les données OHLC
  const refreshOHLCData = async () => {
    if (!pair || !analysisDateTime) {
      alert('Veuillez saisir la paire et la date d\'analyse');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Rafraîchissement des données OHLC...');
      
      const result = await grokService.refreshOHLCData(pair, analysisDateTime);
      
      setLastRefresh(new Date().toLocaleString('fr-FR'));
      loadCacheEntries();
      
      console.log('✅ Données OHLC rafraîchies:', result.substring(0, 100) + '...');
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
      alert('Erreur lors du rafraîchissement des données OHLC');
    } finally {
      setLoading(false);
    }
  };

  // Invalider le cache OHLC
  const invalidateCache = () => {
    if (!pair) {
      alert('Veuillez saisir la paire');
      return;
    }

    const removedCount = grokService.invalidateOHLCCache(pair, analysisDateTime);
    loadCacheEntries();
    
    console.log(`🗑️ ${removedCount} entrées supprimées du cache`);
  };

  // Formater la date pour l'input
  const formatDateTimeForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  // Initialiser avec la date actuelle
  React.useEffect(() => {
    if (!analysisDateTime) {
      setAnalysisDateTime(formatDateTimeForInput(new Date()));
    }
    loadCacheEntries();
  }, []);

  return (
    <div className="space-y-4">
      {/* Contrôles de rafraîchissement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Rafraîchissement des Données OHLC
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pair">Paire de trading</Label>
              <Input
                id="pair"
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                placeholder="XAU/USD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="datetime">Date d'analyse</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={analysisDateTime}
                onChange={(e) => setAnalysisDateTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={refreshOHLCData} 
              disabled={loading || !pair || !analysisDateTime}
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Rafraîchir les données OHLC
            </Button>
            <Button 
              onClick={invalidateCache} 
              variant="destructive"
              disabled={!pair}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Invalider le cache
            </Button>
          </div>

          {lastRefresh && (
            <div className="text-sm text-gray-600">
              Dernier rafraîchissement: {lastRefresh}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entrées du cache OHLC */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Entrées OHLC en Cache ({cacheEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cacheEntries.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              Aucune donnée OHLC en cache
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cacheEntries.map((entry, index) => {
                const keyParts = entry.id.split(':');
                const pairFromKey = keyParts[1]?.split('|')[0] || 'N/A';
                const dateFromKey = keyParts[1]?.split('|')[1] || 'N/A';
                
                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-green-500">
                          OHLC
                        </Badge>
                        <span className="text-sm font-medium">{pairFromKey}</span>
                        <span className="text-xs text-gray-500">{dateFromKey}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {entry.tokenCount?.toLocaleString() || 'N/A'} tokens
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(entry.content.length / 1024)} KB
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations sur le rafraîchissement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Informations sur le Rafraîchissement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Rafraîchissement automatique:</span>
            <Badge variant="secondary">Désactivé</Badge>
          </div>
          <div className="flex justify-between">
            <span>Cache OHLC:</span>
            <Badge variant="secondary">Actif</Badge>
          </div>
          <div className="flex justify-between">
            <span>Données en temps réel:</span>
            <Badge variant="secondary">Oui</Badge>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            💡 Les données OHLC sont toujours récupérées fraîches et mises à jour dans le cache.
            Le rafraîchissement manuel permet de forcer la mise à jour.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OHLCRefreshManager;
