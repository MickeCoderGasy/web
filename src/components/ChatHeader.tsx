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
    <div className="flex items-center justify-between p-4 border-b border-border/50 chat-header">
      {/* Titre et statut */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          {useGrok ? <Zap className="w-4 h-4 text-primary" /> : <Sparkles className="w-4 h-4 text-primary" />}
        </div>
        <div>
          <h2 className="font-semibold text-lg">
            {useGrok ? "Grok Trading Assistant" : "AI Trading Assistant"}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {useGrok ? (
              <>
                <span>Powered by Grok with context</span>
                {selectedAnalysis && (
                  <Badge variant="default" className="text-xs">
                    <Target className="w-3 h-3 mr-1" />
                    Analyse sélectionnée
                  </Badge>
                )}
                {!selectedAnalysis && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Sélectionnez une analyse
                  </Badge>
                )}
              </>
            ) : (
              <span>Powered by advanced AI</span>
            )}
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex items-center gap-3">
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
          >
            <History className="w-5 h-5" />
          </Button>
        )}
        
        {onNewSession && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewSession}
            title="Nouvelle conversation"
          >
            <Plus className="w-5 h-5" />
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
