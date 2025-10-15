import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

type ForexPair = "EUR/USD" | "GBP/USD" | "USD/JPY" | "USD/CHF" | "USD/CAD" | "AUD/USD" | "NZD/USD" | "EUR/GBP" | "EUR/JPY" | "EUR/CHF" | "EUR/CAD" | "EUR/AUD" | "EUR/NZD" | "GBP/JPY" | "GBP/CHF" | "GBP/CAD" | "GBP/AUD" | "GBP/NZD" | "CHF/JPY" | "CAD/JPY" | "AUD/JPY" | "NZD/JPY" | "AUD/CHF" | "AUD/CAD" | "AUD/NZD" | "NZD/CHF" | "NZD/CAD" | "CAD/CHF" | "XAU/USD";
type TradingStyle = "intraday" | "swing";
type RiskLevel = "basse" | "moyenne" | "Haut";
type GainLevel = "min" | "moyen" | "Max";

const MAJOR_PAIRS: ForexPair[] = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "USD/CAD", "AUD/USD", "NZD/USD", 
  "EUR/GBP", "EUR/JPY", "EUR/CHF", "EUR/CAD", "EUR/AUD", "EUR/NZD",
  "GBP/JPY", "GBP/CHF", "GBP/CAD", "GBP/AUD", "GBP/NZD",
  "CHF/JPY", "CAD/JPY", "AUD/JPY", "NZD/JPY",
  "AUD/CHF", "AUD/CAD", "AUD/NZD", "NZD/CHF", "NZD/CAD", "CAD/CHF", 
  "XAU/USD"
];
const TRADING_STYLES: TradingStyle[] = ["intraday", "swing"];
const RISK_LEVELS: RiskLevel[] = ["basse", "moyenne", "Haut"];
const GAIN_LEVELS: GainLevel[] = ["min", "moyen", "Max"];

interface AnalysisConfigProps {
  onStartAnalysis: (config: {
    pair: ForexPair;
    style: TradingStyle;
    risk: RiskLevel;
    gain: GainLevel;
  }) => void;
  isLoading: boolean;
}

export function AnalysisConfig({ onStartAnalysis, isLoading }: AnalysisConfigProps) {
  const [pair, setPair] = useState<ForexPair>("EUR/USD");
  const [style, setStyle] = useState<TradingStyle>("intraday");
  const [risk, setRisk] = useState<RiskLevel>("moyenne");
  const [gain, setGain] = useState<GainLevel>("moyen");

  const handleStartAnalysis = () => {
    onStartAnalysis({ pair, style, risk, gain });
  };

  const SelectionSection = ({ title, options, selectedValue, onSelect }: any) => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option: string) => (
          <Badge
            key={option}
            variant={selectedValue === option ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 transition-all hover:scale-105 ${
              selectedValue === option
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "hover:bg-secondary/50"
            }`}
            onClick={() => onSelect(option)}
          >
            {option}
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="glass-card border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Configuration d'Analyse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SelectionSection
          title="Paire de Devises"
          options={MAJOR_PAIRS}
          selectedValue={pair}
          onSelect={setPair}
        />
        
        <SelectionSection
          title="Style de Trading"
          options={TRADING_STYLES}
          selectedValue={style}
          onSelect={setStyle}
        />
        
        <SelectionSection
          title="Niveau de Risque"
          options={RISK_LEVELS}
          selectedValue={risk}
          onSelect={setRisk}
        />
        
        <SelectionSection
          title="Objectif de Gain"
          options={GAIN_LEVELS}
          selectedValue={gain}
          onSelect={setGain}
        />

        <Button
          onClick={handleStartAnalysis}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Lancer l'Analyse
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
