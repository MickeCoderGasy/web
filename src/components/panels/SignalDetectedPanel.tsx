import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp, TrendingDown, Target, ShieldCheck, DollarSign, 
  Zap, Settings, Clock, Scale, ArrowBigRightDash, Workflow,
  Bell, Activity, AlertTriangle, CheckCircle, BarChart,
  Microscope, XCircle, Sliders, Globe
} from "lucide-react";
import { useState } from "react";

interface SignalDetectedPanelProps {
  signals: any[];
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

export function SignalDetectedPanel({ signals }: SignalDetectedPanelProps) {
  if (!signals || signals.length === 0) return null;

  return (
    <div className="space-y-6">
        {signals.map((signal: any, index: number) => (
          <div key={index} className="space-y-4">
            {/* Signal Header */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-green-500/5">
              <div className="flex items-center gap-3">
                {signal.signal === "BUY" ? (
                  <div className="p-3 rounded-full bg-green-500/20">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                ) : (
                  <div className="p-3 rounded-full bg-red-500/20">
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold">{signal.signal}</h3>
                  <p className="text-sm text-muted-foreground">Signal de trading</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className="bg-primary text-white px-3 py-1">{signal.confidence}</Badge>
                {signal.priority && (
                  <Badge variant="outline" className="text-xs">
                    Priorité {signal.priority}
                  </Badge>
                )}
              </div>
            </div>

            {/* Entry Details */}
            {signal.entry_details && (
              <CollapsibleSection 
                title="Détails d'Entrée" 
                icon={ArrowBigRightDash}
                defaultOpen={true}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <KeyValueItem 
                      label="Prix d'entrée" 
                      value={signal.entry_details.entry_price} 
                      icon={DollarSign}
                    />
                    <KeyValueItem 
                      label="Méthode d'entrée" 
                      value={signal.entry_details.entry_method} 
                      icon={Settings}
                    />
                  </div>
                  <div className="space-y-3">
                    <KeyValueItem 
                      label="Slippage Max" 
                      value={signal.entry_details.max_slippage} 
                      icon={Zap}
                    />
                    <KeyValueItem 
                      label="Time Frame Exécution" 
                      value={signal.entry_details.execution_timeframe} 
                      icon={Clock}
                    />
                  </div>
                </div>
                {signal.entry_details.optimal_entry_before && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <KeyValueItem 
                      label="Entrée optimale avant" 
                      value={signal.entry_details.optimal_entry_before} 
                      icon={Clock}
                    />
                  </div>
                )}
              </CollapsibleSection>
            )}

            {/* Risk Management */}
            {signal.risk_management && (
              <CollapsibleSection 
                title="Gestion du Risque" 
                icon={ShieldCheck}
                defaultOpen={true}
              >
                <div className="space-y-4">
                  {/* Key Risk Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">Stop Loss</span>
                      </div>
                      <div className="text-xl font-bold text-red-500">
                        {signal.risk_management.stop_loss}
                      </div>
                      {signal.risk_management.sl_reasoning && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {signal.risk_management.sl_reasoning}
                        </p>
                      )}
                    </div>
                    
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Take Profit 1</span>
                      </div>
                      <div className="text-xl font-bold text-green-500">
                        {signal.risk_management.take_profit_1}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Ratio R/R</span>
                      </div>
                      <div className="text-xl font-bold text-primary">
                        {signal.risk_management.risk_reward_ratio}
                      </div>
                    </div>
                  </div>

                  {/* Additional Take Profits */}
                  {(signal.risk_management.take_profit_2 || signal.risk_management.take_profit_3) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {signal.risk_management.take_profit_2 && (
                        <KeyValueItem 
                          label="Take Profit 2" 
                          value={signal.risk_management.take_profit_2} 
                          icon={Target}
                        />
                      )}
                      {signal.risk_management.take_profit_3 && (
                        <KeyValueItem 
                          label="Take Profit 3" 
                          value={signal.risk_management.take_profit_3} 
                          icon={Target}
                        />
                      )}
                    </div>
                  )}

                  {/* Position Management */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <KeyValueItem 
                      label="Max Risque/Trade" 
                      value={signal.risk_management.max_risk_per_trade} 
                      icon={Zap}
                    />
                    <KeyValueItem 
                      label="Taille Position (%)" 
                      value={signal.risk_management.position_size_percent} 
                      icon={Settings}
                    />
                  </div>

                  {signal.risk_management.position_adjustment && (
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <KeyValueItem 
                        label="Ajustement Position" 
                        value={signal.risk_management.position_adjustment} 
                        icon={Settings}
                      />
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Execution Plan */}
            {signal.execution_plan && (
              <CollapsibleSection 
                title="Plan d'Exécution" 
                icon={Workflow}
                defaultOpen={false}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <KeyValueItem 
                      label="Fenêtre d'entrée optimale" 
                      value={signal.execution_plan.optimal_entry_window} 
                      icon={Clock}
                    />
                    <KeyValueItem 
                      label="Trailing Stop" 
                      value={signal.execution_plan.trailing_stop} 
                      icon={Target}
                    />
                  </div>
                  
                  <KeyValueItem 
                    label="Action Pré-News" 
                    value={signal.execution_plan.pre_news_action} 
                    icon={Bell}
                  />
                  
                  <KeyValueItem 
                    label="Monitoring Position" 
                    value={signal.execution_plan.position_monitoring} 
                    icon={Activity}
                  />
                  
                  {signal.execution_plan.partial_profit_taking && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Prise de profits partielle
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <KeyValueItem 
                          label="TP1 Exit" 
                          value={signal.execution_plan.partial_profit_taking.tp1_exit} 
                          icon={Target}
                        />
                        <KeyValueItem 
                          label="TP2 Exit" 
                          value={signal.execution_plan.partial_profit_taking.tp2_exit} 
                          icon={Target}
                        />
                        <KeyValueItem 
                          label="TP3 Exit" 
                          value={signal.execution_plan.partial_profit_taking.tp3_exit} 
                          icon={Target}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Entry Conditions */}
            <ListItem items={getNestedValue(signal, 'entry_conditions', [])} title="Conditions d'Entrée" icon={Sliders} />

            {/* Invalidation Rules */}
            <ListItem items={getNestedValue(signal, 'invalidation_rules', [])} title="Règles d'Invalidation" icon={XCircle} />
          </div>
        ))}
    </div>
  );
}
