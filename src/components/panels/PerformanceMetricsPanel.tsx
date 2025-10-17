import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, TrendingUp, Target, DollarSign, Zap, 
  Activity, AlertTriangle, CheckCircle, Scale,
  Clock, Percent, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { useState } from "react";

interface PerformanceMetricsPanelProps {
  performanceMetrics: any;
  signalPerformanceMetrics?: any;
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

// Metric card component
const MetricCard = ({ title, value, icon: Icon, color = "primary", trend = null }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color?: string; 
  trend?: { value: number; isPositive: boolean } | null;
}) => {
  const colorClasses = {
    primary: "bg-primary/10 border-primary/20 text-primary",
    success: "bg-green-500/10 border-green-500/20 text-green-500",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
    danger: "bg-red-500/10 border-red-500/20 text-red-500",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-500"
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold">{value}</div>
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

export function PerformanceMetricsPanel({ performanceMetrics, signalPerformanceMetrics }: PerformanceMetricsPanelProps) {
  if (!performanceMetrics && !signalPerformanceMetrics) return null;

  return (
    <div className="space-y-6">
        {/* Signal Performance Metrics */}
        {signalPerformanceMetrics && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Performance du Signal
            </h4>
            
            {/* Key Performance Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="Pips Risque"
                value={signalPerformanceMetrics.pips_risk || 'N/A'}
                icon={AlertTriangle}
                color="danger"
              />
              <MetricCard
                title="Pips Gain Max"
                value={signalPerformanceMetrics.pips_gain_max || 'N/A'}
                icon={TrendingUp}
                color="success"
              />
              <MetricCard
                title="Pips Gain Min"
                value={signalPerformanceMetrics.pips_gain_min || 'N/A'}
                icon={Target}
                color="info"
              />
              <MetricCard
                title="Valeur Attendue"
                value={signalPerformanceMetrics.expected_value || 'N/A'}
                icon={DollarSign}
                color="primary"
              />
              <MetricCard
                title="Boost Fondamental"
                value={signalPerformanceMetrics.fundamental_boost || 'N/A'}
                icon={Zap}
                color="warning"
              />
              <MetricCard
                title="Probabilité de Gain"
                value={signalPerformanceMetrics.win_probability_estimated || 'N/A'}
                icon={Percent}
                color="success"
              />
            </div>

            {/* Detailed Performance Analysis */}
            <CollapsibleSection 
              title="Analyse Détaillée de Performance" 
              icon={BarChart}
              defaultOpen={false}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <KeyValueItem 
                    label="Pips Risque" 
                    value={signalPerformanceMetrics.pips_risk} 
                    icon={AlertTriangle}
                  />
                  <KeyValueItem 
                    label="Pips Gain Maximum" 
                    value={signalPerformanceMetrics.pips_gain_max} 
                    icon={TrendingUp}
                  />
                  <KeyValueItem 
                    label="Pips Gain Minimum" 
                    value={signalPerformanceMetrics.pips_gain_min} 
                    icon={Target}
                  />
                  <KeyValueItem 
                    label="Valeur Attendue" 
                    value={signalPerformanceMetrics.expected_value} 
                    icon={DollarSign}
                  />
                  <KeyValueItem 
                    label="Boost Fondamental" 
                    value={signalPerformanceMetrics.fundamental_boost} 
                    icon={Zap}
                  />
                  <KeyValueItem 
                    label="Probabilité de Gain Estimée" 
                    value={signalPerformanceMetrics.win_probability_estimated} 
                    icon={Percent}
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* General Performance Metrics */}
        {performanceMetrics && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Métriques Générales
            </h4>
            
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Rendement Mensuel"
                value={performanceMetrics.monthly_return || 'N/A'}
                icon={TrendingUp}
                color="success"
                trend={performanceMetrics.monthly_return_trend ? { 
                  value: performanceMetrics.monthly_return_trend, 
                  isPositive: performanceMetrics.monthly_return_trend > 0 
                } : null}
              />
              <MetricCard
                title="Rendement Total"
                value={performanceMetrics.total_return || 'N/A'}
                icon={Target}
                color="primary"
                trend={performanceMetrics.total_return_trend ? { 
                  value: performanceMetrics.total_return_trend, 
                  isPositive: performanceMetrics.total_return_trend > 0 
                } : null}
              />
              <MetricCard
                title="Score de Risque"
                value={performanceMetrics.risk_score || 'N/A'}
                icon={AlertTriangle}
                color="danger"
              />
              <MetricCard
                title="Sharpe Ratio"
                value={performanceMetrics.sharpe_ratio || 'N/A'}
                icon={Scale}
                color="info"
              />
            </div>

            {/* Risk Metrics */}
            <CollapsibleSection 
              title="Métriques de Risque" 
              icon={AlertTriangle}
              defaultOpen={false}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <KeyValueItem 
                    label="Value at Risk (VaR)" 
                    value={performanceMetrics.var} 
                    icon={AlertTriangle}
                  />
                  <KeyValueItem 
                    label="Maximum Drawdown" 
                    value={performanceMetrics.max_drawdown} 
                    icon={TrendingUp}
                  />
                  <KeyValueItem 
                    label="Volatilité" 
                    value={performanceMetrics.volatility} 
                    icon={Activity}
                  />
                  <KeyValueItem 
                    label="Beta" 
                    value={performanceMetrics.beta} 
                    icon={BarChart}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Trading Statistics */}
            <CollapsibleSection 
              title="Statistiques de Trading" 
              icon={Clock}
              defaultOpen={false}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <KeyValueItem 
                    label="Taux de Réussite" 
                    value={performanceMetrics.win_rate} 
                    icon={Percent}
                  />
                  <KeyValueItem 
                    label="Ratio Profit/Loss" 
                    value={performanceMetrics.profit_loss_ratio} 
                    icon={Scale}
                  />
                  <KeyValueItem 
                    label="Nombre de Trades" 
                    value={performanceMetrics.total_trades} 
                    icon={Activity}
                  />
                  <KeyValueItem 
                    label="Trades Gagnants" 
                    value={performanceMetrics.winning_trades} 
                    icon={CheckCircle}
                  />
                  <KeyValueItem 
                    label="Trades Perdants" 
                    value={performanceMetrics.losing_trades} 
                    icon={AlertTriangle}
                  />
                  <KeyValueItem 
                    label="Profit Moyen par Trade" 
                    value={performanceMetrics.average_profit_per_trade} 
                    icon={DollarSign}
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}
    </div>
  );
}
