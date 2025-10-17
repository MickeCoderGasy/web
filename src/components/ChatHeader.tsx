import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Sparkles, Target, AlertCircle, History, Plus } from 'lucide-react';
import { ModelSelector } from '@/components/ModelSelector';
import { SettingsModal } from '@/components/SettingsModal';
import { ContextSettings } from '@/config/grok-config';

interface ChatHeaderProps {
  useGrok: boolean;
  onToggleModel: (useGrok: boolean) => void;
  isGrokConfigured: boolean;
  settings: ContextSettings;
  onSettingsChange: (settings: ContextSettings) => void;
  onSaveSettings: () => void;
  onShowHistory?: () => void;
  onNewSession?: () => void;
}

export function ChatHeader({
  useGrok,
  onToggleModel,
  isGrokConfigured,
  settings,
  onSettingsChange,
  onSaveSettings,
  onShowHistory,
  onNewSession
}: ChatHeaderProps) {
  const selectedAnalysis = settings.selectedAnalysisId;

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/50 chat-header">
      {/* Titre et statut */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          {useGrok ? <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-primary" /> : <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-sm sm:text-lg truncate">
            <span className="hidden sm:inline">
              {useGrok ? "Qubext Trading Assistant" : "AI Trading Assistant"}
            </span>
            <span className="sm:hidden">
              {useGrok ? "Grok" : "AI"}
            </span>
          </h2>
          <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground flex-wrap">
            {useGrok ? (
              <>
                <span className="hidden sm:inline">Powered by AI with context</span>
                <span className="sm:hidden">Grok</span>
                {selectedAnalysis && (
                  <Badge variant="default" className="text-xs flex-shrink-0">
                    <Target className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Analyse sélectionnée</span>
                    <span className="sm:hidden">Analysé</span>
                  </Badge>
                )}
                {!selectedAnalysis && (
                  <Badge variant="destructive" className="text-xs flex-shrink-0">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Sélectionnez une analyse</span>
                    <span className="sm:hidden">Requis</span>
                  </Badge>
                )}
              </>
            ) : (
              <span className="hidden sm:inline">Powered by advanced AI</span>
            )}
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <ModelSelector
          useGrok={useGrok}
          onToggle={onToggleModel}
          isConfigured={isGrokConfigured}
        />
        
        {onShowHistory && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onShowHistory}
            title="Historique des conversations"
            className="w-8 h-8 sm:w-10 sm:h-10"
          >
            <History className="w-4 h-4" />
          </Button>
        )}
        
        {onNewSession && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewSession}
            title="Nouvelle conversation"
            className="w-8 h-8 sm:w-10 sm:h-10"
          >
            <Plus className="w-4 h-4" />
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
