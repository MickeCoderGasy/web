import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, TrendingUp } from 'lucide-react';

interface OHLCNoDataMessageProps {
  pair: string;
}

export function OHLCNoDataMessage({ pair }: OHLCNoDataMessageProps) {
  return (
    <Alert className="border-amber-500/20 bg-amber-500/5">
      <Info className="h-4 w-4 text-amber-500" />
      <AlertDescription className="text-amber-700">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span>
            Aucune donnée OHLC récente disponible pour <strong>{pair}</strong>.
            Le contexte sera enrichi avec les données d'analyse uniquement.
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
}
