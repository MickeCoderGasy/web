import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, CheckCircle, XCircle, Clock, Target, 
  TrendingUp, BarChart, Globe, MessageSquare, Scale,
  AlertTriangle, Activity, Zap
} from "lucide-react";
import { useState } from "react";

interface ValidationChecksPanelProps {
  marketValidation: any;
  signalValidationChecks?: any;
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

export function ValidationChecksPanel({ marketValidation, signalValidationChecks }: ValidationChecksPanelProps) {
  if (!marketValidation && !signalValidationChecks) return null;

  return (
    <div className="space-y-6">
        {/* Market Validation Score */}
        {marketValidation && (
          <div className="space-y-6">
            {/* Main Score Display */}
            <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-primary">
                  {marketValidation.overall_confluence_score}
                </div>
                <div className="text-2xl text-muted-foreground">/100</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {marketValidation.overall_confluence_score >= marketValidation.minimum_threshold ? (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-medium">Seuil atteint</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="w-6 h-6" />
                    <span className="font-medium">Seuil non atteint</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Seuil minimum: {marketValidation.minimum_threshold}/100
                </p>
              </div>
            </div>

            {/* Score Breakdown */}
            {marketValidation.score_breakdown && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Détail du Score</h4>
                
                {/* INTRADAY Scoring */}
                {marketValidation.trading_style === 'INTRADAY' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'price_action', label: 'Price Action', max: 38, weight: '38%', icon: TrendingUp, color: 'bg-blue-500' },
                        { key: 'smc', label: 'SMC', max: 31, weight: '31%', icon: Target, color: 'bg-green-500' },
                        { key: 'indicators', label: 'Indicateurs', max: 12, weight: '12%', icon: BarChart, color: 'bg-yellow-500' },
                        { key: 'market_context', label: 'Contexte Marché', max: 19, weight: '19%', icon: Globe, color: 'bg-purple-500' }
                      ].map(({ key, label, max, weight, icon: Icon, color }) => {
                        const score = marketValidation.score_breakdown[key] || 0;
                        const percentage = (score / max) * 100;
                        return (
                          <div key={key} className="p-4 rounded-lg bg-secondary/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">{label}</span>
                                <span className="text-xs text-muted-foreground">({weight})</span>
                              </div>
                              <span className="text-sm font-bold">{score}/{max}</span>
                            </div>
                            <div className="w-full bg-secondary/50 rounded-full h-2">
                              <div 
                                className={`${color} rounded-full h-2 transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SWING Scoring */}
                {marketValidation.trading_style !== 'INTRADAY' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'price_action', label: 'Price Action', max: 33, weight: '33%', icon: TrendingUp, color: 'bg-blue-500' },
                        { key: 'smc', label: 'SMC', max: 28, weight: '28%', icon: Target, color: 'bg-green-500' },
                        { key: 'indicators', label: 'Indicateurs', max: 22, weight: '22%', icon: BarChart, color: 'bg-yellow-500' },
                        { key: 'market_context', label: 'Contexte Marché', max: 17, weight: '17%', icon: Globe, color: 'bg-purple-500' }
                      ].map(({ key, label, max, weight, icon: Icon, color }) => {
                        const score = marketValidation.score_breakdown[key] || 0;
                        const percentage = (score / max) * 100;
                        return (
                          <div key={key} className="p-4 rounded-lg bg-secondary/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">{label}</span>
                                <span className="text-xs text-muted-foreground">({weight})</span>
                              </div>
                              <span className="text-sm font-bold">{score}/{max}</span>
                            </div>
                            <div className="w-full bg-secondary/50 rounded-full h-2">
                              <div 
                                className={`${color} rounded-full h-2 transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Market Validation Details */}
            <CollapsibleSection 
              title="Détails de Validation" 
              icon={ShieldCheck}
              defaultOpen={false}
            >
              <div className="space-y-3">
                <KeyValueItem 
                  label="Qualité du Timing" 
                  value={getNestedValue(marketValidation, 'timing_quality')} 
                  icon={Clock}
                />
                <KeyValueItem 
                  label="Confirmation SMC" 
                  value={getNestedValue(marketValidation, 'smc_confirmation')} 
                  icon={Target}
                />
                <KeyValueItem 
                  label="Alignement Price Action" 
                  value={getNestedValue(marketValidation, 'price_action_alignment')} 
                  icon={TrendingUp}
                />
                <KeyValueItem 
                  label="Confirmation Indicateurs" 
                  value={getNestedValue(marketValidation, 'indicators_confirmation')} 
                  icon={BarChart}
                />
                <KeyValueItem 
                  label="Contexte Fondamental" 
                  value={getNestedValue(marketValidation, 'fundamental_context')} 
                  icon={MessageSquare}
                />
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* Signal Validation Checks */}
        {signalValidationChecks && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Vérifications du Signal
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ListItem 
                items={getNestedValue(signalValidationChecks, 'smc_confluence', [])} 
                title="Confluence SMC" 
                icon={Target}
              />
              <ListItem 
                items={getNestedValue(signalValidationChecks, 'timing_factors', [])} 
                title="Facteurs de Timing" 
                icon={Clock}
              />
              <ListItem 
                items={getNestedValue(signalValidationChecks, 'fundamental_factors', [])} 
                title="Facteurs Fondamentaux" 
                icon={MessageSquare}
              />
              <ListItem 
                items={getNestedValue(signalValidationChecks, 'technical_indicators', [])} 
                title="Indicateurs Techniques" 
                icon={BarChart}
              />
              <ListItem 
                items={getNestedValue(signalValidationChecks, 'price_action_confluence', [])} 
                title="Confluence Price Action" 
                icon={TrendingUp}
              />
            </div>
          </div>
        )}
    </div>
  );
}
