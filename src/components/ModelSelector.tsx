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
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Modèle:</span>
      <div className="flex items-center gap-1">
        <Button
          variant={useGrok ? "default" : "outline"}
          size="sm"
          onClick={() => onToggle(true)}
          disabled={!isConfigured}
          className="flex items-center gap-1 text-xs model-button"
        >
          <Zap className="w-3 h-3" />
          Grok
          {!isConfigured && (
            <Badge variant="destructive" className="ml-1 text-xs">
              !
            </Badge>
          )}
        </Button>
        <Button
          variant={!useGrok ? "default" : "outline"}
          size="sm"
          onClick={() => onToggle(false)}
          className="flex items-center gap-1 text-xs model-button"
        >
          <Sparkles className="w-3 h-3" />
          Standard
        </Button>
      </div>
    </div>
  );
}
