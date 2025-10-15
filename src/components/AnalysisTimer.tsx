import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AnalysisTimerProps {
  isAnalyzing: boolean;
  className?: string;
}

export function AnalysisTimer({ 
  isAnalyzing, 
  className = "" 
}: AnalysisTimerProps) {
  if (!isAnalyzing) return null;

  return (
    <Card className={`glass-card border-primary/10 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <div>
            <h3 className="font-semibold text-sm">Analyse en cours</h3>
            <p className="text-xs text-muted-foreground">
              L'analyse prend généralement 4 minutes. Veuillez patienter...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
