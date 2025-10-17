import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Target, AlertCircle } from 'lucide-react';
import { ContextSettingsComponent } from '@/components/ContextSettings';
import { ContextSettings } from '@/config/grok-config';

interface SettingsModalProps {
  settings: ContextSettings;
  onSettingsChange: (settings: ContextSettings) => void;
  onSave: () => void;
}

export function SettingsModal({ settings, onSettingsChange, onSave }: SettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSave();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Paramètres
          {settings.selectedAnalysisId && (
            <Badge variant="default" className="ml-1 text-xs">
              <Target className="w-3 h-3 mr-1" />
              Analysé
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl settings-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration du Chat IA
            {!settings.selectedAnalysisId && (
              <Badge variant="destructive" className="ml-2">
                <AlertCircle className="w-3 h-3 mr-1" />
                Analyse requise
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ContextSettingsComponent
            settings={settings}
            onSettingsChange={onSettingsChange}
            onSave={handleSave}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
