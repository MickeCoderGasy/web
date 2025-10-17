import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';

interface ModelSelectorProps {
  useGrok: boolean;
  onToggle: (useGrok: boolean) => void;
  isConfigured: boolean;
}

export function ModelSelector({ useGrok, onToggle, isConfigured }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">Modèle:</span>
      <div className="flex items-center gap-1">
        <Button
          variant={useGrok ? "default" : "outline"}
          size="sm"
          onClick={() => onToggle(true)}
          disabled={!isConfigured}
          className="flex items-center gap-1 text-xs h-8 px-2 sm:px-3"
        >
          <Zap className="w-3 h-3" />
          <span className="hidden sm:inline">Grok</span>
          <span className="sm:hidden">G</span>
          {!isConfigured && (
            <Badge variant="destructive" className="ml-1 text-xs px-1">
              !
            </Badge>
          )}
        </Button>
        <Button
          variant={!useGrok ? "default" : "outline"}
          size="sm"
          onClick={() => onToggle(false)}
          className="flex items-center gap-1 text-xs h-8 px-2 sm:px-3"
        >
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">Standard</span>
          <span className="sm:hidden">S</span>
        </Button>
      </div>
    </div>
  );
}
