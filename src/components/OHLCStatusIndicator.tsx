import { Badge } from '@/components/ui/badge';
import { TrendingUp, Wifi, WifiOff, Clock, AlertCircle } from 'lucide-react';
import { ContextSettings } from '@/config/grok-config';
import { useOHLCEnrichment } from '@/hooks/useOHLCEnrichment';

interface OHLCStatusIndicatorProps {
  settings: ContextSettings;
}

export function OHLCStatusIndicator({ settings }: OHLCStatusIndicatorProps) {
  const { isLoading, isEnriched, error, lastUpdate } = useOHLCEnrichment(settings);

  const ohlcStatus = !settings.selectedAnalysisId 
    ? 'disabled' 
    : isLoading 
    ? 'loading' 
    : isEnriched 
    ? 'connected' 
    : error && !error.includes('Aucune donnée OHLC disponible')
    ? 'error'
    : 'no-data';

  const getStatusIcon = () => {
    switch (ohlcStatus) {
      case 'loading':
        return <Clock className="w-3 h-3 animate-spin" />;
      case 'connected':
        return <Wifi className="w-3 h-3" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      case 'no-data':
        return <WifiOff className="w-3 h-3" />;
      default:
        return <WifiOff className="w-3 h-3" />;
    }
  };

  const getStatusText = () => {
    switch (ohlcStatus) {
      case 'loading':
        return 'Chargement OHLC...';
      case 'connected':
        return 'OHLC Enrichi';
      case 'error':
        return 'Erreur OHLC';
      case 'no-data':
        return 'Pas de données OHLC';
      default:
        return 'OHLC Désactivé';
    }
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (ohlcStatus) {
      case 'connected':
        return 'default';
      case 'error':
        return 'destructive';
      case 'loading':
        return 'secondary';
      case 'no-data':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusVariant()} className="flex items-center gap-1 text-xs">
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
      
      {lastUpdate && ohlcStatus === 'connected' && (
        <span className="text-xs text-muted-foreground">
          {lastUpdate.toLocaleTimeString()}
        </span>
      )}
      
      {ohlcStatus === 'connected' && (
        <TrendingUp className="w-3 h-3 text-green-500" />
      )}
    </div>
  );
}
