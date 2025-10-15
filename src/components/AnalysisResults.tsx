import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Calendar,
  Info, ShieldCheck, DollarSign, Zap, Settings, Clock, Scale,
  MessageSquare, BookOpen, Target, Lightbulb, Workflow, Sliders,
  Bell, Handshake, Microscope, BarChart, FileText, XCircle,
  ArrowBigRightDash, Globe, ChevronDown, ChevronUp, Star,
  Activity, TrendingUp as TrendingUpIcon, AlertTriangle
} from "lucide-react";
import { useState } from "react";

interface AnalysisResultsProps {
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
const ListItem = ({ items, title, icon: Icon, collapsible = false }: { items: string[] | any[]; title?: string; icon?: any; collapsible?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  
  if (!items || items.length === 0) return null;
  
  return (
    <div className="space-y-3 mt-4">
      {title && (
        <div className="flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary" />} {title}
          </p>
          {collapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}
      {isExpanded && (
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
      )}
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
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && <div className="space-y-3">{children}</div>}
    </div>
  );
};


export function AnalysisResults({ result }: AnalysisResultsProps) {
  if (!result) return null;

  const {
    pair,
    signal_metadata,
    market_validation,
    signals,
    no_signal_analysis,
    fundamental_context,
    market_alerts,
    agent_version, // Top-level agent_version
    Status, // Top-level status
    generated_at // Top-level generated_at
  } = result;

  const hasSignal = signals && signals.length > 0;
  const mainSignal = hasSignal ? signals[0] : null; // Get the first signal if available

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-6 p-1">
        {/* Header with improved visual hierarchy */}
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

        {/* Metadata Info with improved layout */}
      {result.metadata_info && (
        <Card className="glass-card border-primary/10">
            <CollapsibleSection 
              title="Informations Générales" 
              icon={Info}
              defaultOpen={false}
            >
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <KeyValueItem 
                    label="Date de l'Analyse" 
                    value={getNestedValue(result.metadata_info, 'date')} 
                    icon={Calendar}
                  />
                  <KeyValueItem 
                    label="Objectif de Gain" 
                    value={getNestedValue(result.metadata_info, 'gain')} 
                    icon={DollarSign}
                  />
                </div>
                <div className="space-y-3">
                  <KeyValueItem 
                    label="Niveau de Risque" 
                    value={getNestedValue(result.metadata_info, 'risk')} 
                    icon={Zap}
                  />
                  <KeyValueItem 
                    label="Style de Trading" 
                    value={getNestedValue(result.metadata_info, 'style')} 
                    icon={Settings}
                  />
                </div>
              </div>
              {(getNestedValue(signal_metadata, 'data_freshness') !== 'N/A' || getNestedValue(signal_metadata, 'analysis_timestamp') !== 'N/A') && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-3">
            {getNestedValue(signal_metadata, 'data_freshness') !== 'N/A' && (
                      <KeyValueItem 
                        label="Fraîcheur des Données" 
                        value={getNestedValue(signal_metadata, 'data_freshness')} 
                        icon={Clock}
                      />
            )}
            {getNestedValue(signal_metadata, 'analysis_timestamp') !== 'N/A' && (
                      <KeyValueItem 
                        label="Timestamp d'Analyse" 
                        value={new Date(getNestedValue(signal_metadata, 'analysis_timestamp')).toLocaleString('fr-FR')} 
                        icon={Activity}
                      />
                    )}
                  </div>
                </>
            )}
          </CardContent>
            </CollapsibleSection>
        </Card>
      )}

        {/* Confluence Score with enhanced visualization */}
      {market_validation && (
        <Card className="glass-card border-primary/10">
            <CollapsibleSection 
              title=" SCORING DE CONFLUENCE" 
              icon={Scale}
              defaultOpen={false}
            >
          <CardContent>
              <div className="space-y-6">
             

                {/* Main Score Display */}
                <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold text-primary">
                      {market_validation.overall_confluence_score}
                    </div>
                    <div className="text-2xl text-muted-foreground">/100</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                {market_validation.overall_confluence_score >= market_validation.minimum_threshold ? (
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
                Seuil minimum: {market_validation.minimum_threshold}/100
              </p>
                  </div>
              </div>

                {/* Score Breakdown with Style-Adapted Weights */}
              {market_validation.score_breakdown && (
                  <div className="space-y-4">
                   
                    
                    {/* INTRADAY Scoring */}
                    {market_validation.trading_style === 'INTRADAY' && (
                      <div className="space-y-4">
                        
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { key: 'price_action', label: 'Price Action', max: 38, weight: '38%', icon: TrendingUpIcon, color: 'bg-blue-500' },
                            { key: 'smc', label: 'SMC', max: 31, weight: '31%', icon: Target, color: 'bg-green-500' },
                            { key: 'indicators', label: 'Indicateurs', max: 12, weight: '12%', icon: BarChart, color: 'bg-yellow-500' },
                            { key: 'market_context', label: 'Contexte Marché', max: 19, weight: '19%', icon: Globe, color: 'bg-purple-500' }
                          ].map(({ key, label, max, weight, icon: Icon, color }) => {
                            const score = market_validation.score_breakdown[key] || 0;
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
                    {market_validation.trading_style !== 'INTRADAY' && (
                      <div className="space-y-4">
                       
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { key: 'price_action', label: 'Price Action', max: 33, weight: '33%', icon: TrendingUpIcon, color: 'bg-blue-500' },
                            { key: 'smc', label: 'SMC', max: 28, weight: '28%', icon: Target, color: 'bg-green-500' },
                            { key: 'indicators', label: 'Indicateurs', max: 22, weight: '22%', icon: BarChart, color: 'bg-yellow-500' },
                            { key: 'market_context', label: 'Contexte Marché', max: 17, weight: '17%', icon: Globe, color: 'bg-purple-500' }
                          ].map(({ key, label, max, weight, icon: Icon, color }) => {
                            const score = market_validation.score_breakdown[key] || 0;
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
                      value={getNestedValue(market_validation, 'timing_quality')} 
                      icon={Clock}
                    />
                    <KeyValueItem 
                      label="Confirmation SMC" 
                      value={getNestedValue(market_validation, 'smc_confirmation')} 
                      icon={Target}
                    />
                    <KeyValueItem 
                      label="Alignement Price Action" 
                      value={getNestedValue(market_validation, 'price_action_alignment')} 
                      icon={TrendingUpIcon}
                    />
                    <KeyValueItem 
                      label="Confirmation Indicateurs" 
                      value={getNestedValue(market_validation, 'indicators_confirmation')} 
                      icon={BarChart}
                    />
                    <KeyValueItem 
                      label="Contexte Fondamental" 
                      value={getNestedValue(market_validation, 'fundamental_context')} 
                      icon={MessageSquare}
                    />
                </div>
                </CollapsibleSection>
            </div>
          </CardContent>
            </CollapsibleSection>
        </Card>
      )}

        {/* Signal or No Signal with enhanced UI */}
      {hasSignal ? (
        <Card className="glass-card border-green-500/20 bg-green-500/5">
            <CollapsibleSection 
              title="Signal Détecté!" 
              icon={Target}
              defaultOpen={false}
            >
              <CardContent className="space-y-6">
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

                {/* Market Context (from signal) */}
                {signal.market_context && (
                  <div className="p-3 rounded-lg bg-secondary/30 space-y-1">
                    <p className="text-sm font-medium mb-1 flex items-center gap-2"><Globe className="w-4 h-4" /> Contexte du Marché (Signal)</p>
                    <KeyValueItem label="Alignement Tendance" value={signal.market_context.trend_alignment} />
                    <KeyValueItem label="Risque Corrélation" value={signal.market_context.correlation_risk} />
                    <KeyValueItem label="Biais Fondamental" value={signal.market_context.fundamental_bias} />
                    <KeyValueItem label="Risque News (4h)" value={signal.market_context.news_risk_next_4h} />
                    <KeyValueItem label="Environnement Volatilité" value={signal.market_context.volatility_environment} />
                    <KeyValueItem label="Caractéristiques Session" value={signal.market_context.session_characteristics} />
                  </div>
                )}

                {/* Entry Conditions */}
                <ListItem items={getNestedValue(signal, 'entry_conditions', [])} title="Conditions d'Entrée" icon={Sliders} />

                {/* Invalidation Rules */}
                <ListItem items={getNestedValue(signal, 'invalidation_rules', [])} title="Règles d'Invalidation" icon={XCircle} />

                {/* Performance Metrics */}
                {signal.performance_metrics && (
                  <div className="p-3 rounded-lg bg-secondary/30 space-y-1">
                    <p className="text-sm font-medium mb-1 flex items-center gap-2"><BarChart className="w-4 h-4" /> Métriques de Performance</p>
                    <KeyValueItem label="Pips Risque" value={signal.performance_metrics.pips_risk} />
                    <KeyValueItem label="Pips Gain Max" value={signal.performance_metrics.pips_gain_max} />
                    <KeyValueItem label="Pips Gain Min" value={signal.performance_metrics.pips_gain_min} />
                    <KeyValueItem label="Valeur Attendue" value={signal.performance_metrics.expected_value} />
                    <KeyValueItem label="Boost Fondamental" value={signal.performance_metrics.fundamental_boost} />
                    <KeyValueItem label="Probabilité de Gain" value={signal.performance_metrics.win_probability_estimated} />
                  </div>
                )}

                {/* Validation Checks */}
                {signal.validation_checks && (
                  <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Vérifications de Validation</p>
                    <ListItem items={getNestedValue(signal.validation_checks, 'smc_confluence', [])} title="Confluence SMC" />
                    <ListItem items={getNestedValue(signal.validation_checks, 'timing_factors', [])} title="Facteurs de Timing" />
                    <ListItem items={getNestedValue(signal.validation_checks, 'fundamental_factors', [])} title="Facteurs Fondamentaux" />
                    <ListItem items={getNestedValue(signal.validation_checks, 'technical_indicators', [])} title="Indicateurs Techniques" />
                    <ListItem items={getNestedValue(signal.validation_checks, 'price_action_confluence', [])} title="Confluence Price Action" />
                  </div>
                )}

                {/* Supporting Analysis */}
                {signal.supporting_analysis && (
                  <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2"><Microscope className="w-4 h-4" /> Analyse Détaillée</p>
                    <KeyValueItem label="Résumé SMC" value={signal.supporting_analysis.smc_summary} className="flex-col items-start" />
                    <KeyValueItem label="Évaluation du Risque" value={signal.supporting_analysis.risk_assessment} className="flex-col items-start" />
                    <KeyValueItem label="Résumé Technique" value={signal.supporting_analysis.technical_summary} className="flex-col items-start" />
                    <KeyValueItem label="Résumé Fondamental" value={signal.supporting_analysis.fundamental_summary} className="flex-col items-start" />
                    <KeyValueItem label="Résumé Price Action" value={signal.supporting_analysis.price_action_summary} className="flex-col items-start" />
                    <KeyValueItem label="Scénarios Alternatifs" value={signal.supporting_analysis.alternative_scenarios} className="flex-col items-start" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
            </CollapsibleSection>
        </Card>
      ) : no_signal_analysis ? (
          <Card className="glass-card border-yellow-500/20 bg-yellow-500/5">
            <CollapsibleSection 
              title="Aucun Signal Recommandé" 
              icon={ShieldCheck}
              defaultOpen={false}
            >
              <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800">Ma priorité est de protéger ton capital.</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Parfois, ne pas trader est la meilleure décision.
                    </p>
                  </div>
                </div>
              </div>

              {no_signal_analysis.reasons_if_no_signal && (
                <CollapsibleSection 
                  title="Pourquoi je reste prudent" 
                  icon={AlertCircle}
                  defaultOpen={true}
                >
                  <ListItem 
                    items={no_signal_analysis.reasons_if_no_signal} 
                    collapsible={false}
                  />
                </CollapsibleSection>
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

            {/* Supporting Analysis for no-signal case */}
            {getNestedValue(result, 'supporting_analysis') && (
                <CollapsibleSection 
                  title="Résumé de l'Analyse du Marché" 
                  icon={Microscope}
                  defaultOpen={false}
                >
                  <div className="space-y-4">
                    <KeyValueItem 
                      label="Résumé Price Action" 
                      value={getNestedValue(result.supporting_analysis, 'price_action_summary')} 
                      icon={TrendingUpIcon}
                    />
                    <KeyValueItem 
                      label="Résumé Technique" 
                      value={getNestedValue(result.supporting_analysis, 'technical_summary')} 
                      icon={BarChart}
                    />
                    <KeyValueItem 
                      label="Résumé SMC" 
                      value={getNestedValue(result.supporting_analysis, 'smc_summary')} 
                      icon={Target}
                    />
                    <KeyValueItem 
                      label="Résumé Fondamental" 
                      value={getNestedValue(result.supporting_analysis, 'fundamental_summary')} 
                      icon={MessageSquare}
                    />
                    <KeyValueItem 
                      label="Évaluation du Risque" 
                      value={getNestedValue(result.supporting_analysis, 'risk_assessment')} 
                      icon={ShieldCheck}
                    />
                    <KeyValueItem 
                      label="Scénarios Alternatifs" 
                      value={getNestedValue(result.supporting_analysis, 'alternative_scenarios')} 
                      icon={Lightbulb}
                    />
              </div>
                </CollapsibleSection>
            )}
          </CardContent>
            </CollapsibleSection>
        </Card>
      ) : null}

        {/* Fundamental Context with enhanced layout */}
      {fundamental_context && (
        <Card className="glass-card border-primary/10">
            <CollapsibleSection 
              title="Contexte Fondamental" 
              icon={MessageSquare}
              defaultOpen={false}
            >
              <CardContent className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Facteur Principal</span>
                  </div>
                  <p className="font-semibold text-foreground">{fundamental_context.facteur_principal}</p>
              </div>
                
                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Sentiment Général</span>
              </div>
                  <p className="font-semibold text-foreground">{fundamental_context.sentiment_general}</p>
              </div>
                
                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Sentiment News (24h)</span>
              </div>
                  <p className="font-semibold text-foreground">{fundamental_context.news_sentiment_24h}</p>
            </div>

                <div className="p-4 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUpIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Tendance Dominante</span>
                  </div>
                  <p className="font-semibold text-foreground">{fundamental_context.tendance_dominante}</p>
                </div>
              </div>

              {/* Recommended Caution */}
            {fundamental_context.recommended_caution && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">Recommandation de Prudence</h4>
                      <p className="text-sm text-red-700 leading-relaxed">{fundamental_context.recommended_caution}</p>
                    </div>
                  </div>
              </div>
            )}

              {/* Critical Events */}
            {fundamental_context.evenements_critiques_48h && fundamental_context.evenements_critiques_48h.length > 0 && (
                <CollapsibleSection 
                  title="Événements Critiques (48h)" 
                  icon={Calendar}
                  defaultOpen={true}
                >
                  <div className="space-y-3">
                {fundamental_context.evenements_critiques_48h.map((event: any, idx: number) => (
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
          </CardContent>
            </CollapsibleSection>
        </Card>
      )}

        {/* Market Alerts with enhanced layout */}
      {market_alerts && (
        <Card className="glass-card border-primary/10">
            <CollapsibleSection 
              title="Alertes Marché" 
              icon={Bell}
              defaultOpen={false}
            >
              <CardContent className="space-y-4">
              {/* High Impact News */}
              {getNestedValue(market_alerts, 'high_impact_news_next_24h', []).length > 0 && (
                <CollapsibleSection 
                  title="Actualités à Fort Impact (24h)" 
                  icon={AlertCircle}
                  defaultOpen={true}
                >
                  <div className="space-y-3">
                    {getNestedValue(market_alerts, 'high_impact_news_next_24h', []).map((news: any, idx: number) => (
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
              {getNestedValue(market_alerts, 'technical_levels_to_watch', []).length > 0 && (
                <CollapsibleSection 
                  title="Niveaux Techniques à Surveiller" 
                  icon={Target}
                  defaultOpen={false}
                >
                  <ListItem 
                    items={getNestedValue(market_alerts, 'technical_levels_to_watch', [])} 
                    collapsible={false}
                  />
                </CollapsibleSection>
              )}

              {/* Correlation Warnings */}
              {getNestedValue(market_alerts, 'correlation_warnings', []).length > 0 && (
                <CollapsibleSection 
                  title="Avertissements de Corrélation" 
                  icon={Handshake}
                  defaultOpen={false}
                >
                  <ListItem 
                    items={getNestedValue(market_alerts, 'correlation_warnings', [])} 
                    collapsible={false}
                  />
                </CollapsibleSection>
              )}
          </CardContent>
            </CollapsibleSection>
        </Card>
      )}

       
      </div>
      </ScrollArea>
  );
}
