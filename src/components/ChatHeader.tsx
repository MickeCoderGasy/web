import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Target, AlertCircle, History, Plus } from 'lucide-react';
import { SettingsModal } from '@/components/SettingsModal';
import { ContextSettings } from '@/config/grok-config';

interface ChatHeaderProps {
  isGrokConfigured: boolean;
  settings: ContextSettings;
  onSettingsChange: (settings: ContextSettings) => void;
  onSaveSettings: () => void;
  onShowHistory?: () => void;
  onNewSession?: () => void;
}

export function ChatHeader({
  isGrokConfigured,
  settings,
  onSettingsChange,
  onSaveSettings,
  onShowHistory,
  onNewSession
}: ChatHeaderProps) {
  const selectedAnalysis = settings.selectedAnalysisId;

  return (
    <div className="flex items-center justify-between p-2 sm:p-4 border-b border-border/50 chat-header">
      {/* Titre et statut - version mobile simplifiée */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-sm sm:text-lg truncate">
            <span className="hidden sm:inline">Qubext Trading Assistant</span>
            <span className="sm:hidden">Grok</span>
          </h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {selectedAnalysis ? (
              <Badge variant="default" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Contexte actif</span>
                <span className="sm:hidden">✓</span>
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Sélectionnez un contexte</span>
                <span className="sm:hidden">!</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Contrôles - version mobile compacte */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onShowHistory && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onShowHistory}
            title="Historique"
            className="w-7 h-7 sm:w-10 sm:h-10"
          >
            <History className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        )}
        
        {onNewSession && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewSession}
            title="Nouvelle conversation"
            className="w-7 h-7 sm:w-10 sm:h-10"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        )}
        
        <SettingsModal
          settings={settings}
          onSettingsChange={onSettingsChange}
          onSave={onSaveSettings}
        />
      </div>
    </div>
  );
}
