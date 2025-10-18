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
          size="icon" 
          className="w-7 h-7 sm:w-9 sm:h-9"
          title="Paramètres"
        >
          <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
          {settings.selectedAnalysisId && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] settings-modal">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Settings className="w-4 h-4" />
            <span>Configuration</span>
            {!settings.selectedAnalysisId && (
              <Badge variant="destructive" className="ml-2 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Requis
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
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
