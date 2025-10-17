import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, EyeOff, Bug, AlertCircle } from 'lucide-react';
import { AnalysisHistoryItem } from '@/services/analysisHistoryService';

interface AnalysisDebugInfoProps {
  analysis: AnalysisHistoryItem;
}

export function AnalysisDebugInfo({ analysis }: AnalysisDebugInfoProps) {
  const [showDebug, setShowDebug] = useState(false);

  if (!analysis.result) return null;

  return (
    <Card className="glass-card border-amber-500/20 bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bug className="w-4 h-4 text-amber-500" />
          Informations de Debug
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="ml-auto"
          >
            {showDebug ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDebug ? 'Masquer' : 'Afficher'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {showDebug && (
        <CardContent className="space-y-4">
          {/* Signal Mapping Debug */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Mapping du Signal
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Signal final:</span>
                <Badge variant={analysis.signal === 'BUY' ? 'default' : analysis.signal === 'SELL' ? 'destructive' : 'secondary'}>
                  {analysis.signal}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Confiance:</span>
                <span className="font-mono">{analysis.confidence}%</span>
              </div>
            </div>
          </div>

          {/* Raw Data */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Données Brutes</h4>
            <ScrollArea className="h-40 border rounded-lg p-2">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {JSON.stringify(analysis.result, null, 2)}
              </pre>
            </ScrollArea>
          </div>

          {/* Signal Metadata */}
          {analysis.result.signal_metadata && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Signal Metadata</h4>
              <ScrollArea className="h-32 border rounded-lg p-2">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {JSON.stringify(analysis.result.signal_metadata, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
