import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle } from 'lucide-react';

interface RealDataIndicatorProps {
  isConnected: boolean;
  dataCount?: number;
}

export function RealDataIndicator({ isConnected, dataCount }: RealDataIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Database className="w-3 h-3" />
      <span>Données réelles</span>
      {isConnected ? (
        <Badge variant="default" className="text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connecté
        </Badge>
      ) : (
        <Badge variant="destructive" className="text-xs">
          Déconnecté
        </Badge>
      )}
      {dataCount !== undefined && (
        <span>({dataCount} analyses)</span>
      )}
    </div>
  );
}
