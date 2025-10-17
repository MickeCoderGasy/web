import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Info, Calendar, Activity, ShieldCheck, BarChart, Globe, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { SignalDetectedPanel } from "./SignalDetectedPanel";
import { ValidationChecksPanel } from "./ValidationChecksPanel";
import { PerformanceMetricsPanel } from "./PerformanceMetricsPanel";
import { MarketContextPanel } from "./MarketContextPanel";
import { FundamentalContextPanel } from "./FundamentalContextPanel";

interface AnalysisPanelsContainerProps {
  result: any;
}

// Helper function to safely get nested values
const getNestedValue = (obj: any, path: string, defaultValue: any = 'N/A') => {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    if (current === null || typeof current !== 'object' || !current.hasOwnProperty(parts[i])) {
      return defaultValue;
    }
    current = current[parts[i]];
  }
  return current;
};

// Composant CollapsiblePanel pour wrapper les panneaux
const CollapsiblePanel = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false, 
  className = "" 
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  defaultOpen?: boolean; 
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader 
        className="cursor-pointer hover:bg-secondary/20 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <span>{title}</span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
};

export function AnalysisPanelsContainer({ result }: AnalysisPanelsContainerProps) {
  if (!result) return null;

  const {
    pair,
    signal_metadata,
    market_validation,
    signals,
    no_signal_analysis,
    fundamental_context,
    market_alerts,
    agent_version,
    Status,
    generated_at
  } = result;

  const hasSignal = signals && signals.length > 0;
  const mainSignal = hasSignal ? signals[0] : null;

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-6 p-1">
        {/* Header avec informations générales */}
        <Card className="glass-card border-primary/20 shadow-xl shadow-primary/10">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{pair}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analyse générée le {new Date(generated_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {Status && (
                  <Badge 
                    variant={Status === 'Pending' ? 'secondary' : 'default'}
                    className="text-sm px-3 py-1"
                  >
                    {Status}
                  </Badge>
                )}
                {getNestedValue(signal_metadata, 'market_session') && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {getNestedValue(signal_metadata, 'market_session')}
                  </Badge>
                )}
                {agent_version && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    {agent_version}
                  </Badge>
                )}
              </div>
            </div>
            {getNestedValue(result, 'signal_id') && (
              <div className="mt-3 p-2 rounded-lg bg-secondary/20">
                <span className="text-xs text-muted-foreground">ID: </span>
                <span className="text-xs font-mono">{getNestedValue(result, 'signal_id')}</span>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Informations Générales */}
        {result.metadata_info && (
          <Card className="glass-card border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 py-2">
                    <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-muted-foreground block">Date de l'Analyse</span>
                      <span className="text-sm font-medium break-words">
                        {getNestedValue(result.metadata_info, 'date')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-2">
                    <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-muted-foreground block">Objectif de Gain</span>
                      <span className="text-sm font-medium break-words">
                        {getNestedValue(result.metadata_info, 'gain')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 py-2">
                    <Activity className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-muted-foreground block">Niveau de Risque</span>
                      <span className="text-sm font-medium break-words">
                        {getNestedValue(result.metadata_info, 'risk')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-2">
                    <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-muted-foreground block">Style de Trading</span>
                      <span className="text-sm font-medium break-words">
                        {getNestedValue(result.metadata_info, 'style')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Panneau des Signaux Détectés */}
        {hasSignal && (
          <CollapsiblePanel 
            title="Signaux Détectés" 
            icon={Target}
            defaultOpen={false}
            className="border-green-500/20 bg-green-500/5"
          >
            <SignalDetectedPanel signals={signals} />
          </CollapsiblePanel>
        )}

        {/* Panneau des Vérifications de Validation */}
        <CollapsiblePanel 
          title="Vérifications de Validation" 
          icon={ShieldCheck}
          defaultOpen={false}
          className="border-primary/10"
        >
          <ValidationChecksPanel 
            marketValidation={market_validation}
            signalValidationChecks={mainSignal?.validation_checks}
          />
        </CollapsiblePanel>

        {/* Panneau des Métriques de Performance */}
        <CollapsiblePanel 
          title="Métriques de Performance" 
          icon={BarChart}
          defaultOpen={false}
          className="border-primary/10"
        >
          <PerformanceMetricsPanel 
            performanceMetrics={result.performance_metrics}
            signalPerformanceMetrics={mainSignal?.performance_metrics}
          />
        </CollapsiblePanel>

        {/* Panneau du Contexte du Marché */}
        <CollapsiblePanel 
          title="Contexte du Marché" 
          icon={Globe}
          defaultOpen={false}
          className="border-primary/10"
        >
          <MarketContextPanel 
            marketContext={result.market_context}
            marketAlerts={market_alerts}
            signalMarketContext={mainSignal?.market_context}
          />
        </CollapsiblePanel>

        {/* Panneau du Contexte Fondamental */}
        {fundamental_context && (
          <CollapsiblePanel 
            title="Contexte Fondamental" 
            icon={MessageSquare}
            defaultOpen={false}
            className="border-primary/10"
          >
            <FundamentalContextPanel fundamentalContext={fundamental_context} />
          </CollapsiblePanel>
        )}

        {/* Affichage pour aucun signal */}
        {!hasSignal && no_signal_analysis && (
          <Card className="glass-card border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Target className="w-6 h-6" />
                Aucun Signal Recommandé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800">Ma priorité est de protéger ton capital.</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Parfois, ne pas trader est la meilleure décision.
                    </p>
                  </div>
                </div>
              </div>

              {no_signal_analysis.reasons_if_no_signal && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Pourquoi je reste prudent</h4>
                  <div className="space-y-2">
                    {no_signal_analysis.reasons_if_no_signal.map((reason: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm text-foreground leading-relaxed">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {no_signal_analysis.next_evaluation && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Prochaines Étapes</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {no_signal_analysis.next_evaluation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
