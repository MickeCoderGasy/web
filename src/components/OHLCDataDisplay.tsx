import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { formatForUI } from '@/utils/dateUtils';

interface OHLCDataDisplayProps {
  ohlcData: {
    pair?: string;
    timestamp?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    timeframe?: string;
    // Format alternatif
    ticker?: string;
    date_utc?: string;
    o?: number;
    h?: number;
    l?: number;
    c?: number;
    v?: number;
    vw?: number;
    tf?: string;
  };
}

export function OHLCDataDisplay({ ohlcData }: OHLCDataDisplayProps) {
  // Mapper les propriétés selon le format reçu
  const pair = ohlcData.pair || ohlcData.ticker || 'N/A';
  const timestamp = ohlcData.timestamp || ohlcData.date_utc;
  const open = ohlcData.open || ohlcData.o;
  const high = ohlcData.high || ohlcData.h;
  const low = ohlcData.low || ohlcData.l;
  const close = ohlcData.close || ohlcData.c;
  const volume = ohlcData.volume || ohlcData.v;
  const timeframe = ohlcData.timeframe || ohlcData.tf;
  
  // Toujours afficher en UTC pour cohérence avec Grok
  const date = timestamp ? formatForUI(timestamp) : 'N/A';
  
  // Calculer le changement de prix
  const priceChange = (close && open) ? close - open : 0;
  const priceChangePercent = (open && priceChange !== 0) ? ((priceChange / open) * 100).toFixed(2) : '0.00';
  const isPositive = priceChange >= 0;

  console.log('📊 Affichage des données OHLC:', ohlcData);
  console.log('📊 Propriétés mappées:', { pair, timestamp, open, high, low, close, volume, timeframe });

  return (
    <Card className="glass-card border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChart3 className="w-4 h-4 text-primary" />
          Données OHLC Récentes
          <Badge variant="outline" className="text-xs">
            {pair}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Informations temporelles */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{date}</span>
          {timeframe && (
            <Badge variant="secondary" className="text-xs">
              {timeframe}
            </Badge>
          )}
        </div>

        {/* Données OHLC */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Open:</span>
              <span className="font-mono">{open ? open.toFixed(5) : 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">High:</span>
              <span className="font-mono text-green-600">{high ? high.toFixed(5) : 'N/A'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Low:</span>
              <span className="font-mono text-red-600">{low ? low.toFixed(5) : 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Close:</span>
              <span className="font-mono font-semibold">{close ? close.toFixed(5) : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Changement de prix */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className="text-sm font-medium">Changement</span>
          </div>
          <div className="text-right">
            <div className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{priceChange.toFixed(5)}
            </div>
            <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{priceChangePercent}%
            </div>
          </div>
        </div>

        {/* Volume si disponible */}
        {volume && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Volume:</span>
            <span className="font-mono">{volume.toLocaleString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
