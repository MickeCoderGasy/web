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
    date?: string;
    time?: string;
    datetime?: string;
    o?: number;
    h?: number;
    l?: number;
    c?: number;
    v?: number;
    vw?: number;
    tf?: string;
  }[];
}

export function OHLCDataDisplay({ ohlcData }: OHLCDataDisplayProps) {
  console.log('📊 Affichage des données OHLC multiples:', ohlcData);
  console.log('📊 Nombre de données:', ohlcData?.length || 0);

  if (!ohlcData || !Array.isArray(ohlcData) || ohlcData.length === 0) {
    return (
      <Card className="glass-card border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Aucune donnée OHLC disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Trier par timestamp (plus récent en premier)
  const sortedData = [...ohlcData].sort((a, b) => {
    const timestampA = new Date(a.timestamp || a.date_utc || a.date || a.time || a.datetime).getTime();
    const timestampB = new Date(b.timestamp || b.date_utc || b.date || b.time || b.datetime).getTime();
    return timestampB - timestampA;
  });

  // Prendre la première donnée (la plus récente) pour les infos générales
  const latestData = sortedData[0];
  const pair = latestData.pair || latestData.ticker || 'N/A';
  const timeframe = 'M1';

  return (
    <Card className="glass-card border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChart3 className="w-4 h-4 text-primary" />
          Données OHLC M1 ({sortedData.length} bougies)
          <Badge variant="outline" className="text-xs">
            {pair}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Informations générales */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{sortedData.length} bougies M1</span>
          <Badge variant="secondary" className="text-xs">
            {timeframe}
          </Badge>
        </div>

        {/* Affichage des bougies (limité aux 5 plus récentes) */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedData.slice(0, 5).map((item, index) => {
            const timestamp = item.timestamp || item.date_utc || item.date || item.time || item.datetime;
            const open = item.open || item.o;
            const high = item.high || item.h;
            const low = item.low || item.l;
            const close = item.close || item.c;
            const volume = item.volume || item.v;
            
            const date = timestamp ? formatForUI(timestamp) : 'N/A';
            const priceChange = (close && open) ? close - open : 0;
            const priceChangePercent = (open && priceChange !== 0) ? ((priceChange / open) * 100).toFixed(2) : '0.00';
            const isPositive = priceChange >= 0;

            return (
              <div key={index} className="p-2 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Bougie #{index + 1}</span>
                  <span className="text-xs text-muted-foreground">{date}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">O:</span>
                    <span className="font-mono">{open ? open.toFixed(5) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">H:</span>
                    <span className="font-mono text-green-600">{high ? high.toFixed(5) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">L:</span>
                    <span className="font-mono text-red-600">{low ? low.toFixed(5) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">C:</span>
                    <span className="font-mono font-semibold">{close ? close.toFixed(5) : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-3 h-3 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-xs">Changement:</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{priceChange.toFixed(5)}
                    </div>
                    <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{priceChangePercent}%
                    </div>
                  </div>
                </div>

                {volume && (
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Volume:</span>
                    <span className="font-mono">{volume.toLocaleString()}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sortedData.length > 5 && (
          <div className="text-center text-xs text-muted-foreground">
            ... et {sortedData.length - 5} autres bougies
          </div>
        )}
      </CardContent>
    </Card>
  );
}
