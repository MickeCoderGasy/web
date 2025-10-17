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
  const [isExpanded, setIsExpanded] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Charger l'historique des analyses
  useEffect(() => {
    const loadAnalysisHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const history = await analysisHistoryService.getRecentAnalyses(settings.maxHistoryItems);
        setAnalysisHistory(history);
        setIsConnected(history.length > 0);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        setIsConnected(false);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadAnalysisHistory();
  }, [settings.maxHistoryItems]);

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
    <div className="space-y-4 sm:space-y-6">
          {/* Nombre d'analyses à afficher */}
             <div className="space-y-2">
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                 <Label htmlFor="max-history" className="text-sm sm:text-base">Nombre d'analyses à afficher</Label>
                 <div className="flex items-center gap-2 flex-wrap">
                   <RealDataIndicator
                     isConnected={isConnected}
                     dataCount={analysisHistory.length}
                   />
                   <OHLCStatusIndicator settings={settings} />
                 </div>
               </div>
            <Input
              id="max-history"
              type="number"
              min="5"
              max="50"
              value={settings.maxHistoryItems}
              onChange={(e) => handleSettingChange('maxHistoryItems', parseInt(e.target.value) || 20)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Nombre d'analyses récentes à afficher dans la liste (données réelles depuis Supabase)
            </p>
          </div>

          {/* Sélection d'analyse obligatoire */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <Label className="text-sm sm:text-base font-medium">Sélectionner une analyse (obligatoire)</Label>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Vous devez sélectionner une analyse de l'historique pour discuter avec Grok.
            </p>

            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-xs sm:text-sm text-muted-foreground">Chargement des analyses...</span>
              </div>
            ) : (
              <ScrollArea className="h-60 sm:h-80 border rounded-lg">
                <div className="space-y-2 p-2 sm:p-3">
                  {analysisHistory.length === 0 ? (
                    <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                      Aucune analyse trouvée dans l'historique
                    </p>
                  ) : (
                    analysisHistory.map((analysis) => (
                      <div
                        key={analysis.id}
                        className={`p-2 sm:p-3 rounded-lg border transition-colors cursor-pointer ${
                          settings.selectedAnalysisId === analysis.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50 hover:bg-secondary/20'
                        }`}
                        onClick={() => handleAnalysisSelection(analysis.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {analysis.pair}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span className="hidden sm:inline">{new Date(analysis.timestamp).toLocaleString('fr-FR')}</span>
                              <span className="sm:hidden">{new Date(analysis.timestamp).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          {settings.selectedAnalysisId === analysis.id && (
                            <Badge variant="default" className="text-xs">
                              <Target className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Sélectionnée</span>
                              <span className="sm:hidden">Sélect.</span>
                            </Badge>
                          )}
                        </div>
                        
                        {analysis.signal && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge 
                                variant={analysis.signal === 'BUY' ? 'default' : analysis.signal === 'SELL' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {analysis.signal}
                              </Badge>
                              {analysis.confidence && (
                                <span className="text-xs text-muted-foreground">
                                  <span className="hidden sm:inline">Confiance: </span>{analysis.confidence}%
                                </span>
                              )}
                              {analysis.confluenceScore && (
                                <span className="text-xs text-muted-foreground">
                                  <span className="hidden sm:inline">Confluence: </span>{analysis.confluenceScore}/100
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {analysis.summary && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {analysis.summary}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}

            {/* Analyse sélectionnée */}
               {selectedAnalysis && (
                 <div className="space-y-3 sm:space-y-4">
                   <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                     <div className="flex items-center gap-2 mb-2">
                       <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                       <span className="font-medium text-sm sm:text-base">Analyse sélectionnée</span>
                     </div>
                     <div className="text-xs sm:text-sm space-y-1">
                       <p><strong>Paire:</strong> {selectedAnalysis.pair}</p>
                       <p><strong>Date:</strong> {new Date(selectedAnalysis.timestamp).toLocaleString('fr-FR')}</p>
                       {selectedAnalysis.signal && (
                         <p><strong>Signal:</strong> {selectedAnalysis.signal}</p>
                       )}
                       {selectedAnalysis.summary && (
                         <p className="line-clamp-2"><strong>Résumé:</strong> {selectedAnalysis.summary}</p>
                       )}
                     </div>
                   </div>
                   
                   {/* Message informatif pour les données OHLC */}
                   <OHLCNoDataMessage pair={selectedAnalysis.pair} />
                   
                   {/* Statut d'envoi des données OHLC */}
                   <OHLCSendStatus settings={settings} />
                   
                   {/* Résumé des données envoyées à Grok */}
                   <ContextDataSummary analysis={selectedAnalysis} />
                   
                   {/* Informations de debug */}
                   <AnalysisDebugInfo analysis={selectedAnalysis} />
                 </div>
               )}

            {/* Bouton de sauvegarde */}
            <div className="flex justify-end pt-2">
              <Button 
                onClick={onSave} 
                className="flex items-center gap-2 w-full sm:w-auto"
                disabled={!settings.selectedAnalysisId}
                size="sm"
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {settings.selectedAnalysisId ? 'Analyser avec Grok' : 'Sélectionnez une analyse'}
                </span>
                <span className="sm:hidden">
                  {settings.selectedAnalysisId ? 'Analyser' : 'Sélectionnez'}
                </span>
              </Button>
            </div>
          </div>
    </div>
  );
}
