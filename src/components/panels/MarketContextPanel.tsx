import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Globe, TrendingUp, AlertCircle, Bell, Target, 
  Handshake, Calendar, Clock, Activity, BarChart,
  MessageSquare, Zap, Shield, AlertTriangle
} from "lucide-react";
import { useState } from "react";

interface MarketContextPanelProps {
  marketContext: any;
  marketAlerts?: any;
  signalMarketContext?: any;
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

// Helper component for list display
const ListItem = ({ items, title, icon: Icon }: { items: string[] | any[]; title?: string; icon?: any }) => {
  if (!items || items.length === 0) return null;
  
  return (
    <div className="space-y-3 mt-4">
      {title && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary" />} {title}
          </p>
        </div>
      )}
      <div className="space-y-2">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span className="text-sm text-foreground leading-relaxed">
              {typeof item === 'string' ? item : JSON.stringify(item)}
            </span>
          </div>
        ))}
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

export function MarketContextPanel({ marketContext, marketAlerts, signalMarketContext }: MarketContextPanelProps) {
  if (!marketContext && !marketAlerts && !signalMarketContext) return null;

  return (
    <div className="space-y-6">
        {/* Signal Market Context */}
        {signalMarketContext && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Contexte du Marché (Signal)
            </h4>
            
            <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KeyValueItem 
                  label="Alignement Tendance" 
                  value={signalMarketContext.trend_alignment} 
                  icon={TrendingUp}
                />
                <KeyValueItem 
                  label="Risque Corrélation" 
                  value={signalMarketContext.correlation_risk} 
                  icon={Handshake}
                />
                <KeyValueItem 
                  label="Biais Fondamental" 
                  value={signalMarketContext.fundamental_bias} 
                  icon={MessageSquare}
                />
                <KeyValueItem 
                  label="Risque News (4h)" 
                  value={signalMarketContext.news_risk_next_4h} 
                  icon={Bell}
                />
                <KeyValueItem 
                  label="Environnement Volatilité" 
                  value={signalMarketContext.volatility_environment} 
                  icon={Zap}
                />
                <KeyValueItem 
                  label="Caractéristiques Session" 
                  value={signalMarketContext.session_characteristics} 
                  icon={Clock}
                />
              </div>
            </div>
          </div>
        )}

        {/* General Market Context */}
        {marketContext && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Analyse du Marché
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <KeyValueItem 
                label="Tendance Générale" 
                value={marketContext.general_trend} 
                icon={TrendingUp}
              />
              <KeyValueItem 
                label="Volatilité Actuelle" 
                value={marketContext.current_volatility} 
                icon={Zap}
              />
              <KeyValueItem 
                label="Session de Trading" 
                value={marketContext.trading_session} 
                icon={Clock}
              />
              <KeyValueItem 
                label="Liquidité" 
                value={marketContext.liquidity} 
                icon={Activity}
              />
              <KeyValueItem 
                label="Sentiment du Marché" 
                value={marketContext.market_sentiment} 
                icon={MessageSquare}
              />
              <KeyValueItem 
                label="Niveau de Risque" 
                value={marketContext.risk_level} 
                icon={AlertTriangle}
              />
            </div>
          </div>
        )}

        {/* Market Alerts */}
        {marketAlerts && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Alertes Marché
            </h4>
            
            {/* High Impact News */}
            {getNestedValue(marketAlerts, 'high_impact_news_next_24h', []).length > 0 && (
              <CollapsibleSection 
                title="Actualités à Fort Impact (24h)" 
                icon={AlertCircle}
                defaultOpen={true}
              >
                <div className="space-y-3">
                  {getNestedValue(marketAlerts, 'high_impact_news_next_24h', []).map((news: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-semibold text-sm flex-1">{news.event}</h4>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={news.impact === "HIGH" ? "destructive" : "secondary"} 
                            className="text-xs"
                          >
                            {news.impact}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{news.time}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground italic">{news.action}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Technical Levels */}
            {getNestedValue(marketAlerts, 'technical_levels_to_watch', []).length > 0 && (
              <CollapsibleSection 
                title="Niveaux Techniques à Surveiller" 
                icon={Target}
                defaultOpen={false}
              >
                <ListItem 
                  items={getNestedValue(marketAlerts, 'technical_levels_to_watch', [])} 
                />
              </CollapsibleSection>
            )}

            {/* Correlation Warnings */}
            {getNestedValue(marketAlerts, 'correlation_warnings', []).length > 0 && (
              <CollapsibleSection 
                title="Avertissements de Corrélation" 
                icon={Handshake}
                defaultOpen={false}
              >
                <ListItem 
                  items={getNestedValue(marketAlerts, 'correlation_warnings', [])} 
                />
              </CollapsibleSection>
            )}

            {/* Market Conditions */}
            {getNestedValue(marketAlerts, 'market_conditions', []).length > 0 && (
              <CollapsibleSection 
                title="Conditions du Marché" 
                icon={BarChart}
                defaultOpen={false}
              >
                <ListItem 
                  items={getNestedValue(marketAlerts, 'market_conditions', [])} 
                />
              </CollapsibleSection>
            )}

            {/* Risk Factors */}
            {getNestedValue(marketAlerts, 'risk_factors', []).length > 0 && (
              <CollapsibleSection 
                title="Facteurs de Risque" 
                icon={Shield}
                defaultOpen={false}
              >
                <ListItem 
                  items={getNestedValue(marketAlerts, 'risk_factors', [])} 
                />
              </CollapsibleSection>
            )}
          </div>
        )}
    </div>
  );
}
