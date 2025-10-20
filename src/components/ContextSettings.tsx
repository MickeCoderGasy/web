import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, TrendingUp, Clock, Target, AlertCircle } from 'lucide-react';
import { ContextSettings, defaultContextSettings } from '@/config/grok-config';
import analysisHistoryService, { AnalysisHistoryItem } from '@/services/analysisHistoryService';
import { useAuth } from '@/contexts/AuthContext';
import { RealDataIndicator } from '@/components/RealDataIndicator';
import { OHLCStatusIndicator } from '@/components/OHLCStatusIndicator';
import { OHLCNoDataMessage } from '@/components/OHLCNoDataMessage';
import { AnalysisDebugInfo } from '@/components/AnalysisDebugInfo';
import { ContextDataSummary } from '@/components/ContextDataSummary';
import { OHLCSendStatus } from '@/components/OHLCSendStatus';

interface ContextSettingsProps {
  settings: ContextSettings;
  onSettingsChange: (settings: ContextSettings) => void;
  onSave: () => void;
}

export function ContextSettingsComponent({ settings, onSettingsChange, onSave }: ContextSettingsProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Initialiser l'utilisateur dans le service d'historique
  useEffect(() => {
    if (user?.email) {
      analysisHistoryService.setCurrentUser(user.email);
      console.log('✅ [ContextSettings] Utilisateur initialisé:', user.email);
    } else {
      analysisHistoryService.setCurrentUser(null);
      console.log('⚠️ [ContextSettings] Aucun utilisateur connecté');
    }
  }, [user?.email]);

  // Charger l'historique des analyses
  useEffect(() => {
    const loadAnalysisHistory = async () => {
      // Vérifier que l'utilisateur est connecté avant de charger l'historique
      if (!user?.email) {
        console.log('⚠️ [ContextSettings] Utilisateur non connecté, impossible de charger l\'historique');
        setIsConnected(false);
        setIsLoadingHistory(false);
        return;
      }

      setIsLoadingHistory(true);
      try {
        console.log('🔄 [ContextSettings] Chargement de l\'historique pour:', user.email);
        const history = await analysisHistoryService.getRecentAnalyses(settings.maxHistoryItems);
        setAnalysisHistory(history);
        setIsConnected(history.length > 0);
        console.log('✅ [ContextSettings] Historique chargé:', history.length, 'analyses');
      } catch (error) {
        console.error('❌ [ContextSettings] Erreur lors du chargement de l\'historique:', error);
        setIsConnected(false);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadAnalysisHistory();
  }, [settings.maxHistoryItems, user?.email]);

  const handleSettingChange = (key: keyof ContextSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleAnalysisSelection = (analysisId: string) => {
    handleSettingChange('selectedAnalysisId', analysisId);
  };

  const selectedAnalysis = analysisHistory.find(analysis => analysis.id === settings.selectedAnalysisId);

  return (
    <div className="space-y-4">

          {/* Sélection d'analyse obligatoire */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary flex-shrink-0" />
              <Label className="text-sm font-medium">Sélectionner une analyse</Label>
            </div>

            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="ml-2 text-xs text-muted-foreground">Chargement...</span>
              </div>
            ) : (
              <ScrollArea className="h-48 border rounded-lg">
                <div className="space-y-1 p-2">
                  {analysisHistory.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Aucune analyse trouvée
                    </p>
                  ) : (
                    analysisHistory.map((analysis) => (
                      <div
                        key={analysis.id}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          settings.selectedAnalysisId === analysis.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50 hover:bg-secondary/20'
                        }`}
                        onClick={() => handleAnalysisSelection(analysis.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Badge variant="outline" className="text-xs">
                              {analysis.pair}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(analysis.timestamp).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          {settings.selectedAnalysisId === analysis.id && (
                            <Badge variant="default" className="text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              ✓
                            </Badge>
                          )}
                        </div>
                        
                        {analysis.signal && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={analysis.signal === 'BUY' ? 'default' : analysis.signal === 'SELL' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {analysis.signal}
                            </Badge>
                            {analysis.confidence && (
                              <span className="text-xs text-muted-foreground">
                                {analysis.confidence}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Analyse sélectionnée - version simplifiée */}
            {selectedAnalysis && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-medium text-sm">Analyse sélectionnée</span>
                </div>
                <div className="text-xs space-y-1">
                  <p><strong>{selectedAnalysis.pair}</strong> - {new Date(selectedAnalysis.timestamp).toLocaleDateString('fr-FR')}</p>
                  {selectedAnalysis.signal && (
                    <p><strong>Signal:</strong> {selectedAnalysis.signal}</p>
                  )}
                </div>
              </div>
            )}

            {/* Bouton de sauvegarde */}
            <div className="flex justify-end pt-2">
              <Button 
                onClick={onSave} 
                className="flex items-center gap-2 w-full"
                disabled={!settings.selectedAnalysisId}
                size="sm"
              >
                <Target className="w-4 h-4" />
                {settings.selectedAnalysisId ? 'Analyser avec Grok' : 'Sélectionnez une analyse'}
              </Button>
            </div>
          </div>
    </div>
  );
}
