import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Send, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ContextSettings } from '@/config/grok-config';
import { useOHLCEnrichment } from '@/hooks/useOHLCEnrichment';

interface OHLCSendStatusProps {
  settings: ContextSettings;
}

export function OHLCSendStatus({ settings }: OHLCSendStatusProps) {
  const { isLoading, isEnriched, error, ohlcData, refresh } = useOHLCEnrichment(settings);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (isEnriched) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (error) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <TrendingUp className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Envoi des données OHLC...';
    if (isEnriched) return 'Données OHLC envoyées à Grok';
    if (error) return 'Erreur lors de l\'envoi';
    return 'Données OHLC non envoyées';
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (isEnriched) return 'default';
    if (error) return 'destructive';
    if (isLoading) return 'secondary';
    return 'outline';
  };

  return (
    <Card className="glass-card border-purple-500/20 bg-purple-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Send className="w-4 h-4 text-purple-500" />
          Statut d'Envoi OHLC
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="ml-auto"
          >
            {showDetails ? 'Masquer' : 'Détails'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Statut principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm">{getStatusText()}</span>
          </div>
          <Badge variant={getStatusVariant()} className="text-xs">
            {isLoading ? 'En cours' : isEnriched ? 'Envoyé' : error ? 'Erreur' : 'En attente'}
          </Badge>
        </div>

        {/* Bouton de rafraîchissement */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            Rafraîchir
          </Button>
        </div>

        {/* Détails */}
        {showDetails && (
          <div className="space-y-3">
            {/* Données OHLC si disponibles */}
            {ohlcData && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Données OHLC Envoyées</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Paire:</span>
                    <span className="ml-1 font-mono">{ohlcData.pair}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Close:</span>
                    <span className="ml-1 font-mono">{ohlcData.close}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Volume:</span>
                    <span className="ml-1 font-mono">{ohlcData.volume || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timeframe:</span>
                    <span className="ml-1 font-mono">{ohlcData.timeframe || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Erreur si présente */}
            {error && (
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-700">
                    <strong>Erreur:</strong> {error}
                  </span>
                </div>
              </div>
            )}

            {/* Logs de debug */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Logs de Debug</h4>
              <ScrollArea className="h-32 border rounded-lg p-2">
                <div className="text-xs text-muted-foreground">
                  <p>🔄 Vérifiez la console pour les logs détaillés</p>
                  <p>📊 Recherchez les messages "Enrichissement du contexte avec les données OHLC"</p>
                  <p>📈 Vérifiez "Contexte OHLC généré" pour voir les données</p>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
