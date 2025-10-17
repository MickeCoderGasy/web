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
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Paramètres</span>
          {settings.selectedAnalysisId && (
            <Badge variant="default" className="ml-1 text-xs px-1 sm:px-2">
              <Target className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Analysé</span>
              <span className="sm:hidden">✓</span>
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] settings-modal">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Configuration du Chat IA</span>
            <span className="sm:hidden">Paramètres</span>
            {!settings.selectedAnalysisId && (
              <Badge variant="destructive" className="ml-2 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Analyse requise</span>
                <span className="sm:hidden">Requis</span>
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
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
