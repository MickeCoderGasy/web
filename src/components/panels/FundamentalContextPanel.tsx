import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare, Star, Bell, TrendingUp, Calendar, 
  AlertCircle, Globe, Clock, Activity, Target,
  DollarSign, BarChart, Shield, Zap
} from "lucide-react";
import { useState } from "react";

interface FundamentalContextPanelProps {
  fundamentalContext: any;
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

// Helper component for consistent key-value display
const KeyValueItem = ({ label, value, className = "", icon: Icon }: { label: string; value: any; className?: string; icon?: any }) => {
  if (value === null || value === undefined || value === 'N/A' || value === '') return null;
  return (
    <div className={`flex items-start gap-3 py-2 ${className}`}>
      {Icon && <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-muted-foreground block">{label}</span>
        <span className="text-sm font-medium break-words">{String(value)}</span>
      </div>
    </div>
  );
};

// Collapsible section component
const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <span className="font-medium">{title}</span>
        </div>
        {isOpen ? <span className="text-sm">▼</span> : <span className="text-sm">▶</span>}
      </button>
      {isOpen && <div className="space-y-3">{children}</div>}
    </div>
  );
};

export function FundamentalContextPanel({ fundamentalContext }: FundamentalContextPanelProps) {
  if (!fundamentalContext) return null;

  return (
    <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Facteur Principal</span>
            </div>
            <p className="font-semibold text-foreground">{fundamentalContext.facteur_principal}</p>
          </div>
            
          <div className="p-4 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Sentiment Général</span>
            </div>
            <p className="font-semibold text-foreground">{fundamentalContext.sentiment_general}</p>
          </div>
            
          <div className="p-4 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Sentiment News (24h)</span>
            </div>
            <p className="font-semibold text-foreground">{fundamentalContext.news_sentiment_24h}</p>
          </div>

          <div className="p-4 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Tendance Dominante</span>
            </div>
            <p className="font-semibold text-foreground">{fundamentalContext.tendance_dominante}</p>
          </div>
        </div>

        {/* Recommended Caution */}
        {fundamentalContext.recommended_caution && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">Recommandation de Prudence</h4>
                <p className="text-sm text-red-700 leading-relaxed">{fundamentalContext.recommended_caution}</p>
              </div>
            </div>
          </div>
        )}

        {/* Critical Events */}
        {fundamentalContext.evenements_critiques_48h && fundamentalContext.evenements_critiques_48h.length > 0 && (
          <CollapsibleSection 
            title="Événements Critiques (48h)" 
            icon={Calendar}
            defaultOpen={true}
          >
            <div className="space-y-3">
              {fundamentalContext.evenements_critiques_48h.map((event: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-semibold text-sm flex-1">{event.event}</h4>
                    <Badge 
                      variant={event.impact === "HIGH" ? "destructive" : event.impact === "MEDIUM" ? "secondary" : "outline"} 
                      className="text-xs"
                    >
                      {event.impact}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{event.currency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.datetime).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-2 p-2 rounded bg-secondary/30">
                      {event.implication_signal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Economic Indicators */}
        {fundamentalContext.economic_indicators && (
          <CollapsibleSection 
            title="Indicateurs Économiques" 
            icon={BarChart}
            defaultOpen={false}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KeyValueItem 
                  label="PIB" 
                  value={fundamentalContext.economic_indicators.gdp} 
                  icon={DollarSign}
                />
                <KeyValueItem 
                  label="Inflation" 
                  value={fundamentalContext.economic_indicators.inflation} 
                  icon={TrendingUp}
                />
                <KeyValueItem 
                  label="Taux d'Intérêt" 
                  value={fundamentalContext.economic_indicators.interest_rate} 
                  icon={Zap}
                />
                <KeyValueItem 
                  label="Chômage" 
                  value={fundamentalContext.economic_indicators.unemployment} 
                  icon={Activity}
                />
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* Central Bank Policy */}
        {fundamentalContext.central_bank_policy && (
          <CollapsibleSection 
            title="Politique de la Banque Centrale" 
            icon={Shield}
            defaultOpen={false}
          >
            <div className="space-y-3">
              <KeyValueItem 
                label="Stance Monétaire" 
                value={fundamentalContext.central_bank_policy.monetary_stance} 
                icon={Target}
              />
              <KeyValueItem 
                label="Prochaines Décisions" 
                value={fundamentalContext.central_bank_policy.upcoming_decisions} 
                icon={Calendar}
              />
              <KeyValueItem 
                label="Commentaires Récents" 
                value={fundamentalContext.central_bank_policy.recent_comments} 
                icon={MessageSquare}
              />
            </div>
          </CollapsibleSection>
        )}

        {/* Market Sentiment Analysis */}
        {fundamentalContext.market_sentiment_analysis && (
          <CollapsibleSection 
            title="Analyse du Sentiment du Marché" 
            icon={MessageSquare}
            defaultOpen={false}
          >
            <div className="space-y-3">
              <KeyValueItem 
                label="Sentiment des Investisseurs" 
                value={fundamentalContext.market_sentiment_analysis.investor_sentiment} 
                icon={Activity}
              />
              <KeyValueItem 
                label="Positioning des Hedge Funds" 
                value={fundamentalContext.market_sentiment_analysis.hedge_fund_positioning} 
                icon={BarChart}
              />
              <KeyValueItem 
                label="Flux de Capitaux" 
                value={fundamentalContext.market_sentiment_analysis.capital_flows} 
                icon={TrendingUp}
              />
              <KeyValueItem 
                label="Volatilité Implicite" 
                value={fundamentalContext.market_sentiment_analysis.implied_volatility} 
                icon={Zap}
              />
            </div>
          </CollapsibleSection>
        )}

        {/* Risk Factors */}
        {fundamentalContext.risk_factors && (
          <CollapsibleSection 
            title="Facteurs de Risque" 
            icon={AlertCircle}
            defaultOpen={false}
          >
            <div className="space-y-3">
              <KeyValueItem 
                label="Risques Géopolitiques" 
                value={fundamentalContext.risk_factors.geopolitical_risks} 
                icon={Globe}
              />
              <KeyValueItem 
                label="Risques Économiques" 
                value={fundamentalContext.risk_factors.economic_risks} 
                icon={DollarSign}
              />
              <KeyValueItem 
                label="Risques de Liquidité" 
                value={fundamentalContext.risk_factors.liquidity_risks} 
                icon={Activity}
              />
              <KeyValueItem 
                label="Risques de Corrélation" 
                value={fundamentalContext.risk_factors.correlation_risks} 
                icon={Target}
              />
            </div>
          </CollapsibleSection>
        )}
    </div>
  );
}
