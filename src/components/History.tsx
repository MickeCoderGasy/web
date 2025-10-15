import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, History as HistoryIcon, Eye, Calendar, Clock, TrendingUp, TrendingDown, AlertCircle, Scale, DollarSign, Zap, MessageSquare, Settings, Watch, Sigma, Bell, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SignalsLogService, { SignalsLogEntry } from "@/services/signalsLogService";
import { AnalysisResults } from "@/components/AnalysisResults";

export function History() {
  const [signalLogs, setSignalLogs] = useState<SignalsLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'signal' | 'no_signal'>('all');
  const [availablePairs, setAvailablePairs] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { toast } = useToast();

  const fetchSignalLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedAnalysis(null);

      console.log('🔍 [HISTORY COMPONENT] Fetching signal logs from Supabase...');
      
      // Récupérer les logs avec filtres
      const filters = {
        ...(selectedPair && { pair: selectedPair }),
        ...(selectedStatus && { status: selectedStatus })
      };
      
      const logs = await SignalsLogService.fetchSignalsLogs(filters);
      setSignalLogs(logs);
      console.log('✅ [HISTORY COMPONENT] Signal logs loaded:', logs.length);
    } catch (err) {
      console.error('❌ [HISTORY COMPONENT] Error fetching logs:', err);
      setError((err as Error).message || 'Failed to load analysis history');
      toast({
        title: "Erreur",
        description: (err as Error).message || 'Impossible de charger l\'historique',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      console.log('🔍 [HISTORY COMPONENT] Fetching filter options...');
      
      const [pairs, statuses] = await Promise.all([
        SignalsLogService.fetchAvailablePairs(),
        SignalsLogService.fetchAvailableStatuses()
      ]);
      
      setAvailablePairs(pairs);
      setAvailableStatuses(statuses);
      console.log('✅ [HISTORY COMPONENT] Filter options loaded:', { pairs: pairs.length, statuses: statuses.length });
    } catch (err) {
      console.error('❌ [HISTORY COMPONENT] Error fetching filter options:', err);
    }
  };

  useEffect(() => {
    fetchSignalLogs();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchSignalLogs();
  }, [selectedPair, selectedStatus]);

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'Terminée';
      case 'failed': return 'Échouée';
      case 'in_progress': return 'En cours';
      case 'pending': return 'En attente';
      case 'unknown': return 'Inconnu';
      default: return String(status);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      case 'unknown': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (selectedAnalysis) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => setSelectedAnalysis(null)}
          variant="outline"
          className="mb-4"
        >
          ← Retour à l'historique
        </Button>
        <AnalysisResults result={selectedAnalysis} />
      </div>
    );
  }

  // Apply filter logic
  const filteredSignalLogs = signalLogs
    .filter(log => {
      const hasSignal = log.signals && log.signals.length > 0;
      const hasNoSignalAnalysis = log.no_signal_analysis;

      if (filterType === 'signal') {
        return !!hasSignal; // Only show logs with a signal
      }
      if (filterType === 'no_signal') {
        return !!hasNoSignalAnalysis; // Only show logs with no_signal_analysis
      }
      return true; // Show all logs for 'all' filter
    })
    .sort((a, b) => {
      // Sort by date descending (most recent first)
      const dateA = new Date(a.generated_at || 0);
      const dateB = new Date(b.generated_at || 0);
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <Card className="glass-card border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-primary" />
          Historique des Analyses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Chargement de l'historique...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchSignalLogs} variant="outline">
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            {/* Filter controls */}
            <div className="space-y-4 mb-6">
              {/* Filter buttons */}
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                  size="sm"
                >
                  Tout ({signalLogs.length})
                </Button>
                <Button
                  variant={filterType === 'signal' ? 'default' : 'outline'}
                  onClick={() => setFilterType('signal')}
                  size="sm"
                >
                  Signaux ({signalLogs.filter(log => log.signals && log.signals.length > 0).length})
                </Button>
                <Button
                  variant={filterType === 'no_signal' ? 'default' : 'outline'}
                  onClick={() => setFilterType('no_signal')}
                  size="sm"
                >
                  Pas de signal ({signalLogs.filter(log => log.no_signal_analysis).length})
                </Button>
              </div>

              {/* Additional filters */}
              <div className="flex flex-wrap gap-4">
                {/* Pair filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Paire:</label>
                  <select
                    value={selectedPair}
                    onChange={(e) => setSelectedPair(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="">Toutes les paires</option>
                    {availablePairs.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </select>
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Statut:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="">Tous les statuts</option>
                    {availableStatuses.map(status => (
                      <option key={status} value={status}>{getStatusText(status)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredSignalLogs.length === 0 && signalLogs.length > 0 ? (
              <div className="text-center py-8">
                <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Aucune analyse ne correspond à votre filtre actuel.
                </p>
                <Button onClick={() => setFilterType('all')} variant="outline">
                  Voir tout
                </Button>
              </div>
            ) : filteredSignalLogs.length === 0 && signalLogs.length === 0 ? (
              <div className="text-center py-8">
                <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Aucune analyse trouvée pour le moment. Lancez votre première analyse !
                </p>
                <Button onClick={fetchSignalLogs} variant="outline">
                  Actualiser
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-18rem)]"> {/* Adjusted height for filter buttons */}
                <div className="space-y-3">
                  {filteredSignalLogs.map((log) => {
                    const { date, time } = formatDate(log.generated_at || new Date().toISOString());
                    const pair = log.pair || 'N/A';
                    // Correctly extract the signal string from the first signal object in the array
                    const signalType = log.signals?.[0]?.signal; 
                    const hasNoSignal = log.no_signal_analysis;
                    const confluenceScore = log.market_validation?.overall_confluence_score;
                    const risk = log.signal_metadata?.risk;
                    const gain = log.signal_metadata?.gain;
                    const fundamentalSentiment = log.fundamental_context?.sentiment_general;
                    const noSignalReasons = log.no_signal_analysis?.reasons_if_no_signal;
                    
                    const agentVersion = log.agent_version;
                    const timingQuality = log.market_validation?.timing_quality;
                    const smcScore = log.market_validation?.score_breakdown?.smc;
                    const highImpactNewsCount = log.market_alerts?.high_impact_news_next_24h?.length;

                    return (
                      <Card
                        key={log.signal_id || `log-${Math.random()}`}
                        className="cursor-pointer hover:bg-secondary/50 transition-colors border-border/50"
                        onClick={() => {
                          console.log('🔍 [HISTORY COMPONENT] Viewing analysis:', log.signal_id);
                          console.log('📊 [HISTORY COMPONENT] Full log data:', log);
                          console.log('📊 [HISTORY COMPONENT] Signals:', log.signals);
                          console.log('📊 [HISTORY COMPONENT] Market validation:', log.market_validation);
                          
                          const analysisData = {
                            // Propriétés de niveau racine attendues par AnalysisResults
                            pair: log.pair,
                            agent_version: log.agent_version,
                            Status: log.Status,
                            generated_at: log.generated_at,
                            signal_id: log.signal_id,
                            user: log.user,
                            
                            // Données imbriquées
                            signals: log.signals,
                            market_validation: log.market_validation,
                            market_alerts: log.market_alerts,
                            no_signal_analysis: log.no_signal_analysis,
                            fundamental_context: log.fundamental_context,
                            signal_metadata: log.signal_metadata,
                            metadata_info: log.metadata_info
                          };
                          
                          console.log('📊 [HISTORY COMPONENT] Analysis data to display:', analysisData);
                          setSelectedAnalysis(analysisData);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm mb-1">
                                Analyse {pair ? `(${pair})` : ''} du {date} à {time}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                ID: {log.signal_id ? log.signal_id.substring(0, 8) + '...' : 'N/A'}
                              </p>
                            </div>
                            <Badge variant={getStatusVariant(log.Status)}>
                              {getStatusText(log.Status)}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{time}</span>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            {confluenceScore !== undefined && (
                              <div className="flex items-center gap-1">
                                <Scale className="w-3 h-3" />
                                <span>Score: {confluenceScore}%</span>
                              </div>
                            )}
                            {risk && (
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span>Risque: {risk}</span>
                              </div>
                            )}
                            {gain && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span>Gain: {gain}</span>
                              </div>
                            )}
                            {fundamentalSentiment && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>Fonda: {fundamentalSentiment}</span>
                              </div>
                            )}
                            {agentVersion && (
                                <div className="flex items-center gap-1">
                                    <Settings className="w-3 h-3" />
                                    <span>Agent: {agentVersion}</span>
                                </div>
                            )}
                            {timingQuality && (
                                <div className="flex items-center gap-1">
                                    <Watch className="w-3 h-3" />
                                    <span>Timing: {timingQuality}</span>
                                </div>
                            )}
                            {smcScore !== undefined && (
                                <div className="flex items-center gap-1">
                                    <Sigma className="w-3 h-3" />
                                    <span>SMC: {smcScore}%</span>
                                </div>
                            )}
                            {highImpactNewsCount !== undefined && highImpactNewsCount > 0 && (
                                <div className="flex items-center gap-1">
                                    <Bell className="w-3 h-3" />
                                    <span>News: {highImpactNewsCount}</span>
                                </div>
                            )}
                          </div>

                          {signalType && ( 
                            <div className="mt-3 flex items-center gap-2">
                              {signalType === 'BUY' ? ( 
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                              )}
                              <span className={`text-sm font-medium ${
                                signalType === 'BUY' ? 'text-green-500' : 'text-red-500' // Use signalType here
                              }`}>
                                Signal: {signalType} 
                              </span>
                            </div>
                          )}

                          {hasNoSignal && (
                            <div className="mt-3">
                              
                              {noSignalReasons && noSignalReasons.length > 0 && (
                                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                                  {noSignalReasons.slice(0, 2).map((reason, index) => (
                                    <li key={index}>{reason.length > 50 ? reason.substring(0, 50) + '...' : reason}</li>
                                  ))}
                                  {noSignalReasons.length > 2 && (
                                    <li>... ({noSignalReasons.length - 2} de plus)</li>
                                  )}
                                </ul>
                              )}
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAnalysis({
                                  // Propriétés de niveau racine attendues par AnalysisResults
                                  pair: log.pair,
                                  agent_version: log.agent_version,
                                  Status: log.Status,
                                  generated_at: log.generated_at,
                                  signal_id: log.signal_id,
                                  user: log.user,
                                  
                                  // Données imbriquées
                                  signals: log.signals,
                                  market_validation: log.market_validation,
                                  market_alerts: log.market_alerts,
                                  no_signal_analysis: log.no_signal_analysis,
                                  fundamental_context: log.fundamental_context,
                                  signal_metadata: log.signal_metadata,
                                  metadata_info: log.metadata_info
                                });
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Voir les détails
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
